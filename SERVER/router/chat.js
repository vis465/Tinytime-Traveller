const express = require("express");
const cors = require("cors");
const axios = require("axios");
const router = express.Router();

// Add CORS middleware


// Add error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// System prompt to restrict the bot's capabilities
const SYSTEM_PROMPT = 
`You are an AI assistant specifically designed to help users understand and discuss the ideas stored in the database. 
Your role is strictly limited to:
1. Answering questions about the stored ideas
2. Providing explanations about specific aspects of these ideas
3. Comparing different ideas in the database
4. Helping users find relevant ideas based on their queries

You must NOT:
1. Generate new ideas
2. Write code or provide technical implementations
3. Discuss topics unrelated to the stored ideas
4. Provide personal opinions or advice unrelated to the ideas

If a user asks about anything outside these boundaries, politely remind them that you can only discuss the stored ideas.

Current ideas in the database:`;

const OLLAMA_API_URL = "http://115.244.160.81:11434"; // Replace with your Ollama server address

// Route to handle chat messages
router.post("/api/chat", async (req, res) => {
  console.log("bot called");
  try {
    const { messages, ideas } = req.body;

    if (!messages || !Array.isArray(messages) || !ideas) {
      return res.status(400).json({
        error: "Invalid request body. Messages and ideas are required.",
      });
    }
    // Prepare the complete prompt with system message and ideas context
    const fullSystemPrompt = SYSTEM_PROMPT + JSON.stringify(ideas, null, 2);

    // Format messages for Ollama
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system prompt at the beginning
    formattedMessages.unshift({
      role: "system",
      content: fullSystemPrompt,
    });

    // Make request to Ollama API
    const response = await axios.post(
      `${OLLAMA_API_URL}/api/chat`,
      {
        model: "llama3.2:latest",
        messages: formattedMessages,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );
    console.log(response.data.message.content);
    res.json({ response: response.data.message.content, ok: true });
  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Ollama server is not accessible",
        ok: false,
      });
    }

    if (error.timeout) {
      return res.status(504).json({
        error: "Request timed out",
        ok: false,
      });
    }

    res.status(500).json({
      error: "Failed to process chat message",
      details: error.response?.data || error.message,
      ok: false,
    });
  }
});

// Optional: Add a health check route for the Ollama server

module.exports = router;
