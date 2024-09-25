import React, { useState, useEffect } from "react";
import avt from "../../assets/avt.jpg";
import { IconBrandTelegram, IconLogout, IconPhoneCall } from "@tabler/icons-react";
import { navigations } from "../Home/navigation";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/input";
import io from 'socket.io-client';

// Replace with your server URL
const SERVER_URL = "http://localhost:8000";

const Message = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [followingUsers, setFollowingUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("user:detail"));
    if (userDetails) {
      setUser(userDetails);
    }

    const fetchFollowingUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/following", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFollowingUsers(data.following);
        } else {
          console.error("Failed to fetch following users");
        }
      } catch (error) {
        console.error("Error fetching following users", error);
      }
    };

    fetchFollowingUsers();

    const newSocket = io(SERVER_URL, {
      query: { userId: user._id },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user._id]);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        console.log("Received message:", message);
        if (message.conversationId === conversationId) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      return () => {
        socket.off('message');
      };
    }
  }, [socket, conversationId]);

  const handleLogout = () => {
    localStorage.removeItem("user:token");
    localStorage.removeItem("user:detail");
    navigate("/account/signin");
  };

  const { _id: loggedInUserId = "" } = user || {};

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);

    try {
      const response = await fetch("http://localhost:8000/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({
          senderId: loggedInUserId,
          receiverId: user._id,
        }),
      });

      if (response.ok) {
        const { conversationId } = await response.json();
        setConversationId(conversationId);

        const messagesResponse = await fetch(`http://localhost:8000/api/messages/${conversationId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });

        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data);
        } else {
          console.error("Failed to fetch messages:", messagesResponse.statusText);
        }
      } else {
        console.error("Failed to create or retrieve conversation:", response.statusText);
      }
    } catch (error) {
      console.error("Error handling user click:", error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedUser && conversationId) {
      const newMessage = {
        conversationId,
        senderId: loggedInUserId,
        receiverId: selectedUser._id,
        message: message.trim(),
      };

      socket.emit('message', newMessage);

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="w-screen flex h-screen">
      <div className="w-[5%] border-r h-full flex flex-col items-center justify-between">
        <div className="mt-4">
          <img
            src={user?.image || avt}
            alt="User Avatar"
            className="w-[50px] h-[50px] rounded-full"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          {navigations.map(({ id, icon, url }) => (
            <Link
              to={url}
              key={id}
              className="mb-6 text-gray-600 hover:text-green-500"
            >
              <span className="text-2xl">{icon}</span>
            </Link>
          ))}
        </div>
        <div
          className="mb-4 cursor-pointer text-gray-600 hover:text-green-500"
          onClick={handleLogout}
        >
          <span className="text-2xl">
            <IconLogout />
          </span>
        </div>
      </div>

      <div className="w-[25%] border-r h-full p-6">
        <div className="flex justify-center items-center mb-6">
          <img
            src={user?.image || avt}
            alt="User Avatar"
            className="w-[75px] h-[75px] rounded-full"
          />
          <div className="ml-4">
            <h3 className="text-xl font-semibold">{user?.username}</h3>
            <p className="text-sm text-gray-500">My Account</p>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-6">Messages</h3>
        <div className="space-y-6">
          {followingUsers.map((followingUser) => (
            <div
              key={followingUser._id}
              className="flex items-center border-b pb-4 cursor-pointer"
              onClick={() => handleUserClick(followingUser)}
            >
              <img
                src={followingUser?.image || avt}
                alt="Following User Avatar"
                className="w-[50px] h-[50px] rounded-full"
              />
              <div className="ml-4">
                <h3 className="text-md font-semibold">
                  {followingUser.username}
                </h3>
                <p className="text-sm text-gray-500">{followingUser.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[70%] flex flex-col flex-1 h-full">
        <div className="w-full h-[80px] px-6 flex items-center justify-between shadow">
          <div className="flex items-center cursor-pointer"   onClick={() => navigate(`/user/${selectedUser?.username}`)}>
            <img
              src={selectedUser?.image || avt}
              alt="User Avatar"
              className="w-[50px] h-[50px] rounded-full"
            />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">{selectedUser?.username || "Select a user"}</h3>
              <p className="text-sm text-gray-500">{selectedUser ? "Online" : ""}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-500">
            <IconPhoneCall className="cursor-pointer" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 mb-6 break-words max-w-fit w-[60%] ${
                  msg.senderId === loggedInUserId
                    ? 'ml-auto bg-green-500 rounded-b-xl rounded-tl-xl text-white text-right'
                    : 'bg-gray-300 rounded-b-xl rounded-tr-xl text-gray-700'
                }`}
              >
                <p>{msg.message}</p>
                <small className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full  flex items-center p-4 border-t">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={handleInputChange}
            className="flex-1 mr-4 w-[1200px] dark:bg-black"
          />
          <IconBrandTelegram

            onClick={handleSendMessage}
            className="mb-4 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Message;
