const Conversation=require("../models/Conversation")
async function createConversation(userId, title = 'New Conversation') {
    try {
      const newConversation = new newConversation({
        userId,
        title,
        messages: []
      });
      return await newConversation.save();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  // Get all conversations for a user
  async function getConversationsForUser(userId) {
    try {
      return await Conversation.find({ userId }).sort({ updatedAt: -1 });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }
  
  // Get a specific conversation
  async function getConversationById(conversationId) {
    try {
      return await conversationId.findById(conversationId);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }
  
  // Add message to conversation
  async function addMessageToConversation(conversationId, messageData) {
    try {
      const conversation = await conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      conversation.messages.push(messageData);
      conversation.updatedAt = Date.now();
      
      return await conversation.save();
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
  
  // Add bot message with video
  async function addBotVideoResponse(conversationId, text, videoSrc) {
    try {
      return await addMessageToConversation(conversationId, {
        text,
        sender: 'bot',
        videoSrc,
        mediaType: 'video',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error adding video response:', error);
      throw error;
    }
  }
  
  // Update video source for an existing message
  async function updateMessageVideoSrc(conversationId, messageIndex, videoSrc) {
    try {
      const conversation = await conversation.findById(conversationId);
      if (!conversation || !conversation.messages[messageIndex]) {
        throw new Error('Conversation or message not found');
      }
      
      conversation.messages[messageIndex].videoSrc = videoSrc;
      conversation.messages[messageIndex].mediaType = 'video';
      conversation.markModified('messages');
      
      return await conversation.save();
    } catch (error) {
      console.error('Error updating video source:', error);
      throw error;
    }
  }
  
  // Delete a conversation
  async function deleteConversation(conversationId) {
    try {
      return await conversationId.findByIdAndDelete(conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
  
  // Search conversations by content
  async function searchConversations(userId, searchTerm) {
    try {
      return await Conversation.find({
        userId,
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { 'messages.text': { $regex: searchTerm, $options: 'i' } }
        ]
      }).sort({ updatedAt: -1 });
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }
  
  // Video tracking operations
  
  // Get all video messages for analytics
  async function getAllVideoMessages(userId) {
    try {
      return await Conversation.aggregate([
        { $match: { userId } },
        { $unwind: '$messages' },
        { $match: { 'messages.mediaType': 'video' } },
        { $project: {
            conversationId: '$_id',
            messageId: '$messages._id',
            text: '$messages.text',
            videoSrc: '$messages.videoSrc',
            timestamp: '$messages.timestamp'
          }
        }
      ]);
    } catch (error) {
      console.error('Error fetching video messages:', error);
      throw error;
    }
  }
  
  export default {
    Message,
    Conversation,
    createConversation,
    getConversationsForUser,
    getConversationById,
    addMessageToConversation,
    addBotVideoResponse,
    updateMessageVideoSrc,
    deleteConversation,
    searchConversations,
    getAllVideoMessages
  };