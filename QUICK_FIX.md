# 🚀 Quick Reference - Google OAuth Fix

## The Issue
```
Error 400: origin_mismatch
```

## The Solution (30 seconds)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth Client ID
3. Add to **JavaScript Origins**: `http://localhost:3000`
4. Add to **Redirect URIs**: `http://localhost:3000/`
5. Click SAVE
6. Refresh your app

## That's It!
Sign in will work after those changes. ✅

---

## What You're Setting Up
```
Google OAuth → Your App (localhost:3000)
                    ↓
            Your App → Backend (via ngrok)
```

Only Google OAuth is broken. Backend integration is perfect! 💯

