/**
 * Legal Document API Service
 * Handles all interactions with the FastAPI backend for document extraction and PDF generation
 */

const API_BASE_URL = 'https://crampingly-untrying-trinh.ngrok-free.dev';

const LegalDocumentAPI = {
  /**
   * Extract information from a PDF file and download the generated report
   * @param {File} file - PDF file to process
   * @returns {Promise<{success: boolean, filename: string}>}
   */
  extractAndDownloadPDF: async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Starting PDF extraction and download for:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/extract-and-download`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'legal_report.pdf';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Received empty response from server');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Successfully downloaded:', filename);
      return { success: true, filename };
    } catch (error) {
      console.error('Extract and download error:', error);
      throw error;
    }
  },

  /**
   * Extract information from a PDF file (without download)
   * @param {File} file - PDF file to process
   * @returns {Promise<{structured: Object}>}
   */
  extractPDF: async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Extracting information from:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Extraction successful:', data);
      return data;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw error;
    }
  },

  /**
   * Extract with custom field filtering
   * @param {File} file - PDF file to process
   * @param {Array<string>} fields - Fields to extract
   * @returns {Promise<Object>}
   */
  smartExtractPDF: async (file, fields = null) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Smart extracting from:', file.name, 'with fields:', fields);

      const formData = new FormData();
      formData.append('file', file);
      if (fields && fields.length > 0) {
        formData.append('fields', JSON.stringify(fields));
      }

      const response = await fetch(`${API_BASE_URL}/api/smart-extract-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Smart extraction successful:', data);
      return data;
    } catch (error) {
      console.error('Smart extraction error:', error);
      throw error;
    }
  },

  /**
   * Generate a custom PDF report with filtered fields
   * @param {Object} data - Extracted data
   * @param {Array<string>} fields - Fields to include in report
   * @returns {Promise<Blob>}
   */
  generateCustomPDF: async (data, fields) => {
    try {
      console.log('Generating custom PDF with fields:', fields);

      const response = await fetch(`${API_BASE_URL}/api/generate-custom-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          fields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('PDF generated successfully');
      return blob;
    } catch (error) {
      console.error('Generate PDF error:', error);
      throw error;
    }
  },

  /**
   * Get available fields for extraction
   * @returns {Promise<Object>}
   */
  getAvailableFields: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fields`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Available fields:', data);
      return data;
    } catch (error) {
      console.error('Get fields error:', error);
      throw error;
    }
  },

  /**
   * Send a chat message to the AI
   * @param {string} message - User message
   * @param {string} chatId - Chat ID
   * @param {Object} context - Additional context (extracted data, etc.)
   * @returns {Promise<Object>}
   */
  sendChatMessage: async (message, chatId, context = null) => {
    try {
      console.log('Sending chat message:', message);

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatId,
          context: context || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat response:', data);
      return data;
    } catch (error) {
      console.error('Chat message error:', error);
      throw error;
    }
  },

  /**
   * Health check endpoint
   * @returns {Promise<boolean>}
   */
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  /**
   * Extract information from an image file and download as PDF
   * Supports: PNG, JPG, JPEG, BMP, TIFF, GIF, WEBP
   * @param {File} file - Image file to process
   * @returns {Promise<{success: boolean, filename: string}>}
   */
  extractAndDownloadImage: async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Starting image extraction and download for:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/extract-image-download`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'legal_report.pdf';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Received empty response from server');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Successfully downloaded image report:', filename);
      return { success: true, filename };
    } catch (error) {
      console.error('Image extract and download error:', error);
      throw error;
    }
  },

  /**
   * Extract information from an image file (without download)
   * @param {File} file - Image file to process
   * @returns {Promise<{structured: Object, source: string}>}
   */
  extractImage: async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Extracting information from image:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/extract-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Image extraction successful:', data);
      return data;
    } catch (error) {
      console.error('Image extraction error:', error);
      throw error;
    }
  },

  /**
   * Extract with custom field filtering from image
   * @param {File} file - Image file to process
   * @param {Array<string>} fields - Fields to extract
   * @returns {Promise<Object>}
   */
  smartExtractImage: async (file, fields = null) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Smart extracting from image:', file.name, 'with fields:', fields);

      const formData = new FormData();
      formData.append('file', file);
      if (fields && fields.length > 0) {
        formData.append('fields', fields.join(','));
      }

      const response = await fetch(`${API_BASE_URL}/api/smart-extract-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Image smart extraction successful:', data);
      return data;
    } catch (error) {
      console.error('Image smart extraction error:', error);
      throw error;
    }
  },

  /**
   * Extract selected fields from image and download as PDF
   * @param {File} file - Image file to process
   * @param {Array<string>} fields - Fields to include in report
   * @returns {Promise<{success: boolean, filename: string}>}
   */
  smartExtractImagePDF: async (file, fields = null) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Smart extracting from image and downloading:', file.name);

      const formData = new FormData();
      formData.append('file', file);
      if (fields && fields.length > 0) {
        formData.append('fields', fields.join(','));
      }

      const response = await fetch(`${API_BASE_URL}/api/smart-extract-image-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'legal_report.pdf';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Received empty response from server');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Successfully downloaded filtered image report:', filename);
      return { success: true, filename };
    } catch (error) {
      console.error('Smart extract image PDF error:', error);
      throw error;
    }
  },

  /**
   * Check if file format is supported for image extraction
   * @param {File} file - File to check
   * @returns {boolean}
   */
  isImageSupported: (file) => {
    if (!file) return false;
    const supportedFormats = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif', '.webp'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return supportedFormats.includes(fileExtension);
  },

  /**
   * Get all supported file formats
   * @returns {Array<string>}
   */
  getSupportedFormats: () => {
    return {
      pdf: ['.pdf'],
      images: ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif', '.webp'],
      all: ['.pdf', '.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif', '.webp']
    };
  },
};

export default LegalDocumentAPI;
