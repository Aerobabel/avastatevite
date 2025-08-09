// src/pages/AuthPage.jsx
import React, { useEffect, useState } from 'react';
import { useSignIn, useSignUp, useClerk, useSession } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { setActive } = useClerk();

  // UI state
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [method, setMethod] = useState('email');        // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Resend state
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Keep factor / signUp instance for verification + resend
  const [pending, setPending] = useState(null);
  // pending shape:
  // { type: 'signin'|'signup', identifier: string, factor?: { emailAddressId?, phoneNumberId? }, signUp?: SignUpResource }

  // If already signed in, go to app
  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  // Resend countdown
  useEffect(() => {
    if (!resendDisabled) return;
    if (resendTimer <= 0) { setResendDisabled(false); return; }
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendDisabled, resendTimer]);

  const startResendTimer = () => {
    setResendTimer(30);
    setResendDisabled(true);
  };

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'signin') {
        // Start sign-in & send email code
        const res = await signIn.create({ identifier: email });
        const emailFactor = res.supportedFirstFactors?.find((f) => f.strategy === 'email_code');
        if (!emailFactor) throw new Error('Email verification not available for this account');

        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailFactor.emailAddressId,
        });

        setPending({
          type: 'signin',
          identifier: email,
          factor: { emailAddressId: emailFactor.emailAddressId },
        });
        setVerifying(true);
        startResendTimer();
      } else {
        // Start sign-up & send email code
        const su = await signUp.create({ emailAddress: email });
        await su.prepareEmailAddressVerification({ strategy: 'email_code' });

        setPending({ type: 'signup', identifier: email, signUp: su });
        setVerifying(true);
        startResendTimer();
      }
    } catch (err) {
      console.error(err);
      const m =
        err?.errors?.[0]?.message ||
        err?.errors?.[0]?.longMessage ||
        err?.message ||
        'Something went wrong. Please try again.';
      if (err?.errors?.[0]?.code === 'form_identifier_exists' && activeTab === 'signup') {
        setActiveTab('signin');
      }
      setError(m);
    } finally {
      setIsLoading(false);
    }
  };

  const onPhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'signin') {
        const res = await signIn.create({ identifier: phone });
        const phoneFactor = res.supportedFirstFactors?.find((f) => f.strategy === 'phone_code');
        if (!phoneFactor) throw new Error('Phone verification not available for this account');

        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneFactor.phoneNumberId, // ✅ camelCase
        });

        setPending({
          type: 'signin',
          identifier: phone,
          factor: { phoneNumberId: phoneFactor.phoneNumberId },
        });
        setVerifying(true);
        startResendTimer();
      } else {
        const su = await signUp.create({ phoneNumber: phone });
        await su.preparePhoneNumberVerification({ strategy: 'phone_code' });

        setPending({ type: 'signup', identifier: phone, signUp: su });
        setVerifying(true);
        startResendTimer();
      }
    } catch (err) {
      console.error(err);
      const m =
        err?.errors?.[0]?.message ||
        err?.errors?.[0]?.longMessage ||
        err?.message ||
        'Something went wrong. Please try again.';
      if (err?.errors?.[0]?.code === 'form_identifier_exists' && activeTab === 'signup') {
        setActiveTab('signin');
      }
      setError(m);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!pending) throw new Error('Verification session not found. Please start over.');

      if (pending.type === 'signin') {
        const res = await signIn.attemptFirstFactor({
          strategy: method === 'email' ? 'email_code' : 'phone_code',
          code,
        });

        if (res.status === 'complete') {
          await setActive({ session: res.createdSessionId }); // ✅ activate session
          // reset UI
          setVerifying(false);
          setPending(null);
          setCode('');
          navigate('/', { replace: true });
          return;
        }
        throw new Error('Sign-in failed. Please try again.');
      } else {
        // signup verify
        if (!pending.signUp) throw new Error('SignUp instance not found.');
        const res =
          method === 'email'
            ? await pending.signUp.attemptEmailAddressVerification({ code })
            : await pending.signUp.attemptPhoneNumberVerification({ code });

        if (res.status === 'complete') {
          await setActive({ session: res.createdSessionId }); // ✅ activate session
          setVerifying(false);
          setPending(null);
          setCode('');
          navigate('/', { replace: true });
          return;
        }
        throw new Error('Sign-up failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      const code = err?.errors?.[0]?.code;
      const msg =
        code === 'verification_expired'
          ? 'This code has expired. Please request a new one.'
          : code === 'verification_exists'
          ? 'This code has already been used. Please request a new one.'
          : code === 'form_code_incorrect'
          ? 'Incorrect verification code. Please try again.'
          : err?.errors?.[0]?.longMessage ||
            err?.errors?.[0]?.message ||
            err?.message ||
            'Invalid verification code. Please try again.';
      setError(msg);
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!pending) throw new Error('No pending verification to resend.');

      if (pending.type === 'signin') {
        if (method === 'email') {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: pending.factor?.emailAddressId,
          });
        } else {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: pending.factor?.phoneNumberId,
          });
        }
      } else {
        if (!pending.signUp) throw new Error('SignUp instance not available for resend.');
        if (method === 'email') {
          await pending.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        } else {
          await pending.signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
        }
      }

      startResendTimer();
      setError('New code sent successfully!');
    } catch (err) {
      console.error(err);
      const code = err?.errors?.[0]?.code;
      const msg =
        code === 'verification_exists'
          ? 'This account is already verified. Please sign in.'
          : code === 'rate_limit_exceeded'
          ? 'Too many attempts. Please wait before trying again.'
          : err?.errors?.[0]?.message ||
            err?.message ||
            'Failed to resend code. Please try again.';
      setError(msg);
      if (code === 'verification_exists') {
        setVerifying(false);
        setPending(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!signInLoaded || !signUpLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Avastate</h1>
          <p className="text-indigo-200 mt-1">
            {verifying ? 'Verify your account' : 'Connect with AI personalities'}
          </p>
        </div>

        {/* Tabs */}
        {!verifying && (
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 font-medium ${
                activeTab === 'signin'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('signin')}
              disabled={isLoading}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-4 font-medium ${
                activeTab === 'signup'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('signup')}
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="p-6">
          {/* (Optional) Google OAuth */}
          {!verifying && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              onClick={async () => {
                try {
                  await signIn.authenticateWithRedirect({
                    strategy: 'oauth_google',
                    redirectUrl: '/SignIn',   // where Clerk returns first
                    redirectUrlComplete: '/', // final landing after success
                  });
                } catch (e) {
                  console.error(e);
                  setError('Google sign-in failed. Please try again.');
                }
              }}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>
          )}

          {/* Divider */}
          {!verifying && (
            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          )}

          {/* Verify view */}
          {verifying ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <p className="text-gray-700 text-center">
                We sent a 6-digit code to your {method === 'email' ? 'email' : 'phone'}
                <br />
                <span className="font-medium">
                  {pending?.identifier || (method === 'email' ? email : phone)}
                </span>
              </p>

              <form onSubmit={onVerify} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg text-center focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={isLoading}
                    required
                  />
                </div>

                {error && (
                  <div className={`text-sm text-center py-2 ${error.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || code.length < 6}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Account'
                  )}
                </motion.button>

                <div className="text-center mt-4 space-x-4">
                  <button
                    type="button"
                    onClick={onResend}
                    className={`text-indigo-600 text-sm font-medium hover:text-indigo-800 ${resendDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={resendDisabled || isLoading}
                  >
                    {resendDisabled ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifying(false);
                      setPending(null);
                      setCode('');
                    }}
                    className="text-gray-600 text-sm font-medium hover:text-gray-800 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Change {method === 'email' ? 'email' : 'phone'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            // Entry view
            <div className="space-y-4">
              {/* Method toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    method === 'email' ? 'bg-white shadow text-indigo-600' : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setMethod('email')}
                  disabled={isLoading}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    method === 'phone' ? 'bg-white shadow text-indigo-600' : 'text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => setMethod('phone')}
                  disabled={isLoading}
                >
                  Phone
                </button>
              </div>

              {/* Email form */}
              {method === 'email' && (
                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && <div className="text-red-500 text-sm py-2">{error}</div>}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : activeTab === 'signin' ? (
                      'Sign In with Email'
                    ) : (
                      'Sign Up with Email'
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* Phone form */}
              {method === 'phone' && (
                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onPhoneSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                      placeholder="+1 (555) 123-4567"
                      required
                      disabled={isLoading}
                    />
                    <p className="mt-1 text-xs text-gray-500">We'll send a verification code to your phone</p>
                  </div>

                  {error && <div className="text-red-500 text-sm py-2">{error}</div>}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !phone}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : activeTab === 'signin' ? (
                      'Sign In with Phone'
                    ) : (
                      'Sign Up with Phone'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </div>
          )}

          {/* Footer */}
          {!verifying && (
            <div className="mt-6 text-center text-sm text-gray-600">
              {activeTab === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                    onClick={() => setActiveTab('signup')}
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                    onClick={() => setActiveTab('signin')}
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
