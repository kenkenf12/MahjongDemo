# Deployment Checklist: Go-Live Steps

Complete these steps to deploy the Mahjong game to production.

## ✅ Pre-Deployment (Already Done)
- [x] Frontend graphics created (46 PNG tile images)
- [x] HTML/CSS/JS frontend built
- [x] ESM migration completed (all TypeScript files updated)
- [x] Backend tests passing (348/356, 95%)
- [x] Cloudflare Workers configuration created (`wrangler.toml`)
- [x] Frontend pushed to `gh-pages` branch
- [x] Deployment guide written

---

## ⚡ Action Items (In Order)

### 1. Enable GitHub Pages
**Estimated time: 2 minutes**

- [ ] Go to https://github.com/kenkenf12/MahjongDemo/settings/pages
- [ ] Under "Build and deployment" → **Source**: Select "Deploy from a branch"
- [ ] **Branch**: Select `gh-pages` / `(root)`
- [ ] Click **Save**
- [ ] Wait for GitHub Pages to build (check Settings → Pages for status)
- [ ] Test access: https://kenkenf12.github.io/MahjongDemo/

**Expected result:** Frontend loads with tile graphics, no connection errors yet.

---

### 2. Set Up Cloudflare Workers
**Estimated time: 5 minutes**

#### 2.1 Install Wrangler
```bash
npm install -g wrangler
```

#### 2.2 Authenticate
```bash
wrangler login
```
- [ ] Opens browser, click "Authorize"
- [ ] Return to terminal

#### 2.3 Build Backend
```bash
cd backend
npm install
npm run build
```

- [ ] Verify no TypeScript errors
- [ ] `dist/cf-worker.js` created

#### 2.4 Deploy
```bash
wrangler deploy
```

- [ ] Deployment succeeds
- [ ] Note your Workers URL (e.g., `https://mahjong-game.your-account.workers.dev`)

---

### 3. Create KV Namespace (Optional but Recommended)
**Estimated time: 3 minutes**

```bash
wrangler kv:namespace create "GAME_KV"
wrangler kv:namespace create "GAME_KV" --preview
```

- [ ] Copy namespace IDs
- [ ] Update `backend/wrangler.toml`:
  ```toml
  [[kv_namespaces]]
  binding = "GAME_KV"
  id = "your-kv-namespace-id"
  preview_id = "your-kv-preview-id"
  ```
- [ ] Redeploy: `wrangler deploy`

---

### 4. Configure Frontend for Production
**Estimated time: 5 minutes**

#### 4.1 Update Backend URL
- [ ] Check out `gh-pages` branch:
  ```bash
  git checkout gh-pages
  ```

- [ ] Edit `client.js`, find this line (~line 18):
  ```javascript
  connect(host = 'localhost:3000') {
  ```

- [ ] Replace with your Workers URL (no `https://`, no `/`):
  ```javascript
  connect(host = 'mahjong-game.your-account.workers.dev') {
  ```

- [ ] Save and commit:
  ```bash
  git add client.js
  git commit -m "Update backend URL to production Cloudflare Workers"
  git push origin gh-pages
  ```

- [ ] GitHub Pages will redeploy automatically (~1 minute)

---

### 5. Verify CORS Configuration
**Estimated time: 2 minutes**

- [ ] Review `backend/src/cf-worker.ts`
- [ ] Ensure CORS headers allow GitHub Pages origin:
  ```
  Access-Control-Allow-Origin: https://kenkenf12.github.io
  ```
- [ ] If needed, update and redeploy:
  ```bash
  npm run build
  wrangler deploy
  ```

---

### 6. End-to-End Testing
**Estimated time: 10 minutes**

- [ ] Open https://kenkenf12.github.io/MahjongDemo/
- [ ] Verify page loads (should see tile graphics)
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab (check for errors)
- [ ] Go to Network tab → filter "WS" (WebSocket)
- [ ] Create a new game room:
  - [ ] Enter player name
  - [ ] Click "Create Room"
  - [ ] Verify WebSocket connects (Network tab should show `ws://...` connection)
  - [ ] Verify game UI displays without errors
- [ ] If joining works, try multiplayer:
  - [ ] Open second browser tab (or different browser)
  - [ ] Join the same room code
  - [ ] Verify both players see each other

---

### 7. Monitor & Validate
**Ongoing**

- [ ] Check Cloudflare Workers Dashboard for traffic/errors
- [ ] Monitor GitHub Pages deployment status
- [ ] Collect user feedback on gameplay
- [ ] Review console logs for any issues

---

## Common Issues & Fixes

### Issue: GitHub Pages shows 404
**Fix:**
- Verify `gh-pages` branch exists and is selected in Settings → Pages
- Check that files are at root level (not in subdirectory)
- Wait a few minutes for deployment to complete

### Issue: Frontend loads but WebSocket won't connect
**Fix:**
- Verify `client.js` has correct Workers URL (no `https://` prefix)
- Check CORS headers in Workers backend
- Verify Workers deployment succeeded

### Issue: WebSocket connects but game doesn't load
**Fix:**
- Check browser console for JavaScript errors
- Verify backend is responding to HTTP requests (try `curl https://your-workers-url/health`)
- Check Cloudflare Workers dashboard for errors

### Issue: Tiles aren't displaying
**Fix:**
- Verify `assets/tiles/` directory is in `gh-pages` branch
- Check browser Network tab for 404 errors on image requests
- Verify paths in `index.html` are correct

---

## Rollback Plan

If issues occur, you can quickly revert:

```bash
# Disable GitHub Pages
# (Settings → Pages → Source: None)

# Or switch gh-pages back to old version:
git revert <commit-hash>
git push origin gh-pages

# Or stop Cloudflare Workers:
# (Cloudflare Dashboard → Workers → Disable)
```

---

## Success Metrics

Your deployment is complete when:
1. ✅ GitHub Pages frontend loads at https://kenkenf12.github.io/MahjongDemo/
2. ✅ All 46 tile images display correctly
3. ✅ WebSocket connects to Cloudflare Workers backend
4. ✅ Can create and join game rooms
5. ✅ Multiplayer games function correctly
6. ✅ No console errors or warnings

---

## Post-Launch

After going live:
1. Share the URL: `https://kenkenf12.github.io/MahjongDemo/`
2. Monitor performance metrics in Cloudflare dashboard
3. Collect user feedback
4. Plan for future features (leaderboards, tournaments, etc.)

---

## Questions?

Refer to the full deployment guide: `DEPLOYMENT_GITHUB_PAGES_AND_CLOUDFLARE.md`
