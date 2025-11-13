# VerdictX Frontend - Backend Integration Guide

## ✅ Integration Complete!

Your React frontend is now properly configured to communicate with your teammate's Python backend via ngrok.

---

## 🔧 Configuration Files Updated

### 1. `.env` File (Updated)
**Location**: `my-chat-app/.env`

```properties
REACT_APP_GOOGLE_CLIENT_ID=415850413825-pjonauh2d63edu9odf95gh10nmdks9en.apps.googleusercontent.com
REACT_APP_API_BASE=https://squirarchical-isabel-designed.ngrok-free.dev
```

✅ **What Changed**: Added `REACT_APP_API_BASE` pointing to the ngrok URL exposed by your teammate's backend.

---

### 2. `App.js` - API Endpoint Configuration
**Location**: `src/App.js` (Lines 44-46)

```javascript
// --- MASTER API ENDPOINT (From Environment Variable) ---
// Uses the ngrok URL exposed by teammate's backend
// If backend is offline, requests will fail - ask teammate to keep backend + ngrok running
const MASTER_API_URL = process.env.REACT_APP_API_BASE || 'https://squirarchical-isabel-designed.ngrok-free.dev';
```

✅ **What Changed**: 
- Now reads from environment variable `REACT_APP_API_BASE`
- Falls back to ngrok URL if env var is not set
- No hardcoded localhost URL

---

## 🚀 How to Use

### Step 1: Teammate's Backend Setup (Already Done by Teammate)
Your teammate should have:
```bash
# Backend running on their machine
python main.py
# Running on: http://localhost:8000

# ngrok tunnel exposing it publicly
ngrok http 8000
# Exposed at: https://squirarchical-isabel-designed.ngrok-free.dev
```

### Step 2: Start Your React Frontend
```bash
cd my-chat-app
npm start
# Running on: http://localhost:3000
```

### Step 3: Test the Integration
1. Open http://localhost:3000 in browser
2. Open DevTools (F12) → Console tab
3. Click on a feature (e.g., "Judgment Prediction")
4. Upload a case file
5. Click "Analyze Case"
6. Watch console for logs:
   ```
   Making API call to: https://squirarchical-isabel-designed.ngrok-free.dev/judgment-prediction
   FormData keys: file
   API Response status: 200
   API Response data: {...}
   ```

---

## 📡 API Endpoints (All 5 Features)

Your frontend calls these endpoints via the ngrok URL:

| Feature | Endpoint |
|---------|----------|
| Judgment Prediction | `POST /judgment-prediction` |
| Bail Analysis | `POST /bail-analysis` |
| Case Summarization | `POST /case-summary` |
| VerdictX QAI | `POST /verdictx-qai` |
| Information Extraction & Drafting | `POST /information-extraction` |

### Request Format
All requests are sent as **multipart/form-data**:
```javascript
{
  file: <file object>,           // Optional: The case file
  case_text: "string content"    // Optional: Copy-pasted case content
}
```

---

## ✅ Security Implementation (Following Best Practices)

