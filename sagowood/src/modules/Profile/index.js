import React, { useEffect, useState } from "react";
import avt from "../../assets/avt.jpg";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconBookmark,
  IconLogout,
  IconPhoto,
} from "@tabler/icons-react";
import { navigations } from "../Home/navigation";
import { Link, useNavigate, useLocation } from "react-router-dom";
import postImg from "../../assets/post.jpg";
import PostCommentsModal from "../../pop-up/PostCommentsModal";
import Button from "../../components/Button";
import EditProfileModal from "../../pop-up/EditProfileModal";
const Profile = () => {
  const navigate = useNavigate();
  //dieu huong chuyen trang co gan dia chi (tab )
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  //tao ham de hien thi thong tin bai viet va luot comments
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  // New state for tracking the active tab
  const [activeTab, setActiveTab] = useState("posts");
  //
  const [savedPosts, setSavedPosts] = useState([]); // State for saved posts
  //tao ham hien thi thong tin bai viet va luot comments
  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };
  //tao ham dong hien thi thong tin bai viet va luot comments
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };
  const handleOpenEditProfileModal = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("user:token");
    localStorage.removeItem("user:detail");
    navigate("/account/signin");
  };
  const handleSaveProfile = (updatedUser) => setUser(updatedUser);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postsResponse = await fetch("http://localhost:8000/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch user posts");
        }
        const postsData = await postsResponse.json();
        setPosts(postsData?.posts);
        setUser(postsData?.user);
        //show savepost
        const savedPostsResponse = await fetch(
          "http://localhost:8000/api/saved-posts", // Adjust API endpoint
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );

        const savedPostsData = await savedPostsResponse.json();
        setSavedPosts(savedPostsData?.savedPosts); // Store saved posts data
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
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
      setLoading(false);
    };
    fetchData();
    //Trích xuất các tham số truy vấn tab từ URL
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab");
    if (tab === "saved") {
      setActiveTab("saved");
      window.history.pushState(null, "", "/profile?tab=saved");
    } else {
      setActiveTab("posts");
      window.history.pushState(null, "", "/profile?tab=posts");
    }
  }, [location.search]);

  return (
    <div className="h-screen bg-[#d2cfdf] flex overflow-hidden">
      {/* Left sidebar */}
      <div className="pt-4 w-[20%] bg-white flex flex-col">
        <div className="h-[30%] flex justify-center items-center border-b">
          <div className="flex flex-col justify-center items-center">
            <img
              src={user?.image || avt}
              alt="avt"
              className="w-[75px] h-[75px] rounded-full"
            />
            <div className="my-4 text-center">
              <h3 className="text-xl font-semibold"> {user.username}</h3>
              <p className="text-sm font-light">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="h-[55%] flex flex-col justify-evenly pl-12 border-b">
          {navigations.map(({ id, name, icon, url }) => (
            <Link
              to={url}
              key={id}
              className="flex cursor-pointer items-center hover:text-green-500"
            >
              <span className="mr-2">{icon}</span>
              {name}
            </Link>
          ))}
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
      {/* Main content */}
      <div className="pt-4 w-[80%] bg-gray overflow-scroll h-full scrollbar-hide">
        <div className="flex flex-col justify-center items-center">
          <div className="my-4 flex flex-row items-center">
            <img
              src={user?.image || avt}
              alt="avt"
              className="w-[120px] h-[120px] rounded-full"
            />
            <div className="ml-4">
              <h3 className="text-2xl font-semibold">{user?.username}</h3>
              <p className="text-lg font-light">{user?.email}</p>
            </div>
            <Button
              label="Edit Profile"
              className="mx-4 mb-20"
              onClick={handleOpenEditProfileModal}
            />
          </div>
          <div className="text-2xl flex justify-around w-[600px] text-center my-4">
            <div>
              <h4 className="font-bold">{postsCount}</h4>
              <p className="font-light text-xl">Posts</p>
            </div>
            <div>
              <h4 className="font-bold">{followersCount}</h4>
              <p className="font-light text-xl">Followers</p>
            </div>
            <div>
              <h4 className="font-bold">{followingCount}</h4>
              <p className="font-light text-xl">Following</p>
            </div>
          </div>
          {/* Tab selection */}
          <div className="mt-8 flex justify-center space-x-20 mb-6 w-[80%] border-t-gray-950 border-t-2">
            <div
              className={`flex cursor-pointer text-xl items-center border-t-2 ${
                activeTab === "posts"
                  ? "font-bold border-t-4 border-t-black"
                  : "font-light"
              }`}
              onClick={() => {
                setActiveTab("posts");
                window.history.pushState(null, "", "/profile?tab=posts");
              }}
            >
              <IconPhoto className="mx-2" />
              POSTS
            </div>
            <div
              className={`flex cursor-pointer text-xl items-center border-t-2 ${
                activeTab === "saved"
                  ? "font-bold border-t-4 border-t-black"
                  : "font-light"
              }`}
              onClick={() => {
                setActiveTab("saved");
                window.history.pushState(null, "", "/profile?tab=saved");
              }}
            >
              <IconBookmark className="mx-2" />
              SAVED
            </div>
            <div
              className={`flex cursor-pointer text-xl items-center border-t-2 ${
                activeTab === "shares"
                  ? "font-bold border-t-4 border-t-black"
                  : "font-light"
              }`}
              onClick={() => {
                setActiveTab("shares");
                window.history.pushState(null, "", "/profile?tab=shares");
              }}
            >
              <IconShare className="mx-2" />
              SHARES
            </div>
          </div>

          {/* Conditionally render posts based on active tab */}
          <div className="flex justify-center flex-wrap">
            {activeTab === "posts" &&
              posts?.length > 0 &&
              posts.map(
                ({
                  _id,
                  caption = "",
                  description = "",
                  image = "",
                  likes = [],
                  comments = [],
                  saved = [],
                }) => (
                  <div
                    key={_id}
                    className="relative w-[400px] mt-6 mx-2 flex flex-col border p-4 rounded-lg bg-white group"
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
                    <div className="relative w-full h-[300px]">
                      <img
                        src={image || postImg}
                        alt={caption}
                        className="absolute inset-0 object-cover w-full h-full rounded-xl"
                      />
                    </div>
                    {/* <div>
                      <p className="font-semibold">{caption}</p>
                    </div>
                    <p className="my-4 text-sm font-normal">{description}</p> */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-75 rounded-lg p-4">
                      <div className="py-4 flex justify-evenly gap-8 text-black text-sm font-medium">
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconHeart />
                          </span>
                          {likes?.length}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconMessageCircle />
                          </span>
                          {comments?.length}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconShare />
                          </span>
                          3.9k
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconBookmark />
                          </span>
                          {saved?.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            {activeTab === "saved" &&
              savedPosts?.length > 0 &&
              savedPosts.map(
                ({
                  _id,
                  caption = "",
                  description = "",
                  image = "",
                  user = {},
                  likes = [],
                  comments = [],
                  saved = [],
                }) => (
                  <div
                    key={_id}
                    className="relative w-[400px] mt-6 mx-2 flex flex-col border p-4 rounded-lg bg-white group"
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
                    <div className="relative w-full h-[300px] mb-4">
                      <img
                        src={image || postImg}
                        alt={caption}
                        className="absolute inset-0 object-cover w-full h-full rounded-xl"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{caption}</p>
                    </div>
                    <p className="my-4 text-sm font-normal">{description}</p>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-75 rounded-lg p-4">
                      <div className="py-4 flex justify-evenly gap-8 text-black text-sm font-medium">
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconHeart />
                          </span>
                          {likes?.length}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconMessageCircle />
                          </span>
                          {comments?.length}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconShare />
                          </span>
                          3.9k
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            <IconBookmark />
                          </span>
                          {saved?.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

            {/* Add conditional rendering for 'Saved' and 'Shares' content here */}
          </div>

          {/* Modal for viewing post comments */}
          <PostCommentsModal
            isOpen={isModalOpen}
            post={selectedPost}
            onClose={handleCloseModal}
          />
          {/* Modal for editing profile */}
          <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={handleCloseEditProfileModal}
            user={user}
            onSave={handleSaveProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
