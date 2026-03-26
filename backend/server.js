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
  plan: { type: String, default: 'trial' },
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
  days: Number,
  status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}))

const User = mongoose.model('User', new mongoose.Schema({
  userId: String,
  telegramToken: String,
  deployedAgentId: String,
  currentPlan: { type: String, default: 'trial' },
  planExpiry: Date,
  totalAgents: { type: Number, default: 0 },
  maxAgents: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  lastPayment: Date,
  paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }]
}))

// SINGLE PLAN - ₹999 for 1 day
const PLAN = {
  name: "1-Day Trial",
  price: 999,
  days: 1,
  features: ["1 AI Agent", "All AI models", "512MB memory", "Full privacy", "24-hour access"],
  maxAgents: 1
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// GET plan info
app.get('/api/plan', (req, res) => {
  res.json({ plan: PLAN })
})

// Create Razorpay order for ₹999
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { userId } = req.body
    const amount = PLAN.price

    // Create Razorpay order (amount in paise, so multiply by 100)
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        plan: PLAN.name
      }
    })

    // Save payment record
    const payment = await Payment.create({
      userId,
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      plan: PLAN.name,
      days: PLAN.days,
      status: 'created'
    })

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        plan: PLAN.name,
        days: PLAN.days
      },
      plan: PLAN
    })
  } catch (err) {
    console.error('Order creation error:', err)
    res.status(500).json({ error: err.message || 'Failed to create order' })
  }
})

// Verify payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId
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
    const planExpiry = new Date()
    planExpiry.setDate(planExpiry.getDate() + PLAN.days)

    let user = await User.findOne({ userId })

    if (!user) {
      user = await User.create({
        userId,
        currentPlan: PLAN.name,
        planExpiry,
        maxAgents: PLAN.maxAgents,
        totalAgents: 0,
        lastPayment: new Date()
      })
    } else {
      user.currentPlan = PLAN.name
      user.planExpiry = planExpiry
      user.maxAgents = PLAN.maxAgents
      user.lastPayment = new Date()
      user.paymentHistory.push(payment._id)
      await user.save()
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      plan: PLAN.name,
      days: PLAN.days,
      expiryDate: planExpiry
    })
  } catch (err) {
    console.error('Payment verification error:', err)
    res.status(500).json({ error: err.message || 'Failed to verify payment' })
  }
})

// GET user plan status
app.get('/api/user/plan/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId })
      .populate('paymentHistory')

    if (!user) {
      return res.json({
        plan: PLAN,
        canDeploy: false,
        remainingAgents: 0,
        expiryDate: null,
        hasActivePlan: false
      })
    }

    const now = new Date()
    const isActive = user.planExpiry && user.planExpiry > now
    const remainingAgents = user.maxAgents - user.totalAgents

    res.json({
      user,
      plan: PLAN,
      canDeploy: isActive && remainingAgents > 0,
      remainingAgents: Math.max(0, remainingAgents),
      expiryDate: user.planExpiry,
      daysRemaining: isActive ? Math.ceil((user.planExpiry - now) / (1000 * 60 * 60 * 24)) : 0,
      hasActivePlan: isActive
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DEPLOY
app.post('/api/deploy', async (req, res) => {
  const { telegramToken, aiModel, userId } = req.body

  if (!telegramToken || !userId) {
    return res.status(400).json({ error: 'telegramToken and userId are required' })
  }

  // Check user plan
  const user = await User.findOne({ userId })
  const now = new Date()

  if (!user || !user.planExpiry || user.planExpiry <= now) {
    return res.status(403).json({
      error: 'No active plan. Purchase ₹999 1-day trial to deploy.',
      hasActivePlan: false,
      purchaseUrl: '/pricing'
    })
  }

  if (user.totalAgents >= user.maxAgents) {
    return res.status(403).json({
      error: 'Maximum agents reached (1 agent only in this plan)',
      current: user.totalAgents,
      max: user.maxAgents,
      message: 'Only 1 agent allowed in this plan'
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
      plan: PLAN.name,
      expiryDate: user.planExpiry,
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
        createdAt: dep.createdAt,
        expiryDate: user.planExpiry
      },
      daysRemaining: Math.ceil((user.planExpiry - now) / (1000 * 60 * 60 * 24))
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
      console.log(`💰 Pricing: ₹999 for 1 day, 1 agent`)
      console.log(`💰 Currency: INR (Indian Rupees)`)
    })
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })