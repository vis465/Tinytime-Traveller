const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
