# Hong Kong Mahjong Game - Deployment Guide

## Deployment Options

### Option 1: Local Development (Recommended for Testing)
```bash
cd backend
npm install
npm run build
npm start
# Server runs at http://localhost:3000
```

### Option 2: Docker (Any Cloud Provider)
```bash
docker build -t mahjong-game .
docker run -p 3000:3000 mahjong-game
```

### Option 3: Heroku (Free/Paid)
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 4: Railway (Easy, Recommended)
1. Push to GitHub
2. Connect GitHub repo to Railway
3. Railway auto-detects Node.js, builds, and deploys
4. Get public URL automatically

### Option 5: Vercel/Netlify (Frontend Only)
- Deploy frontend separately
- Backend runs on Railway/Heroku
- Frontend connects to backend API

### Option 6: DigitalOcean/AWS/GCP (Full Control)
- Provision Node.js server
- Deploy backend
- Configure reverse proxy (nginx)
- Add SSL certificate

---

## Quick Start: Local Development

### 1. Setup
```bash
cd backend
npm install
npm run build
npm start
```

### 2. Test
```bash
# In another terminal
npm test
```

### 3. Access
- HTTP: http://localhost:3000
- WebSocket: ws://localhost:3000
- Health: http://localhost:3000/health

---

## Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Build and Run
```bash
docker build -t mahjong-game .
docker run -p 3000:3000 mahjong-game
```

### Docker Compose (Multiple Services)
```yaml
version: '3.8'
services:
  mahjong-api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
```

---

## Railway.app Deployment (Recommended)

### 1. Prepare Repository
```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Railway
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository
4. Select "MahjongDemo" repo
5. Railway auto-detects Node.js
6. Builds and deploys automatically

### 3. Configure
- Railway detects `package.json` in `/backend`
- Sets `PORT=` environment variable
- Deploys build artifacts automatically

### 4. Access
- Public URL: `https://your-app-name.railway.app`
- WebSocket: `wss://your-app-name.railway.app`

---

## Heroku Deployment

### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

### 2. Create App
```bash
heroku create your-app-name
```

### 3. Create Procfile
```
# At root of repo
web: cd backend && npm start
```

### 4. Deploy
```bash
git push heroku main
```

### 5. View Logs
```bash
heroku logs --tail
```

---

## Environment Variables

### Production Setup
```bash
# For Railway/Heroku, set via dashboard:
NODE_ENV=production
PORT=3000
HOST=0.0.0.0  # Important for cloud servers
```

### Test Variables
```bash
TEST_GAMES=10
TEST_PLAYERS=4
```

---

## Frontend Setup (Optional)

For a web interface, create a simple React app:

### Option A: Create React App
```bash
npx create-react-app frontend
cd frontend
npm install socket.io-client axios
```

### Option B: Vue 3
```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install socket.io-client axios
```

### Option C: Next.js (Recommended)
```bash
npx create-next-app@latest frontend
cd frontend
npm install socket.io-client
```

### Connect to Backend
```javascript
import io from 'socket.io-client';

const socket = io('https://your-app-name.railway.app');

socket.emit('join-game', {
  gameId: 'game-123',
  position: 'East',
  playerId: 'player-1'
});

socket.on('game-state', (data) => {
  console.log('Game state:', data);
});
```

---

## Production Checklist

### Before Deploying
- [x] Build succeeds: `npm run build`
- [x] Tests pass: `npm test`
- [x] No TypeScript errors
- [x] All environment variables set
- [x] Health endpoint working
- [x] CORS configured correctly

### Security Checklist
- [ ] Enable HTTPS/TLS (auto on Railway/Heroku)
- [ ] Add JWT authentication
- [ ] Validate all inputs
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] Secrets not in code
- [ ] Logging configured
- [ ] Error handling robust

### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking (Sentry/Rollbar)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Database backups (if applicable)

---

## Troubleshooting

### Port Already in Use
```bash
PORT=3001 npm start
```

### Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### WebSocket Connection Issues
- Check CORS settings
- Verify WebSocket enabled on server
- Check firewall rules
- Enable secure WebSocket (WSS) in production

### Memory Issues
```bash
# Increase Node.js memory
NODE_OPTIONS=--max_old_space_size=2048 npm start
```

---

## Scaling (Future)

### Load Balancing
- Use sticky sessions (for WebSocket)
- Load balance HTTP requests
- Redis for shared state (future)

### Database
- Add MongoDB/PostgreSQL (future)
- Implement caching (Redis)
- Setup backup strategy

### Monitoring
- Application Performance Monitoring (APM)
- Error tracking
- Log aggregation
- Metrics dashboards

---

## Cost Comparison

| Provider | Tier | Monthly | WebSocket | Notes |
|----------|------|---------|-----------|-------|
| Railway | Free | $5 | ✅ | Recommended |
| Railway | Hobby | $7 | ✅ | Extra capacity |
| Heroku | Free | $0 | ✅ | Sleeping required |
| Heroku | Hobby | $7 | ✅ | 1000 dyno hours |
| DigitalOcean | Droplet | $4-6 | ✅ | Full control |
| AWS | Free Tier | $0-15 | ✅ | Complex setup |

---

## Recommended Setup

### Development
```bash
npm run dev
```

### Production
```bash
# Option 1: Railway (Recommended)
# Push to GitHub → Connect to Railway
# Automatic deployment

# Option 2: Docker
docker build -t mahjong .
docker run -p 3000:3000 mahjong

# Option 3: Heroku
git push heroku main

# Option 4: Local VPS
ssh user@server.com
git clone repo
cd backend && npm install && npm run build
npm start
```

---

## API Endpoints Available

### HTTP REST
```
GET  http://localhost:3000/health
POST http://localhost:3000/api/games
GET  http://localhost:3000/api/games
GET  http://localhost:3000/api/games/{id}
```

### WebSocket
```
ws://localhost:3000
  - join-game
  - player-action
  - leave-game
  - ping
```

---

## Next Steps

1. Choose deployment option above
2. Follow setup instructions
3. Test endpoints
4. Deploy frontend (optional)
5. Monitor logs
6. Scale as needed

---

**Ready to deploy?** Choose your platform above and follow the guide! 🚀
