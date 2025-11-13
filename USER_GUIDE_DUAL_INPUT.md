# VerdictX Dual Input System - User Guide ✅

## Your App Currently Supports BOTH Inputs

### 1️⃣ FEATURE SELECTION
When user types "Hello" or opens the app, they see 5 feature buttons:
```
⚖️ Judgment Prediction
🔓 Bail Analysis  
📋 Case Summarization
🤖 VerdictX QAI
📄 Information Extraction & Drafting
```

### 2️⃣ AFTER FEATURE SELECTED
Once a feature is selected, the message box becomes active with TWO INPUT OPTIONS:

#### OPTION A: File Upload
```
Click "+" button (plus icon) in message input area
↓
Select "Attach Files" for documents
or
Select "Attach Photos" for images
↓
Choose PDF/Image from computer
↓
File preview appears in chat
↓
Click Send (with or without additional text)
```

#### OPTION B: Text Input
```
Click in message input box
↓
Type your case details/text
↓
Click Send button
↓
Backend receives plain text
```

#### OPTION C: Both Together
```
1. Attach a file (using "+" button)
2. Type text in message box
3. Click Send
↓
Backend receives BOTH file AND text
```

## Backend Will Receive

### If File Only:
```json
FormData {
  file: <binary PDF/image>,
  case_text: null
}
```

### If Text Only:
```json
FormData {
  file: null,
  case_text: "User's typed text..."
}
```

### If Both:
```json
FormData {
  file: <binary PDF/image>,
  case_text: "User's typed text..."
}
```

## Code Flow

```
handleSendMessage() (Line 670)
    ↓
if (selectedFeature) {
    ↓
    handleFeatureAPICall(selectedFeature, messageText)
        ↓
        Prepare FormData {
            if (attachedFile?.file) append file
            if (fileContent/messageText) append case_text
        }
        ↓
        fetch(endpoint, {
            method: 'POST',
            body: formData
        })
}
```

## UI Elements

### Message Input Area (Bottom of Chat)
```
[+] [😊] [Text Input Box___] [Send ➤]
  ↑
  ├─ Attachment button (shows menu on click)
  ├─ Emoji picker
  ├─ Text input (enabled when feature selected)
  └─ Send button (enabled if text OR file present)
```

### Attachment Menu (When "+" clicked)
```
📄 Attach Files
🖼️  Attach Photos
```

### File Preview (After Upload)
```
┌─────────────────────┐
│ 📄 document.pdf     │
│ 245 KB              │
│ [✕] (remove)       │
└─────────────────────┘
```

## User Workflows

### Workflow 1: Analysis Using Uploaded Case File
```
1. Select "⚖️ Judgment Prediction"
2. Click "+"
3. Attach: "murder_case.pdf"
4. Click Send
5. Backend: Analyzes PDF using /predict/judgment
```

### Workflow 2: Analysis Using Typed Case Details
```
1. Select "📋 Case Summarization"
2. Type: "This is a contract dispute case where..."
3. Click Send
4. Backend: Summarizes text using /summary/case
```

### Workflow 3: Analysis Using Both
```
1. Select "🔓 Bail Analysis"
2. Attach: "bail_petition.pdf"
3. Type: "Focus on financial conditions and flight risk"
4. Click Send
5. Backend: /predict/bail receives both file AND text
```

### Workflow 4: Follow-up Questions
```
1. User submitted case analysis (either file or text)
2. Bot returned analysis results
3. Active Context indicator shows at top
4. User can now:
   - Type follow-up question in message box
   - Click Send
   - Backend: /qa/followup receives question + context
```

## Key Features ✅

| Feature | Status | How |
|---------|--------|-----|
| File Upload | ✅ Active | Click "+" button |
| Text Input | ✅ Active | Type in message box |
| Both Together | ✅ Active | Attach + Type + Send |
| Text Only | ✅ Active | Type + Send (skip file) |
| File Only | ✅ Active | Attach + Send (skip text) |
| Follow-ups | ✅ Active | After analysis submitted |

## No Changes Required! 

Your app **already perfectly implements** this dual-input system:

✅ Text input box always available when feature selected
✅ File attachment button always available
✅ Both work independently OR together
✅ Backend receives FormData with both fields (optional)
✅ Complete user flexibility

## Backend Implementation Example

```python
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse

@app.post("/predict/judgment")
async def predict_judgment(
    file: UploadFile = File(None),
    case_text: str = Form(None)
):
    case_data = ""
    
    # Process file if provided
    if file:
        file_content = await file.read()
        # OCR/extract text from PDF
        case_data += extract_text_from_pdf(file_content)
    
    # Process text if provided
    if case_text:
        case_data += case_text
    
    # Ensure we have data
    if not case_data:
        return {"error": "No file or text provided"}
    
    # Perform judgment prediction
    result = predict_judgment_logic(case_data)
    return {"status": "success", "prediction": result}

@app.post("/predict/bail")
async def predict_bail(
    file: UploadFile = File(None),
    case_text: str = Form(None)
):
    # Same pattern as above
    pass

@app.post("/summary/case")
async def summarize_case(
    file: UploadFile = File(None),
    case_text: str = Form(None)
):
    # Same pattern as above
    pass

@app.post("/qa/query")
async def qa_query(
    file: UploadFile = File(None),
    case_text: str = Form(None)
):
    # Q&A on uploaded document or provided text
    pass
```

## Summary

**Your VerdictX app is perfectly configured for dual-input!**

Users can:
- 📄 Upload case documents (PDF/images)
- ⌨️ Type case details manually
- 📎 Do both at the same time

All features work seamlessly, and the backend receives data in the correct FormData format.

No modifications to code structure or functionality needed! ✅
