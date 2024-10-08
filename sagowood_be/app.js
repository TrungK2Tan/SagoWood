const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
let activeUsers = {}; // To store active users and their socket ids

io.on("connection", (socket) => {
  console.log("New client connected");

  // Join the user to a specific room (could be used for private messaging)
  socket.on("join", (userId) => {
    activeUsers[userId] = socket.id;
  });

  // Handle incoming messages
  socket.on("message", async (message) => {
    try {
      console.log("Message received:", message);

      // Save the message to the database
      const newMessage = new Message(message);
      await newMessage.save();

      // Emit the message to all clients except the sender
      socket.broadcast.emit("message", message);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // Remove the user from the active users list
    for (let userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
      }
    }
  });
});

// Import Schemas
const User = require("./models/userSchema");
const Posts = require("./models/postSchema");
const Contacts = require("./models/contactSchema");
// Connect database
require("./db/connection");
// Import Middleware
const authenticate = require("./middleware/auth");
const Conversation = require("./models/conversationSchema");
const Message = require("./models/messageSchema");

// Middleware to handle JSON and URL-encoded data
const corsOptions = {
  origin: "http://localhost:3000", // Change to the correct URL or use "*"
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Dummy data for demonstration
const countries = [
  { id: 1, name: "Vietnam" },
  { id: 2, name: "USA" },
  { id: 3, name: "India" },
];

const cities = {
  Vietnam: [
    { id: 1, name: "Hanoi" },
    { id: 2, name: "Ho Chi Minh City" },
  ],
  USA: [
    { id: 3, name: "New York" },
    { id: 4, name: "Los Angeles" },
  ],
  India: [
    { id: 5, name: "Delhi" },
    { id: 6, name: "Mumbai" },
  ],
};

const districts = {
  "Hanoi": [
    { id: 1, name: "Hoan Kiem" },
    { id: 2, name: "Tay Ho" },
  ],
  "Ho Chi Minh City": [
    { id: 3, name: "District 1" },
    { id: 4, name: "District 2" },
  ],
  "New York": [
    { id: 5, name: "Manhattan" },
    { id: 6, name: "Brooklyn" },
  ],
  "Los Angeles": [
    { id: 7, name: "Hollywood" },
    { id: 8, name: "Beverly Hills" },
  ],
  "Delhi": [
    { id: 9, name: "Central Delhi" },
    { id: 10, name: "South Delhi" },
  ],
  "Mumbai": [
    { id: 11, name: "South Mumbai" },
    { id: 12, name: "Andheri" },
  ],
};
app.get("/", (req, res) => {
  res.send("Hello world");
});
// Endpoint to fetch countries
app.get("/api/countries", (req, res) => {
  res.json(countries);
});

// Endpoint to fetch cities by country
app.get("/api/cities", (req, res) => {
  const { country } = req.query;
  const cityList = cities[country] || [];
  res.json(cityList);
});

// Endpoint to fetch districts by city
app.get("/api/districts", (req, res) => {
  const { city } = req.query;
  const districtList = districts[city] || [];
  res.json(districtList);
});
// Dang Ky

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, phone, dateOfBirth, country, city, district } = req.body; 
    if (!username || !email || !password || !phone || !dateOfBirth || !country || !city || !district) {
      return res.status(400).send("Cannot be empty");
    }

    // Check if email or phone already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).send("Email is already in use");
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).send("Phone number is already in use");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Combine country, city, and district into a single address
    const address = `${country}, ${city}, ${district}`;
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone, 
      dateOfBirth,
      address, 
      image: "", 
      createdAt: new Date() // Add createdAt field
    });
    
    await user.save();
    return res.status(200).send("Successfully registered");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// Dang Nhap
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send("User or password is invalid");
  }
  const validate = await bcryptjs.compare(password, user.password);
  if (!validate) {
    return res.status(401).send("User or password is invalid");
  }
  const payload = {
    id: user._id,
    username: user.username,
  };
  const JWT_SECRET_KEY =
    process.env.JWT_SECRET_KEY || "THIS_IS_THE_SECRET_KEY_OF_JWT";
  jsonwebtoken.sign(
    payload,
    JWT_SECRET_KEY,
    { expiresIn: 86400 },
    (err, token) => {
      if (err) return res.json({ message: err });
      return res.status(200).json({ user, token });
    }
  );
});
// Edit Profile
app.put("/api/edit-profile", authenticate, async (req, res) => {
  try {
    const { username, email, image } = req.body;
    const { user } = req;

    // Kiểm tra dữ liệu đầu vào
    if (!username && !email && !image) {
      return res.status(400).send("No fields to update");
    }

    // Tìm người dùng và cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          username: username || user.username,
          email: email || user.email,
          image: image || user.image,
        },
      },
      { new: true } // Trả về tài liệu mới sau khi cập nhật
    );

    // Trả về thông tin người dùng đã được cập nhật
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
});

