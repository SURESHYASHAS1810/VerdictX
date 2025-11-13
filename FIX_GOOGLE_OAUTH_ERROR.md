# ✅ Fix Google OAuth Error - Step by Step

## 🔴 The Problem
```
Error 400: origin_mismatch
Access blocked: Authorisation error
```

This happens because:
- Your app is running on `http://localhost:3000`
- Google OAuth doesn't have this origin authorized
- You need to add it to Google Cloud Console

---

## 🔧 Solution: Add Localhost to Google OAuth

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account
3. Look for your project (VerdictX or similar)

### Step 2: Find OAuth Credentials
1. In left sidebar, go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (the one with ID: `415850413825-pjonauh2d63edu9odf95gh10nmdks9en.apps.googleusercontent.com`)
3. Click on it to edit

### Step 3: Add Authorized JavaScript Origins
1. Scroll to **"Authorized JavaScript origins"**
2. Click **"+ ADD URI"**
3. Add these 3 origins:
   - `http://localhost:3000`
   - `http://localhost`
   - `http://127.0.0.1:3000`

### Step 4: Add Authorized Redirect URIs
1. Scroll to **"Authorized redirect URIs"**
2. Click **"+ ADD URI"**
3. Add these 2 URIs:
   - `http://localhost:3000/`
   - `http://localhost:3000/signin`

### Step 5: Save
1. Click **"SAVE"** button at bottom
2. Wait a few seconds for changes to apply

### Step 6: Clear Browser Cache
1. Press **Ctrl + Shift + Delete** (or Cmd + Shift + Delete on Mac)
2. Clear cookies and cached images
3. Or open app in **Incognito/Private** window

### Step 7: Test Again
1. Refresh your app at `http://localhost:3000`
2. Try signing in with Google
3. Should work now! ✅

---

## 📸 Reference (What It Looks Like)

**Authorized JavaScript origins section:**
```
✓ http://localhost:3000
✓ http://localhost
✓ http://127.0.0.1:3000
```

**Authorized redirect URIs section:**
```
✓ http://localhost:3000/
✓ http://localhost:3000/signin
```

---

## ⏱️ How Long Does It Take?
Usually 5-10 seconds, but can take up to 5 minutes for changes to propagate.

**If still doesn't work after 5 minutes:**
1. Clear browser cache again
2. Try in a different browser
3. Try in Incognito window
4. Restart your React app (`npm start`)

---

## ✅ Checklist
- [ ] Opened Google Cloud Console
- [ ] Found OAuth 2.0 credentials for your app
- [ ] Added `http://localhost:3000` to JavaScript origins
- [ ] Added `http://localhost:3000/` to redirect URIs
- [ ] Clicked SAVE
- [ ] Cleared browser cache
- [ ] Refreshed app page
- [ ] Tried signing in again

---

## 🎯 If You Don't Have Access
If you can't access Google Cloud Console:
- You need the email that created the Google Cloud project
- Ask the project owner to add you as an Editor
- Then follow steps above

---

## 📝 Current Configuration in Code
Your app uses this Google Client ID:
```javascript
const GOOGLE_CLIENT_ID = '415850413825-pjonauh2d63edu9odf95gh10nmdks9en.apps.googleusercontent.com';
```

This is fine - just needs the localhost origins authorized in Cloud Console.

---

**Once you add localhost:3000 to Google OAuth, sign-in will work! 🎉**

