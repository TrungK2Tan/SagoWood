const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Changed from "USER" to "User" for consistency
  },
  followed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Changed from "USER" to "User" for consistency
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
});

const Contacts = mongoose.model("Contact", contactSchema); // Changed model name to "Contact"

module.exports = Contacts;
