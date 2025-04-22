
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const Video = require("./models/Video");
const mongoose = require("mongoose");
const botroute=require("./router/chat");

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect("mongodb://localhost:27017/storyapp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// Store last generated video ID
let lastGeneratedVideoId = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/",botroute);
// Generate Video Route
app.post("/generate-video", async (req, res) => {
  let { story, language } = req.body;
  
  const data = {
    topic: "Custom",
    prompt: story,
    voice: "Jessica",
    theme: "Hormozi_1",
    style: "cinematic",
    language,
    duration: "60-90",
    aspect_ratio: "9:16",
    custom_instruction: "Create a kid-friendly video for bedtime story with engaging visuals and a fun tone.",
    use_ai: "1",
    include_voiceover: "1",
    bg_music: "default",
    bg_music_volume: "50",
  };
console.log("generate")
  // try {
  //   console.log("Sending request to Vadoo AI:", data);
  //   const response = await axios.post("https://viralapi.vadoo.tv/api/generate_video", data, {
  //     headers: { "X-API-KEY": process.env.API_KEY },
  //   });

  //   if (response.data && response.data.id) {
  //     lastGeneratedVideoId = response.data.id;
  //     res.json({ message: "Video generation started", videoId: lastGeneratedVideoId });
  //   } else {
  //     res.status(500).json({ error: "Failed to generate video" });
  //   }
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Error generating video");
  // }
});

// Check Video Status Route
app.get("/check-video-status", async (req, res) => {
  console.log("check triggered")
  if (!lastGeneratedVideoId) {
    return res.json({ message: "No video ID found. Generate a video first." });
  }

  try {
    let headersList = {
       "X-API-KEY": "w34W5MQjubmnZ0xrmx3MLk38tnuKMR42rFWNOXJEO1I",
       "Content-Type": "application/json" 
      }
      
    
      let reqOptions = {
        url: `https://viralapi.vadoo.tv/api/get_video_url?id=${lastGeneratedVideoId}`,
        method: "GET",
        headers: headersList
      }
      
      let response = await axios.request(reqOptions);
      console.log(response)
    if (response.data.status === "completed") {
      // Save to MongoDB
      const newVideo = new Video({ url: response.data.url });
      await newVideo.save();
      lastGeneratedVideoId = null; // Reset after storing
      res.json({ url: response.data.url });
    } else {
      res.json({ message: "Video is still processing. Try again later." });
    }
  } catch (error) {
    console.error("Error checking video status:", error);
    res.status(500).send("Error checking video status");
  }
});

// Fetch All Videos
app.get("/fetchvideos", async (req, res) => {
  try {
    // const latestVideo = await Video.findOne().sort({_id:1}).exec();
    const l=await Video.find();
    console.log(l)
    if (!l) {
        return res.status(404).send("No videos found");
    }
    res.json({ urls:l });
} catch (error) {
    console.error("Error fetching latest video:", error);
    res.status(500).send("Internal Server Error");
}
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
