const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const webhooks=require("../webhooks")
const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/storyapp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/hook", webhooks);

// Root route
app.get("/", (req, res) => {
  res.send("Video Server running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Video Server running on port ${PORT}`);
});
