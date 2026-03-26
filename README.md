# 🔐 SecureClaw

Deploy secure AI agents powered by OpenClaw + NVIDIA NemoClaw in 60 seconds.
Built by WorkChain (@WorkChainOfficial)

## 🚀 How it works

1. Paste your Telegram Bot Token
2. Choose your AI model
3. Click Deploy → Agent is live instantly

## 🛠️ Tech Stack

- **Frontend**: Next.js 14
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Containers**: Docker + Dockerode
- **Privacy**: NemoClaw Privacy Router
- **Payments**: PayU + Paddle
- **Reverse Proxy**: Traefik

## 📋 Prerequisites

```bash
- Docker (20.10+)
- Docker Compose (2.0+)
- Node.js 18+ (for local development)
- MongoDB (for local DB, or use Docker)
```

## 🏃 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/WorkChainOfficial/secureclaw.git
cd secureclaw
```

### 2. Build the agent Docker image

```bash
docker build -t secureclaw:latest ./docker
```

### 3. Configure environment variables

```bash
# For backend
cp backend/.env.example backend/.env

# For frontend
cp frontend/.env.example frontend/.env.local
```

### 4. Start all services

```bash
docker-compose up -d
```

### 5. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Traefik Dashboard: http://localhost:8080

## 🧪 Local Development

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### Backend (Express)

```bash
cd backend
npm install
npm run dev
```

## 🔧 Configuration

### Backend (.env)

```env
MONGODB_URI=mongodb://mongo:27017/secureclaw
PORT=3001
JWT_SECRET=your-super-secret-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📦 Project Structure

```
secureclaw/
├── docker/               # Agent container setup
│   ├── Dockerfile        # Base image for AI agents
│   ├── entrypoint.sh     # Container startup script
│   ├── privacy-router.py # NemoClaw privacy filter
│   └── secureclaw-config.yml  # OpenClaw config
├── backend/             # Express API server
│   ├── server.js        # Main API server
│   ├── package.json     # Backend dependencies
│   └── .env.example     # Environment template
├── frontend/            # Next.js UI
│   ├── pages/
│   │   ├── index.js     # Landing page
│   │   └── deploy.js    # Deploy page
│   ├── components/      # React components
│   ├── package.json     # Frontend dependencies
│   └── .env.example     # Environment template
├── docker-compose.yml   # Multi-container orchestration
└── README.md           # This file
```

## 🔐 Security Features

- **Privacy Router**: Blocks telemetry, analytics, and tracking requests
- **Isolated Containers**: Each agent runs in its own Docker container
- **Memory Limits**: 512MB per agent container
- **Token Encryption**: Telegram tokens stored in MongoDB
- **NemoClaw Integration**: Privacy-focused AI routing

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/deploy` | Deploy new agent |
| GET | `/api/deployments/:userId` | List user deployments |
| POST | `/api/stop/:id` | Stop deployment |
| POST | `/api/restart/:id` | Restart deployment |
| DELETE | `/api/deploy/:id` | Delete deployment |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

- Twitter: [@WorkChainOfficial](https://twitter.com/WorkChainOfficial)
- Discord: [OpenClaw Community](https://discord.com/invite/clawd)

---

Made with ❤️ by WorkChain