// Tao Bai Viet
app.post("/api/createpost", authenticate, async (req, res) => {
  try {
    const { caption, desc, url } = req.body;
    const { user } = req;
    if (!caption || !desc || !url) {
      return res.status(400).send("Please fill all the fields");
    }
    const createPost = new Posts({
      caption,
      description: desc,
      image: url,
      user: user._id,
    });

    await createPost.save();
    res.status(200).send("Create Post Successfully");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});
// Trang ca nhan tai khoan dang nhap
app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const posts = await Posts.find({ user: user._id })
      .populate("user", "_id username")
      .populate("comments.user", "_id username image");
    res.status(200).json({ posts, user });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Trang ca nhan nguoi dung khac
app.get("/api/people", authenticate, async (req, res) => {
  try {
    const { username } = req.query;
    const { user: follower } = req;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [isFollowed] = await Contacts.find({
      follower: follower._id,
      followed: user._id,
    });

    // Get follower and following counts
    const followersCount = await Contacts.countDocuments({
      followed: user._id,
    });
    const followingCount = await Contacts.countDocuments({
      follower: user._id,
    });

    const userDetail = {
      id: user._id,
      username: user.username,
      email: user.email,
      image: user.image,
      followersCount,
      followingCount,
    };
    const posts = await Posts.find({ user: user._id }).populate(
      "comments.user",
      "_id username image"
    );
    res.status(200).json({ posts, userDetail, isFollowed: !!isFollowed });
  } catch (error) {
    res.status(500).send(error);
  }
});
//hien thi cac bai viet
app.get("/api/posts", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const posts = await Posts.find()
      .populate("user", "_id username email image")
      .populate("comments.user", "_id username image")
      .sort({ _id: -1 });
    res.status(200).json({ posts, user });
  } catch (error) {
    res.status(500).send(error);
  }
});
// Hiển thị một bài viết cụ thể theo ID
app.get("/api/posts/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL
    const post = await Posts.findById(id) // Tìm bài viết theo ID
      .populate("user", "_id username email image") // Thêm thông tin người dùng
      .populate("comments.user", "_id username image"); // Thêm thông tin người dùng cho các bình luận

    // Kiểm tra nếu bài viết không tồn tại
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post); // Trả về bài viết
  } catch (error) {
    res.status(500).send(error); // Trả về lỗi nếu có
  }
});

// Delete Post
app.delete("/api/posts/:id", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const { user } = req;

    // Find the post by ID
    const post = await Posts.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if the user is the owner of the post
    if (!post.user.equals(user._id)) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this post" });
    }

    await Posts.findByIdAndDelete(postId); // Delete the post

    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//comment cho bai viet
