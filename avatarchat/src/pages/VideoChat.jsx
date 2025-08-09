// src/components/VideoChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPaperPlane, FaRobot } from 'react-icons/fa';

const VideoChat = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const conversationEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarResponse, setAvatarResponse] = useState('');

  // Initialize media devices
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };
    
    initMedia();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Scroll to bottom of conversation when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Start/stop call
  const toggleCall = () => {
    if (!isCallActive) {
      startRecording();
    } else {
      stopRecording();
    }
    setIsCallActive(!isCallActive);
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = handleAudioStop;
      
      mediaRecorder.start();
      startVoiceDetection();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      stopVoiceDetection();
    }
  };

  // Handle audio stop and send to backend
  const handleAudioStop = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    
    setIsProcessing(true);
    setTranscription('');
    
    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate transcription response
      const simulatedTranscription = "Hello! How can I assist you today?";
      setTranscription(simulatedTranscription);
      
      // Add user message to conversation
      const newUserMessage = {
        id: Date.now(),
        text: simulatedTranscription,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversation(prev => [...prev, newUserMessage]);
      
      // Simulate avatar response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedResponse = "I'm your AI assistant. I can help answer your questions, provide information, or just have a conversation! What would you like to talk about?";
      setAvatarResponse(simulatedResponse);
      
      const newAvatarMessage = {
        id: Date.now() + 1,
        text: simulatedResponse,
        sender: 'avatar',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversation(prev => [...prev, newAvatarMessage]);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice activity detection
  const startVoiceDetection = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    const source = audioContext.createMediaStreamSource(mediaRecorderRef.current.stream);
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkVolume = () => {
      analyser.getByteTimeDomainData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      
      const avg = sum / bufferLength;
      const isCurrentlySpeaking = avg > 15; // Volume threshold
      
      if (isCurrentlySpeaking !== isSpeaking) {
        setIsSpeaking(isCurrentlySpeaking);
        
        if (isCurrentlySpeaking) {
          // User started speaking
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          // User stopped speaking - wait to see if they start again
          silenceTimerRef.current = setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }, 1500); // 1.5 seconds of silence
        }
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        requestAnimationFrame(checkVolume);
      }
    };
    
    checkVolume();
  };

  // Stop voice detection
  const stopVoiceDetection = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setIsSpeaking(false);
  };

  // Handle text message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to conversation
    const newUserMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setConversation(prev => [...prev, newUserMessage]);
    setMessage('');
    
    setIsProcessing(true);
    
    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate avatar response
      const responses = [
        "That's an interesting point! Could you tell me more about that?",
        "I understand what you're saying. Here's some information that might help...",
        "Thanks for sharing that! Based on your input, I'd recommend...",
        "I've processed your request. Here are the results you asked for...",
        "That's a great question! Here's what I found..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAvatarResponse(randomResponse);
      
      const newAvatarMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'avatar',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversation(prev => [...prev, newAvatarMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
          AI Avatar Video Chat
        </h1>
        <p className="text-indigo-300 max-w-2xl mx-auto">
          Experience the future of communication with UE5-powered avatars. Your webcam and microphone feed the AI assistant for real-time interaction.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Section */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-video bg-black">
            {/* UE5 Avatar Simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-gray-900 to-indigo-900 border-2 border-indigo-500/30 rounded-lg w-full h-full flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="relative inline-block">
                        <div className="bg-indigo-500 rounded-full w-32 h-32 mx-auto flex items-center justify-center animate-pulse-slow">
                          <FaRobot className="text-5xl text-white" />
                        </div>
                        <div className="absolute -inset-2 rounded-full border-4 border-indigo-300 animate-ping-slow opacity-20"></div>
                      </div>
                      <h3 className="text-xl font-bold mt-4">UE5 Avatar Stream</h3>
                      <p className="text-indigo-300 mt-2 max-w-md">
                        {isProcessing 
                          ? "Processing your request..." 
                          : isCallActive
                            ? "Connected to cloud server"
                            : "Ready to connect"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Avatar Response Overlay */}
                {avatarResponse && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 animate-fadeIn">
                    <div className="flex items-start">
                      <div className="bg-indigo-500 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="font-bold text-xs">AI</span>
                      </div>
                      <p className="text-white text-sm">{avatarResponse}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* User Webcam */}
            <div className="absolute bottom-4 right-4 w-1/4 rounded-xl overflow-hidden border-2 border-white shadow-lg">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`w-full transform ${isVideoOn ? '' : 'hidden'}`}
              />
              {!isVideoOn && (
                <div className="bg-gray-800 w-full aspect-video flex items-center justify-center">
                  <FaVideoSlash className="text-2xl text-gray-500" />
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="bg-gray-900 p-4 flex justify-center space-x-6">
            <button 
              onClick={toggleCall}
              className={`flex items-center justify-center w-14 h-14 rounded-full ${
                isCallActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } transition-all transform hover:scale-105 shadow-lg`}
            >
              {isCallActive ? (
                <span className="bg-white w-6 h-6 rounded-sm"></span>
              ) : (
                <span className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-white ml-1"></span>
              )}
            </button>
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
              } transition-all shadow-lg`}
            >
              {isMuted ? (
                <FaMicrophoneSlash className="text-xl" />
              ) : (
                <FaMicrophone className="text-xl" />
              )}
            </button>
            
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500'
              } transition-all shadow-lg`}
            >
              {isVideoOn ? <FaVideo className="text-xl" /> : <FaVideoSlash className="text-xl" />}
            </button>
          </div>
          
          {/* Status Indicators */}
          <div className="bg-gray-900 p-3 flex justify-center items-center border-t border-gray-700">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span>{isCallActive ? 'Call Active' : 'Call Inactive'}</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isSpeaking ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span>{isSpeaking ? 'Speaking...' : 'Silent'}</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span>{isProcessing ? 'Processing...' : 'Ready'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Section - Fixed Height Container */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
          <div className="p-4 bg-gradient-to-r from-indigo-700 to-purple-800">
            <h2 className="text-xl font-bold">Conversation</h2>
            <p className="text-sm text-indigo-200">Voice and text chat with your AI avatar</p>
          </div>
          
          {/* Chat Messages Container with Fixed Height */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-800/50"
            style={{ maxHeight: '50vh' }}
          >
            <div className="space-y-4">
              {conversation.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FaRobot className="text-4xl mx-auto mb-4 text-indigo-500" />
                  <p>Start a conversation with your AI avatar</p>
                  <p className="text-sm mt-2">Speak or type a message to begin</p>
                </div>
              ) : (
                conversation.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
                        msg.sender === 'user' 
                          ? 'bg-indigo-600 rounded-tr-none' 
                          : 'bg-gray-700 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {msg.sender === 'user' ? 'You' : 'Avatar'} • {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={conversationEndRef} />
            </div>
          </div>
          
          {/* Transcription */}
          {transcription && (
            <div className="border-t border-gray-700 p-4 bg-gray-900/50">
              <div className="flex items-center mb-2">
                <FaMicrophone className="text-indigo-400 mr-2" />
                <span className="text-sm font-medium">Transcription</span>
              </div>
              <p className="text-sm bg-gray-800 rounded-lg p-3">{transcription}</p>
            </div>
          )}
          
          {/* Text Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4 bg-gray-900">
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 px-5 rounded-r-xl flex items-center justify-center transition-colors disabled:opacity-50"
                disabled={isProcessing || !message.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Connection Information */}
      <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
        <h3 className="text-xl font-bold mb-4 text-center">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-indigo-500/20">
            <h4 className="font-medium text-indigo-400 mb-2">Webcam</h4>
            <p className="text-sm">{isVideoOn ? 'Active (720p)' : 'Disabled'}</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-indigo-500/20">
            <h4 className="font-medium text-indigo-400 mb-2">Microphone</h4>
            <p className="text-sm">{isMuted ? 'Muted' : 'Active (16-bit, 44.1kHz)'}</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-indigo-500/20">
            <h4 className="font-medium text-indigo-400 mb-2">UE5 Avatar</h4>
            <p className="text-sm">Simulated (Cloud connection ready)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;