import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import {
  Menu,
  X,
  MessageSquarePlus,
  Trash2,
  Share2,
  Check,
  Copy, // Added Copy icon
  User,
  ChevronDown,
  LogOut,
  FileDown, // For PDF Export
  Smile, // For Emoji Picker
  Edit, // For Message Editing
  Sun, // For Dark Mode Toggle
  Moon, // For Dark Mode Toggle
  FileText, // Added FileText import for attachment menu
  Image, // Added Image import for attachment menu
  Plus, // Added Plus import for attachment menu
  Send, // Added Send import for attachment menu
  Eye, // FIX: Ensure Eye is imported
  EyeOff, // FIX: Ensure EyeOff is imported
} from 'lucide-react';

// Define the default logo path for the header 
const DEFAULT_AVATAR_URL = '/VerdictX2.png';

// Google OAuth client ID for authentication
const GOOGLE_CLIENT_ID = '415850413825-pjonauh2d63edu9odf95gh10nmdks9en.apps.googleusercontent.com';

// Array of common emojis for the picker and reactions (NOTE: Single Declaration)
const EMOJIS = ['👍', '👋', '😊', '💡', '🚀', '✅', '🔥', '⚙️'];

// --- MOCK DATABASE API FUNCTIONS (TO BE REPLACED WITH FASTAPI FETCH CALLS) ---
// Note: These functions currently just read/write to chatHistory state for demonstration.
const API_URL = 'YOUR_FASTAPI_ENDPOINT'; // Placeholder API URL

const saveChatToDB = (chatId, chatHistory) => {
    // Logic for finding and saving the specific chat conversation to MongoDB
    console.log(`[DB MOCK] Saving chat ${chatId} to persistent storage.`);
};

const fetchAllChatsFromDB = (userId) => {
    // Logic to fetch all chats for a user from MongoDB
    console.log(`[DB MOCK] Fetching all chats for user ${userId}.`);
    // Currently returns mock data for demonstration purposes
    return [
        { id: 1, title: 'Rajesh Murder Case', date: 'Jan 1', messages: [/*...*/] },
        { id: 2, title: 'Bail Application - Jan 3', date: 'Jan 3', messages: [/*...*/] },
    ];
};
// --- END MOCK API FUNCTIONS ---

// Function to handle file downloads
const handleFileDownload = (file) => {
  try {
    // Create an anchor element
    const link = document.createElement('a');
    
    // If it's a URL, use it directly, otherwise use the blob URL
    if (file.url.startsWith('http') || file.url.startsWith('blob:')) {
      link.href = file.url;
    } else {
      // For base64 or other data
      const blob = dataURLtoBlob(file.url);
      link.href = URL.createObjectURL(blob);
    }
    
    // Set download attribute with filename
    link.download = file.name;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL if created
    if (link.href.startsWith('blob:')) {
      URL.revokeObjectURL(link.href);
    }
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download file. Please try again.');
  }
};

// Helper function to convert data URL to blob
const dataURLtoBlob = (dataurl) => {
  try {
    if (dataurl.startsWith('data:')) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    // If not a data URL, fetch and convert to blob
    return fetch(dataurl).then(r => r.blob());
  } catch (error) {
    console.error('Data URL conversion failed:', error);
    throw error;
  }
};

// Reusable Google Sign-In Button Component
const GoogleSignInButton = ({ setCurrentUser, setIsLoggedIn, setLoginError }) => {
  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleUser = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
      };
      setCurrentUser(googleUser);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(googleUser));
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setLoginError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: '12px' }}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          console.error('Login Failed');
          setLoginError('Failed to sign in with Google. Please try again.');
        }}
        theme="filled_blue"
        size="large"
        width="100%"
        text="sign_in_with_google"
        logo_alignment="left"
        shape="rectangular"
      />
    </div>
  );
};


