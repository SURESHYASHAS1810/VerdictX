// API Service for handling FastAPI interactions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const APIService = {
    // User Management
    loginUser: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    googleLogin: async (tokenId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: tokenId })
            });

            if (!response.ok) {
                throw new Error('Google login failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    },

    // Chat Management
    getAllChats: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats/user/${userId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch chats');
            }

            return await response.json();
        } catch (error) {
            console.error('Get chats error:', error);
            throw error;
        }
    },

    saveChat: async (chatData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chatData)
            });

            if (!response.ok) {
                throw new Error('Failed to save chat');
            }

            return await response.json();
        } catch (error) {
            console.error('Save chat error:', error);
            throw error;
        }
    },

    updateChat: async (chatId, chatData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chatData)
            });

            if (!response.ok) {
                throw new Error('Failed to update chat');
            }

            return await response.json();
        } catch (error) {
            console.error('Update chat error:', error);
            throw error;
        }
    },

    deleteChat: async (chatId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete chat');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete chat error:', error);
            throw error;
        }
    },

    // PDF Processing
    extractPDF: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/extract`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('PDF extraction failed');
            }

            return await response.json();
        } catch (error) {
            console.error('PDF Extraction error:', error);
            throw error;
        }
    },

    // Field Information
    getAvailableFields: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/available-fields`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch available fields');
            }

            return await response.json();
        } catch (error) {
            console.error('Get fields error:', error);
            throw error;
        }
    },

    // AI Chat Interaction
    sendMessage: async (message, chatId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    chatId,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            return await response.json();
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    },
};

export default APIService;