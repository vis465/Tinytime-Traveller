const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/storyapp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Video schema and model
const videoSchema = new mongoose.Schema({
  story: String,
  videoUrl: String
});

const Video = mongoose.model('Video', videoSchema);

router.post('/video', async (req, res) => {
  const { story, videoUrl } = req.body;
  
  if (!story || !videoUrl) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const newVideo = new Video({ story, videoUrl });
    await newVideo.save();
    res.send("Webhook received and stored successfully");
  } catch (error) {
    console.error("Error saving video to database:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/video/latest', async (req, res) => {
  try {
    const latestVideo = await Video.findOne().sort({ _id: -1 }).exec();
    
    if (!latestVideo) {
      return res.status(404).send("No videos found");
    }

    res.json({
      videoUrl: latestVideo.videoUrl,
      story: latestVideo.story
    });
  } catch (error) {
    console.error("Error fetching latest video:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