// Typing indicator component
const TypingIndicator = ({ isDarkMode }) => {
  const dotStyle = {
    display: 'inline-block',
    width: '4px',
    height: '4px',
    margin: '0 2px',
    backgroundColor: isDarkMode ? '#fff' : '#000',
    borderRadius: '50%',
    animation: 'typing 1s infinite ease-in-out',
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      <div style={{ ...dotStyle, animationDelay: '0s' }} />
      <div style={{ ...dotStyle, animationDelay: '0.2s' }} />
      <div style={{ ...dotStyle, animationDelay: '0.4s' }} />
      <style>{`
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

// Main application component with all the functionality
function AppContent() {
  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        [data-print-hide="true"] {
          display: none !important;
        }
        .print-hidden {
          display: none !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ------------------------------------------------
  // State and Refs
  // ------------------------------------------------
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
  
  // File input refs
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // NEW: Store selected file data separately
  const [attachedFile, setAttachedFile] = useState(null);

  // Handle file attachment and display in message input
  const handleFileAttachment = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a file preview URL
      const fileObj = {
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        url: URL.createObjectURL(file)
      };
      setAttachedFile(fileObj);
      setMessage(''); // Clear message input, we'll display file preview separately
      event.target.value = '';
    }
    setShowAttachMenu(false);
  };

  // Handle photo attachment and display in message input
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
        setMessage(''); // Clear message input, we'll display image preview separately
      } else {
        alert('Please select an image file');
      }
      event.target.value = '';
    }
    setShowAttachMenu(false);
  };

  const [currentChatId, setCurrentChatId] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false); 
  
  // NEW: Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  
  // NEW: Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // NEW: Hover state for message actions & Reaction Picker
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [reactionPickerId, setReactionPickerId] = useState(null);

  // Refs for auto-scrolling chat history
  const chatContainerRef = useRef(null);

  // Dynamic Color Scheme based on Dark Mode
  const colors = {
      // FIX: Use a deep, uniform color for main app background/header background
      bgApp: isDarkMode ? '#121212' : 'white', 
      bgPrimary: isDarkMode ? '#242424' : '#f9fafb', // Slightly lighter dark background for containers/sidebar
      textPrimary: isDarkMode ? 'white' : '#1f2937',
      textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
      border: isDarkMode ? '#4b5563' : '#e5e7eb',
      chatBubbleUser: isDarkMode ? '#10b981' : '#3b82f6',
      chatBubbleBot: isDarkMode ? '#242424' : '#f3f4f6', // Chat bubble background matching bgPrimary
      chatActive: isDarkMode ? '#2563eb' : '#e0e7ff',
      inputBorder: isDarkMode ? '#6b7280' : '#d1d5db',
      inputBg: isDarkMode ? '#121212' : 'white', // Input box background matching bgApp
  };

  // Mock data (replace with Firestore/API logic in a real app)
  const [users, setUsers] = useState([]);

  const [chatHistory, setChatHistory] = useState(fetchAllChatsFromDB(currentUser?.id || 'initial'));

  // ------------------------------------------------
  // Persistent Storage and Initial Load
  // ------------------------------------------------

  // Load state from localStorage on mount (USER ONLY - Chat History loaded from MOCK DB)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        // Simulate initial chat load from DB after user logs in
        setChatHistory(fetchAllChatsFromDB(user.id));
    }
  }, []); // Run only once on mount


  // Save chatHistory to MOCK DB (Manual simulation of backend saving)
  useEffect(() => {
    if (currentChatId) {
        saveChatToDB(currentChatId, chatHistory);
    }
  }, [chatHistory, currentChatId]);


  // ------------------------------------------------
  // Filtered Chat History for sidebar search
  // ------------------------------------------------
  const filteredChatHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // ------------------------------------------------
  // EFFECTS (other)
  // ------------------------------------------------
  useEffect(() => {
    setLoginForm({ email: '', password: '' });
  }, []);

  // AUTO-SCROLL TO BOTTOM when currentChat changes
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
      setChatHistory(prevHistory => {
        return prevHistory.map(chat => {
          if (String(chat.id) === String(currentChatId)) { // Use String conversion for reliable ID match
            return {
              ...chat,
              title: generateChatTitle(currentChat),
              messages: currentChat,
              date: 'Just now'
            };
          }
          return chat;
        });
      });
    }
  }, [currentChat, currentChatId]);
  
  useEffect(() => {
    return () => {};
  }, []);

  // ------------------------------------------------
  // HANDLERS
  // ------------------------------------------------
  // Auth Handlers (retained)
  const handleLogin = (e) => { e.preventDefault(); setLoginError(''); const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password); if (user) { setCurrentUser(user); setIsLoggedIn(true); localStorage.setItem('user', JSON.stringify(user)); } else { setLoginError('Invalid email or password'); } };
  const handleSignup = (e) => { e.preventDefault(); /* ... signup logic ... */ const newUser = { id: users.length + 1, name: signupForm.name, email: signupForm.email, password: signupForm.password }; setUsers([...users, newUser]); setCurrentUser(newUser); setIsLoggedIn(true); setChatHistory([]); localStorage.setItem('user', JSON.stringify(newUser)); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); setCurrentChat([]); setCurrentChatId(null); setLoginForm({ email: '', password: '' }); setShowUserMenu(false); localStorage.removeItem('user'); localStorage.removeItem('currentChatId'); };
  
  // Mock Google Sign-In Success Handler (Fallback for direct button click, though handled by component now)
  const handleMockGoogleSignIn = () => { 
    console.log('Google Sign-In attempted (Mocked fallback)'); 
    const mockUser = { id: 'google-user-123', name: 'Google User', email: 'mock@google.com' };
    setCurrentUser(mockUser); 
    setIsLoggedIn(true); 
    localStorage.setItem('user', JSON.stringify(mockUser));
    // Simulate initial chat load from DB after user logs in
    setChatHistory(fetchAllChatsFromDB(mockUser.id)); 
  };

  // NEW HANDLER: Export Chat to PDF
  const handleExportPdf = () => {
      window.print();
  };

  // NEW HANDLER: Insert Emoji (for message composition)
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // NEW HANDLER: Add Message Reaction (Mock)
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

  // NEW HANDLER: Delete Message
  const deleteMessage = (messageId) => {
    setCurrentChat(prevChat => prevChat.filter(msg => msg.id !== messageId));
  };
  
  // NEW HANDLER: Edit Message Start
  const startEditMessage = (messageObj) => {
    if (messageObj.sender === 'user') {
      setIsEditing(true);
      setEditMessageId(messageObj.id);
      setMessage(messageObj.text);
      setShowEmojiPicker(false);
    }
  };

  // REFINED HANDLER: Send/Update Message Logic (CRITICAL INTEGRATION POINT)
  const handleSendMessage = () => {
    if (message.trim() && !isBotTyping) {
      let messageText = message;
      let fileData = attachedFile; // Capture file data before clearing message input

      setMessage(''); // Clear message input for the next user message
      setAttachedFile(null); // Clear attached file state
      
      if (isEditing) {
        // --- EDIT/UPDATE LOGIC ---
        setCurrentChat(prevChat => prevChat.map(msg => 
          msg.id === editMessageId ? { ...msg, text: messageText } : msg
        ));
        setIsEditing(false);
        setEditMessageId(null);
        return;
      }

      // --- NEW MESSAGE LOGIC (Integration Target) ---
      setIsBotTyping(true); // START: Disable input
      
      const newMessage = {
        text: messageText,
        sender: 'user',
        // --- KEY CHANGE: CAPTURE HIGH-PRECISION TIMESTAMP ---
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now(),
        // ATTACHMENT: Include file metadata if present
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
      }
      
      // Add user message and typing indicator placeholder
      const botPlaceholderId = Date.now() + 1; // Unique ID for the message being streamed
      const initialBotMessage = {
        text: 'AI is thinking...', 
        sender: 'bot',
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTyping: true,
        id: botPlaceholderId
      };
      
      setCurrentChat(prev => [...prev, newMessage, initialBotMessage]);

      // -------------------------------------------------
      // *** YOUR FASTAPI INTEGRATION POINT ***
      // -------------------------------------------------
      
      const userId = currentUser ? currentUser.id : 'anonymous'; // Ensure user ID is sent
      const payload = {
          user_id: userId,
          chatId: newChatId, 
          query: messageText,
          file_metadata: fileData ? { name: fileData.name, url: fileData.url, type: fileData.type } : null,
          // SCENARIO 1 & 2 CONTEXT: Send the ENTIRE current conversation array 
          // (including the user's new message and placeholder) to the backend for RAG context.
          analysis_context: [...currentChat, newMessage, initialBotMessage], 
      };
      
      console.log("Payload ready for FastAPI for AUTO-SAVING:", payload);
      
      // REPLACE THIS SIMULATION BLOCK WITH YOUR ACTUAL FETCH CALL:
      /*
      fetch('YOUR_FASTAPI_ENDPOINT/api/chat/respond', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      }).then(res => res.json()).then(data => {
          // 1. Update chat with final BOT_RESPONSE
          // 2. FastAPI/Python MUST handle saving the updated chat history to MongoDB here.
      }).catch(error => console.error("API Error", error));
      */
      // -------------------------------------------------


      // Final response simulation delay (Current Mock Logic)
      setTimeout(() => {
        const BOT_RESPONSE = 'Acknowledged. Your DL/ML-powered request is being processed by the VerdictX engine.';
        
        // Update the chat, replacing the typing indicator with the final response
        setCurrentChat(prevChat => {
          const lastMessageIndex = prevChat.findIndex(msg => msg.id === botPlaceholderId);
          
          if (lastMessageIndex !== -1) {
            const updatedLastMessage = {
                ...prevChat[lastMessageIndex],
                text: BOT_RESPONSE, // Final text
                isTyping: false,
                timestamp: Date.now(), // Set final timestamp
            };
            return [...prevChat.slice(0, lastMessageIndex), updatedLastMessage];
          }
          return prevChat;
        });
        
        setIsBotTyping(false); // END: Enable input
      }, 2000); 
    }
  };

  const startNewChat = () => { setCurrentChat([]); setCurrentChatId(null); setShowSidebar(false); setMessage(''); };
  const deleteChat = (chatId, e) => { e.stopPropagation(); setChatHistory(chatHistory.filter(chat => chat.id !== chatId)); if (currentChatId === chatId) { setCurrentChat([]); setCurrentChatId(null); } };
  const loadChat = (chat) => { setCurrentChat(chat.messages || []); setCurrentChatId(chat.id); setShowSidebar(false); };
  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  
  const generateShareLink = () => { return `${window.location.origin}/shared/${currentChatId || 'new-chat-id'}`; }; // Use currentChatId for better link logic
  
  // FIX: Updated copyShareLink to use document.execCommand('copy') for better iframe compatibility
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

  // ------------------------------------------------
  // LOGIN/SIGNUP UI (Retained, but using Poppins font)
  // ------------------------------------------------
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
          padding: '48px 40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '200px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <img 
                src="/VerdictX2.png"
                alt="VerdictX Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
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
            <form onSubmit={handleLogin}>
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
              
              <GoogleSignInButton setCurrentUser={setCurrentUser} setIsLoggedIn={setIsLoggedIn} setLoginError={setLoginError} />


              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, fontFamily: 'Alata, sans-serif' }}>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setShowSignup(true); setLoginError(''); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px', fontFamily: 'Alata, sans-serif' }}>Sign up</button>
                </p>
              </div>

            </form>
          ) : (
            <form onSubmit={handleSignup}>
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
              
              <GoogleSignInButton setCurrentUser={setCurrentUser} setIsLoggedIn={setIsLoggedIn} setLoginError={setSignupError} />
              
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

  // ------------------------------------------------
  // MAIN CHAT UI
  // ------------------------------------------------
  return (
    <div style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden', 
        backgroundColor: colors.bgApp, // Dynamic Background
        fontFamily: 'Poppins, sans-serif'
      }}>
      
      {/* Sidebar (Chat History) */}
      {showSidebar && (
        <div style={{
          width: '280px',
          backgroundColor: colors.bgPrimary, // Dynamic Background
          borderRight: `1px solid ${colors.border}`, // Dynamic Border
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
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>Chat History</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: colors.textPrimary }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* NEW: Search Bar */}
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
                    boxSizing: 'border-box'
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
            {/* Using filteredChatHistory */}
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
                  <p style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.title}
                  </p>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', margin: 0 }}>
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
        
        {/* Header (Navbar) - REDUCED SIZE */}
        <div style={{
          height: '64px', // Reduced height
          backgroundColor: colors.bgApp, // Dynamic Background
          borderBottom: `1px solid ${colors.border}`, // Dynamic Border
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 24px'
        }}
        // Added class for print CSS targeting
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
              className="logo-print" // Added class for print CSS targeting
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
            {/* NEW: Dark Mode Toggle */}
            <div style={{ display: 'none' }} data-print-hide="true" className="print-hidden">
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

            {/* Share Button with PDF Export */}
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
                  <span style={{ fontSize: '14px', color: colors.textPrimary, fontWeight: '500' }}>Share</span>
                </button>
                </div>
                {showShareMenu && (
                  <div
                    className="share-menu"
                    data-print-hide="true"
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: 'absolute', top: '48px', right: 0, backgroundColor: colors.bgApp, border: `1px solid ${colors.border}`, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '8px 0', width: '280px', zIndex: 50, color: colors.textPrimary }}
                  >
                    {/* NEW: Export to PDF Button */}
                    <button
                        data-print-hide="true"
                        onClick={handleExportPdf}
                        style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: colors.textPrimary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgPrimary}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FileDown size={20} color="#dc2626" />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Export as PDF</span>
                    </button>
                    
                    {/* UPDATED: Copy Share Link Button */}
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
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{linkCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
                    </button>

                  </div>
                )}
              </div>
            )}

            {/* User Profile/Menu */}
            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}
              onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowShareMenu(false); }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgPrimary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              data-print-hide="true"
            >
              {/* Generic User Avatar */}
              <div style={{ width: '36px', height: '36px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="white" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary }}>
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
                  <p style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                    {currentUser?.name}
                  </p>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', margin: 0 }}>
                    {currentUser?.email}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '12px', marginTop: '4px', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '6px', color: '#dc2626', fontWeight: '500', fontSize: '14px' }}
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

        {/* Chat Display Area - AUTO-SCROLLING and PLACEHOLDER HANDLING */}
        <div 
            ref={chatContainerRef} // Ref attached for scrolling
            style={{
                flex: 1,
                overflowY: 'auto', // Enables scrolling
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // Pushes content to the bottom if the chat is empty
                justifyContent: currentChat.length === 0 ? 'flex-end' : 'flex-start',
                backgroundColor: colors.bgApp,
            }}
        >
          <div style={{ width: '100%', maxWidth: '896px' }}>
            {currentChat.length === 0 ? (
              // Placeholder Message - UPDATED FONT
              <div style={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}> 
                <p style={{ color: colors.textSecondary, fontSize: '20px', margin: 0, fontFamily: 'Alata, sans-serif' }}>Start a new conversation</p>
                {/* UPDATED: Applied Alata font to the second line */}
                <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '8px', fontFamily: 'Alata, sans-serif' }}>Your message will be automatically saved</p>
              </div>
            ) : (
              // Individual Message Rendering
              <>
                {currentChat.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    // Outer wrapper for the message row (bubble + actions + reactions)
                    style={{
                      display: 'flex',
                      // Align the whole row (bubble + actions) right/left
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                      marginBottom: '24px', // Increased margin to accommodate reactions below the bubble
                      width: '100%',
                      maxWidth: '896px',
                      position: 'relative',
                    }}
                    // Enable hover state tracking on the whole row
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    
                    {/* ---------------------------------------------------- */}
                    {/* LEFT ACTIONS (Bot Copy Icon) or User Copy/Edit/Delete */}
                    {/* ---------------------------------------------------- */}
                    {msg.sender === 'bot' && !msg.isTyping && (
                       <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: '40px', // Reserve space for buttons
                          opacity: hoveredMessageId === msg.id ? 1 : 0,
                          transition: 'opacity 0.2s',
                          marginRight: '8px', 
                          order: 1,
                        }}
                        data-print-hide="true"
                      >
                         {/* Copy Icon (LEFT SIDE OF BOT BUBBLE) */}
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
                    
                    {/* ---------------------------------------------------- */}
                    {/* MESSAGE BUBBLE & INNER CONTENT */}
                    {/* ---------------------------------------------------- */}
                    <div className="message-bubble" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        maxWidth: '512px', 
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
                                position: 'relative', // Anchor for reactions
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
                                ) : (
                                    <>
                                        {/* Display file/image first if present */}
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
                                                    // Image preview with download button
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
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleFileDownload(msg.file);
                                                                }}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    padding: '8px',
                                                                    cursor: 'pointer',
                                                                    opacity: 0.8,
                                                                    transition: 'opacity 0.2s'
                                                                }}
                                                                title="Download file"
                                                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                                                            >
                                                                <FileDown size={20} color={msg.sender === 'user' ? '#fff' : colors.textPrimary} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // File preview with download button
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
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleFileDownload(msg.file);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                padding: '8px',
                                                                cursor: 'pointer',
                                                                opacity: 0.8,
                                                                transition: 'opacity 0.2s'
                                                            }}
                                                            title="Download file"
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                                                        >
                                                            <FileDown size={20} color={msg.sender === 'user' ? '#fff' : colors.textPrimary} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Display text content below the file */}
                                        {msg.text && (
                                            <div style={{ 
                                                margin: 0,
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                color: msg.sender === 'user' ? '#fff' : colors.textPrimary,
                                                textAlign: msg.sender === 'user' ? 'right' : 'left',
                                                paddingRight: msg.sender === 'user' ? '4px' : '0',
                                                paddingLeft: msg.sender === 'user' ? '0' : '4px'
                                            }}>
                                                {msg.text}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
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
                            
                            {/* NEW: Reaction Button for User and Bot message (BOTTOM RIGHT OF BUBBLE) */}
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

                             {/* Reactions Display (BELOW THE BUBBLE, ALIGNED TO ITS CORNER) */}
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
                                        // Align to the specific corner of the bubble
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
                        
                        {/* Reaction Picker Panel - FLOATING (Aligned relative to the message bubble) */}
                        {reactionPickerId === msg.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                bottom: '56px', // Position above the bubble
                                // Align panel corner relative to bubble (shifted for visual balance)
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
                    {/* ---------------------------------------------------- */}


                    {/* RIGHT ACTIONS (User actions) */}
                    {msg.sender === 'user' && !msg.isTyping && (
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center', 
                          minWidth: '40px', // Reserve space for buttons
                          opacity: hoveredMessageId === msg.id ? 1 : 0,
                          transition: 'opacity 0.2s',
                          marginLeft: '8px', 
                          order: 3, 
                        }}
                        data-print-hide="true"
                      >
                        {/* Edit, Delete, and Copy Buttons (USER SIDE - NEXT TO BUBBLE) */}
                        <div style={{ display: 'flex', marginBottom: '0px' }}> {/* Removed marginBottom to tighten group */}
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

                        {/* Reaction Button - User side (BOTTOM RIGHT CORNER OF BUBBLE - ALIGNED WITH IT) */}
                         <div style={{ position: 'absolute', right: '12px', bottom: '12px', zIndex: 10, opacity: 0 }}>
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
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div style={{
          padding: '24px',
          backgroundColor: colors.bgApp, // Dynamic Background
          borderTop: `1px solid ${colors.border}`, // Dynamic Border
          display: 'flex',
          justifyContent: 'center'
        }}
        data-print-hide="true"
        >
          <div style={{ width: '100%', maxWidth: '896px' }}>
            {/* File Preview Area */}
            {attachedFile && (
              <div style={{
                marginBottom: '12px',
                backgroundColor: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                overflow: 'hidden',
                maxWidth: '300px'
              }}>
                {attachedFile.type.startsWith('image/') ? (
                  <div>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={attachedFile.url} 
                        alt={attachedFile.name}
                        style={{
                          width: '100%',
                          height: '160px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <button
                        onClick={() => setAttachedFile(null)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.5)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                      >
                        <X size={16} color="#fff" />
                      </button>
                    </div>
                    <div style={{
                      padding: '12px',
                      borderTop: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Image size={20} color={colors.textPrimary} />
                      <div>
                        <div style={{ fontWeight: 500, color: colors.textPrimary }}>{attachedFile.name}</div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                          {Math.round(attachedFile.size / 1024)} KB
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: colors.border,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={24} color={colors.textPrimary} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: colors.textPrimary }}>{attachedFile.name}</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                        {Math.round(attachedFile.size / 1024)} KB • {attachedFile.type.split('/')[1].toUpperCase()}
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                      }}
                    >
                      <X size={20} color={colors.textSecondary} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: colors.inputBg, // Dynamic Background
              // Visual cue when disabled/typing
              border: `2px solid ${isBotTyping ? '#9ca3af' : colors.inputBorder}`, 
              borderRadius: '9999px',
              padding: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              
              {/* Attachment Button */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }}
                  disabled={isBotTyping || isEditing} // Disable attachment while typing/editing
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: isBotTyping || isEditing ? colors.border : colors.bgPrimary, // Dynamic Background
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

                {/* Attachment Menu */}
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
                    {/* Attach Files */}
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

                    {/* Attach Photos */}
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

                {/* Hidden file inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttachment}
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  onChange={handlePhotoAttachment}
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* NEW: Emoji Picker Toggle and Panel (for composition) */}
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
                placeholder={isEditing ? "Editing message..." : isBotTyping ? "AI is generating response..." : "Type your message here..."}
                disabled={isBotTyping} // Disable input while typing
                style={{
                  flex: 1,
                  outline: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '16px',
                  color: colors.textPrimary, // Dynamic Text Color
                  backgroundColor: 'transparent',
                  fontFamily: 'Alata, sans-serif',
                  cursor: isBotTyping ? 'not-allowed' : 'text'
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={isBotTyping || !message.trim()} // Disable send button if typing or input is empty
                title={isEditing ? "Update Message" : "Send Message"}
                style={{
                  width: '40px',
                  height: '40px',
                  // Gray out color when disabled
                  backgroundColor: isBotTyping || !message.trim() ? colors.textSecondary : isEditing ? '#ff8a00' : '#3b82f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isBotTyping || !message.trim() ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isBotTyping || !message.trim() ? colors.textSecondary : isEditing ? '#e67300' : '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isBotTyping || !message.trim() ? colors.textSecondary : isEditing ? '#ff8a00' : '#3b82f6'}
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

// Export the main App component wrapped with GoogleOAuthProvider
export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}
