# Follow-Up Questions Implementation - Complete Guide

## Overview
Follow-up questions are now **fully implemented and enabled** for all 5 features in VerdictX. This guide explains how the feature works, how to test it, and what to expect.

---

## How Follow-Up Questions Work

### 1. **Feature Selection & Initial Response**
- User selects a feature from the welcome message (e.g., "⚖️ Judgment Prediction")
- User sends their first query with text and/or PDF
- System calls the **main feature endpoint** (e.g., `/predict/judgment`)
- Bot responds with formatted answer
- Response is tagged with `featureKey` to track which feature was used

### 2. **Follow-Up Question Detection**
When the user sends another message:
- System checks if there's already a bot response from the selected feature
- If YES → Routes to the **followup endpoint** (e.g., `/predict/followup/judgment`)
- If NO → Routes to the **main endpoint**

### 3. **Context Sending**
For follow-up questions, the system sends:
- The new question
- **Conversation history** (all previous messages in JSON format)
- This allows the backend to understand the context

---

## Implementation Details

### Modified Functions in `App.js`

#### 1. **Updated `handleSendMessage()` (Lines 674-684)**
```javascript
// Detect if this is a follow-up question
const lastBotMsg = [...currentChat].reverse().find(
  msg => msg.sender === 'bot' && msg.featureKey === selectedFeature
);

if (lastBotMsg && messageText.trim() && !fileData) {
  // Follow-up question → use followupEndpoint
  await handleFollowupQuestion(messageText);
} else {
  // New request → use main endpoint
  await handleFeatureAPICall(selectedFeature, messageText);
}
```

**Logic:**
- If there's a bot message with the current feature AND
- User typed text (no file) THEN
- Call follow-up function
- Otherwise, call regular feature function

#### 2. **Enhanced `handleFollowupQuestion()` (Lines 545-598)**
```javascript
// Build conversation history for context
const conversationHistory = currentChat
  .filter(msg => !msg.isWelcomeMessage && !msg.isTyping)
  .map(msg => ({
    sender: msg.sender,
    text: msg.text
  }));

const formData = new FormData();
formData.append('question', question);
formData.append('conversation_history', JSON.stringify(conversationHistory));
```

**Key additions:**
- Sends full conversation history to backend
- Filters out welcome messages and typing indicators
- Includes `featureKey` in response for tracking

---

## Configuration - All Features Ready

Each feature in `FEATURE_CONFIG` (Lines 71-113) has both endpoints configured:

### 1. **⚖️ Judgment Prediction**
```javascript
'judgment_prediction': {
  name: 'Judgment Prediction',
  endpoint: '/predict/judgment',
  followupEndpoint: '/predict/followup/judgment',
  // ... other config
}
```

### 2. **🔓 Bail Analysis**
```javascript
'bail_analysis': {
  name: 'Bail Analysis',
  endpoint: '/predict/bail',
  followupEndpoint: '/predict/followup/bail',
  // ... other config
}
```

### 3. **📋 Case Summarization**
```javascript
'case_summarization': {
  name: 'Case Summarization',
  endpoint: '/summary/case',
  followupEndpoint: '/predict/followup/summary',
  // ... other config
}
```

### 4. **🤖 VerdictX QAI**
```javascript
'verdictx_qai': {
  name: 'VerdictX QAI',
  endpoint: '/qa/query',
  followupEndpoint: '/qa/followup',
  // ... other config
}
```

### 5. **📄 Information Extraction & Document Drafting**
```javascript
'information_extraction': {
  name: 'Information Extraction & Document Drafting',
  endpoint: '/predict/extraction',
  followupEndpoint: '/predict/followup/extraction',
  // ... other config
}
```

---

## Testing Follow-Up Questions

### **Test Scenario 1: Judgment Prediction with Follow-Up**

1. **Start Chat** → Click "New Chat"
2. **Select Feature** → Click "⚖️ Judgment Prediction"
3. **Submit Query** → Enter: 
   - Text: "A defendant is accused of theft worth $500. What's the likely verdict?"
   - Or upload a case document
4. **Get Response** → Bot provides judgment prediction with confidence scores
5. **Ask Follow-Up** → Type: "What factors would increase the likelihood of acquittal?"
6. **Expected Behavior**:
   - System should recognize this as a follow-up
   - Should call `/predict/followup/judgment` endpoint (not `/predict/judgment`)
   - Should send conversation history to backend
   - Bot responds with answer contextual to the original judgment

### **Test Scenario 2: Bail Analysis with Follow-Up**

1. **Select Feature** → "🔓 Bail Analysis"
2. **Initial Query** → "The defendant has a stable job and family. Should bail be granted?"
3. **Bot Responds** → With bail verdict and reasoning
4. **Follow-Up** → "What if the defendant has prior convictions?"
5. **Expected Behavior**:
   - Routes to `/predict/followup/bail`
   - Includes context about stable job/family in history
   - Response considers the new information in context

### **Test Scenario 3: Case Summarization with Follow-Up**

1. **Select Feature** → "📋 Case Summarization"
2. **Upload Document** → Legal case document
3. **Bot Responds** → With case summary
4. **Follow-Up** → "What are the key legal precedents?"
5. **Expected Behavior**:
   - Routes to `/predict/followup/summary`
   - Sends conversation history including the case summary
   - Responds with precedents related to the case

