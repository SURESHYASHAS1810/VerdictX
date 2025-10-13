import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
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
} from 'lucide-react';

const DEFAULT_AVATAR_URL = '/VerdictX2.png';
const GOOGLE_CLIENT_ID = '415850413825-pjonauh2d63edu9odf95gh10nmdks9en.apps.googleusercontent.com';
const EMOJIS = ['👍', '👋', '😊', '💡', '🚀', '✅', '🔥', '⚙️'];

// The main application content component
function AppContent() {
  // ... [keep all your existing state declarations and other code]

  // Auth Handlers
  const handleGoogleLogin = (response) => {
    if (response.credential) {
      try {
        // Decode the JWT token to get user info
        const decoded = JSON.parse(atob(response.credential.split('.')[1]));
        const user = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        };
        setCurrentUser(user);
        setIsLoggedIn(true);
        setLoginError('');
      } catch (error) {
        console.error('Error processing Google sign-in:', error);
        setLoginError('Failed to process Google sign-in. Please try again.');
      }
    }
  };

  // Login form component
  const LoginForm = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '20px',
      fontFamily: 'Poppins, sans-serif'
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
            width: '64px',
            height: '64px',
            backgroundColor: '#3b82f6',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <MessageSquarePlus size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            Sign in to continue to your chats
          </p>
        </div>

        <div style={{ width: '100%', marginBottom: '20px' }}>
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            onSuccess={handleGoogleLogin}
            onError={() => setLoginError('Google Sign-In failed. Please try again.')}
            useOneTap
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        {loginError && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{loginError}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Main render logic
  if (!isLoggedIn) {
    return <LoginForm />;
  }

  // ... [keep your existing chat UI render code]
}

// Wrap the app with GoogleOAuthProvider
const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AppContent />
  </GoogleOAuthProvider>
);

export default App;