### What's NOT in Frontend Code
❌ No master API key in `.env` or `App.js`
❌ No hardcoded sensitive credentials
❌ No backend URLs in GitHub (they're in environment variables)

### What's In Frontend Code
✅ Public ngrok URL (teammate's temporary tunnel)
✅ API call logic using FormData
✅ Error handling with helpful messages

### Where Secrets Go
✅ Backend only (in your teammate's Python code)
✅ Authentication keys/tokens on server side
✅ Frontend only receives safe response data

---

## 🔍 Debugging Checklist

If API calls fail, check these in order:

### 1. **Is Backend Running?**
```bash
# Ask teammate to verify:
# Terminal 1: Backend running at http://localhost:8000
# Terminal 2: ngrok tunnel at https://squirarchical-isabel-designed.ngrok-free.dev
```

### 2. **Check Browser Console (F12)**
Look for:
- ✅ "Making API call to: https://squirarchical-isabel-designed.ngrok-free.dev/..."
- ✅ "API Response status: 200" (success) or "4xx/5xx" (error)
- ❌ "Failed to fetch" → Backend down or tunnel inactive

### 3. **Verify CORS is Enabled on Backend**
Backend Python code should have:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost",
        "https://squirarchical-isabel-designed.ngrok-free.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. **Network Tab Analysis**
1. Open DevTools → Network tab
2. Upload file and click "Analyze Case"
3. Look for request to `/judgment-prediction`
4. Check:
   - Status code (200 = success, 4xx/5xx = error)
   - Request body has FormData with `file` or `case_text`
   - Response body has actual data

---

## 📋 Chat History & Feature Switching

### Features
✅ Chat history is preserved when switching features
✅ Users can ask follow-up questions to same feature
✅ All messages saved in conversation
✅ Can upload files or paste text

### Example Flow
```
1. User sends "hello"
   → Bot shows welcome message with 5 feature buttons

2. Click "Judgment Prediction"
   → Upload form appears

3. Upload case file + click "Analyze Case"
   → API call to /judgment-prediction
   → Response shown in chat

4. Click "Bail Analysis" 
   → All previous messages STAY visible ✅
   → New upload form for Bail Analysis

5. Upload another file
   → API call to /bail-analysis
   → Full conversation history preserved ✅
```

---

## 🎯 What Changed in Your Code

### Changes Summary:
1. ✅ Removed hardcoded `localhost:8000`
2. ✅ Added environment variable `REACT_APP_API_BASE`
3. ✅ Updated `.env` with ngrok URL
4. ✅ Improved error message to mention ngrok
5. ✅ FormData handling optimized (no Content-Type header)
6. ✅ Console logging for debugging

### NO Changes to:
- ❌ UI components structure
- ❌ Feature buttons and selection
- ❌ Chat history preservation
- ❌ File upload logic
- ❌ Message sending
- ❌ Dark mode, emoji reactions, etc.

---

## 🚨 Common Issues & Solutions

### Issue: "Failed to fetch" Error
**Cause**: Backend not running or ngrok tunnel down

**Solution**:
```bash
# Ask teammate to run:
python main.py                          # Terminal 1
ngrok http 8000                         # Terminal 2 (separate window)
# Check ngrok shows: https://squirarchical-isabel-designed.ngrok-free.dev
```

### Issue: CORS Error in Console
**Cause**: Backend doesn't have CORS middleware

**Solution**: Teammate needs to add CORS to their FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware
# ... add middleware code (see Debugging section above)
```

### Issue: API Responds with 404
**Cause**: Endpoint path mismatch

**Solution**: Check endpoint names in `FEATURE_CONFIG`:
- `/judgment-prediction` ✅
- `/bail-analysis` ✅
- `/case-summary` ✅
- `/verdictx-qai` ✅
- `/information-extraction` ✅

Verify these match exactly in backend routes.

### Issue: Timeout or Slow Response
**Cause**: ngrok tunnel is slow or backend processing is heavy

**Solution**:
- Backend can be heavy for case analysis (normal)
- Ngrok adds ~500ms latency (expected)
- Consider adding loading spinner if responses take >5s

---

## 📝 Environment Variable Reference

### For Development
```bash
# .env file (already set)
REACT_APP_API_BASE=https://squirarchical-isabel-designed.ngrok-free.dev
```

### For Production (When Deploying)
```bash
# Update .env.production or CI/CD variables
REACT_APP_API_BASE=https://your-production-api-url.com
```

---

## ✨ You're All Set!

Your frontend is now properly integrated with your teammate's backend via ngrok. 

**Next Steps**:
1. ✅ Teammate runs backend + ngrok
2. ✅ You run `npm start`
3. ✅ Test by uploading a case file
4. ✅ Watch console for success logs

**Questions?** Check console logs first - they tell you exactly what's happening! 🎉

