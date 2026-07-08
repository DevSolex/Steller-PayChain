# PayChain Deployment Guide

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `paychain-db`
   - **Database**: `paychain`
   - **User**: `paychain`
   - **Region**: Oregon (US West)
   - **Plan**: Free
4. Click **Create Database**
5. Copy the **Internal Database URL** (starts with `postgresql://`)

### Step 2: Deploy Backend

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `paychain-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `apps/backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run db:generate && npm run build`
   - **Start Command**: `npm run start:migrate`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<paste Internal Database URL from Step 1>
   JWT_SECRET=<generate a random 32-char string>
   JWT_EXPIRES_IN=7d
   STELLAR_NETWORK=testnet
   STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
   STELLAR_SOROBAN_RPC=https://soroban-testnet.stellar.org
   STELLAR_ADMIN_SECRET=SAAJ6H4V56OKOUPFQNIX23VMTDAUYVD3NZLORHWHJYINRNXLONNV447S
   PAYROLL_CONTRACT_ID=CA6D63AASZ74PCD5N22X7IEH2IT7SWPBXOMYD3J5ZRQM4PVD6L6NZ2KQ
   PAYMENT_CONTRACT_ID=CDXABK45X4EIUBFDBPXYS25GEK3COFO47XBAII5R3NAPNCDL7XBVMZMA
   ```

5. **Optional**: Add Redis
   - If you want caching, add `REDIS_URL` from a Render Redis instance
   - For free tier without Redis, the app will work fine (just slower)

6. Click **Create Web Service**

7. Once deployed, copy the service URL (e.g., `https://paychain-backend.onrender.com`)

8. Update the `FRONTEND_URL` environment variable:
   - Go to Environment tab
   - Add: `FRONTEND_URL=https://paychain-frontend.vercel.app` (update after frontend deploy)

---

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=<your Render backend URL>/api
   NEXT_PUBLIC_APP_NAME=PayChain
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   ```

   Example:
   ```
   NEXT_PUBLIC_API_URL=https://paychain-backend.onrender.com/api
   ```

5. Click **Deploy**

6. Once deployed, copy the production URL (e.g., `https://paychain-frontend.vercel.app`)

### Step 2: Update Backend CORS

1. Go back to Render dashboard
2. Open your `paychain-backend` service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://paychain-frontend.vercel.app
   ```
5. Click **Save Changes** (service will redeploy automatically)

---

## Verification

### Backend Health Check
```bash
curl https://paychain-backend.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### Frontend
Visit `https://paychain-frontend.vercel.app` — you should see the PayChain landing page

---

## Post-Deployment

### Database Schema
The `start:migrate` command runs `prisma db push` on every deploy, which syncs your schema with the database.

### Monitoring
- **Render**: Check logs at https://dashboard.render.com
- **Vercel**: Check logs at https://vercel.com/dashboard

### Troubleshooting

**Backend won't start:**
- Check Render logs for errors
- Verify `DATABASE_URL` is correct
- Ensure all required env vars are set

**Frontend can't connect to backend:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend `FRONTEND_URL` matches your Vercel domain
- Check browser console for CORS errors

**Database connection fails:**
- Render free tier databases spin down after 90 days of inactivity
- First request after spindown takes ~30 seconds to wake up

---

## Alternative: One-Click Deploy

If you have a `render.yaml` in your repo root, you can use Render's Blueprint:

1. Go to https://dashboard.render.com/blueprints
2. Click **New Blueprint Instance**
3. Connect your repo
4. Render will auto-provision database + web service from `render.yaml`

Note: You'll still need to manually set `FRONTEND_URL` and `REDIS_URL` after deploy.
