import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import '../meta.css';

const PixelStream = React.memo(({ url }) => (
  <div className="pixel-stream-wrapper">
    <iframe
      src={url}
      title="metahuman-stream"
      allow="autoplay"
      className="pixel-stream"
      key="metahuman-stream"
      style={{
        border: '0',
        width: '100%',
        height: '100%',
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      }}
    />
  </div>
));

const Spinner = () => (
  <div
    className="spinner"
    aria-label="loading"
    style={{
      width: 16,
      height: 16,
      border: '3px solid rgba(0,0,0,0.1)',
      borderTop: '3px solid #5c6ac4',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: 6,
    }}
  />
);

const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div
      className={`message-bubble ${isUser ? 'user' : 'assistant'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        background: isUser ? '#f0f4ff' : '#ffffff',
        color: '#1f2d3a',
        padding: '12px 16px',
        borderRadius: 16,
        borderTopLeftRadius: isUser ? 16 : 4,
        borderTopRightRadius: isUser ? 4 : 16,
        maxWidth: '75%',
        boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
        marginBottom: 8,
        position: 'relative',
        fontSize: 14,
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: 4,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {isUser ? 'You' : 'Metahuman'}
      </div>
      <div>{content}</div>
    </div>
  );
};

function MetaChat() {
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [webcamReady, setWebcamReady] = useState(false);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isPlayingRef = useRef(false);
  const sessionCreatedRef = useRef(false);
  const lastFrameSentRef = useRef(0);

  const API_BASE_URL = 'http://13.62.89.200:8000'; // adjust if needed
  const PIXEL_STREAM_URL = 'http://13.62.89.200'; // adjust

  useEffect(() => {
    if (sessionCreatedRef.current) return;
    sessionCreatedRef.current = true;

    const createSession = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/sessions/create`);
        setSessionId(response.data.session_id);
      } catch (error) {
        console.error('Failed to create session:', error);
        setErrorMsg('Session creation failed');
      }
    };
    createSession();

    (async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Available media devices:', devices);
      } catch (e) {
        console.warn('Failed to enumerate devices', e);
      }
    })();
  }, [API_BASE_URL]);

  const handleUserMedia = () => {
    setWebcamReady(true);
  };

  const getWebcamFrameBlob = () => {
    if (!webcamRef.current) return null;
    const frame = webcamRef.current.getScreenshot();
    if (!frame) {
      console.warn('Screenshot null — webcam may not be ready or permission denied');
      return null;
    }
    const imageData = frame.split(',')[1];
    return new Blob([Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0))], {
      type: 'image/jpeg',
    });
  };

  const sendWebcamFrame = useCallback(async () => {
    const now = Date.now();
    if (now - lastFrameSentRef.current < 5000) return;
    lastFrameSentRef.current = now;

    if (!webcamReady || !sessionId) return;
    const imageBlob = getWebcamFrameBlob();
    if (!imageBlob) return;

    const form = new FormData();
    form.append('image', imageBlob, 'webcam.jpg');
    form.append('session_id', sessionId);
    try {
      await axios.post(`${API_BASE_URL}/process/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) {
      console.warn('Failed to send webcam frame', e);
    }
  }, [sessionId, webcamReady]);

  const startRecording = async () => {
    if (isPlayingRef.current) return;
    if (isRecording || isProcessing) return;
    if (!webcamReady) {
      setErrorMsg('Webcam not ready yet.');
      return;
    }
    try {
      setIsRecording(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processMedia(audioBlob);
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording (getUserMedia):', error);
      setErrorMsg(`Camera/mic error: ${error.name || error.message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const processMedia = async (audioBlob) => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await sendWebcamFrame();

      const audioFormData = new FormData();
      audioFormData.append('audio', audioBlob, 'recording.webm');
      audioFormData.append('session_id', sessionId);

      const audioResp = await axios.post(`${API_BASE_URL}/process/audio`, audioFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const transcript = audioResp.data.transcript?.trim();
      if (!transcript) {
        console.warn('Empty transcript received');
        setErrorMsg('Transcription was empty');
        return;
      }

      setConversation((prev) => [...prev, { role: 'user', content: transcript }]);

      const payload = new FormData();
      payload.append('session_id', sessionId);
      payload.append('text', transcript);
      payload.append('generate_audio', 'true');

      if (webcamReady) {
        const imageBlob = getWebcamFrameBlob();
        if (imageBlob) {
          payload.append('image', imageBlob, 'webcam.jpg');
        }
      }

      const textResponse = await axios.post(`${API_BASE_URL}/process/text_with_image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: textResponse.data.response_text },
      ]);
      setResponseText(textResponse.data.response_text);

      if (isRecording) {
        stopRecording();
      }
    } catch (error) {
      console.error('Error processing media:', error);
      setErrorMsg('Media processing error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = (formData.get('text') || '').toString();
    if (!text.trim() || !sessionId) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setConversation((prev) => [...prev, { role: 'user', content: text }]);

      const payload = new FormData();
      payload.append('session_id', sessionId);
      payload.append('text', text);
      payload.append('generate_audio', 'true');

      if (webcamReady) {
        const imageBlob = getWebcamFrameBlob();
        if (imageBlob) {
          payload.append('image', imageBlob, 'webcam.jpg');
        }
      }

      const response = await axios.post(`${API_BASE_URL}/process/text_with_image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.response_text },
      ]);
      setResponseText(response.data.response_text);

      if (isRecording) {
        stopRecording();
      }
    } catch (error) {
      console.error('Error processing text with image:', error);
      setErrorMsg('Text processing failed');
    } finally {
      setIsProcessing(false);
      e.target.reset();
    }
  };

  return (
    <div
      className="app-container"
      style={{
        fontFamily:
          "'Inter', system-ui,-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        background: '#f5f7fa',
        minHeight: '100vh',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#1f2d3a',
      }}
    >
      <header
        className="app-header"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>Metahuman Chat</div>
          <div
            style={{
              background: '#eceef7',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              display: 'inline-block',
              color: '#5c6ac4',
              fontWeight: 600,
            }}
          >
            Live
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
              <Spinner /> Processing...
            </div>
          )}
          <div style={{ fontSize: 14, color: '#555' }}>
            {sessionId ? (
              <span>
                Session: <strong style={{ wordBreak: 'break-all' }}>{sessionId.slice(0, 8)}</strong>
              </span>
            ) : (
              'Initializing...'
            )}
          </div>
        </div>
      </header>

      {errorMsg && (
        <div
          className="error-banner"
          style={{
            background: '#ffe3e3',
            color: '#9b2c2c',
            padding: '10px 16px',
            borderRadius: 10,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 6px 18px rgba(255,0,0,0.05)',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div
        className="main-content"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 20,
          flex: 1,
          marginTop: 4,
        }}
      >
        {/* Left panel */}
        <div className="left-panel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            className="media-card"
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: 16,
              boxShadow: '0 12px 32px rgba(31,45,58,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Your Input</div>
              <div style={{ fontSize: 12, color: '#777' }}>
                {isRecording ? 'Recording...' : 'Idle'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div
                className="webcam-wrap"
                style={{
                  position: 'relative',
                  flex: '1 1 240px',
                  minWidth: 220,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#000',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.1)',
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={(err) => {
                    console.error('Webcam error:', err);
                    setErrorMsg(`Webcam init error: ${err.name || err.message}`);
                  }}
                  className="webcam-preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    background: isRecording ? '#ff6b6b' : '#2d8cf0',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {isRecording ? 'Speaking' : webcamReady ? 'Ready' : 'Loading...'}
                </div>
              </div>

              <div
                className="controls"
                style={{
                  flex: '1 1 220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minWidth: 220,
                }}
              >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing || isPlayingRef.current || !sessionId}
                    className="action-button"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      background: isRecording ? '#ff4d4f' : '#5c6ac4',
                      color: '#fff',
                      boxShadow: '0 12px 24px rgba(92,106,196,0.3)',
                      transition: 'transform .1s ease',
                    }}
                  >
                    {isRecording ? 'Stop Talking' : 'Start Talking'}
                  </button>
                  <div
                    className="status-box"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#f0f4ff',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Spinner /> Processing...
                      </>
                    ) : (
                      'Ready'
                    )}
                  </div>
                </div>

                <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    name="text"
                    placeholder="Type your message..."
                    disabled={isProcessing || !sessionId}
                    className="text-input"
                    autoComplete="off"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #d9e2ec',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !sessionId}
                    className="send-button"
                    style={{
                      padding: '12px 20px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#10b981',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div
            className="conversation-card"
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: 16,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 12px 32px rgba(31,45,58,0.04)',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Conversation</div>
            <div
              className="conversation-container"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                paddingRight: 4,
                gap: 4,
              }}
            >
              {conversation.length === 0 ? (
                <div
                  className="empty-conversation"
                  style={{
                    padding: 20,
                    background: '#f0f4ff',
                    borderRadius: 10,
                    textAlign: 'center',
                    color: '#555',
                    fontSize: 14,
                  }}
                >
                  Start talking to begin the conversation...
                </div>
              ) : (
                conversation.map((message, index) => (
                  <MessageBubble key={index} role={message.role} content={message.content} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            className="stream-card"
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 12px 32px rgba(31,45,58,0.04)',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Metahuman Stream</div>
              <div style={{ fontSize: 12, color: '#777' }}>Live pixel stream</div>
            </div>
            <div style={{ flex: 1, minHeight: 220 }}>
              <PixelStream url={PIXEL_STREAM_URL} />
            </div>
          </div>

          {responseText && (
            <div
              className="latest-response-card"
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: 16,
                boxShadow: '0 12px 32px rgba(31,45,58,0.04)',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                Latest Response
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{responseText}</p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          /* Animations */
          @keyframes spin { to { transform: rotate(360deg); } }

          .action-button:disabled,
          .send-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .text-input:focus {
            border-color: #5c6ac4;
            box-shadow: 0 0 0 3px rgba(92,106,196,0.2);
          }

          /* ---------- Responsive tweaks ---------- */

          /* Medium and down (<= 1024px) */
          @media (max-width: 1024px) {
            .main-content {
              grid-template-columns: 1fr !important;
            }
            .app-header {
              flex-wrap: wrap;
              gap: 8px;
            }
            .left-panel, .right-panel {
              min-width: 0;
            }
            .webcam-wrap,
            .controls {
              min-width: 0 !important;
              flex: 1 1 100% !important;
            }
            .status-box {
              min-width: 140px;
            }
          }

          /* Small and down (<= 768px) */
          @media (max-width: 768px) {
            .app-container {
              padding: 12px !important;
            }
            .app-header {
              padding: 10px 12px !important;
            }
            .media-card, .conversation-card, .stream-card, .latest-response-card {
              padding: 14px !important;
            }
            .webcam-wrap {
              aspect-ratio: 16 / 9;      /* keep video nicely framed */
              min-height: 180px;         /* fallback for browsers without aspect-ratio */
            }
            .pixel-stream-wrapper {
              aspect-ratio: 16 / 9;
            }
            .message-bubble {
              max-width: 100% !important; /* let messages span full width on mobile */
              font-size: 15px !important;
            }
            .conversation-container {
              padding-right: 0 !important;
            }
            .text-input {
              min-width: 0;
            }
          }

          /* Extra small (<= 480px) */
          @media (max-width: 480px) {
            .app-container {
              padding: 10px !important;
              gap: 10px !important;
            }
            .app-header div[style*="font-size: 22px"] {
              font-size: 18px !important;
            }
            .status-box {
              font-size: 13px !important;
              padding: 10px 12px !important;
            }
            .action-button, .send-button {
              padding: 12px 14px !important;
            }
            /* stack the send form buttons cleanly */
            form[onsubmit] {
              gap: 8px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default MetaChat;
