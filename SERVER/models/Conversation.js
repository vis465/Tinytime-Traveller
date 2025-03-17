// MongoDB Schema Definitions
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Message Schema
const MessageSchema = new Schema({
  text: {
    type: String,
    required: false
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  videoSrc: {
    type: String,
    required: false
  },
  mediaType: {
    type: String,
    enum: ['none', 'video', 'image', 'audio'],
    default: 'none'
  }
});

// Conversation Schema
const ConversationSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  messages: [MessageSchema]
});

// Create models
const Message = mongoose.model('Message', MessageSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);
