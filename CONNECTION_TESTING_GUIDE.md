# Connection Testing & Troubleshooting Guide

## Understanding the Connection Error

When testing the GitHub Pages frontend, you may see:
```
[17:02:11] Connection error: undefined
[17:02:14] Disconnected from server
```

This is **expected** when the backend hasn't been configured yet. The frontend is designed to gracefully handle this.

---

## What's Happening

1. **Frontend loads successfully** ✅
   - HTML/CSS/JavaScript all work
   - All 46 tile images load correctly
   - UI is interactive

2. **Backend not configured yet** ⚠️
   - Frontend tries to connect to `localhost:3000` by default
   - This only works if you're running a local backend
   - GitHub Pages frontend can't reach localhost

3. **Solution:** Configure the backend URL

---

## How to Configure Backend URL

### Option 1: Using the Settings UI (Recommended)

1. Open the GitHub Pages frontend: https://kenkenf12.github.io/MahjongDemo/
2. Scroll to the bottom and click **⚙️ Settings**
3. Enter your Cloudflare Workers URL:
   ```
   mahjong-game.your-account.workers.dev
   ```
   (Replace `your-account` with your actual Cloudflare account)
4. Click **Save URL**
5. The frontend will reconnect automatically

### Option 2: Direct Edit in Code

Edit `client.js` in the `gh-pages` branch:

**Before:**
```javascript
connect(host = 'localhost:3000') {
```

**After:**
```javascript
connect(host = 'mahjong-game.your-account.workers.dev') {
```

Then commit and push to gh-pages.

---

## Testing Connection Steps

### Step 1: Deploy Cloudflare Workers
```bash
npm install -g wrangler
wrangler login
cd backend
npm run build
wrangler deploy
```

Note the URL from the output (e.g., `https://mahjong-game.your-account.workers.dev`)

### Step 2: Configure Frontend URL
Go to Settings in the GitHub Pages frontend and enter the Workers URL (without `https://` or `/`).

### Step 3: Verify Connection
Check the browser console (F12 → Console):
- If connected: ✅ "Connected to server"
- If not connected: Look for detailed error message

### Step 4: Test Game Functions
1. Enter a player name
2. Click "New Game"
3. Wait for confirmation message
4. Try "Join Game" from another browser tab

---

## Troubleshooting

### Issue: "Demo Mode (No Backend)"
**Cause:** Backend URL not configured and running locally  
**Solution:** Enter your Cloudflare Workers URL in Settings

### Issue: Connection Fails Immediately
**Cause 1:** Incorrect URL format  
**Solution:** Make sure URL doesn't include `https://` or `/`  
**Example:** ✅ `mahjong-game.your-account.workers.dev`

**Cause 2:** Workers not deployed yet  
**Solution:** Run `wrangler deploy` in backend directory

### Issue: "Cannot find module" in Wrangler Deploy
**Cause:** TypeScript compilation error  
**Solution:**
```bash
cd backend
npm run build  # Check for errors
wrangler deploy
```

### Issue: Tile Images Not Loading
**Cause:** Assets path incorrect  
**Solution:** Verify `assets/tiles/` directory exists in gh-pages branch

### Issue: WebSocket Connection Timeout
**Cause:** CORS headers not configured  
**Solution:** Check `backend/src/cf-worker.ts` for proper CORS headers

---

## Network Debugging

### Check WebSocket Connection
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Attempt to connect
5. Look for wss:// connections

### Check Error Details
1. Open DevTools Console
2. Look for specific error messages
3. Check if connection URL is correct

### Test Backend Directly
```bash
# If backend running locally
curl http://localhost:3000/health

# If deployed to Cloudflare Workers
curl https://mahjong-game.your-account.workers.dev/health
```

---

## Local Testing (No GitHub Pages)

If testing locally without GitHub Pages:

### Option A: Local Backend + HTML File
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Serve frontend
cd frontend
python -m http.server 8000
# or
npx serve frontend
```

Then open: http://localhost:8000

The frontend will auto-detect localhost and connect to `localhost:3000`.

### Option B: Local Backend + GitHub Pages
1. Deploy backend to Cloudflare: `wrangler deploy`
2. Configure GitHub Pages frontend with Workers URL
3. Open GitHub Pages URL

---

## URL Format Reference

### Correct Formats
✅ `localhost:3000` (local development)  
✅ `mahjong-game.your-account.workers.dev` (Cloudflare Workers)  
✅ `example.com:8000` (custom domain with port)

### Incorrect Formats
❌ `https://localhost:3000` (has protocol)  
❌ `https://mahjong-game.your-account.workers.dev` (has protocol)  
❌ `mahjong-game.your-account.workers.dev/` (has trailing slash)

---

## Browser Console Log Examples

### Connected Successfully
```
✓ Connected to server
✓ Game created! Code: ABC123
✓ Tile graphics loaded successfully
```

### Disconnected (Expected Before Backend URL Set)
```
⚠️ Backend URL not configured. Using demo mode (no connection).
To connect to a backend, set the server URL in settings.
```

### Connection Error
```
❌ Failed to connect: WebSocket is closed before the connection is established
→ Check URL format
→ Check if backend is running
→ Check browser console for CORS errors
```

---

## Quick Reference

| Scenario | Action |
|----------|--------|
| Testing frontend locally | No action needed, frontend works fine |
| Testing with local backend | Enter `localhost:3000` in Settings |
| Deployed to GitHub Pages, no backend | Enter Cloudflare Workers URL in Settings |
| Deployed to GitHub Pages with backend | URL saved in localStorage, should reconnect automatically |

---

## Summary

The frontend is **fully functional and ready to test**. The connection error is expected until you:
1. Deploy the backend to Cloudflare Workers
2. Configure the Workers URL in the frontend settings

Once configured, the multiplayer game will work end-to-end!
