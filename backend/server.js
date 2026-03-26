const express = require('express')
const Docker = require('dockerode')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
const docker = new Docker()

app.use(cors())
app.use(express.json())

// Schema
const Deployment = mongoose.model('Deployment', new mongoose.Schema({
  userId: String,
  telegramToken: String,
  aiModel: { type: String, default: 'claude-3-5-sonnet-20241022' },
  containerId: String,
  subdomain: String,
  status: { type: String, default: 'running' },
  plan: String,
  createdAt: { type: Date, default: Date.now }
}))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// DEPLOY
app.post('/api/deploy', async (req, res) => {
  const { telegramToken, aiModel, userId, plan } = req.body

  if (!telegramToken || !userId) {
    return res.status(400).json({ error: 'telegramToken and userId are required' })
  }

  const subdomain = `agent-${Math.random().toString(36).substr(2, 6)}`

  try {
    // Check if Docker image exists
    try {
      await docker.getImage('secureclaw:latest').inspect()
    } catch (imgErr) {
      // Image doesn't exist - would need build
      console.warn('⚠️ secureclaw:latest image not found. Please build first.')
    }

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
      plan,
      containerId: container.id,
      subdomain,
      status: 'running'
    })

    res.json({
      success: true,
      deployment: {
        id: dep._id,
        subdomain: `${subdomain}.secureclaw.com`,
        status: 'running',
        createdAt: dep.createdAt
      }
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
    })
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })