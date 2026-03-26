const express = require('express')
const Docker = require('dockerode')
const mongoose = require('mongoose')
const cors = require('cors')
const Razorpay = require('razorpay')
const crypto = require('crypto')
require('dotenv').config()

const app = express()
const docker = new Docker()

// Razorpay Initialization (India - UPI payments)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
})

app.use(cors())
app.use(express.json())

// Schemas
const Deployment = mongoose.model('Deployment', new mongoose.Schema({
  userId: String,
  telegramToken: String,
  aiModel: { type: String, default: 'claude-3-5-sonnet-20241022' },
  containerId: String,
  subdomain: String,
  status: { type: String, default: 'running' },
  plan: { type: String, default: 'free' },
  expiryDate: Date,
  createdAt: { type: Date, default: Date.now }
}))

const Payment = mongoose.model('Payment', new mongoose.Schema({
  userId: String,
  orderId: String,
  razorpayPaymentId: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  plan: String,
  duration: Number, // in months
  status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}))

const User = mongoose.model('User', new mongoose.Schema({
  userId: String, // Unique user identifier
  telegramToken: String, // For agent deployment
  deployedAgentId: String, // Reference to deployment
  currentPlan: { type: String, default: 'free' },
  planExpiry: Date,
  totalAgents: { type: Number, default: 0 },
  maxAgents: { type: Number, default: 1 }, // Based on plan
  createdAt: { type: Date, default: Date.now },
  lastPayment: Date,
  paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }]
}))

// PLANS - India pricing in INR
const PLANS = {
  free: {
    name: "Starter",
    price: 0,
    duration: 0, // Lifetime free
    features: ["1 agent", "Basic AI models", "512MB memory", "Community support"],
    maxAgents: 1,
    durationMonths: 0
  },
  starter: {
    name: "Starter Pro",
    price: 99, // ₹99
    duration: 1, // 1 month
    features: ["3 agents", "Advanced AI (Claude 3.5, GPT-4o)", "1GB memory", "Email support", "Priority deployment"],
    maxAgents: 3,
    durationMonths: 1
  },
  pro: {
    name: "Pro",
    price: 249, // ₹249
    duration: 1, // 1 month
    features: ["10 agents", "All AI models", "2GB memory", "Priority support", "Custom domain"],
    maxAgents: 10,
    durationMonths: 1
  },
  business: {
    name: "Business",
    price: 699, // ₹699
    duration: 1, // 1 month
    features: ["Unlimited agents", "All AI models", "4GB memory", "24/7 support", "API access", "Team accounts"],
    maxAgents: 999,
    durationMonths: 1
  },
  annual: {
    name: "Annual Pro",
    price: 2499, // ₹2499 (saves 58%)
    duration: 12, // 12 months
    features: ["Everything in Pro", "12 months for price of 10", "Dedicated support", "Free upgrades"],
    maxAgents: 10,
    durationMonths: 12
  }
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ==================== PAYMENT ENDPOINTS ====================

// Get available plans
app.get('/api/plans', (req, res) => {
  res.json({ plans: PLANS })
})

// Create Razorpay order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { userId, planName } = req.body

    if (!PLANS[planName]) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    const plan = PLANS[planName]

    if (plan.price === 0) {
      // Free plan, no payment needed
      await saveFreePlan(userId, planName)
      return res.json({
        success: true,
        freePlan: true,
        message: 'Free plan activated',
        plan: planName
      })
    }

    // Create Razorpay order (amount in paise, so multiply by 100)
    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        plan: planName
      }
    })

    // Save payment record
    const payment = await Payment.create({
      userId,
      orderId: order.id,
      amount: plan.price,
      currency: 'INR',
      plan: planName,
      duration: plan.durationMonths,
      status: 'created'
    })

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        plan: planName
      }
    })
  } catch (err) {
    console.error('Order creation error:', err)
    res.status(500).json({ error: err.message || 'Failed to create order' })
  }
})

// Save free plan
async function saveFreePlan(userId, planName) {
  let user = await User.findOne({ userId })

  if (!user) {
    user = await User.create({
      userId,
      currentPlan: planName,
      planExpiry: null, // Free plan has no expiry
      maxAgents: PLANS[planName].maxAgents
    })
  } else {
    user.currentPlan = planName
    user.planExpiry = null
    user.maxAgents = PLANS[planName].maxAgents
    await user.save()
  }
}

// Verify payment (after UPI/Card payment)
app.post('/api/payment/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planName
    } = req.body

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' })
    }

    // Find payment record
    const payment = await Payment.findOne({ orderId: razorpay_order_id })
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // Update payment status
    payment.razorpayPaymentId = razorpay_payment_id
    payment.status = 'paid'
    payment.updatedAt = new Date()
    await payment.save()

    // Update user plan
    const plan = PLANS[planName]
    const planExpiry = new Date()
    planExpiry.setMonth(planExpiry.getMonth() + plan.durationMonths)

    let user = await User.findOne({ userId })

    if (!user) {
      user = await User.create({
        userId,
        currentPlan: planName,
        planExpiry,
        maxAgents: plan.maxAgents,
        totalAgents: 0,
        lastPayment: new Date()
      })
    } else {
      user.currentPlan = planName
      user.planExpiry = planExpiry
      user.maxAgents = plan.maxAgents
      user.lastPayment = new Date()
      user.paymentHistory.push(payment._id)
      await user.save()
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      plan: planName,
      expiryDate: planExpiry
    })
  } catch (err) {
    console.error('Payment verification error:', err)
    res.status(500).json({ error: err.message || 'Failed to verify payment' })
  }
})

