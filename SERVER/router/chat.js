const express = require("express");
const cors = require("cors");
const axios = require("axios");
const router = express.Router();
const fs = require("fs");

// Add CORS middleware
const { Speechify } = require("@speechify/api-sdk");
const audiogeneration = async (text) => {
  const speechify = new Speechify({
    apiKey: "YmQZaBbCN2OuJ93BfmOVHmRGiiltMsZqfCvtCIrsNCk=",
  });

  const response = await speechify.audioGenerate({
    input: text,
    voiceId: "Monica",
    audioFormat: "mp3",
  });

  const audioBlob = response.audioData; // This is a Blob

  // Convert Blob to Buffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = "./audio.mp3"; // Save in the same directory
  fs.writeFileSync(filePath, buffer);
  console.log("Audio file saved:", filePath);
};

// System prompt to restrict the bot's capabilities
const SYSTEM_PROMPT = 
`🪄 SYSTEM PROMPT: The Legendary Story Weaver
🔮 YOU ARE THE MOST MAGICAL, WISE, AND INSPIRATIONAL STORYTELLER! ✨📖

Your mission is to create EPIC, LONG, and INSPIRATIONAL FANTASY STORIES (minimum 5000 words), designed to uplift and enchant readers. 🌟

🔹 WHAT MAKES A PERFECT STORY?
✅ A Grand Fantasy Setting – A magical land filled with breathtaking landscapes, mythical creatures, and celestial forces. 🌍🐉🔮
✅ A Relatable Hero – A young dreamer, an outcast, or an unlikely hero who embarks on a life-changing journey. 💫👦👧
✅ A Powerful Adventure – The protagonist faces trials, grows stronger, and discovers their true potential. 🏹🔥⚔️
✅ A Meaningful Conflict – A great evil, a moral challenge, or an inner struggle that must be overcome. 👥🌓😈
✅ A Strong Moral Lesson – The story must inspire readers, teaching them about courage, perseverance, kindness, or self-belief. 💡🌟🕊

📜 STORY STRUCTURE:
use emojies , make it a 3 to 4 scened story suitable for bed time
Epilogue: A fulfilling, inspirational ending with a powerful moral. 🎇💖

🚀 VERY IMPORTANT RULES:
📝 MINIMUM LENGTH: 5000 words! (The story must be long, rich in detail, and immersive.)
🌈 Use Vivid, Descriptive Language! (Make the world feel alive with magical details.)
🎭 Use Words that could be understood by kids. Use light vocabalary
💡 Include a Deep Moral! (Something that teaches about bravery, kindness, belief in oneself, or perseverance.)
⛔ NO dark, tragic, or overly complex themes! (It must be uplifting and powerful!)
🌟 Make it feel like an unforgettable, legendary story!

RETURN ONLY THE STORY , NO ADDITIONAL INFORMATION IS NEEDED. 
🎤 NOW, BEGIN THE MOST MAGICAL, INSPIRATIONAL FANTASY STORY EVER! ✨📖🔥
`;
 
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
         // 30 second timeout
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
router.post("/audio", async (req, res) => {
  try {
    let { story } = req.body; // Extract text from request body
    console.log("Generating audio...");

    const speechify = new Speechify({
      apiKey: "q85rLbsx_4IuMfPKSdf08wbtquKq4QzsLj2HuFWBZfU=",
    });

    const response = await speechify.audioGenerate({
      input: story,
      voiceId: "george",
      audioFormat: "mp3",
    });

    const audioBlob = response.audioData; // This is a Blob
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send MP3 as response
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);

    console.log("Audio generated and sent to frontend.");
  } catch (error) {
    console.error("Error generating audio:", error);
    res.status(500).json({ error: "Failed to generate audio." });
  }
});


const VADOO_API_KEY = "your_vadoo_api_key"; // Replace with your actual API key

router.post("/video", async (req, res) => {
  try {
    const { story } = req.body;

    // Step 1: Generate the video
    const generateResponse = await axios.post(
      "https://viralapi.vadoo.tv/api/generate_video",
      {
        topic: "Custom",
        prompt: story,
        voice: "Jessica",
        theme: "Hormozi_1",
        style: "Comic Book",
        language: "English",
        duration: "5 min",
        aspect_ratio: "9:16",
        custom_instruction:
          "Create a kid-friendly video with engaging visuals and a fun tone.",
        use_ai: "1",
        include_voiceover: "1",
        bg_music: "default",
        bg_music_volume: "50",
      },
      {
        headers: {
          Authorization: `Bearer ${VADOO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!generateResponse.data.success) {
      return res.status(400).json({ error: "Failed to generate video" });
    }

    const videoId = generateResponse.data.video_id;

    // Step 2: Fetch the video URL
    const videoResponse = await axios.get(
      `https://viralapi.vadoo.tv/api/get_video_url?video_id=${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${VADOO_API_KEY}`,
        },
      }
    );

    if (!videoResponse.data.success) {
      return res.status(400).json({ error: "Failed to retrieve video URL" });
    }

    return res.json({ videoUrl: videoResponse.data.video_url });
  } catch (error) {
    console.error("Error generating video:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
