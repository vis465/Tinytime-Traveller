const express = require("express");
const cors = require("cors");
const axios = require("axios");

const botroute = require("./router/chat");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Use webhooks router

console.log("botroute");
app.use(botroute);

// Fetch Data Route
app.get('/fetch-data', async (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://viralapi.vadoo.tv/api/get_video_url?id=741045352191',
    headers: { 
      'X-API-KEY': process.env.API_KEY
    },
    data : ''
  };

  try {
    const response = await axios.request(config);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});

// Generate Video Route
app.post('/generate-video', async (req, res) => {
    let storyy=req.body.story
  const story = storyy;

  const data = {
      "topic": "Custom",
      "prompt": story,
      "voice": "Jessica",
      "theme": "Hormozi_1",
      "style": "cinematic",
      "language": "English",
      "duration": "60-90",
      "aspect_ratio": "9:16",
      "custom_instruction":"Create a kid-friendly video for bedtime story with engaging visuals and a fun tone.",
      "use_ai": "1",
      "include_voiceover": "1",
      "bg_music": "default",
      "bg_music_volume": "50"
    };

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://viralapi.vadoo.tv/api/generate_video',
    headers: { 
      'X-API-KEY': process.env.API_KEY
    },
    data : data
  };

  try {
    console.log("story");
    // const response = await axios.request(config);
    // res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating video');
  }
});

// Root route
app.get("/", (req, res) => {
    res.send("Server running");
});

// Start server and listen on 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
