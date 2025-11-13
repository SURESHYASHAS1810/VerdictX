import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import LandingPage from './LandingPage';
import {
  Menu,
  X,
  MessageSquarePlus,
  Trash2,
  Share2,
  Check,
  Copy,
  User,
  ChevronDown,
  LogOut,
  FileDown,
  Smile,
  Edit,
  Sun,
  Moon,
  FileText,
  Image,
  Plus,
  Send,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

// Import your storage service (assuming it exists)
const StorageService = {
  getUser: () => JSON.parse(localStorage.getItem('user')),
  setUser: (user) => { localStorage.setItem('user', JSON.stringify(user)); return true; },
  clearUser: () => localStorage.removeItem('user'),
  getAllChats: (userId) => JSON.parse(localStorage.getItem(`chats_${userId}`) || '[]'),
  saveChat: (chatId, messages, title) => {
    const user = StorageService.getUser();
    if (!user) return;
    const chats = StorageService.getAllChats(user.id);
    const existingIndex = chats.findIndex(c => String(c.id) === String(chatId));
    const chatData = { id: chatId, title, messages, date: 'Just now' };
    if (existingIndex >= 0) {
      chats[existingIndex] = chatData;
    } else {
      chats.unshift(chatData);
    }
    localStorage.setItem(`chats_${user.id}`, JSON.stringify(chats));
  },
  getChat: (chatId) => {
    const user = StorageService.getUser();
    if (!user) return null;
    const chats = StorageService.getAllChats(user.id);
    return chats.find(c => String(c.id) === String(chatId));
  },
  deleteChat: (chatId) => {
    const user = StorageService.getUser();
    if (!user) return;
    const chats = StorageService.getAllChats(user.id).filter(c => String(c.id) !== String(chatId));
    localStorage.setItem(`chats_${user.id}`, JSON.stringify(chats));
  },
  getCurrentChatId: () => localStorage.getItem('currentChatId'),
  setCurrentChatId: (chatId) => localStorage.setItem('currentChatId', String(chatId)),
  clearCurrentChatId: () => localStorage.removeItem('currentChatId'),
};

const DEFAULT_AVATAR_URL = '/VerdictX5.png';
const GOOGLE_CLIENT_ID = '415850413825-pjonauh2d63edu9odf95gh10nmdks9en.apps.googleusercontent.com';
const EMOJIS = ['👍', '👎', '😊', '💡', '🚀', '✅', '🔥', '⚖️'];
const MASTER_API_URL = 'https://squirarchical-isabel-designed.ngrok-free.dev';
const EXTRACTION_API_URL = 'https://crampingly-untrying-trinh.ngrok-free.dev';

const FEATURE_CONFIG = {
  'judgment_prediction': {
    name: 'Judgment Prediction',
    endpoint: '/predict/judgment',
    followupEndpoint: '/predict/followup/judgment',
    icon: '⚖️',
    acceptsText: true,
    acceptsPdf: true,
    inputType: 'both',
    apiUrl: MASTER_API_URL
  },
  'bail_analysis': {
    name: 'Bail Analysis',
    endpoint: '/predict/bail',
    followupEndpoint: '/predict/followup/bail',
    icon: '🔓',
    acceptsText: false,
    acceptsPdf: true,
    inputType: 'pdf',
    apiUrl: MASTER_API_URL
  },
  'case_summarization': {
    name: 'Case Summarization',
    endpoint: '/summary/case',
    followupEndpoint: '/predict/followup/summary',
    icon: '📋',
    acceptsText: false,
    acceptsPdf: true,
    inputType: 'pdf',
    apiUrl: MASTER_API_URL
  },
  'verdictx_qai': {
    name: 'VerdictX QAI',
    endpoint: '/qa/query',
    followupEndpoint: '/qa/followup',
    icon: '🤖',
    acceptsText: true,
    acceptsPdf: false,
    inputType: 'text',
    apiUrl: MASTER_API_URL
  },
  'information_extraction': {
    name: 'Information Extraction & Document Drafting',
    endpoint: '/api/extract-and-download',
    followupEndpoint: '/api/extract-and-download',
    icon: '📄',
    acceptsText: true,
    acceptsPdf: true,
    inputType: 'both',
    apiUrl: EXTRACTION_API_URL
  }
};

const TypingIndicator = ({ isDarkMode }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
    {[0, 0.2, 0.4].map((delay, i) => (
      <div key={i} style={{
        display: 'inline-block',
        width: '4px',
        height: '4px',
        margin: '0 2px',
        backgroundColor: isDarkMode ? '#fff' : '#000',
        borderRadius: '50%',
        animation: 'typing 1s infinite ease-in-out',
        animationDelay: `${delay}s`
      }} />
    ))}
    <style>{`
      @keyframes typing {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `}</style>
  </div>
);

// Format structured responses based on feature type
const formatStructuredResponse = (data, featureKey) => {
  if (featureKey === 'judgment_prediction') {
    const precedentsHTML = data.precedents?.length
      ? data.precedents.map((p, i) => `${i + 1}. [${p.outcome}] (Similarity: ${(p.similarity * 100).toFixed(1)}%)\n${p.text}`).join('\n\n')
      : 'No similar precedents found.';

    return `======================================================================
⚖️  CASE TYPE: ${data.case_type || 'Unknown'}
======================================================================

🎯 PREDICTION: ${data.prediction}
   Confidence: ${data.confidence || 'N/A'}%
   (Grant: ${data.grant_probability || 0}% | Reject: ${data.reject_probability || 0}%)

======================================================================
LEGAL ANALYSIS (Case Summary + IRAC)
======================================================================
${data.llm_analysis || 'No IRAC analysis available.'}

======================================================================
SIMILAR PRECEDENTS (Top ${data.precedents?.length || 0})
======================================================================
${precedentsHTML}`;
  }

  if (featureKey === 'bail_analysis') {
    const bailRel = data.bail_relevance || {};
    const verdict = data.verdict_info?.verdict || 'VERDICT NOT CLEAR';
    
    const finalProb = data.final_verdict_prob ? (data.final_verdict_prob * 100).toFixed(1) : 'N/A';
    const finalRejectProb = data.final_verdict_prob ? ((1 - data.final_verdict_prob) * 100).toFixed(1) : 'N/A';
    const finalVerdict = data.final_verdict_text || 'UNCERTAIN';
    
    const mlProb = data.ml_prob ? (data.ml_prob * 100).toFixed(1) : 'N/A';
    const mlRejectProb = data.ml_prob ? ((1 - data.ml_prob) * 100).toFixed(1) : 'N/A';
    const confPercentage = data.ml_confidence ? (data.ml_confidence * 100).toFixed(1) : 'N/A';
    
    const relevanceNote = !bailRel.is_bail_case
      ? `\n======================================================================
⚠️  NOTE: This is a ${data.case_type || 'Legal Case'}, NOT a bail application
   Bail mentions in judgment: ${bailRel.bail_mentions || 0}
   Relevance score: ${bailRel.relevance_score || 0}%
======================================================================\n`
      : '';

    const statusNote = bailRel.case_closed
      ? `\n======================================================================
📌 CASE STATUS: ${bailRel.case_status || 'Closed/Decided'}
======================================================================\n`
      : '';

    const summaryText = data.summary && data.summary.length > 0
      ? data.summary.map((point, i) => `${i + 1}. ${point}`).join('\n')
      : 'No summary available.';

    const reasonsText = data.reasons && data.reasons.length > 0
      ? data.reasons.map((point, i) => `${i + 1}. ${point}`).join('\n')
      : 'No reasoning available.';

    const emoji = finalProb >= 60 ? '✅' : finalProb < 40 ? '❌' : '⚠️';

    return `======================================================================
📋 CASE ANALYSIS RESULTS
======================================================================

⚖️  CASE TYPE: ${data.case_type || 'Unknown'}
${statusNote}${relevanceNote}
======================================================================
📖 CASE SUMMARY
======================================================================
${summaryText}

======================================================================
🎓 LEGAL ANALYSIS (IRAC Method)
======================================================================
${data.irac_analysis || 'No IRAC analysis available.'}

📊 BAIL PREDICTION
----------------------------------------------------------------------

Final Verdict: ${finalVerdict}
Bail Grant Probability: ${finalProb}%
Bail Reject Probability: ${finalRejectProb}%

${emoji} FINAL TENDENCY: ${finalVerdict}

======================================================================
📝 KEY LEGAL REASONING
======================================================================
${reasonsText}

======================================================================
✅ ANALYSIS COMPLETE
======================================================================`;
  }

  if (featureKey === 'case_summarization') {
    return `
${data.summary || 'No summary available.'}`;
  }

  if (featureKey === 'verdictx_qai') {
    return `======================================================================
⚖️  LEGAL RESPONSE
======================================================================
${data.response || 'No response available.'}`;
  }

  if (featureKey === 'information_extraction') {
    const extractedEntities = data.extracted_entities || {};
    const draftedDocuments = data.drafted_documents || [];

    const entitiesText = Object.keys(extractedEntities).length > 0
      ? Object.entries(extractedEntities).map(([key, value]) => `${key}: ${value}`).join('\n')
      : 'No entities extracted.';

    const documentsText = draftedDocuments.length > 0
      ? draftedDocuments.map((doc, i) => `${i + 1}. ${doc.title}\n${doc.content}`).join('\n\n')
      : 'No documents drafted.';

    return `======================================================================
📄 INFORMATION EXTRACTION & DOCUMENT DRAFTING
======================================================================

🔍 EXTRACTED INFORMATION
----------------------------------------------------------------------
${entitiesText}

📝 DRAFTED DOCUMENTS
----------------------------------------------------------------------
${documentsText}

======================================================================
✅ EXTRACTION & DRAFTING COMPLETE
======================================================================`;
  }

  return JSON.stringify(data, null, 2);
};

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showSignup, setShowSignup] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentChat, setCurrentChat] = useState([]);
  
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const [attachedFile, setAttachedFile] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const [currentChatId, setCurrentChatId] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [reactionPickerId, setReactionPickerId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const chatContainerRef = useRef(null);

  const colors = {
    bgApp: isDarkMode ? '#121212' : 'white',
    bgPrimary: isDarkMode ? '#242424' : '#f9fafb',
    textPrimary: isDarkMode ? 'white' : '#1f2937',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#4b5563' : '#e5e7eb',
    chatBubbleUser: isDarkMode ? '#10b981' : '#3b82f6',
    chatBubbleBot: isDarkMode ? '#242424' : '#f3f4f6',
    chatActive: isDarkMode ? '#2563eb' : '#e0e7ff',
    inputBorder: isDarkMode ? '#6b7280' : '#d1d5db',
    inputBg: isDarkMode ? '#121212' : 'white',
  };

  useEffect(() => {
    const savedUser = StorageService.getUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }
    
    const chats = StorageService.getAllChats(savedUser?.id);
    setChatHistory(chats);
    
    const lastChatId = StorageService.getCurrentChatId();
    if (lastChatId) {
      const lastChat = StorageService.getChat(lastChatId);
      if (lastChat) {
        setCurrentChatId(lastChatId);
        setCurrentChat(lastChat.messages || []);
      }
    }
  }, []);

  const filteredChatHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentChat]);

  const generateChatTitle = (messages) => {
    if (messages.length === 0) return 'New conversation';
    
    const firstUserMessage = messages.find(msg => msg.sender === 'user' && !msg.isTyping);
    if (!firstUserMessage) return 'New conversation';
    
    const words = firstUserMessage.text.split(' ');
    const titleWords = words.slice(0, 4).join(' ');
    return words.length > 4 ? `${titleWords}...` : titleWords;
  };

  useEffect(() => {
    if (currentChatId && currentChat.length > 0) {
      const newTitle = generateChatTitle(currentChat);
      
      StorageService.saveChat(currentChatId, currentChat, newTitle);
      
      setChatHistory(prevHistory => {
        return prevHistory.map(chat => {
          if (String(chat.id) === String(currentChatId)) {
            return {
              ...chat,
              title: newTitle,
              messages: currentChat,
              date: 'Just now'
            };
          }
          return chat;
        });
      });
    }
  }, [currentChat, currentChatId]);

  const handleLogout = () => { 
    setIsLoggedIn(false); 
    setCurrentUser(null); 
    setCurrentChat([]); 
    setCurrentChatId(null); 
    setLoginForm({ email: '', password: '' }); 
    setShowUserMenu(false); 
    setChatHistory([]);
    setSelectedFeature(null);
    
    StorageService.clearUser();
    StorageService.clearCurrentChatId();
  };

  const handleExportPdf = () => {
    if (currentChat.length === 0) {
      alert('No chat messages to export');
      return;
    }

    // Create HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Alata', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #1f2937;
              margin: 0;
              padding: 20px;
              background-color: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #3b82f6;
              margin: 0;
              font-size: 28px;
            }
            .header-info {
              color: #6b7280;
              margin: 8px 0 0 0;
              font-size: 13px;
            }
            .chat-container {
              max-width: 900px;
              margin: 0 auto;
            }
            .message {
              margin-bottom: 16px;
              page-break-inside: avoid;
            }
            .user-message {
              background-color: #dbeafe;
              color: #1f2937;
              padding: 12px 16px;
              border-radius: 12px;
              margin-left: 80px;
              border-left: 4px solid #3b82f6;
            }
            .bot-message {
              background-color: #f3f4f6;
              color: #1f2937;
              padding: 12px 16px;
              border-radius: 12px;
              margin-right: 80px;
              border-left: 4px solid #9ca3af;
            }
            .message-label {
              font-weight: 600;
              font-size: 12px;
              margin-bottom: 4px;
              color: #4b5563;
            }
            .message-text {
              white-space: pre-wrap;
              word-break: break-word;
              font-size: 14px;
            }
            .message-time {
              font-size: 11px;
              color: #9ca3af;
              margin-top: 6px;
              font-style: italic;
            }
            .footer {
              margin-top: 40px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚖️ VerdictX Chat Export</h1>
            <div class="header-info">
              <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 5px 0;">Time: ${new Date().toLocaleTimeString()}</p>
              <p style="margin: 5px 0;">User: ${currentUser?.name || 'Unknown'}</p>
              ${selectedFeature ? `<p style="margin: 5px 0;">Feature: ${FEATURE_CONFIG[selectedFeature]?.name || 'Unknown'}</p>` : '<p style="margin: 5px 0;">Feature: Multiple</p>'}
            </div>
          </div>
          
          <div class="chat-container">
            ${currentChat.map((msg) => `
              <div class="message">
                <div class="${msg.sender === 'user' ? 'user-message' : 'bot-message'}">
                  <div class="message-label">${msg.sender === 'user' ? '👤 You' : '🤖 VerdictX'}</div>
                  <div class="message-text">${(msg.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                  <div class="message-time">${msg.time || new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">© VerdictX - AI Legal Assistant | Confidential</p>
            <p style="margin: 5px 0;">Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    // Use html2pdf to generate and download PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    const opt = {
      margin: 8,
      filename: `VerdictX_Chat_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    // Generate PDF
    // eslint-disable-next-line no-undef
    if (typeof html2pdf !== 'undefined') {
      // eslint-disable-next-line no-undef
      html2pdf().set(opt).from(element).save();
    } else {
      // Fallback to text download if html2pdf is not available
      const textContent = `
VerdictX Chat Export
================================================================================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
User: ${currentUser?.name || 'Unknown'}
Feature: ${selectedFeature ? FEATURE_CONFIG[selectedFeature]?.name : 'Multiple'}
================================================================================

${currentChat.map((msg) => {
  const sender = msg.sender === 'user' ? '👤 YOU' : '🤖 VERDICTX';
  return `[${msg.time || ''}] ${sender}:\n${msg.text || '(No text)'}\n\n`;
}).join('')}
================================================================================
© VerdictX - AI Legal Assistant | Confidential
Generated on: ${new Date().toLocaleString()}
      `;

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VerdictX_Chat_${new Date().getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleReaction = (messageId, emoji) => {
    setCurrentChat(prevChat => prevChat.map(msg => {
      if (msg.id === messageId) {
        const currentReactions = msg.reactions || {};
        const newCount = (currentReactions[emoji] || 0) + 1;
        return {
          ...msg,
          reactions: { ...currentReactions, [emoji]: newCount }
        };
      }
      return msg;
    }));
    setReactionPickerId(null);
  };

  const deleteMessage = (messageId) => {
    setCurrentChat(prevChat => prevChat.filter(msg => msg.id !== messageId));
  };
  
  const startEditMessage = (messageObj) => {
    if (messageObj.sender === 'user') {
      setIsEditing(true);
      setEditMessageId(messageObj.id);
      setMessage(messageObj.text);
      setShowEmojiPicker(false);
    }
  };

  const handleFeatureAPICall = async (featureKey, messageText) => {
    if (!FEATURE_CONFIG[featureKey]) {
      console.error('Invalid feature:', featureKey);
      return;
    }

    const config = FEATURE_CONFIG[featureKey];

    try {
      setIsBotTyping(true);
      
      const userMsg = {
        id: Date.now(),
        sender: 'user',
        text: messageText || `Processing ${config.name}...`,
        file: attachedFile || null,
        timestamp: new Date(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCurrentChat(prev => [...prev, userMsg]);

      const formData = new FormData();
      
      if (config.inputType === 'pdf' || config.inputType === 'both') {
        if (attachedFile?.file) {
          formData.append('file', attachedFile.file);
          console.log('Appended file:', attachedFile.file.name, 'Type:', attachedFile.file.type);
        }
      }
      
      if (config.inputType === 'text' || config.inputType === 'both') {
        if (messageText) {
          formData.append(config.inputType === 'text' ? 'question' : 'case_text', messageText);
        }
      }

      // Use /api/extract-and-download for information_extraction (both PDF and Image)
      let endpoint = config.apiUrl + config.endpoint;
      if (selectedFeature === 'information_extraction') {
        endpoint = config.apiUrl + '/api/extract-and-download';
        console.log('Using extract-and-download for:', endpoint);
      }
      
      console.log('Making API call to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Check if response is PDF, Image, or JSON (for information_extraction feature)
      const contentType = response.headers.get('content-type');
      
      if (contentType && (contentType.includes('application/pdf') || contentType.includes('image/'))) {
        // Handle file download for information_extraction (PDF or Image)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'extracted_file';
        if (contentType.includes('application/pdf')) {
          filename = filename + '.pdf';
        } else if (contentType.includes('image/png')) {
          filename = filename + '.png';
        } else if (contentType.includes('image/jpeg')) {
          filename = filename + '.jpg';
        } else if (contentType.includes('image/')) {
          filename = filename + '.img';
        }
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `✅ Document extracted and downloaded successfully!\n\nFile: ${filename}`,
          timestamp: new Date(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          featureKey: featureKey
        };
        setCurrentChat(prev => [...prev, botMsg]);
      } else if (contentType && contentType.includes('application/json')) {
        // Handle JSON response (extracted data from image or other sources)
        const data = await response.json();
        console.log('API Response data:', data);

        if (data.status === 'error') {
          throw new Error(data.error || 'Unknown error from API');
        }

        // For information_extraction feature, format the response nicely
        let formattedText;
        if (selectedFeature === 'information_extraction') {
          formattedText = formatStructuredResponse(data, featureKey);
        } else {
          formattedText = formatStructuredResponse(data, featureKey);
        }

        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: formattedText,
          timestamp: new Date(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          featureKey: featureKey
        };
        setCurrentChat(prev => [...prev, botMsg]);
      } else {
        // Handle other response types
        const data = await response.json();
        console.log('API Response data:', data);

        if (data.status === 'error') {
          throw new Error(data.error || 'Unknown error from API');
        }

        const formattedText = formatStructuredResponse(data, featureKey);

        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: formattedText,
          timestamp: new Date(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          featureKey: featureKey
        };
        setCurrentChat(prev => [...prev, botMsg]);
      }

      setAttachedFile(null);
      setMessage('');
      
    } catch (error) {
      console.error('API Error:', error);
      const apiUrl = config.apiUrl;
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `❌ Error: ${error.message}\n\nPlease check if the backend server is running at ${apiUrl}`,
        timestamp: new Date(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCurrentChat(prev => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleFollowupQuestion = async (question) => {
    if (!selectedFeature || !question.trim()) return;

    const config = FEATURE_CONFIG[selectedFeature];
    if (!config || !config.followupEndpoint) return;

    try {
      setIsBotTyping(true);

      const userMsg = {
        id: Date.now(),
        sender: 'user',
        text: question,
        timestamp: new Date(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCurrentChat(prev => [...prev, userMsg]);

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

      const endpoint = config.apiUrl + config.followupEndpoint;
      console.log('Making followup API call to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.error || 'Unknown error');
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `======================================================================\n⚖️ FOLLOW-UP ANSWER\n======================================================================\n${data.response || 'No response available.'}`,
        timestamp: new Date(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        featureKey: selectedFeature
      };
      setCurrentChat(prev => [...prev, botMsg]);

    } catch (error) {
      console.error('Followup API Error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `❌ Error: ${error.message}`,
        timestamp: new Date(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCurrentChat(prev => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleFileAttachment = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileObj = {
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        url: URL.createObjectURL(file)
      };
      setAttachedFile(fileObj);
      setMessage('');
      event.target.value = '';
    }
    setShowAttachMenu(false);
  };

  const handlePhotoAttachment = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const fileObj = {
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          url: URL.createObjectURL(file)
        };
        setAttachedFile(fileObj);
        setMessage('');
      } else {
        alert('Please select an image file');
      }
      event.target.value = '';
    }
    setShowAttachMenu(false);
  };

  const handleSendMessage = async () => {
    if ((message.trim() || attachedFile) && !isBotTyping) {
      let messageText = message;
      let fileData = attachedFile;

      setMessage('');
      setAttachedFile(null);
      
      if (isEditing) {
        setCurrentChat(prevChat => prevChat.map(msg => 
          msg.id === editMessageId ? { ...msg, text: messageText } : msg
        ));
        setIsEditing(false);
        setEditMessageId(null);
        return;
      }

      // If a feature is selected, process it through the API
      if (selectedFeature && (messageText.trim() || fileData)) {
        // Check if this is a follow-up question (bot already responded with this feature)
        const lastBotMsg = [...currentChat].reverse().find(msg => msg.sender === 'bot' && msg.featureKey === selectedFeature);
        
        if (lastBotMsg && messageText.trim() && !fileData) {
          // This is a follow-up question - use the followup endpoint
          await handleFollowupQuestion(messageText);
        } else {
          // This is a new feature request - use the main endpoint
          await handleFeatureAPICall(selectedFeature, messageText);
        }
        return;
      }

      setIsBotTyping(true);
      
      const newMessage = {
        text: messageText,
        sender: 'user',
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now(),
        file: fileData ? { name: fileData.name, url: fileData.url, type: fileData.type } : undefined
      };
      
      let newChatId = currentChatId;

      if (!currentChatId) {
        newChatId = Date.now();
        const newChat = {
          id: newChatId,
          title: 'New conversation',
          date: 'Just now',
          messages: [newMessage]
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChatId);
        StorageService.setCurrentChatId(newChatId);
      }

      const botPlaceholderId = Date.now() + 1;
      const initialBotMessage = {
        text: 'AI is thinking...', 
        sender: 'bot',
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTyping: true,
        id: botPlaceholderId
      };
      
      setCurrentChat(prev => [...prev, newMessage, initialBotMessage]);

      setTimeout(() => {
        setCurrentChat(prevChat => {
          const lastMessageIndex = prevChat.findIndex(msg => msg.id === botPlaceholderId);
          
          if (lastMessageIndex !== -1) {
            const updatedLastMessage = {
                ...prevChat[lastMessageIndex],
                text: '',
                isWelcomeMessage: true,
                isTyping: false,
                timestamp: Date.now(),
            };
            return [...prevChat.slice(0, lastMessageIndex), updatedLastMessage];
          }
          return prevChat;
        });
        
        setIsBotTyping(false);
      }, 2000);
    }
  };

  const startNewChat = () => { 
    setCurrentChat([]); 
    setCurrentChatId(null); 
    setShowSidebar(false); 
    setMessage('');
    setSelectedFeature(null);
    setAttachedFile(null);
    StorageService.clearCurrentChatId();
  };
  
  const deleteChat = (chatId, e) => { 
    e.stopPropagation(); 
    
    StorageService.deleteChat(chatId);
    
    setChatHistory(chatHistory.filter(chat => chat.id !== chatId)); 
    
    if (currentChatId === chatId) { 
      setCurrentChat([]); 
      setCurrentChatId(null); 
      setSelectedFeature(null);
      StorageService.clearCurrentChatId();
    } 
  };
  
  const loadChat = (chat) => { 
    setCurrentChat(chat.messages || []); 
    setCurrentChatId(chat.id); 
    setShowSidebar(false);
    
    const lastBotMessage = [...(chat.messages || [])].reverse().find(msg => msg.sender === 'bot' && msg.featureKey);
    if (lastBotMessage) {
      setSelectedFeature(lastBotMessage.featureKey);
    }
    
    StorageService.setCurrentChatId(chat.id);
  };

  const handleKeyPress = (e) => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSendMessage(); 
    } 
  };
  
  const generateShareLink = () => { 
    return `${window.location.origin}/shared/${currentChatId || 'new-chat-id'}`;
  };
  
  const copyShareLink = () => { 
    const link = generateShareLink();
    
    try {
        const tempInput = document.createElement('textarea');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        setLinkCopied(true);
        setTimeout(() => {
          setLinkCopied(false);
          setShowShareMenu(false);
        }, 2000);

    } catch (err) {
        console.error("Could not copy text: ", err);
        setLoginError("Failed to copy link. Please copy manually."); 
        setTimeout(() => setLoginError(''), 3000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '20px',
        fontFamily: 'Alata, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '440px',
          padding: '48px 40px',
          position: 'relative'
        }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Alata, sans-serif',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '180px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              maxWidth: '95%',
              position: 'relative'
            }}>
              <img 
                src="/VerdictX5.png"
                alt="VerdictX Logo"
                style={{
                  width: '180px',
                  height: '45px',
                  objectFit: 'contain',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.target.onerror = null;
                  e.target.src = '/VerdictX2.png';
                }}
              />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: 0, fontFamily: 'Alata, sans-serif' }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', fontFamily: 'Alata, sans-serif' }}>
              {showSignup ? 'Create your account to get started' : 'Sign in to continue to your chats'}
            </p>
          </div>

          {!showSignup ? (
            <form onSubmit={(e) => { e.preventDefault(); setLoginError('Invalid credentials'); }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', fontFamily: 'Alata, sans-serif' }}>Email Address</label>
                <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: 'Alata, sans-serif' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} placeholder="your@email.com" />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', fontFamily: 'Alata, sans-serif' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showLoginPassword ? 'text' : 'password'} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required style={{ width: '100%', padding: '12px 16px', paddingRight: '48px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: 'Alata, sans-serif' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>{showLoginPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}</button>
                </div>
              </div>

              {loginError && (<div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '20px' }}><p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{loginError}</p></div>)}

              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', fontFamily: 'Alata, sans-serif' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'} onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}>Sign In</button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '16px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', fontFamily: 'Alata, sans-serif' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    try {
                      const decoded = jwtDecode(credentialResponse.credential);
                      const userData = {
                        id: decoded.sub,
                        name: decoded.name,
                        email: decoded.email,
                        picture: decoded.picture
                      };
                      
                      const stored = StorageService.setUser(userData);
                      
                      if (stored) {
                        setCurrentUser(userData);
                        setIsLoggedIn(true);
                        setLoginError('');
                      } else {
                        setLoginError('Failed to save user data. Please try again.');
                      }
                    } catch (error) {
                      console.error('Google login error:', error);
                      setLoginError('Failed to process login. Please try again.');
                    }
                  }}
                  onError={() => {
                    setLoginError('Google Sign In was unsuccessful. Please try again later.');
                  }}
                  useOneTap
                  theme="filled_blue"
                  shape="rectangular"
                  size="large"
                  type="standard"
                  text="continue_with"
                  width="280px"
                />
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, fontFamily: 'Alata, sans-serif' }}>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setShowSignup(true); setLoginError(''); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px', fontFamily: 'Alata, sans-serif' }}>Sign up</button>
                </p>
              </div>

            </form>
          ) : (
            <form onSubmit={(e) => { 
              e.preventDefault();
              
              // Validate form inputs
              if (!signupForm.name.trim()) {
                setSignupError('Please enter your full name');
                return;
              }
              if (!signupForm.email.trim()) {
                setSignupError('Please enter your email address');
                return;
              }
              if (signupForm.password.length < 6) {
                setSignupError('Password must be at least 6 characters long');
                return;
              }
              if (signupForm.password !== signupForm.confirmPassword) {
                setSignupError('Passwords do not match');
                return;
              }

              // Create user object
              const userData = {
                id: Date.now().toString(),
                name: signupForm.name,
                email: signupForm.email,
                picture: DEFAULT_AVATAR_URL
              };

              // Save user to storage
              const stored = StorageService.setUser(userData);

              if (stored) {
                setCurrentUser(userData);
                setIsLoggedIn(true);
                setSignupError('');
                setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
              } else {
                setSignupError('Failed to create account. Please try again.');
              }
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Full Name</label>
                <input type="text" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} placeholder="John Doe" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Address</label>
                <input type="email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} placeholder="your@email.com" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showSignupPassword ? 'text' : 'password'} value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required style={{ width: '100%', padding: '12px 16px', paddingRight: '48px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>{showSignupPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}</button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? 'text' : 'password'} value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '12px 16px', paddingRight: '48px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} placeholder="Confirm your password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>{showConfirmPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}</button>
                </div>
              </div>

              {signupError && (<div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '20px' }}><p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{signupError}</p></div>)}

              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'} onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}>Create Account</button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '16px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    try {
                      const decoded = jwtDecode(credentialResponse.credential);
                      const userData = {
                        id: decoded.sub,
                        name: decoded.name,
                        email: decoded.email,
                        picture: decoded.picture
                      };
                      
                      const stored = StorageService.setUser(userData);
                      
                      if (stored) {
                        setCurrentUser(userData);
                        setIsLoggedIn(true);
                        setSignupError('');
                      } else {
                        setSignupError('Failed to save user data. Please try again.');
                      }
                    } catch (error) {
                      console.error('Google signup error:', error);
                      setSignupError('Failed to process signup. Please try again.');
                    }
                  }}
                  onError={() => {
                    setSignupError('Google Sign Up was unsuccessful. Please try again later.');
                  }}
                  theme="filled_blue"
                  shape="rectangular"
                  size="large"
                  type="standard"
                  text="signup_with"
                  width="280px"
                />
              </div>
              
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setShowSignup(false); setSignupError(''); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Sign in</button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden', 
        backgroundColor: colors.bgApp,
        fontFamily: 'Poppins, sans-serif'
      }}>
      
      {showSidebar && (
        <div style={{
          width: '280px',
          backgroundColor: colors.bgPrimary,
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          color: colors.textPrimary,
        }}>
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: 0, fontFamily: 'Alata, sans-serif' }}>Chat History</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: colors.textPrimary }}
            >
              <X size={20} />
            </button>
          </div>
          
          <div style={{ padding: '12px' }}>
            <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: '6px',
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    outline: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Alata, sans-serif'
                }}
            />
          </div>

          <div style={{ padding: '12px' }}>
            <button
              onClick={startNewChat}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              <MessageSquarePlus size={18} />
              Start New Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredChatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat)}
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: currentChatId === chat.id ? colors.chatActive : 'transparent',
                  color: colors.textPrimary
                }}
                onMouseEnter={(e) => {
                  if (currentChatId !== chat.id) { e.currentTarget.style.backgroundColor = colors.bgApp; }
                }}
                onMouseLeave={(e) => {
                  if (currentChatId !== chat.id) { e.currentTarget.style.backgroundColor = 'transparent'; }
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Alata, sans-serif' }}>
                    {chat.title}
                  </p>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', margin: 0, fontFamily: 'Alata, sans-serif' }}>
                    {chat.date} • {chat.messages?.length || 0} messages
                  </p>
                </div>
                
                <button
                  onClick={(e) => deleteChat(chat.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        <div style={{
          height: '64px',
          backgroundColor: colors.bgApp,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 24px'
        }}
        className="header-content" 
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              style={{ padding: '8px', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: colors.textPrimary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgPrimary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              data-print-hide="true"
            >
              <Menu size={24} color={colors.textPrimary} />
            </button>
            <img 
              src={DEFAULT_AVATAR_URL}
              alt="VerdictX Logo" 
              className="logo-print"
              style={{ 
                width: '120px', 
                height: '50px', 
                display: 'block', 
                marginTop: '4px',
                filter: isDarkMode ? 'invert(1)' : 'none', 
                backgroundColor: colors.bgApp
              }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="header-controls" data-print-hide="true">
            <div data-print-hide="true" className="print-hidden">
              <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  style={{ 
                      padding: '8px', 
                      background: 'none', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                    color: colors.textPrimary 
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgPrimary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {currentChat.length > 0 && (
              <div className="no-print" data-print-hide="true">
                <div style={{ position: 'relative', '@media print': { display: 'none' } }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); setShowUserMenu(false); }}
                  style={{ padding: '8px 12px', background: 'none', border: `1px solid ${colors.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgPrimary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Share2 size={18} color={colors.textPrimary} />
                  <span style={{ fontSize: '14px', color: colors.textPrimary, fontWeight: '500', fontFamily: 'Alata, sans-serif' }}>Share</span>
                </button>
                </div>
                {showShareMenu && (
                  <div
                    className="share-menu"
                    data-print-hide="true"
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: 'absolute', top: '48px', right: 0, backgroundColor: colors.bgApp, border: `1px solid ${colors.border}`, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '8px 0', width: '280px', zIndex: 50, color: colors.textPrimary }}
                  >
                    <button
                        data-print-hide="true"
                        onClick={handleExportPdf}
                        style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: colors.textPrimary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgPrimary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FileDown size={20} color="#dc2626" />
                      <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Alata, sans-serif' }}>Export as PDF</span>
                    </button>
                    
                    <button
                        data-print-hide="true"
                        onClick={copyShareLink}
                        style={{ 
                            width: '100%', 
                            padding: '12px 16px', 
                            textAlign: 'left', 
                            background: 'none', 
                            border: 'none', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            cursor: 'pointer', 
                            color: colors.textPrimary 
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgPrimary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {linkCopied ? <Check size={20} color="#10b981" /> : <Copy size={20} color="#3b82f6" />}
                      <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Alata, sans-serif' }}>{linkCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
                    </button>

                  </div>
                )}
              </div>
            )}

            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}
              onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowShareMenu(false); }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgPrimary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              data-print-hide="true"
            >
              <div style={{ width: '36px', height: '36px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="white" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary, fontFamily: 'Alata, sans-serif' }}>
                {currentUser?.name || 'My Account'}
              </span>
              <ChevronDown size={16} color={colors.textSecondary} />
            </div>
            {showUserMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'absolute', top: '56px', right: 0, backgroundColor: colors.bgApp, border: `1px solid ${colors.border}`, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '8px', width: '220px', zIndex: 50, color: colors.textPrimary }}
              >
                <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary, margin: 0, fontFamily: 'Alata, sans-serif' }}>
                    {currentUser?.name}
                  </p>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', margin: 0, fontFamily: 'Alata, sans-serif' }}>
                    {currentUser?.email}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '12px', marginTop: '4px', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '6px', color: '#dc2626', fontWeight: '500', fontSize: '14px', fontFamily: 'Alata, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        <div 
            ref={chatContainerRef}
            style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: currentChat.length === 0 ? 'flex-end' : 'flex-start',
                backgroundColor: colors.bgApp,
            }}
        >
          <div style={{ width: '100%', maxWidth: '896px' }}>
            {currentChat.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}> 
                <p style={{ color: colors.textSecondary, fontSize: '20px', margin: 0, fontFamily: 'Alata, sans-serif' }}>Start a new conversation</p>
                <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '8px', fontFamily: 'Alata, sans-serif' }}>Send a message to begin</p>
              </div>
            ) : (
              <>
                {currentChat.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                      marginBottom: '24px',
                      width: '100%',
                      maxWidth: '896px',
                      position: 'relative',
                    }}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    
                    {msg.sender === 'bot' && !msg.isTyping && (
                       <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: '40px',
                          opacity: hoveredMessageId === msg.id ? 1 : 0,
                          transition: 'opacity 0.2s',
                          marginRight: '8px', 
                          order: 1,
                        }}
                        data-print-hide="true"
                      >
                        <button
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                const contentToCopy = msg.text;
                                try {
                                    const tempInput = document.createElement('textarea');
                                    tempInput.value = contentToCopy;
                                    document.body.appendChild(tempInput);
                                    tempInput.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(tempInput);
                                    alert("Bot message copied!"); 
                                } catch (err) {
                                    console.error("Failed to copy text: ", err);
                                }
                            }}
                            title="Copy message"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                            <Copy size={16} color={colors.textSecondary} />
                        </button>
                      </div>
                    )}
                    
                    <div className="message-bubble" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        maxWidth: '800px', 
                        order: 2,
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        minWidth: msg.file ? '300px' : 'auto'
                    }}>
                        <div
                            style={{
                                padding: '12px 16px',
                                borderRadius: '16px',
                                backgroundColor: msg.sender === 'user' ? colors.chatBubbleUser : colors.chatBubbleBot,
                                color: msg.sender === 'user' ? 'white' : colors.textPrimary,
                                fontFamily: 'Alata, sans-serif',
                                boxShadow: isEditing && msg.id === editMessageId ? '0 0 0 2px #ff8a00' : 'none',
                                position: 'relative',
                                cursor: msg.sender === 'user' && !msg.isTyping ? 'default' : 'default',
                                width: '100%'
                            }}
                        >
                            <div style={{ fontSize: '14px', margin: 0 }}>
                                {msg.isTyping ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>AI is thinking...</span>
                                        <TypingIndicator isDarkMode={isDarkMode} />
                                    </div>
                                ) : msg.isWelcomeMessage ? (
                                    <div style={{ width: '100%', padding: '0' }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: msg.sender === 'user' ? '#fff' : colors.textPrimary }}>
                                                👋 Hi, I'm VerdictX — Your Legal AI Assistant
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {Object.keys(FEATURE_CONFIG).map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        setSelectedFeature(key);
                                                    }}
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '6px',
                                                        border: `2px solid ${colors.chatBubbleUser}`,
                                                        backgroundColor: selectedFeature === key ? colors.chatBubbleUser : 'transparent',
                                                        color: selectedFeature === key ? 'white' : colors.chatBubbleUser,
                                                        fontFamily: 'Alata, sans-serif',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        textAlign: 'center',
                                                        width: '100%'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = colors.chatBubbleUser;
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (selectedFeature !== key) {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                            e.currentTarget.style.color = colors.chatBubbleUser;
                                                        }
                                                    }}
                                                >
                                                    {FEATURE_CONFIG[key].icon} {FEATURE_CONFIG[key].name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.file && (
                                            <div 
                                                style={{
                                                    border: `1px solid ${msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : colors.border}`,
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    marginBottom: msg.text ? '12px' : '0',
                                                    backgroundColor: msg.sender === 'user' ? 'rgba(255,255,255,0.05)' : colors.bgSecondary,
                                                    maxWidth: '300px'
                                                }}
                                            >
                                                {msg.file.type.startsWith('image/') ? (
                                                    <div>
                                                        <img 
                                                            src={msg.file.url} 
                                                            alt={msg.file.name}
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: '200px',
                                                                objectFit: 'cover',
                                                                borderTopLeftRadius: '12px',
                                                                borderTopRightRadius: '12px',
                                                                display: 'block'
                                                            }}
                                                        />
                                                        <div style={{
                                                            padding: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            borderTop: `1px solid ${msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : colors.border}`
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Image size={20} color={msg.sender === 'user' ? '#fff' : colors.textPrimary} />
                                                                <div>
                                                                    <div style={{ 
                                                                        fontSize: '14px',
                                                                        fontWeight: '500',
                                                                        color: msg.sender === 'user' ? '#fff' : colors.textPrimary 
                                                                    }}>
                                                                        {msg.file.name}
                                                                    </div>
                                                                    <div style={{ 
                                                                        fontSize: '12px',
                                                                        color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : colors.textSecondary 
                                                                    }}>
                                                                        {Math.round(msg.file.size / 1024)} KB
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        padding: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '8px',
                                                                backgroundColor: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : colors.border,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <FileText size={24} color={msg.sender === 'user' ? '#fff' : colors.textPrimary} />
                                                            </div>
                                                            <div>
                                                                <div style={{ 
                                                                    fontSize: '14px',
                                                                    fontWeight: '500',
                                                                    color: msg.sender === 'user' ? '#fff' : colors.textPrimary 
                                                                }}>
                                                                    {msg.file.name}
                                                                </div>
                                                                <div style={{ 
                                                                    fontSize: '12px',
                                                                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : colors.textSecondary 
                                                                }}>
                                                                    {Math.round(msg.file.size / 1024)} KB • {msg.file.type.split('/')[1].toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {msg.text && (
                                            <div style={{ 
                                                margin: 0,
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                color: msg.sender === 'user' ? '#fff' : colors.textPrimary,
                                                textAlign: msg.sender === 'user' ? 'right' : 'left',
                                                whiteSpace: 'pre-wrap',
                                                fontFamily: 'monospace'
                                            }}>
                                                {msg.text}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {msg.isWelcomeMessage && selectedFeature && (
                              <div style={{
                                marginTop: '12px',
                                padding: '8px 12px',
                                backgroundColor: colors.bgPrimary,
                                borderRadius: '8px',
                                display: 'inline-block'
                              }}>
                                <p style={{ color: colors.textPrimary, fontSize: '13px', fontFamily: 'Alata, sans-serif', margin: 0 }}>
                                  ✓ {FEATURE_CONFIG[selectedFeature]?.name} selected
                                </p>
                              </div>
                            )}

                            <p style={{
                                fontSize: '12px',
                                marginTop: '4px',
                                opacity: 0.7,
                                margin: 0,
                                color: msg.sender === 'user' ? 'white' : colors.textSecondary,
                                textAlign: 'right'
                            }}>
                                {msg.time}
                            </p>
                            
                            {!msg.isTyping && (
                                <div style={{ 
                                    position: 'absolute', 
                                    right: '-12px', 
                                    bottom: '-12px', 
                                    zIndex: 10, 
                                    opacity: hoveredMessageId === msg.id || reactionPickerId === msg.id ? 1 : 0, 
                                    transition: 'opacity 0.2s' 
                                }}
                                data-print-hide="true"
                                >
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setReactionPickerId(reactionPickerId === msg.id ? null : msg.id); }}
                                      title="React"
                                      style={{ 
                                        background: colors.bgPrimary, 
                                        border: `1px solid ${colors.border}`, 
                                        borderRadius: '50%', 
                                        padding: '4px', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                      }}
                                    >
                                      <Smile size={14} color={colors.textSecondary} />
                                    </button>
                                </div>
                            )}

                             {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div 
                                    style={{
                                        display: 'flex', 
                                        gap: '4px', 
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        backgroundColor: colors.bgPrimary,
                                        border: `1px solid ${colors.border}`,
                                        position: 'absolute',
                                        bottom: '-12px', 
                                        zIndex: 5,
                                        right: msg.sender === 'user' ? '0' : 'auto', 
                                        left: msg.sender === 'bot' ? '0' : 'auto', 
                                    }}
                                    data-print-hide="true"
                                >
                                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                                        <span key={emoji} style={{ fontSize: '12px', color: colors.textPrimary }}>
                                            {emoji} {count}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {reactionPickerId === msg.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                bottom: '56px',
                                right: msg.sender === 'user' ? '0' : 'auto',
                                left: msg.sender === 'bot' ? '0' : 'auto',
                                backgroundColor: colors.bgPrimary,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                padding: '8px',
                                display: 'flex',
                                gap: '4px',
                                zIndex: 70,
                                minWidth: '200px'
                              }}
                              data-print-hide="true"
                            >
                              {EMOJIS.map((emoji, idx) => (
                                <span key={idx} onClick={() => handleReaction(msg.id, emoji)} style={{ fontSize: '20px', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.border} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  {emoji}
                                </span>
                              ))}
                            </div>
                          )}
                    </div>

                    {msg.sender === 'user' && !msg.isTyping && (
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center', 
                          minWidth: '40px',
                          opacity: hoveredMessageId === msg.id ? 1 : 0,
                          transition: 'opacity 0.2s',
                          marginLeft: '8px', 
                          order: 3, 
                        }}
                        data-print-hide="true"
                      >
                        <div style={{ display: 'flex', marginBottom: '0px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditMessage(msg); }}
                            title="Edit message"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          >
                            <Edit size={16} color={colors.textSecondary} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                            title="Delete message"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={16} color={colors.textSecondary} />
                          </button>
                           <button
                              onClick={(e) => { 
                                  e.stopPropagation(); 
                                  const contentToCopy = msg.text;
                                  try {
                                      const tempInput = document.createElement('textarea');
                                      tempInput.value = contentToCopy;
                                      document.body.appendChild(tempInput);
                                      tempInput.select();
                                      document.execCommand('copy');
                                      document.body.removeChild(tempInput);
                                      alert("Your message copied!");
                                  } catch (err) {
                                      console.error("Failed to copy text: ", err);
                                  }
                              }}
                              title="Copy message"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          >
                              <Copy size={16} color={colors.textSecondary} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div style={{
          padding: '24px',
          backgroundColor: colors.bgApp,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'center'
        }}
        data-print-hide="true"
        >
          <div style={{ width: '100%', maxWidth: '896px' }}>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: colors.inputBg,
              border: `2px solid ${isBotTyping ? '#9ca3af' : colors.inputBorder}`, 
              borderRadius: '9999px',
              padding: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }}
                  disabled={isBotTyping || isEditing}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: isBotTyping || isEditing ? colors.border : colors.bgPrimary,
                    border: 'none',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isBotTyping || isEditing ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isBotTyping || isEditing ? colors.border : colors.border}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isBotTyping || isEditing ? colors.border : colors.bgPrimary}
                >
                  <Plus size={20} color={isBotTyping || isEditing ? colors.textSecondary : colors.textPrimary} />
                </button>

                {showAttachMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '0',
                      marginBottom: '8px',
                      backgroundColor: colors.bgPrimary,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: `1px solid ${colors.border}`,
                      zIndex: 10,
                      width: '160px'
                    }}
                  >
                    <button
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 16px',
                        border: 'none',
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        color: colors.textPrimary,
                        fontSize: '14px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.border}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FileText size={16} />
                      Attach Files
                    </button>

                    <button
                      onClick={() => photoInputRef.current.click()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        color: colors.textPrimary,
                        fontSize: '14px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.border}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Image size={16} />
                      Attach Photos
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttachment}
                  style={{ display: 'none' }}
                  accept=".pdf,.PDF"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  onChange={handlePhotoAttachment}
                  style={{ display: 'none' }}
                />
              </div>

              {selectedFeature && (
                <button
                  onClick={() => {
                    setSelectedFeature(null);
                    setAttachedFile(null);
                  }}
                  title="Clear selected feature"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontFamily: 'Alata, sans-serif',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  <X size={14} />
                  {FEATURE_CONFIG[selectedFeature]?.name}
                </button>
              )}
              
              <div style={{ position: 'relative' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }}
                    disabled={isBotTyping}
                    style={{ background: 'none', border: 'none', cursor: isBotTyping ? 'not-allowed' : 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center' }}
                >
                    <Smile size={24} color={isBotTyping ? colors.textSecondary : colors.textPrimary} />
                </button>
                
                {showEmojiPicker && (
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            bottom: '56px',
                            left: '0',
                            backgroundColor: colors.bgPrimary,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            padding: '8px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            width: '200px',
                            gap: '4px',
                            zIndex: 60
                        }}
                    >
                        {EMOJIS.map((emoji, index) => (
                            <span 
                                key={index} 
                                onClick={() => handleEmojiSelect(emoji)}
                                style={{ fontSize: '24px', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.border}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {emoji}
                            </span>
                        ))}
                    </div>
                )}
              </div>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isEditing 
                    ? "Editing message..." 
                    : isBotTyping 
                    ? "AI is generating response..." 
                    : selectedFeature
                    ? `Type Your message here...`
                    : "Type your message here..."
                }
                disabled={isBotTyping}
                style={{
                  flex: 1,
                  outline: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '16px',
                  color: colors.textPrimary,
                  backgroundColor: 'transparent',
                  fontFamily: 'Alata, sans-serif',
                  cursor: isBotTyping ? 'not-allowed' : 'text'
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={isBotTyping || (!message.trim() && !attachedFile)}
                title={isEditing ? "Update Message" : "Send Message"}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: isBotTyping || (!message.trim() && !attachedFile) ? colors.textSecondary : isEditing ? '#ff8a00' : '#3b82f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isBotTyping || (!message.trim() && !attachedFile) ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isBotTyping || (!message.trim() && !attachedFile) ? colors.textSecondary : isEditing ? '#e67300' : '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isBotTyping || (!message.trim() && !attachedFile) ? colors.textSecondary : isEditing ? '#ff8a00' : '#3b82f6'}
              >
                {isEditing ? <Edit size={18} color="white" /> : <Send size={18} color="white" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<AppContent />} />
        <Route path="/chat" element={<AppContent />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <App />
      </Router>
    </GoogleOAuthProvider>
  );
} 