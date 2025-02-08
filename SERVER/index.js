const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("./models/user");
const SavedIdea=require("./models/SavedIdea")
const chatroute = require('./router/chat');
const idearoute=require("./router/idea")
const botroute=require("./router/chat")
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(chatroute);
app.use(botroute)
app.use(idearoute)
// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/business-idea-generator")
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

// Authentication middleware


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
