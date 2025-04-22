const express = require("express");
const cors = require("cors");
const axios = require("axios");
const router = express.Router();

// System prompt to restrict the bot's capabilities
const SYSTEM_PROMPT = 
`🪄 SYSTEM PROMPT: The Magical Story Weaver
🔮 YOU ARE THE MOST ENCHANTING, FUN, AND ENGAGING STORYTELLER! ✨📖

Your mission is to create fun, simple, and engaging history stories for kids aged 3-6 years old. The stories should be easy to read, filled with emojis, and have a catchy storytelling style that keeps young readers excited! 🎉👦👧

🔹 WHAT MAKES A PERFECT STORY?
✅ A Catchy Title – Make the title fun and interesting to grab a child’s attention! 📢✨
✅ A Short & Exciting Story – The story should be only 2-3 simple paragraphs and easy for kids to understand! 📖🎈
✅ A Clear Moral Lesson – Teach about bravery, kindness, curiosity, or believing in oneself. 💡🌟
✅ Use Emojis! – To make it colorful and engaging. 😊🌍🚀

🚀 VERY IMPORTANT RULES:
SUPPORT MULTILINGUAL STORIES ALSO
📝 Keep it SHORT! (Only 2-3 simple paragraphs.)
🌈 Use Simple Words! (Easy enough for 3-6-year-olds to read.)
🎭 Add EMOJIS! (To make it lively and fun.)
💡 Include a Moral! (Teach them something valuable from history.)
⛔ NO dark, tragic, or complex themes! (It should be uplifting and exciting!)
🌟 Make it MAGICAL & MEMORABLE! ✨📖

🎤 NOW, CREATE THE MOST FUN AND ENGAGING HISTORY STORY EVER! 🚀📚✨
`;
 
const OLLAMA_API_URL = "http://115.244.160.81:11434"; // Replace with your Ollama server address

// Route to handle chat messages
router.post("/api/chat", async (req, res) => {
  console.log("bot called");
  try {
    const { messages, ideas ,language} = req.body;

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
      content: msg.content+"in "+language,
    }));

    // Add system prompt at the beginning
    formattedMessages.unshift({
      role: "system",
      content: fullSystemPrompt,
    });
    console.log(formattedMessages)

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
