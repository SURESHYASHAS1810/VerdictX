// apiService.js - FastAPI Integration Layer
const API_BASE_URL = 'YOUR_BACKEND_URL'; // Your friend will provide this
const API_KEY = 'YOUR_API_KEY'; // Your friend will provide this

const APIService = {
  // Basic PDF extraction
  extractPDF: async (pdfFile) => {
    const formData = new FormData();
    formData.append('file', pdfFile);

    const response = await fetch(`${API_BASE_URL}/api/extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    return await response.json();
  },

  // Smart extraction with fields
  smartExtract: async (pdfFile, fields) => {
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('fields', JSON.stringify(fields));

    const response = await fetch(`${API_BASE_URL}/api/smart-extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    return await response.json();
  },

  // Get available fields
  getAvailableFields: async () => {
    const response = await fetch(`${API_BASE_URL}/api/fields`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  },

  // Filter existing results
  filterFields: async (jsonData, fields) => {
    const response = await fetch(`${API_BASE_URL}/api/filter-fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: jsonData,
        fields: fields
      })
    });

    return await response.json();
  },

  // Generate PDF report
  generatePDF: async (jsonData) => {
    const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    return await response.blob(); // Returns PDF file
  },

  // Extract and download in one step
  extractAndDownload: async (pdfFile) => {
    const formData = new FormData();
    formData.append('file', pdfFile);

    const response = await fetch(`${API_BASE_URL}/api/extract-and-download`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    return await response.blob(); // Returns PDF file
  }
};

export default APIService;