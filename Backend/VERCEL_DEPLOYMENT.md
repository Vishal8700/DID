# Vercel Deployment Guide

## ✅ Your Backend is Ready for Vercel!

### What's Already Done:
- ✅ Backend moved to `api/server.js`
- ✅ `app.listen()` removed
- ✅ ES Module export configured
- ✅ `vercel.json` configured
- ✅ Dynamic CORS for production
- ✅ Dynamic domain/URI for SIWE

---

## 🚀 Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Navigate to Backend folder
```bash
cd Backend
```

### 3. Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (Select your account)
- Link to existing project? **N** (first time)
- Project name? (Press Enter or type a name)
- In which directory is your code located? **.**
- Want to override settings? **N**

### 4. Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:
```
MONGODB_URI = mongodb+srv://didauth:JUeHY2NtuJxQRNFm@cluster0.3ji8uzs.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET = your-secret-key-change-this
INFURA_KEY = 1db3bf96da314fc2bf8b028f15dcf6b1
PRIVATE_KEY = 53c0d3479b0f4c729620fa3a998554728989ccef97565a1cfded361fa57ab02a
FRONTEND_URL = https://your-frontend-domain.vercel.app
```

**⚠️ IMPORTANT:** Replace `FRONTEND_URL` with your actual frontend Vercel URL after deploying the frontend.

### 5. Redeploy After Adding Environment Variables
```bash
vercel --prod
```

---

## 🔗 Your API Endpoints

After deployment, your API will be available at:
```
https://your-backend.vercel.app/api/challenge/:address
https://your-backend.vercel.app/api/auth
https://your-backend.vercel.app/api/userinfo
https://your-backend.vercel.app/api/register-app
... (all other endpoints)
```

---

## 🧪 Testing Your Deployment

### Test the root endpoint:
```bash
curl https://your-backend.vercel.app/
```

Expected response:
```json
{ "message": "Hello from Vercel Express!" }
```

### Test the stats endpoint:
```bash
curl https://your-backend.vercel.app/api/stats/users
```

---

## 🔧 Update Frontend Configuration

After deploying, update your frontend `.env` file:

**Client/.env**
```
VITE_API_URL=https://your-backend.vercel.app
```

Then redeploy your frontend.

---

## 📝 Common Issues & Solutions

### Issue: CORS errors
**Solution:** Make sure `FRONTEND_URL` environment variable is set in Vercel with your frontend domain.

### Issue: MongoDB connection fails
**Solution:** Verify `MONGODB_URI` is correctly set in Vercel environment variables.

### Issue: 404 on API routes
**Solution:** Ensure `vercel.json` routes are configured correctly (already done).

### Issue: Environment variables not working
**Solution:** After adding env vars, redeploy with `vercel --prod`.

---

## 🎯 Next Steps

1. Deploy backend to Vercel
2. Copy the backend URL
3. Add `FRONTEND_URL` environment variable in Vercel
4. Update frontend `.env` with backend URL
5. Deploy frontend to Vercel
6. Test authentication flow

---

## 📊 Monitoring

View logs in real-time:
```bash
vercel logs
```

Or check the Vercel Dashboard → Your Project → Deployments → View Function Logs
