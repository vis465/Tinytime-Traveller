const express = require('express');

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();

app.get("/api/profile", auth, async (req, res) => {
    res.json(req.user);
  });

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, "your_jwt_secret");
    const user = await User.findOne({ _id: decoded._id });
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};
module.exports = router;