# Quick Follow-Up Testing Guide

## What's New?
Follow-up questions are now **fully implemented** for all 5 features. When you ask a follow-up question after getting a response, the system automatically detects it and uses the appropriate follow-up endpoint with conversation context.

---

## Quick Test (2 minutes)

### Step 1: Open App
1. Go to http://localhost:3000
2. Sign in with Google

### Step 2: Select Feature
- Click any feature button (e.g., "⚖️ Judgment Prediction")
- Badge should appear below message box showing selected feature

### Step 3: Ask Initial Question
- Type: `"What is the likely verdict for a first-time shoplifter?"`
- Send message
- Wait for bot response

### Step 4: Check Console
- Open **F12** (Developer Tools) → **Console** tab
- You should see: `Making API call to: https://squirarchical-isabel-designed.ngrok-free.dev/predict/judgment`
- This is the **main endpoint** ✓

### Step 5: Ask Follow-Up
- Type: `"What if the defendant had prior convictions?"`
- Send message
- Wait for bot response

### Step 6: Check Console Again
- Should see: `Making followup API call to: https://squirarchical-isabel-designed.ngrok-free.dev/predict/followup/judgment`
- This is the **followup endpoint** ✓
- This means **follow-up was detected correctly!**

### Step 7: Verify Response
- Bot should provide contextual answer considering both original and follow-up question
- Response starts with "⚖️ FOLLOW-UP ANSWER" header

---

## Expected Behavior

### ✅ What Should Happen:

| Scenario | Expected Action | Endpoint Used |
|----------|-----------------|---------------|
| Select feature, ask question | Routes to main feature API | `/predict/judgment` |
| Ask follow-up (text only) | Routes to followup API | `/predict/followup/judgment` |
| Ask follow-up after upload | Routes to main API | `/predict/judgment` |
| Switch to different feature | Routes to new feature API | New feature endpoint |
| Ask follow-up on new feature | Routes to new feature followup | New feature followup |

---

## All 5 Features Ready

Each feature supports follow-ups:

1. **⚖️ Judgment Prediction**
   - Main: `/predict/judgment`
   - Follow-up: `/predict/followup/judgment`

2. **🔓 Bail Analysis**
   - Main: `/predict/bail`
   - Follow-up: `/predict/followup/bail`

3. **📋 Case Summarization**
   - Main: `/summary/case`
   - Follow-up: `/predict/followup/summary`

4. **🤖 VerdictX QAI**
   - Main: `/qa/query`
   - Follow-up: `/qa/followup`

5. **📄 Information Extraction & Document Drafting**
   - Main: `/predict/extraction`
   - Follow-up: `/predict/followup/extraction`

---

## Common Issues & Quick Fixes

### Issue: Follow-up calling main endpoint
- **Check:** Are you typing text only? (no file upload)
- **Fix:** Follow-ups work for text-only questions

### Issue: Console shows different endpoint than expected
- **Check:** Browser console (F12)
- **Verify:** Are you asking a question after getting a response?
- **Note:** First question after feature selection always uses main endpoint

### Issue: Backend not responding to follow-up
- **Check:** Does backend have the followup endpoints configured?
- **Verify:** Network tab shows the followup endpoint being called
- **Contact:** Backend team to enable followup endpoints

---

## What Was Changed

### Code Changes (App.js only):

1. **Follow-Up Detection Logic (Lines 674-684)**
   - Checks if bot already responded with selected feature
   - Detects if current message is text-only (no file)
   - Routes to followup endpoint if conditions met

2. **Conversation History (Lines 551-570)**
   - Collects previous messages for context
   - Sends as JSON with question
   - Backend can use for context-aware responses

3. **Feature Tagging**
   - Bot responses include `featureKey` property
   - Enables tracking which feature was used

### No Breaking Changes
- All existing code preserved
- No refactoring of components
- No changes to state management
- Only additive enhancements

---

## Network Tab Verification

To verify follow-ups are working:

1. **Open F12** → **Network** tab
2. **Ask initial question** with feature selected
3. **Look for request** to `/predict/[feature]`
4. **Ask follow-up question**
5. **Look for request** to `/predict/followup/[feature]`
6. **Click the followup request**
7. **Check Payload/Request Body** - should include:
   - `question`: The user's follow-up question
   - `conversation_history`: JSON array of previous messages

---

## Testing Checklist

- [ ] Select a feature (badge appears)
- [ ] Ask initial question (gets response)
- [ ] Check console shows main endpoint
- [ ] Ask follow-up (gets contextual response)
- [ ] Check console shows followup endpoint
- [ ] Verify response has "FOLLOW-UP ANSWER" header
- [ ] Test with different feature (works independently)
- [ ] Test all 5 features with follow-ups

---

## Backend Integration Notes

For the backend team, here's what's being sent:

**Follow-up Request:**
```json
{
  "question": "User's follow-up question",
  "conversation_history": "[{\"sender\":\"user\",\"text\":\"...\"},{\"sender\":\"bot\",\"text\":\"...\"}]"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "response": "Follow-up answer text"
}
```

---

## Success Indicators

✅ Follow-up feature is working if:
- Console shows different endpoint for follow-ups
- Bot responses have "FOLLOW-UP ANSWER" header
- Conversation history is sent with follow-up requests
- Backend receives conversation_history parameter
- Responses consider context from previous messages

