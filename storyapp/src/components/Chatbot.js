import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./storify.css";
import ReactMarkdown from 'react-markdown';

export default function KidsChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [botMood, setBotMood] = useState("happy");
  const [showIntro, setShowIntro] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  // Ref for speech recognition
  const recognitionRef = useRef(null);
  function createShapes() {
    const container = document.querySelector('.floating-shapes');
    const shapes = ['circle', 'star', 'square'];
    const colors = ['#f9c5d1', '#b8c1ec', '#d1c1f9', '#ffc8dd', '#a5dff9'];
    
    for (let i = 0; i < 15; i++) {
      const shape = document.createElement('div');
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      shape.classList.add('shape', shapeType);
      shape.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      shape.style.width = Math.floor(Math.random() * 30 + 10) + 'px';
      shape.style.height = shape.style.width;
      shape.style.left = Math.floor(Math.random() * 100) + '%';
      shape.style.top = Math.floor(Math.random() * 100) + '%';
      shape.style.animationDuration = Math.floor(Math.random() * 15 + 15) + 's';
      shape.style.animationDelay = Math.floor(Math.random() * 5) + 's';
      container.appendChild(shape);
    }
  }
  useEffect(() => {
    // Initialize Web Speech API for synthesis
    if (window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
      // createShapes();
    }
    
    // Initialize Web Speech API for recognition
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      // Set up event handlers
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        
        // Auto-send if confidence is high
        if (event.results[0][0].confidence > 0.8) {
          sendMessage(transcript);
        }
      };
     
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setBotMood("sad");
        setTimeout(() => setBotMood("happy"), 2000);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    
    // Initial welcome message
    setTimeout(() => {
      if (messages.length === 0) {
        const welcomeMessage = "Hi there, friend! I'm Tiny TIme Traveller, your magical story buddy! What kind of adventure would you like to hear today? 🦄✨";
        setMessages([
          { 
            role: "bot", 
            content: welcomeMessage
          }
        ]);
        // Auto-play welcome message
        speakWithEmotion(welcomeMessage, "happy");
      }
      setShowIntro(false);
    }, 3000);
  }, []);

  // Function for emotional text-to-speech
  const speakWithEmotion = (text, emotion) => {
    if (!speechSynthesis) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties based on emotion
    switch(emotion) {
      case "happy":
        utterance.pitch = 1.2;
        utterance.rate = 1.1;
        break;
      case "sad":
        utterance.pitch = 0.8;
        utterance.rate = 0.8;
        break;
      case "excited":
        utterance.pitch = 1.5;
        utterance.rate = 1.2;
        break;
      case "confused":
        utterance.pitch = 1.1;
        utterance.rate = 0.9;
        break;
      default:
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
    }
    
    // Get available voices (this might need to be moved to useEffect with a timeout
    // since voices are loaded asynchronously in some browsers)
    const voices = speechSynthesis.getVoices();
    const kidVoices = voices.filter(voice => 
      voice.name.includes("Kid") || 
      voice.name.includes("Child") ||
      voice.name.includes("Young")
    );
    
    // Use a kid-friendly voice if available
    if (kidVoices.length > 0) {
      utterance.voice = kidVoices[0];
    }
    
    speechSynthesis.speak(utterance);
  };

  // Enhanced audio generation with emotion
  

  // Simple emotion detection from text
  const detectTextEmotion = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("yay") || lowerText.includes("hooray") || 
        lowerText.includes("happy") || lowerText.includes("excited")) {
      return "excited";
    } else if (lowerText.includes("sad") || lowerText.includes("sorry") || 
              lowerText.includes("unfortunately")) {
      return "sad";
    } else if (lowerText.includes("confused") || lowerText.includes("strange") || 
              lowerText.includes("weird")) {
      return "confused";
    } else {
      return "happy"; // Default emotion
    }
  };

  const generateVideo = async (text) => {
    try {
      setBotMood("excited");
      const response = await axios.post("http://localhost:4000/generate-video", { story: text });

      // Notify user
      alert("Your video is being generated. Please come back in some time to view it.");

      setBotMood("happy");
    } catch (error) {
      console.error("Error fetching video:", error);
      setBotMood("sad");
      setTimeout(() => setBotMood("happy"), 2000);
    }
  };
  

  // Start voice recording with browser Speech Recognition
  const startRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setBotMood("excited");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setBotMood("sad");
      setTimeout(() => setBotMood("happy"), 2000);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send message (now accepts optional text parameter)
  const sendMessage = async (text = null) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMessages = [...messages, { role: "user", content: messageText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setBotMood("thinking");

    try {
      const response = await axios.post("http://localhost:4000/api/chat", {
        messages: newMessages,
        ideas: {},
      });
      
      if (response.data.ok) {
        const emotion = detectTextEmotion(response.data.response);
        setBotMood(emotion === "happy" ? "happy" : emotion);
        
        const botMessage = { 
          role: "bot", 
          content: response.data.response,
          emotion: emotion 
        };
        
        setMessages([...newMessages, botMessage]);
        
        // Auto-play the response with emotion
        // speakWithEmotion(response.data.response, emotion);
      } else {
        setBotMood("confused");
        setMessages([...newMessages, { 
          role: "bot", 
          content: "Oops! My magic powers are taking a nap. Let's try again!",
          emotion: "confused"
        }]);
        setTimeout(() => setBotMood("happy"), 3000);
      }
    } catch (error) {
      setBotMood("sad");
      setMessages([...newMessages, { 
        role: "bot", 
        content: "Oh no! My wand isn't working right now. Let's try again soon!",
        emotion: "sad"
      }]);
      setTimeout(() => setBotMood("happy"), 3000);
    }
    setLoading(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getBotFace = () => {
    switch(botMood) {
      case "happy": return "😁";
      case "thinking": return "💭";
      case "confused": return "😵";
      case "sad": return "🥺";
      case "excited": return "😄";
      case "singing": return "🎶";
      default: return "😉";
    }
  };

  // Story starters for suggestions
  const storyStarters = [
    "Tell me a story about ",
    "I want to hear about ",
  ];

  return (
    <div className={`storify-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* Intro animation */}
      {showIntro && (
        <div className="intro-animation">
          <div className="intro-text bounce">
            📚 Tiny TIme Traveller! 📚
          </div>
        </div>
      )}

      {/* Header */}
      <div className="storify-header">
        <h1 className="app-title">
          <span className="book-icon">📚</span> 
          Tiny TIme Traveller 
          <span className="sparkle-icon pulse">✨</span>
        </h1>
        <button 
          onClick={toggleDarkMode} 
          className="theme-toggle-btn"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Bot character */}
      <div className={`bot-avatar ${loading ? 'pulse' : 'bounce'}`}>
        <span className="bot-face">{getBotFace()}</span>
      </div>

      {/* Chat container */}
      <div className="chat-container">
        {/* Chat messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.role === "user" ? 'user-message' : 'bot-message'} fade-in`}
          >
            <div className="message-content">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            
            {msg.role === "bot" && (
              <div className="message-actions">
                <button 
                  className="action-btn listen-btn"
                  onClick={() => speakWithEmotion(messages.content, "happy")}
                >
                  🎵 Listen
                </button>
                <button 
                  className="action-btn watch-btn"
                  onClick={() => generateVideo(msg.content)}
                >
                  🎬 Watch
                </button>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="loading-indicator">
            <div className="loading-dot" style={{animationDelay: '0s'}}></div>
            <div className="loading-dot" style={{animationDelay: '0.2s'}}></div>
            <div className="loading-dot" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}
      </div>

      {/* Story starters */}
      <div className="story-starters">
        {storyStarters.map((starter, index) => (
          <button
            key={index}
            onClick={() => setInput(starter)}
            className="starter-btn"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Input area with voice recording */}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Tell me what story you want..."
          className="message-input"
        />
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`voice-btn ${isRecording ? 'recording' : ''}`}
          title={isRecording ? "Stop recording" : "Start voice input"}
        >
          <span className="voice-icon">{isRecording ? '🔴' : '🎤'}</span>
        </button>
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className={`send-btn ${loading || !input.trim() ? 'disabled' : ''}`}
        >
          <span className="send-icon">✉️</span>
        </button>
      </div>

      {/* Media players */}
      

      {videoSrc && (
        <div className="media-container video-container">
          <h3 className="media-title">Story Video 🎬</h3>
          <video controls className="video-player">
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
      )}
    </div>
  );
}