// Get user plan status
app.get('/api/user/plan/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId })
      .populate('paymentHistory')

    if (!user) {
      const newUser = await User.create({
        userId: req.params.userId,
        currentPlan: 'free',
        maxAgents: PLANS.free.maxAgents
      })
      return res.json({
        user: newUser,
        plan: PLANS.free,
        canDeploy: true,
        remainingAgents: PLANS.free.maxAgents
      })
    }

    const plan = PLANS[user.currentPlan]
    const remainingAgents = user.maxAgents - user.totalAgents

    res.json({
      user,
      plan,
      canDeploy: remainingAgents > 0,
      remainingAgents: Math.max(0, remainingAgents)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== DEPLOYMENT ENDPOINTS ====================

// DEPLOY
app.post('/api/deploy', async (req, res) => {
  const { telegramToken, aiModel, userId, plan } = req.body

  if (!telegramToken || !userId) {
    return res.status(400).json({ error: 'telegramToken and userId are required' })
  }

  // Check user plan limits
  const user = await User.findOne({ userId })
  if (user && user.totalAgents >= user.maxAgents) {
    return res.status(403).json({
      error: 'Plan limit reached',
      current: user.totalAgents,
      max: user.maxAgents,
      message: 'Upgrade your plan to deploy more agents'
    })
  }

  const subdomain = `agent-${Math.random().toString(36).substr(2, 6)}`

  try {
    const container = await docker.createContainer({
      Image: 'secureclaw:latest',
      name: `sc-${userId}-${Date.now()}`,
      Env: [
        `TELEGRAM_BOT_TOKEN=${telegramToken}`,
        `AI_MODEL=${aiModel || 'claude-3-5-sonnet-20241022'}`,
        `USER_ID=${userId}`,
        `SECURECLAW_PRIVACY=true`
      ],
      HostConfig: {
        RestartPolicy: { Name: 'unless-stopped' },
        Memory: 512 * 1024 * 1024
      },
      Labels: {
        'secureclaw.user': userId,
        'secureclaw.subdomain': subdomain
      }
    })

    await container.start()

    const dep = await Deployment.create({
      userId,
      telegramToken,
      aiModel,
      plan: plan || 'free',
      containerId: container.id,
      subdomain,
      status: 'running'
    })

    // Update user agent count
    if (user) {
      user.totalAgents += 1
      if (!user.deployedAgentId) {
        user.deployedAgentId = dep._id
      }
      await user.save()
    }

    res.json({
      success: true,
      deployment: {
        id: dep._id,
        subdomain: `${subdomain}.secureclaw.com`,
        status: 'running',
        createdAt: dep.createdAt
      },
      remainingAgents: user ? user.maxAgents - user.totalAgents : 0
    })
  } catch (err) {
    console.error('Deploy error:', err)
    res.status(500).json({ error: err.message || 'Deployment failed' })
  }
})

// GET deployments
app.get('/api/deployments/:userId', async (req, res) => {
  try {
    const deployments = await Deployment.find({ userId: req.params.userId })
    res.json({ deployments })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// STOP deployment
app.post('/api/stop/:id', async (req, res) => {
  try {
    const dep = await Deployment.findById(req.params.id)
    if (!dep) return res.status(404).json({ error: 'Deployment not found' })

    await docker.getContainer(dep.containerId).stop()
    await Deployment.updateOne({ _id: dep._id }, { status: 'stopped' })
    res.json({ success: true, status: 'stopped' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// RESTART deployment
app.post('/api/restart/:id', async (req, res) => {
  try {
    const dep = await Deployment.findById(req.params.id)
    if (!dep) return res.status(404).json({ error: 'Deployment not found' })

    await docker.getContainer(dep.containerId).restart()
    await Deployment.updateOne({ _id: dep._id }, { status: 'running' })
    res.json({ success: true, status: 'running' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE deployment
app.delete('/api/deploy/:id', async (req, res) => {
  try {
    const dep = await Deployment.findById(req.params.id)
    if (!dep) return res.status(404).json({ error: 'Deployment not found' })

    const c = docker.getContainer(dep.containerId)
    await c.stop().catch(() => {})
    await c.remove()
    await Deployment.deleteOne({ _id: dep._id })

    // Update user agent count
    const user = await User.findOne({ userId: dep.userId })
    if (user && user.totalAgents > 0) {
      user.totalAgents -= 1
      await user.save()
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secureclaw')
  .then(() => {
    const port = process.env.PORT || 3001
    app.listen(port, () => {
      console.log('🚀 SecureClaw API running')
      console.log(`📡 Port: ${port}`)
      console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI || 'localhost:27017/secureclaw'}`)
      console.log(`💳 Razorpay Payments: ${process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Test Mode'}`)
      console.log(`💰 Currency: INR (Indian Rupees)`)
    })
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })