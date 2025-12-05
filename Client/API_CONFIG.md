# API Configuration Guide

## Environment Variables

The frontend now uses a centralized API configuration that automatically falls back to localhost if the environment variable is not set.

### Configuration File
Location: `src/config/api.js`

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Environment Setup

**For Production (Vercel):**
```env
VITE_API_URL=https://didbackend.vercel.app
```

**For Local Development:**
```env
VITE_API_URL=http://localhost:5000
```

Or simply omit `VITE_API_URL` and it will default to `http://localhost:5000`

### Updated Components

All API calls have been updated to use the centralized `API_URL` from `src/config/api.js`:

- ✅ `NewAuth.jsx` - Authentication flow
- ✅ `Success.jsx` - User info display
- ✅ `AppRegistration.jsx` - App registration
- ✅ `AppSetup.jsx` - App management
- ✅ `Dashboard/Profile.jsx` - User profile
- ✅ `Dashboard/Sidebar.jsx` - Sidebar user info
- ✅ `Dashboard/MyApps.jsx` - Apps list
- ✅ `Dashboard/DashboardTabContent.jsx` - Dashboard content

### How It Works

1. **Production**: Set `VITE_API_URL` in Vercel environment variables
2. **Development**: Either set it in `.env` or let it default to localhost
3. **Automatic Fallback**: If `VITE_API_URL` is not set, uses `http://localhost:5000`

### Deployment Steps

1. Deploy backend to Vercel → Get URL (e.g., `https://didbackend.vercel.app`)
2. Update `Client/.env`:
   ```env
   VITE_API_URL=https://didbackend.vercel.app
   ```
3. Deploy frontend to Vercel
4. Set `VITE_API_URL` in Vercel Dashboard → Environment Variables
5. Redeploy frontend

### Testing

**Local Development:**
```bash
# Backend
cd Backend
npm run dev

# Frontend (in another terminal)
cd Client
npm run dev
```

**Production:**
- Frontend will automatically use `https://didbackend.vercel.app`
- All API calls will route to your production backend
