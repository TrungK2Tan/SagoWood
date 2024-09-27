import React, { useState, useEffect } from "react";
import avt from "../../assets/avt.jpg";
import imgLogo from "../../assets/logo.jpg";
import Input from "../../components/input";
import Button from "../../components/Button";
import postImg from "../../assets/post.jpg";
import {
  IconPlus,
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconBookmark,
  IconSearch,
  IconLogout,
  IconMoodAngry,
  IconMoodHappy,
  IconMoodSad,
  IconThumbUp,
} from "@tabler/icons-react";
import { navigations } from "./navigation";
import { Link, useNavigate } from "react-router-dom";
import PacmanLoader from "react-spinners/PacmanLoader";
import PostCommentsModal from "../../pop-up/PostCommentsModal";
import DarkMode from "../../components/DarkMode";

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [trendingPost, setTrendingPost] = useState(null);
  const [comment, setComment] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //lay danh sach nguoi dung ch follow
  const [suggestions, setSuggestions] = useState([]); // New state for suggestions
  //lay danh sach nguoi dung da follow
  const [activeFollowers, setActiveFollowers] = useState([]); // New state for active followers
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [postReactions, setPostReactions] = useState({});
  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev); // Update this line
  };
  const handleReactionClick = async (id, reactionType) => {
    const currentReaction = postReactions[id]; // Get the current reaction for the specific post
  
    try {
      // Set URLs for API
      const removeUrl = "http://localhost:8000/api/remove-reaction";
      const reactUrl = "http://localhost:8000/api/react";
      const fetchPostUrl = `http://localhost:8000/api/posts/${id}`; // URL to fetch the post
  
      // If the user clicks on the same type of reaction, remove the current reaction
      if (currentReaction === reactionType) {
        // Remove the reaction
        await updateReaction(removeUrl, id, currentReaction); // Call function to remove the reaction
        setPostReactions((prev) => ({ ...prev, [id]: null })); // Update state to remove the reaction
        
        // Fetch the updated post data
        const response = await fetch(fetchPostUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          console.error("Failed to fetch post after removing reaction:", errorMessage);
          throw new Error("Failed to fetch post after removing reaction");
        }
  
        const updatedPost = await response.json();
  
        // Update data based on the response
        setData((prevData) =>
          prevData.map((post) =>
            post._id === updatedPost._id ? updatedPost : post
          )
        );
  
      } else {
        // If there is a current reaction, remove that reaction first
        if (currentReaction) {
          await updateReaction(removeUrl, id, currentReaction); // Remove the current reaction
        }
  
        // Set the new reaction in state
        setPostReactions((prev) => ({ ...prev, [id]: reactionType }));
  
        const response = await fetch(reactUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
          body: JSON.stringify({ id, reactionType }),
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          console.error("Failed to update post reaction:", errorMessage);
          throw new Error("Failed to update post reaction");
        }
  
        const { updatedPost } = await response.json();
  
        // Update data based on the response
        setData((prevData) =>
          prevData.map((post) =>
            post._id === updatedPost._id ? updatedPost : post
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Hàm để xử lý việc cập nhật phản ứng
  const updateReaction = async (url, id, reactionType) => {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({ id, reactionType }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(`Failed to update reaction: ${reactionType}`, errorMessage);
      throw new Error(`Failed to update reaction: ${reactionType}`);
    }
  };

  const getReactionIcon = (reactionType) => {
    switch (reactionType) {
      case "like":
        return <IconThumbUp className="text-blue-500" />;
      case "love":
        return <IconMoodHappy className="text-yellow-500" />;
      case "haha":
        return <IconMoodHappy className="text-green-500" />;
      case "angry":
        return <IconMoodAngry className="text-red-600" />;
      case "sad":
        return <IconMoodSad className="text-purple-500" />;
      case "default":
        return <IconThumbUp className="text-black" />;
    }
  };

  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };
  const handleTrendingPostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };
  const handleLogout = () => {
    localStorage.removeItem("user:token");
    localStorage.removeItem("user:detail");
    navigate("/account/signin");
  };
  // random hien thi bai viet o trang chu
  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch trending post
        const responseTrendingPosts = await fetch(
          "http://localhost:8000/api/posts",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        if (!responseTrendingPosts.ok)
          throw new Error("Failed to fetch trending posts");
        const data = await responseTrendingPosts.json();
        const postsWithreactions = data.posts.filter(
          (post) => post.reactions.length > 0
        );
        const postsWithComments = data.posts.filter(
          (post) => post.comments.length > 0
        );
        const sortedByreactions = postsWithreactions.sort(
          (a, b) => b.reactions.length - a.reactions.length
        );
        const sortedByComments = postsWithComments.sort(
          (a, b) => b.comments.length - a.comments.length
        );
        const topPosts = [
          ...(sortedByreactions.length > 0 ? [sortedByreactions[0]] : []),
          ...(sortedByComments.length > 0 ? [sortedByComments[0]] : []),
        ];
        if (topPosts.length > 0) {
          const randomIndex = Math.floor(Math.random() * topPosts.length);
          setTrendingPost(topPosts[randomIndex]);
        }

        // Fetch user posts and info
        const postsResponse = await fetch("http://localhost:8000/api/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
        if (!postsResponse.ok) throw new Error("Failed to fetch user posts");
        const postsData = await postsResponse.json();
        // Shuffle posts
        const shuffledPosts = shuffleArray(postsData.posts);
        setData(shuffledPosts);
        setUser(postsData.user);

        // Fetch post count
        const postsCountResponse = await fetch(
          "http://localhost:8000/api/posts-stats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        const postsCountData = await postsCountResponse.json();
        setPostsCount(postsCountData.postsCount);

        // Fetch follower count
        const followersCountResponse = await fetch(
          "http://localhost:8000/api/followers-stats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        const followersCountData = await followersCountResponse.json();
        setFollowersCount(followersCountData.followersCount);

        // Fetch following count
        const followingCountResponse = await fetch(
          "http://localhost:8000/api/following-stats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        const followingCountData = await followingCountResponse.json();
        setFollowingCount(followingCountData.followingCount);
        const getRandomItems = (arr, count) => {
          const shuffled = arr.slice().sort(() => 0.5 - Math.random());
          return shuffled.slice(0, count);
        };

        // Fetch active followers and select 5 random ones
        const followersResponse = await fetch(
          "http://localhost:8000/api/active-followers",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        if (!followersResponse.ok)
          throw new Error("Failed to fetch active followers");
        const followersData = await followersResponse.json();
        setActiveFollowers(getRandomItems(followersData.followers, 5));

        // Fetch suggestions and select 5 random ones
        const suggestionsResponse = await fetch(
          "http://localhost:8000/api/suggestions",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        if (!suggestionsResponse.ok)
          throw new Error("Failed to fetch suggestions");
        const suggestionsData = await suggestionsResponse.json();
        setSuggestions(getRandomItems(suggestionsData.suggestions, 5));
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const { _id: loggedInUserId = "", username = "", email = "" } = user || {};

  const handleReactionSave = async (_id, index, reaction = "save") => {
    try {
      const response = await fetch(`http://localhost:8000/api/${reaction}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: _id }),
      });
      if (!response.ok) throw new Error("Failed to update post reaction");
      const { updatedPost } = await response.json();
      const updatePost = data.map((post, i) => {
        if (i === index) return updatedPost;
        else return post;
      });
      setData(updatePost);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCommentSubmit = async (postId, index) => {
    try {
      const token = localStorage.getItem("user:token");
      if (!token) throw new Error("Token is missing");
      const response = await fetch(
        `http://localhost:8000/api/posts/${postId}/comment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: comment }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to add comment");
      }
      const { updatedPost } = await response.json();
      const updatedPosts = data.map((post, i) =>
        i === index ? updatedPost : post
      );
      setData(updatedPosts);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(error.message);
    }
  };

  return (
    <div className="h-screen  flex overflow-hidden">
      {/**trai */}
      <div className="w-[20%]  flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center h-[30%] border-b">
            <PacmanLoader />
          </div>
        ) : (
          <div className="h-[30%] flex justify-center items-center border-b">
            <div className="flex flex-col justify-center items-center">
              <img
                src={user?.image || avt}
                alt="avt"
                className="w-[75px] h-[75px] rounded-full"
              />
              <div className="my-4 text-center">
                <h3 className="text-xl font-semibold">{username}</h3>
                <p className="text-sm font-light">{email}</p>
              </div>
              <div className="h-[50px] flex justify-around w-[300px] text-center">
                <div>
                  <h4 className="font-bold">{postsCount}</h4>
                  <p className="font-light text-sm">Posts</p>
                </div>
                <div>
                  <h4 className="font-bold">{followersCount}</h4>
                  <p className="font-light text-sm">Followers</p>
                </div>
                <div>
                  <h4 className="font-bold">{followingCount}</h4>
                  <p className="font-light text-sm">Following</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="h-[55%] flex flex-col justify-evenly pl-12 border-b">
          {navigations.map(({ id, name, icon, url }) => {
            return (
              <Link
                to={url}
                key={id}
                className="flex cursor-pointer items-center hover:text-green-500"
              >
                <span className="mr-2">{icon}</span>
                {name}
              </Link>
            );
          })}
        </div>
        <div className="h-[15%] pt-10">
          <div
            className="flex ml-12 cursor-pointer hover:text-green-500"
            onClick={handleLogout}
          >
            <span className="mr-2">
              <IconLogout />
            </span>
            Log Out
          </div>
        </div>
      </div>
      {/**giua */}
      <div className="w-[60%] overflow-auto h-full scrollbar-hide">
        <div className="h-[75px] border-l flex justify-evenly items-center pt-4 sticky top-0 shadow-lg z-50 bg-white dark:bg-black">
          <div className="flex flex-row justify-center items-center mb-4">
            <img
              src={imgLogo}
              alt="avt"
              className="w-[50px] h-[50px] rounded-full mx-2"
            />
            <div>
              <h1>SagoWood</h1>
              <h1>K7's mini social network </h1>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Input
              placeholder="Search on K7"
              className="rounded-full bg-white dark:bg-black"
            />
            <Button icon={<IconSearch />} className="mb-4 ml-4 rounded-full" />
          </div>
          <Button
            onClick={() => navigate("/createpost")}
            icon={<IconPlus />}
            label="Create new post"
            className="rounded-full bg-green-400 hover:bg-green-600 mb-4 flex"
          />
          {/*Darkmode switch */}
          <div>
            <DarkMode />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-[90%]">
            <PacmanLoader />
          </div>
        ) : (
          data?.map(
            (
              {
                _id = "",
                caption = "",
                description = "",
                image = "",
                user = {},
                reactions = [],
                comments = [],
                saved = [],
                // Đây phải là một mảng của các đối tượng comment
              },
              index
            ) => {
              const isAlreadySaved =
                saved.length > 0 && saved.includes(loggedInUserId);

              return (
                <div className=" w-[80%] mx-auto mt-8 p-8" key={_id}>
                  <div
                    className="border-b flex items-center pb-4 mb-4 cursor-pointer"
                    onClick={() =>
                      username === user.username
                        ? navigate("/profile")
                        : navigate(`/user/${user.username}`)
                    }
                  >
                    <img
                      src={user.image || avt}
                      alt="avt"
                      className="w-[50px] h-[50px] rounded-full"
                    />
                    <div className="ml-4">
                      <h3 className="text-lg leading-none font-semibold">
                        {user.username || "Unknown User"}
                      </h3>
                      <p className="text-sm font-light">
                        {user.email || "No Email"}
                      </p>
                    </div>
                  </div>
                  <div className="border-b pb-2 mb-2">
                    <div className="flex mt-4 mb-2 pb-2">
                      <h4 className="mr-4 font-bold">
                        {user.email || "No Email"}:
                      </h4>
                      <p className="font-medium">{caption}</p>
                    </div>
                    <img
                      src={image || postImg}
                      className="object-cover w-full h-full rounded-lg"
                      alt="post"
                      onClick={() =>
                        handleOpenModal({
                          _id,
                          caption,
                          description,
                          image,
                          user,
                          reactions,
                          comments,
                          saved,
                        })
                      }
                    />
                    <p className="my-4 text-sm font-normal">{description}</p>
                  </div>
                  <div className="flex flex-col pb-4 mb-4">
                    <div className="flex flex-row justify-around">
                      <div className="flex flex-row cursor-pointer">
                        {Object.entries(
                          reactions.reduce((acc, reaction) => {
                            // Nếu loại phản ứng đã tồn tại trong acc, tăng số lượng, nếu không thì khởi tạo số lượng là 1
                            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([type, count]) => (
                          <div
                            key={type}
                            className="flex flex-row items-center mr-2"
                          >
                            {getReactionIcon(type)}
                            {/* Hiển thị số lượng phản ứng bên cạnh biểu tượng */}
                            <span className="ml-1">{count}</span>
                          </div>
                        ))}
                        Reactions
                      </div>

                      <a
                        className=" cursor-pointer"
                        onClick={() =>
                          handleOpenModal({
                            _id,
                            caption,
                            description,
                            image,
                            user,
                            reactions,
                            comments,
                            saved,
                          })
                        }
                      >
                        View All {comments?.length} Comments
                      </a>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <textarea
                        rows={1}
                        className="w-[80%] border p-4 resize-none mt-4 bg-white dark:bg-black"
                        placeholder="Add Comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button
                        label="Add Comment"
                        onClick={() => handleCommentSubmit(_id, index)}
                        className=" w-[20%] mt-4 p-4 rounded py-4 "
                      />
                    </div>
                  </div>
                  <div className="flex justify-evenly text-black dark:text-white text-sm font-medium">
                    <div className="flex cursor-pointer items-center relative group">
                      <div className="flex items-center mr-2">
                        <span className="mr-1">
                          {/* Kiểm tra xem người dùng đã phản ứng hay chưa */}
                          {reactions && reactions.length > 0
                            ? // Nếu có phản ứng, hiển thị biểu tượng phản ứng của người dùng
                              getReactionIcon(
                                reactions.find(
                                  (reaction) => reaction.user === loggedInUserId
                                )?.type || "default" // Nếu không tìm thấy, hiển thị biểu tượng mặc định
                              )
                            : // Nếu chưa có phản ứng, hiển thị biểu tượng mặc định
                              getReactionIcon("default")}
                        </span>
                      </div>
                      {/* Dropdown Menu for Reactions */}
                      <div
                        className={`dark:text-white dark:bg-black absolute left-0 z-10 bg-white border rounded shadow-lg transition-opacity duration-200 ease-in-out transform ${
                          isDropdownVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-1"
                        } group-hover:opacity-100 group-hover:translate-y-0`}
                        style={{
                          top: "-200%",
                          marginBottom: "5px",
                          whiteSpace: "nowrap",
                        }} // Thêm whiteSpace để ngăn cách dòng
                      >
                        {/* Reaction options */}
                        <div className="flex space-x-2">
                          {" "}
                          {/* Sử dụng flex và space-x để bố trí ngang */}
                          <div
                            onClick={() => {
                              handleReactionClick(_id, "like");
                              setDropdownVisible(false);
                            }}
                            className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                          >
                            <IconThumbUp className="text-blue-500" />
                            <span className="ml-2">Like</span>
                          </div>
                          <div
                            onClick={() => {
                              handleReactionClick(_id, "love");
                              setDropdownVisible(false);
                            }}
                            className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                          >
                            <IconMoodHappy className="text-yellow-500" />
                            <span className="ml-2">Love</span>
                          </div>
                          <div
                            onClick={() => {
                              handleReactionClick(_id, "haha");
                              setDropdownVisible(false);
                            }}
                            className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                          >
                            <IconMoodHappy className="text-green-500" />
                            <span className="ml-2">Haha</span>
                          </div>
                          <div
                            onClick={() => {
                              handleReactionClick(_id, "angry");
                              setDropdownVisible(false);
                            }}
                            className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                          >
                            <IconMoodAngry className="text-red-600" />
                            <span className="ml-2">Angry</span>
                          </div>
                          <div
                            onClick={() => {
                              handleReactionClick(_id, "sad");
                              setDropdownVisible(false);
                            }}
                            className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                          >
                            <IconMoodSad className="text-purple-500" />
                            <span className="ml-2">Sad</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex cursor-pointer items-center"
                      onClick={() =>
                        handleOpenModal({
                          _id,
                          caption,
                          description,
                          image,
                          user,
                          reactions,
                          comments,
                          saved,
                        })
                      }
                    >
                      <span className="mr-2">
                        <IconMessageCircle />
                      </span>
                      {comments?.length} Comments
                    </div>
                    <div className="flex cursor-pointer items-center">
                      <span className="mr-2">
                        <IconShare />
                      </span>
                      3.9k Shares
                    </div>
                    <div
                      className="flex cursor-pointer items-center"
                      onClick={() =>
                        isAlreadySaved
                          ? handleReactionSave(_id, index, "unsave")
                          : handleReactionSave(_id, index, "save")
                      }
                    >
                      <span className="mr-2">
                        <IconBookmark
                          fill={isAlreadySaved ? "red" : "white"}
                          color={isAlreadySaved ? "red" : "black"}
                        />
                      </span>
                      {saved?.length} Saved
                    </div>
                  </div>
                </div>
              );
            }
          )
        )}
        {/**Hien thi pop-up khi click vao icon comments */}
        <PostCommentsModal
          isOpen={isModalOpen}
          post={selectedPost}
          onClose={handleCloseModal}
        />
      </div>
      {/**phai */}
      <div className="w-[20%] flex flex-col items-center space-y-8 p-4">
        {/* Trending Feeds */}
        <div className="w-full max-w-[400px]">
          <h3 className="text-lg font-semibold mb-4">Trending Feeds</h3>
          <div className="w-full h-[200px] mx-auto rounded-2xl overflow-hidden">
            {trendingPost && (
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => handleTrendingPostClick(trendingPost)}
              >
                <img
                  loading="lazy"
                  src={trendingPost.image}
                  alt="Trending post"
                  className="object-cover w-full h-full rounded-2xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Suggestions for you */}
        <div className="w-full max-w-[400px]">
          <div className="flex flex-row justify-between">
            <h3 className="text-lg font-semibold mb-4">Suggestions for you</h3>
            <a className="text-lg font-semibold mb-4 cursor-pointer">See All</a>
          </div>
          {suggestions.length === 0 ? (
            <p className="text-gray-500">No suggestions available.</p>
          ) : (
            <div className="flex flex-col space-y-4 ">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="flex items-center space-x-2 p-2 cursor-pointer justify-between"
                  onClick={() => navigate(`/user/${suggestion.username}`)}
                >
                  <div className="flex flex-row">
                    <img
                      src={suggestion.image || avt}
                      alt={suggestion.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{suggestion.username}</p>
                      <p className="text-gray-500">{suggestion.email}</p>
                    </div>
                  </div>

                  {/* <Button label="Follow" /> */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Followers */}
        <div className="w-full max-w-[400px]">
          <h3 className="text-lg font-semibold mb-4">Active Followers</h3>
          {activeFollowers.length === 0 ? (
            <p className="text-gray-500">No active followers.</p>
          ) : (
            <div className="flex flex-col space-y-4">
              {activeFollowers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center space-x-2 p-2 cursor-pointer"
                  onClick={() => navigate(`/user/${follower.username}`)}
                >
                  <img
                    src={follower.image || avt}
                    alt={follower.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{follower.username}</p>
                    <p className="text-gray-500">{follower.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <h2 className="w-full max-w-[400px] flex justify-center text-center fixed bottom-0 right-0">
          © 2024 SagoWood from K7
        </h2>
      </div>
    </div>
  );
};

export default Home;