app.put("/api/posts/:id/comment", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const { user } = req;

    if (!text) return res.status(400).json({ msg: "Comment text is required" });

    const post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Add comment to the post
    post.comments.push({ user: user._id, text });
    await post.save();

    // Populate user information in the updated post
    const updatedPost = await Posts.findById(postId)
      .populate("user", "_id username email image")
      .populate("comments.user", "_id username image")
      .exec();

    res.json({ updatedPost });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
//follow user
app.post("/api/follow", authenticate, async (req, res) => {
  try {
    const { id } = req.body;
    const { user } = req;
    if (!id) return res.status(400).send("Id cannot be empty");
    const [followedUser] = await User.find({ _id: id });
    const followUser = new Contacts({
      follower: user,
      followed: followedUser,
    });
    await followUser.save();
    res.status(200).json({ isFollowed: true });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
//unfollow user
app.post("/api/unfollow", authenticate, async (req, res) => {
  try {
    const { id } = req.body;
    const { user } = req;
    if (!id) return res.status(400).send("Id cannot be empty");
    await Contacts.deleteOne({ follower: user._id, followed: id });

    res.status(200).json({ isFollowed: false });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
// Handle adding or updating a reaction to a post
app.put("/api/react", authenticate, async (req, res) => {
  try {
    const { id, reactionType } = req.body;
    console.log("Received ID:", id, "Reaction Type:", reactionType);

    if (!id || !reactionType) {
      return res.status(400).send("Id and reaction type cannot be empty");
    }

    const validReactions = ["like", "love", "haha", "angry", "sad"];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).send("Invalid reaction type");
    }

    const existingReaction = await Posts.findOne({
      _id: id,
      "reactions.user": req.user._id,
      "reactions.type": reactionType,
    });

    if (existingReaction) {
      return res.status(400).send("You have already reacted with this type");
    }

    await Posts.findOneAndUpdate(
      { _id: id },
      { $pull: { reactions: { user: req.user._id } } },
      { new: true }
    );

    const updatedPost = await Posts.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          reactions: {
            user: req.user._id,
            type: reactionType,
            date: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    )
      .populate("user", "_id username email image")
      .populate("comments.user", "_id username image");

    res.status(200).json({ updatedPost });
  } catch (error) {
    console.error("Error handling reaction:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle removing a reaction from a post
app.put("/api/remove-reaction", authenticate, async (req, res) => {
  try {
    const { id, reactionType } = req.body;
    const { user } = req;
    if (!id || !reactionType)
      return res.status(400).send("Id and reaction type cannot be empty");

    // Ensure the reaction type is valid
    const validReactions = ["like", "love", "haha", "angry", "sad"];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).send("Invalid reaction type");
    }

    // Remove the reaction based on user and reaction type
    const updatedPost = await Posts.findOneAndUpdate(
      { _id: id },
      { $pull: { reactions: { user: user._id, type: reactionType } } },
      { returnDocument: "after" }
    )
      .populate("user", "_id username email image")
      .populate("comments.user", "_id username image");

    res.status(200).json({ updatedPost });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).send("Internal Server Error");
  }
});

//xu ly save bai viet
app.put("/api/save", authenticate, async (req, res) => {
  try {
    const { id } = req.body;
    const { user } = req;
    if (!id) return res.status(400).send("Id cannot be empty");

    const updatedPost = await Posts.findOneAndUpdate(
      { _id: id },
      {
        $push: { saved: user._id },
      },
      { returnDocument: "after" }
    )
      .populate("user", "_id username email image")
      .populate("comments.user", "_id username image");

    // await followUser.save()
    res.status(200).json({ updatedPost });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
//xu ly unsave bai viet
app.put("/api/unsave", authenticate, async (req, res) => {
  try {
    const { id } = req.body;
    const { user } = req;
    if (!id) return res.status(400).send("Id cannot be empty");

    const updatedPost = await Posts.findOneAndUpdate(
      { _id: id },
      {
        $pull: { saved: user._id },
      },
      { returnDocument: "after" }
    )
      .populate("user", "_id username email image")
      .populate("comments.user", "_id username image");

    // await followUser.save()
    res.status(200).json({ updatedPost });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
// Endpoint to retrieve saved posts for the authenticated user
app.get("/api/saved-posts", authenticate, async (req, res) => {
  try {
    const { user } = req;
    // Find posts where the authenticated user is in the 'saved' array
    const savedPosts = await Posts.find({ saved: user._id })
      .populate("user", "_id username email image") // Populate user details of the post creator
      .populate("comments.user", "_id username image") // Populate user details of comments
      .sort({ _id: -1 }); // Sort by latest posts

    res.status(200).json({ savedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//hien thi bai viet,following,followers cua user dang nhap
app.get("/api/posts-stats", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const postsCount = await Posts.countDocuments({ user: user._id });
    res.status(200).json({ postsCount });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/followers-stats", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const followersCount = await Contacts.countDocuments({
      followed: user._id,
    });
    res.status(200).json({ followersCount });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/following-stats", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const followingCount = await Contacts.countDocuments({
      follower: user._id,
    });
    res.status(200).json({ followingCount });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
//lay danh sach nguoi dung da follow user đăng nhập
app.get("/api/active-followers", authenticate, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Query to get the list of users following the logged-in user
    const activeFollowers = await Contacts.find({ followed: loggedInUserId });

    // Extract follower IDs from the contacts
    const activeFollowerIds = activeFollowers.map(
      (contact) => contact.follower
    );

    // Fetch the follower details using their IDs
    const followersInfo = await User.find({ _id: { $in: activeFollowerIds } });

    res.status(200).json({ followers: followersInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
//danh sách người dùng mà người dùng đã đăng nhập chưa theo dõi
app.get("/api/suggestions", authenticate, async (req, res) => {
  try {
    const { user } = req;
    const loggedInUserId = user._id;

    // Fetch all users except the logged-in user
    const allUsers = await User.find({ _id: { $ne: loggedInUserId } });

    // Fetch users that the logged-in user is already following
    const followedUsers = await Contacts.find({ follower: loggedInUserId })
      .select("followed")
      .exec();

    // Extract followed user IDs
    const followedUserIds = followedUsers.map((contact) =>
      contact.followed.toString()
    );

    // Filter out the followed users from the list of all users
    const suggestedUsers = allUsers.filter(
      (user) => !followedUserIds.includes(user._id.toString())
    );

    // Send the list of suggested users as response
    res.status(200).json({ suggestions: suggestedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// Following Users
app.get("/api/following", authenticate, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const followedUsers = await Contacts.find({
      follower: loggedInUserId,
    }).populate("followed");

    const followedUserIds = followedUsers.map(
      (contact) => contact.followed._id
    );
    const followingInfo = await User.find({ _id: { $in: followedUserIds } });

    res.status(200).json({ following: followingInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Message to Followed Users
app.post("/api/messageToFollowed", authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const senderId = req.user._id;

    if (!message) {
      return res.status(400).send("Message cannot be empty");
    }

    // Fetch the list of followed users
    const followedUsers = await Contacts.find({ follower: senderId }).populate(
      "followed"
    );
    const followedUserIds = followedUsers.map(
      (contact) => contact.followed._id
    );

    // Create a conversation and send the message to each followed user
    for (const receiverId of followedUserIds) {
      // Check if a conversation already exists
      let conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        // Create a new conversation if it doesn't exist
        conversation = new Conversation({
          members: [senderId, receiverId],
        });
        await conversation.save();
      }

      // Send the message
      const newMessage = new Message({
        // Updated to `Message`
        conversationId: conversation._id,
        senderId,
        receiverId, // Added receiverId
        message,
      });
      await newMessage.save();
    }

    res.status(200).send("Messages sent successfully");
  } catch (error) {
    console.error("Error sending messages to followed users:", error);
    res.status(500).send("Server Error");
  }
});

// Create or retrieve conversation
app.post("/api/conversation", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).send("Sender and Receiver IDs are required");
    }

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
      });
      await conversation.save();
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });
    const conversationUserData = Promise.all(
      conversations.map(async (conversation) => {
        const receiverId = conversation.members.find(
          (member) => member !== userId
        );
        const user = await User.findById(receiverId);
        return {
          user: {
            receiverId: user._id,
            email: user.email,
            username: user.username,
            image: user.image,
          },
          conversationId: conversation._id,
        };
      })
    );
    res.status(200).json(await conversationUserData);
  } catch (error) {
    console.log(error, "error");
  }
});
// Create or update message
app.post("/api/message", async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId } = req.body;

    if (!senderId || !message) {
      return res.status(400).send("Please fill all required fields");
    }

    const newMessage = new Message({
      conversationId,
      senderId,
      receiverId,
      message,
    });
    await newMessage.save();

    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.error("Error sending message", error);
    res.status(500).send("Server Error");
  }
});

// Fetch messages by conversationId
app.get("/api/messages/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const messages = await Message.find({ conversationId });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
