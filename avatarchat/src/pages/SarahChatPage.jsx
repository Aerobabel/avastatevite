// src/pages/SarahChatPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import MetaChat from './metachat';

export default function SarahChatPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // If you navigated here with Link state, we'll use it; otherwise fallback defaults.
  const avatar = state?.avatar || {
    name: 'Sarah',
    image:
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=500',
  };

  return (
    <div
      style={{
        background: '#f5f7fa',
        minHeight: '100vh',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 8px 28px rgba(31,45,58,0.04)',
        }}
      >
        {/* Left: Back */}
        <button
          onClick={() => navigate(-1)} // or navigate('/app')
          title="Back"
          aria-label="Back"
          style={{
            width: 36,
            height: 36,
            borderRadius: '9999px',
            border: '1px solid #e5e7eb',
            background: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(31,45,58,0.06)',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Center: Sarah chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={avatar.image}
            alt={avatar.name}
            style={{
              width: 36,
              height: 36,
              borderRadius: '9999px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.2 }}>
            {avatar.name || 'Sarah'}
          </div>
        </div>

        {/* Right: Clerk profile circle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: { width: 36, height: 36 } } }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="redirect" signInUrl="/SignIn">
              <button
                title="Sign in"
                aria-label="Sign in"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '9999px',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(31,45,58,0.06)',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="#374151" strokeWidth="2" />
                  <path d="M20 21a8 8 0 10-16 0" stroke="#374151" strokeWidth="2" />
                </svg>
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* Body: your MetaChat */}
      <div style={{ flex: 1 }}>
        <MetaChat />
      </div>
    </div>
  );
}
