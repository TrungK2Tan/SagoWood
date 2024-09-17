const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Renamed from 'from'
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Renamed from 'to'
  message: { type: String, required: true }, // Ensure this field is required
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt fields
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
