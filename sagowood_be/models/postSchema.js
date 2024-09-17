const mongoose = require("mongoose"); // Import mongoose

// Define the schema for posts
const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  }, // Ensure image is a string
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming likes should also reference User
    },
  ],
  comments: [
    {
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", // Correct reference to User model
        required: true 
      },
      text: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming likes should also reference User
    },
  ],
});

// Create the model for posts
const Posts = mongoose.model("Posts", postSchema);

module.exports = Posts;
