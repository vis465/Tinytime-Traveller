import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

const IdeaChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const messagesEndRef = useRef(null);
  let API_BASE_URL = "http://localhost:5000/api";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchIdeas();
    console.log(ideas)
  }, []); // Only fetch ideas on mount

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages change

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/viewideas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIdeas(data);

      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your AI assistant for discussing the stored ideas. What would you like to know about them?",
        },
      ]);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      setMessages([
        {
          role: "assistant",
          content:
            "Sorry, I couldn't fetch the ideas. Please try refreshing the page.",
        },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    
    // Update messages with user input first
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Then send the message
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage], // Include the new user message
          ideas: ideas 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the response
      const botResponse = {
        role: 'assistant',
        content: typeof data === 'string' ? data : 
                data.response || 
                data.message?.content || 
                data.content || 
                "I received your message but couldn't process it properly."
      };

      // Update messages with bot response
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, {
        role: 'assistant',
        content: "Error: Unable to get a response. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-h-full max-w-screen bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center space-x-2 p-4 border-b bg-blue-50 rounded-t-lg max-h-full ticky top-0">
        <Bot className="w-6 h-6 text-blue-600 ticky top-0" />
        <h2 className="text-lg font-semibold text-blue-800 sticky top-0">Ideas Assistant</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-full">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex-shrink-0">
                {message.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
              <div
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              <span className="text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the stored ideas..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaChatbot;