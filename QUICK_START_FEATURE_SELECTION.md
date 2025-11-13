# VerdictX Feature Selection - Quick Start Guide 🚀

## User Journey

### Step 1: Welcome Message (After Login)
```
Welcome to VerdictX — Your Legal AI Assistant

[⚖️ Judgment Prediction]
[🔓 Bail Analysis]
[📋 Case Summarization]
[🤖 VerdictX QAI]
[📄 Information Extraction & Drafting]
```

### Step 2: Select a Feature
User clicks any feature button → Feature gets selected

### Step 3: Feature Selected State
Message input area shows:
```
┌─────────────────────────────────┐
│ [+] [😊] [✕ Judgment Prediction] │ (message input placeholder changes)
│ Enter text or use + to attach file for Judgment Prediction...
│                                       [Send ➤]
└─────────────────────────────────┘
```

### Step 4a: Send Text Only
User types: `"Case details about vehicle accident..."`
Click Send → Feature processes text

### Step 4b: Send File Only
1. Click `+` icon
2. Choose "Attach Files"
3. Select PDF
4. Click Send → Feature processes file

### Step 4c: Send File + Text
1. Click `+` icon
2. Select file (shown in message input)
3. Type: `"Focus on liability aspects"`
4. Click Send → Feature processes both

### Step 5: Change Feature
Click any other feature button → Previous deselected, new one selected

### Step 6: Clear Selection
Click `✕` on feature badge → Back to normal chat mode

---

## API Call Details

When user sends message with feature selected:

```javascript
// Backend receives:
POST https://squirarchical-isabel-designed.ngrok-free.dev/predict/judgment

FormData:
  ├─ file: <File object> (if attached)
  └─ case_text: "Case details about..." (if text entered)

// Backend response shown in chat:
"Based on the case details you provided..."
```

---

## Feature Endpoints

| Feature | Endpoint | Input Type |
|---------|----------|-----------|
| Judgment Prediction | `/predict/judgment` | Text or PDF file |
| Bail Analysis | `/predict/bail` | Text or PDF file |
| Case Summarization | `/summary/case` | Text or PDF file |
| VerdictX QAI | `/qa/query` | Text query |
| Information Extraction & Drafting | `/predict/extraction` | Text or PDF file |

---

## Message Box Behavior

### No Feature Selected
```
Placeholder: "Type your message here..."
Send Button: Enabled (if text entered)
Behavior: Normal chat mode
```

### Feature Selected
```
Placeholder: "Enter text or use + to attach file for [Feature Name]..."
+ Button: Opens File/Photo attachment menu
Send Button: Enabled (if text OR file provided)
Feature Badge: Shows selected feature with X to clear
```

---

## File Upload Options

### Via + Button
```
┌─ Attach Menu
│  ├─ [📄 Attach Files] → Select PDF/DOC/TXT
│  └─ [🖼️ Attach Photos] → Select IMAGE
```

**Supported Files:**
- PDFs: `.pdf`, `.PDF`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, etc.
- Documents: `.doc`, `.docx`, `.txt`

---

## Key Differences from Previous Version

### BEFORE ❌
```
User clicks feature
    ↓
Large file upload area appears in chat bubble
    ↓
User must upload file within that area
    ↓
User must click "Analyze Case" button
```

### AFTER ✅
```
User clicks feature
    ↓
Small badge appears in message input
    ↓
User can type text OR click + to upload file
    ↓
User clicks Send button (normal message flow)
```

---

## Error Handling

If backend is unavailable:
```
User sees message: "Error: API Error: 502..."
Console shows detailed error logs
User can retry by sending message again
```

If file upload fails:
```
User sees: "Failed to process file"
Can clear file (X button) and try again
```

---

## Tips for Users

✅ **DO:**
- Select a feature first
- Use the message box for all interactions
- Click X to change features
- Attach multiple times if needed

❌ **DON'T:**
- Try to upload without selecting feature
- Close feature selection mid-processing
- Attach huge files (check size in dialog)

---

## For Developers

### Testing Workflow

1. **Login**: Use Google OAuth
2. **Select Feature**: Click any feature button
3. **Send Text**:
   ```javascript
   Type text → Click Send
   // handleFeatureAPICall('judgment_prediction', 'case text here')
   ```
4. **Send File**:
   ```javascript
   Click + → Select file → Click Send
   // handleFeatureAPICall('judgment_prediction', '', fileData)
   ```
5. **Verify Backend**: Check that response comes back and displays in chat

### State Management

Key states:
- `selectedFeature`: Which feature button was clicked
- `attachedFile`: File object from + button
- `message`: Text in input box
- `currentChat`: All messages in conversation

### Function Calls

```javascript
// When feature button clicked
setSelectedFeature('judgment_prediction')

// When + → file selected
setAttachedFile({
  name: 'case.pdf',
  type: 'application/pdf',
  size: 2048000,
  file: File,
  url: 'blob:...'
})

// When Send clicked (with feature)
handleFeatureAPICall('judgment_prediction', messageText)
// Makes POST to backend endpoint with FormData
```

---

## Next Steps

1. Ensure backend is running with active ngrok tunnel
2. Test each feature endpoint
3. Verify file upload handling on backend
4. Test response display in chat
5. Test error cases (network errors, timeouts, etc.)

Good luck! 🎉