### **Test Scenario 4: VerdictX QAI with Follow-Up**

1. **Select Feature** → "🤖 VerdictX QAI"
2. **Ask Question** → "What is the legal definition of mens rea?"
3. **Bot Responds** → With detailed explanation
4. **Follow-Up** → "How does this apply to negligence cases?"
5. **Expected Behavior**:
   - Routes to `/qa/followup`
   - Includes previous Q&A in context
   - Responds with application to negligence

### **Test Scenario 5: Information Extraction with Follow-Up**

1. **Select Feature** → "📄 Information Extraction & Document Drafting"
2. **Upload Document** → Contract or legal document
3. **Bot Responds** → With extracted entities and drafted clauses
4. **Follow-Up** → "Can you draft an amendment based on this extraction?"
5. **Expected Behavior**:
   - Routes to `/predict/followup/extraction`
   - Sends extracted information in context
   - Responds with amendment draft

---

## Key Behavioral Rules

### **When Follow-Up is Triggered:**
✅ User has selected a feature  
✅ A bot has already responded with that feature  
✅ User types text (no file attachment)  
→ **Result:** Use followup endpoint

### **When Main Endpoint is Used:**
✅ First message after selecting feature  
✅ User uploads a new file  
✅ Different feature is selected  
→ **Result:** Use main endpoint

### **Context Sent to Backend:**
- User's current question
- All previous messages (filtered)
- Message sender (user/bot)
- Message text content

### **What's NOT Sent:**
- File attachments (follow-ups are text-only)
- Welcome messages
- Typing indicators
- User IDs or session tokens

---

## Browser Console Logging

When testing, open **Developer Tools (F12)** and check the **Console** tab:

**For a regular feature call:**
```
Making API call to: https://squirarchical-isabel-designed.ngrok-free.dev/predict/judgment
```

**For a follow-up question:**
```
Making followup API call to: https://squirarchical-isabel-designed.ngrok-free.dev/predict/followup/judgment
```

The different endpoint confirms the system correctly detected it as a follow-up.

---

## Troubleshooting Follow-Ups

### **Issue: Follow-up is calling main endpoint instead of followup endpoint**

**Check:**
1. Is there a bot message with `featureKey` in the conversation?
   - Bot messages must have `featureKey: selectedFeature` property
   - Verify in Network tab → look at bot message JSON

2. Is the user sending text-only (no file)?
   - Follow-ups only work for text messages
   - Uploading a file triggers main endpoint

3. Is the same feature still selected?
   - If user clicked a different feature button, it changes the context

**Solution:**
- Ensure bot responses include `featureKey` property
- Check that followupEndpoint is configured in FEATURE_CONFIG for the feature

### **Issue: Backend doesn't receive conversation history**

**Check Network tab:**
1. Click the followup API request
2. Go to **Payload** or **Request Body** tab
3. Verify `conversation_history` field contains JSON array
4. Should look like: `[{"sender":"user","text":"..."},{"sender":"bot","text":"..."}]`

**Solution:**
- Backend should parse `conversation_history` from FormData
- If not present, the backend may need update to receive context

### **Issue: Follow-ups give irrelevant responses**

**Possible causes:**
1. **Backend not using conversation history** - Backend needs to be configured to use the history
2. **History filter too aggressive** - Try adjusting the filter in handleFollowupQuestion
3. **Feature semantics** - Some features may need custom follow-up logic

**Solution:**
- Coordinate with backend team to verify they're using `conversation_history`
- Ensure followup endpoints accept and process the context

---

## Code Changes Summary

### **Files Modified:**
- `src/App.js` (only file modified)

### **Functions Modified:**
1. `handleSendMessage()` - Added follow-up detection logic (10 lines added)
2. `handleFollowupQuestion()` - Enhanced with conversation history (6 lines added)

### **No Structure/Functionality Changes:**
- All existing components preserved
- No refactoring of code structure
- No modification to existing functions beyond the above
- All new code is additive only

---

## Feature Completeness Checklist

- ✅ Follow-up detection implemented
- ✅ All 5 features configured with followupEndpoints
- ✅ Conversation history sent with follow-ups
- ✅ Feature key stored in bot messages
- ✅ Response formatting supports all features
- ✅ Error handling for follow-ups
- ✅ No breaking changes to existing code

---

## Next Steps

1. **Backend Configuration:**
   - Ensure all followup endpoints exist on backend
   - Ensure backends accept and process `conversation_history` parameter
   - Test each followup endpoint individually

2. **End-to-End Testing:**
   - Test all 5 features with follow-up scenarios
   - Verify conversation history is utilized correctly
   - Check response quality improves with context

3. **User Feedback:**
   - Monitor if follow-ups are improving answer quality
   - Collect feedback on context handling
   - Iterate on question/history filtering if needed

---

## Support & Questions

For issues or questions about follow-up questions:
1. Check browser console for API endpoint logs
2. Check Network tab in DevTools for request/response
3. Verify conversation_history is being sent
4. Contact backend team to confirm followup endpoints are configured

