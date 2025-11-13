# Dual Input Support - Both File Upload AND Text Input ✅

## Overview
Your VerdictX app **ALREADY SUPPORTS BOTH OPTIONS**:
- ✅ Upload case file (PDF/image)
- ✅ Manually type case text in message box
- ✅ Use either option OR both together

## How It Works

### Option 1: File Upload Only
1. Select a feature (e.g., "⚖️ Judgment Prediction")
2. Click "+" button → "Attach Files"
3. Select PDF/image file with case details
4. Click Send button
5. Backend receives: `file` (FormData)

### Option 2: Text Input Only
1. Select a feature (e.g., "📋 Case Summarization")
2. Type case text directly in message box
3. Click Send button
4. Backend receives: `case_text` (FormData text field)

### Option 3: Both File AND Text
1. Select a feature
2. Attach a file using "+" button
3. Type additional instructions/context in message box
4. Click Send button
5. Backend receives: BOTH `file` AND `case_text`

## Technical Implementation

### FormData Structure (Backend Receives)
```javascript
// File upload handler (line 367-372 in App.js)
const formData = new FormData();
if (attachedFile?.file) {
  formData.append('file', attachedFile.file);  // PDF/Image
}
if (fileContent) {
  formData.append('case_text', fileContent);   // Text from message box
}
```

### Backend Should Handle
```python
@app.post("/predict/judgment")
async def predict_judgment(
    file: UploadFile = None,
    case_text: str = None
):
    # Handle file if present
    if file:
        content = await file.read()
        # OCR/extract text from PDF/image
    
    # Handle text if present
    if case_text:
        content = case_text
    
    # Use whichever (or both) is available
    # Process and return results
```

## Message Flow

```
User Action → Form Data Prepared → Backend API Call
     ↓              ↓                      ↓
Select Feature   file: PDF         /predict/judgment
     ↓            + 
Type Text        case_text: "..."  
     ↓            
Send Button      
```

## Code Locations

| Feature | File | Lines |
|---------|------|-------|
| Feature selection | App.js | 1490-1528 |
| Text input | App.js | 2095-2120 |
| File attachment | App.js | 1960-2010 |
| Send handler | App.js | 670-720 |
| API call | App.js | 335-405 |
| FormData prep | App.js | 367-372 |

## Current Status

✅ **Text Input**: Fully working
- Users can type in message box when feature selected
- Input box shows placeholder: "Type your message here..."
- Send button enabled when text OR file present

✅ **File Upload**: Fully working
- Click "+" button to open attachment menu
- "Attach Files" option for documents
- "Attach Photos" option for images
- File preview shows in chat

✅ **Both Together**: Fully working
- User can attach file AND type text
- Both sent together in single FormData

## How to Test

1. **Test Text Only**:
   - Select "📋 Case Summarization"
   - Type: "Summarize this case about contract disputes..."
   - Click Send
   - Backend receives: `case_text` = "Summarize..."

2. **Test File Only**:
   - Select "⚖️ Judgment Prediction"
   - Attach PDF file
   - Click Send (without typing)
   - Backend receives: `file` = PDF content

3. **Test Both**:
   - Select "🔓 Bail Analysis"
   - Attach PDF file
   - Type: "Focus on bail factors"
   - Click Send
   - Backend receives: `file` + `case_text`

## Important Notes

### ✅ No Changes Needed
The code structure is preserved and already supports all scenarios.

### ✅ No Features Removed
- File upload: Still available via "+" button
- Text input: Always enabled when feature selected
- Both options: Work together seamlessly

### ✅ Backend Expectations
Your backend should:
1. Accept `file` parameter (optional)
2. Accept `case_text` parameter (optional)
3. Handle cases where only one is present
4. Handle cases where both are present

## Example API Endpoints

```python
# Judgment Prediction
POST /predict/judgment
- file: UploadFile (optional) - PDF case document
- case_text: str (optional) - Plain text case details

# Bail Analysis
POST /predict/bail
- file: UploadFile (optional) - Bail petition document
- case_text: str (optional) - Plain text case details

# Case Summarization
POST /summary/case
- file: UploadFile (optional) - Full case document
- case_text: str (optional) - Case text for summarization

# VerdictX QAI
POST /qa/query
- file: UploadFile (optional) - Reference document
- case_text: str (optional) - Question or context
```

## Summary

**Your app already implements dual input support perfectly!**

- Users can upload files
- Users can type text
- Users can do both at once
- All options work with any feature
- Backend receives data in FormData format
- No modifications to structure or functionality
