// storage.js - Centralized Storage Service for VerdictX
// This file handles all chat persistence operations
// Phase 1: Uses localStorage (current)
// Phase 2: Will switch to FastAPI backend (just update functions here)

const StorageService = {
  // ==========================================
  // USER OPERATIONS
  // ==========================================
  
  /**
   * Save user data to storage
   * @param {Object} user - User object containing id, name, email, and picture
   */
  setUser: (user) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('[Storage] Failed to save user:', error);
      return false;
    }
  },

  /**
   * Get current user data from storage
   * @returns {Object|null} User object or null if not found
   */
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('[Storage] Failed to get user:', error);
      return null;
    }
  },

  /**
   * Remove user data from storage
   */
  removeUser: () => {
    try {
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error('[Storage] Failed to remove user:', error);
      return false;
    }
  },

  // ==========================================
  // CHAT OPERATIONS
  // ==========================================

  /**
   * Save a single chat conversation to storage
   * @param {string} chatId - Unique identifier for the chat
   * @param {Array} messages - Array of message objects
   * @param {string} title - Chat title
   */
  saveChat: (chatId, messages, title = 'New conversation') => {
    try {
      const allChats = StorageService.getAllChats();
      const existingChatIndex = allChats.findIndex(chat => String(chat.id) === String(chatId));
      
      const chatData = {
        id: chatId,
        title: title,
        messages: messages,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        lastUpdated: Date.now()
      };

      if (existingChatIndex !== -1) {
        // Update existing chat
        allChats[existingChatIndex] = chatData;
      } else {
        // Add new chat to beginning
        allChats.unshift(chatData);
      }

      localStorage.setItem('chatHistory', JSON.stringify(allChats));
      console.log(`[Storage] Saved chat ${chatId} with ${messages.length} messages`);
      return true;
    } catch (error) {
      console.error('[Storage] Failed to save chat:', error);
      return false;
    }
  },

  /**
   * Get all chats for the current user
   * @param {string} userId - User ID (for future backend filtering)
   * @returns {Array} Array of chat objects
   */
  getAllChats: (userId = null) => {
    try {
      const stored = localStorage.getItem('chatHistory');
      const chats = stored ? JSON.parse(stored) : [];
      console.log(`[Storage] Loaded ${chats.length} chats from storage`);
      return chats;
    } catch (error) {
      console.error('[Storage] Failed to load chats:', error);
      return [];
    }
  },

  /**
   * Get a specific chat by ID
   * @param {string} chatId - Unique identifier for the chat
   * @returns {Object|null} Chat object or null if not found
   */
  getChat: (chatId) => {
    try {
      const allChats = StorageService.getAllChats();
      const chat = allChats.find(chat => String(chat.id) === String(chatId));
      if (chat) {
        console.log(`[Storage] Found chat ${chatId} with ${chat.messages?.length || 0} messages`);
      }
      return chat || null;
    } catch (error) {
      console.error('[Storage] Failed to get chat:', error);
      return null;
    }
  },

  /**
   * Delete a specific chat
   * @param {string} chatId - Unique identifier for the chat
   * @returns {boolean} Success status
   */
  deleteChat: (chatId) => {
    try {
      const allChats = StorageService.getAllChats();
      const filteredChats = allChats.filter(chat => String(chat.id) !== String(chatId));
      localStorage.setItem('chatHistory', JSON.stringify(filteredChats));
      console.log(`[Storage] Deleted chat ${chatId}`);
      return true;
    } catch (error) {
      console.error('[Storage] Failed to delete chat:', error);
      return false;
    }
  },

  /**
   * Add a message to an existing chat
   * @param {string} chatId - Unique identifier for the chat
   * @param {Object} message - Message object to add
   */
  addMessage: (chatId, message) => {
    try {
      const chat = StorageService.getChat(chatId);
      if (chat) {
        chat.messages.push(message);
        StorageService.saveChat(chatId, chat.messages, chat.title);
      } else {
        // Create new chat if it doesn't exist
        StorageService.saveChat(chatId, [message], 'New conversation');
      }
      return true;
    } catch (error) {
      console.error('[Storage] Failed to add message:', error);
      return false;
    }
  },

  // ==========================================
  // CURRENT CHAT STATE
  // ==========================================

  /**
   * Save the current active chat ID
   * @param {string} chatId - Current chat ID
   */
  setCurrentChatId: (chatId) => {
    try {
      localStorage.setItem('currentChatId', String(chatId));
    } catch (error) {
      console.error('[Storage] Failed to set current chat ID:', error);
    }
  },

  /**
   * Get the current active chat ID
   * @returns {string|null} Current chat ID or null
   */
  getCurrentChatId: () => {
    try {
      return localStorage.getItem('currentChatId');
    } catch (error) {
      console.error('[Storage] Failed to get current chat ID:', error);
      return null;
    }
  },

  /**
   * Clear the current chat ID
   */
  clearCurrentChatId: () => {
    try {
      localStorage.removeItem('currentChatId');
    } catch (error) {
      console.error('[Storage] Failed to clear current chat ID:', error);
    }
  },

  // ==========================================
  // USER OPERATIONS (Already working in your app)
  // ==========================================

  /**
   * Save user data
   * @param {Object} user - User object
   */
  saveUser: (user) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      console.log(`[Storage] Saved user ${user.email}`);
      return true;
    } catch (error) {
      console.error('[Storage] Failed to save user:', error);
      return false;
    }
  },

  /**
   * Get saved user data
   * @returns {Object|null} User object or null
   */
  getUser: () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('[Storage] Failed to get user:', error);
      return null;
    }
  },

  /**
   * Remove user data (logout)
   */
  clearUser: () => {
    try {
      localStorage.removeItem('user');
      console.log('[Storage] Cleared user data');
      return true;
    } catch (error) {
      console.error('[Storage] Failed to clear user:', error);
      return false;
    }
  },

  // ==========================================
  // UTILITY OPERATIONS
  // ==========================================

  /**
   * Clear all chat data (useful for debugging)
   */
  clearAllChats: () => {
    try {
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('currentChatId');
      console.log('[Storage] Cleared all chat data');
      return true;
    } catch (error) {
      console.error('[Storage] Failed to clear chats:', error);
      return false;
    }
  },

  /**
   * Get storage usage statistics
   * @returns {Object} Storage stats
   */
  getStorageStats: () => {
    try {
      const chats = StorageService.getAllChats();
      const totalMessages = chats.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0);
      const storageUsed = new Blob([localStorage.getItem('chatHistory') || '']).size;
      
      return {
        totalChats: chats.length,
        totalMessages: totalMessages,
        storageUsedKB: (storageUsed / 1024).toFixed(2),
        estimatedLimitKB: 5120 // ~5MB limit for localStorage
      };
    } catch (error) {
      console.error('[Storage] Failed to get stats:', error);
      return null;
    }
  }
};

// ==========================================
// FUTURE: FASTAPI INTEGRATION (PHASE 2)
// ==========================================
// When backend is ready, replace function implementations with API calls:
/*
const API_BASE_URL = 'https://your-backend-api.com';

StorageService.saveChat = async (chatId, messages, title) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        chatId: chatId,
        messages: messages,
        title: title,
        userId: getCurrentUserId()
      })
    });
    const data = await response.json();
    
    // Keep localStorage as backup
    localStorage.setItem(`chat_${chatId}`, JSON.stringify({ messages, title }));
    
    return data.success;
  } catch (error) {
    console.error('[API] Failed, using localStorage fallback:', error);
    // Fallback to localStorage
    localStorage.setItem(`chat_${chatId}`, JSON.stringify({ messages, title }));
    return true;
  }
};
*/

export default StorageService;