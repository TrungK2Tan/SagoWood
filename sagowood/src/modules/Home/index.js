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
        const postsWithLikes = data.posts.filter(
          (post) => post.likes.length > 0
        );
        const postsWithComments = data.posts.filter(
          (post) => post.comments.length > 0
        );
        const sortedByLikes = postsWithLikes.sort(
          (a, b) => b.likes.length - a.likes.length
        );
        const sortedByComments = postsWithComments.sort(
          (a, b) => b.comments.length - a.comments.length
        );
        const topPosts = [
          ...(sortedByLikes.length > 0 ? [sortedByLikes[0]] : []),
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

  const {
    _id: loggedInUserId = "",
    username = "",
    email = "",
  } = user || {};

  const handleReaction = async (_id, index, reaction = "like") => {
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
            <Input placeholder="Search on K7" className="rounded-full bg-white dark:bg-black" />
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
                likes = [],
                comments = [],
                saved = [],
                // Đây phải là một mảng của các đối tượng comment
              },
              index
            ) => {
              const isAlreadyLiked =
                likes.length > 0 && likes.includes(loggedInUserId);
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
                          likes,
                          comments,
                          saved,
                        })
                      }
                    />
                    <p className="my-4 text-sm font-normal">{description}</p>
                  </div>
                  <div className="flex flex-col pb-4 mb-4">
                    <a
                      className="cursor-pointer"
                      onClick={() =>
                        handleOpenModal({
                          _id,
                          caption,
                          description,
                          image,
                          user,
                          likes,
                          comments,
                          saved,
                        })
                      }
                    >
                      View All {comments?.length} Comments
                    </a>

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
                    <div
                      className="flex cursor-pointer items-center"
                      onClick={() =>
                        isAlreadyLiked
                          ? handleReaction(_id, index, "dislike")
                          : handleReaction(_id, index, "like")
                      }
                    >
                      <span className="mr-2">
                        <IconHeart
                          fill={isAlreadyLiked ? "red" : "white"}
                          color={isAlreadyLiked ? "red" : "black"}
                        />
                      </span>
                      {likes?.length} Likes
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
                          likes,
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
