// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

import CreateAvatarPage from './pages/CreateAvatarPage';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import MetaChat from './pages/SarahChatPage';

import './index.css';
import './App.css';
import SarahChatPage from './pages/SarahChatPage';

const clerkPubKey = "pk_test_cG9wdWxhci1jcm93LTM0LmNsZXJrLmFjY291bnRzLmRldiQ";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
        <Routes>
          {/* Signed-in -> HomePage, Signed-out -> LandingPage */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <HomePage />
                </SignedIn>
                <SignedOut>
                  <LandingPage />
                </SignedOut>
              </>
            }
          />

          {/* Protected routes: send signed-out users to your custom AuthPage */}
          <Route
            path="/CreateAvatar"
            element={
              <>
                <SignedIn>
                  <CreateAvatarPage />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/SignIn" replace />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/chat/:avatarId"
            element={
              <>
                <SignedIn>
                  <ChatPage />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/SignIn" replace />
                </SignedOut>
              </>
            }
          />

          <Route
            path="/SarahChatPage"
            element={
              <>
                <SignedIn>
                  <SarahChatPage />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/SignIn" replace />
                </SignedOut>
              </>
            }
          />

          {/* Custom sign-in page */}
          <Route path="/SignIn" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
