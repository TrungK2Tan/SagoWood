import React, { useEffect, useState } from "react";
import avt from "../../assets/avt.jpg";
import {
  IconPlus,
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconBookmark,
  IconSearch,
  IconLogout,
  IconPhoto,
} from "@tabler/icons-react";
import { navigations } from "../Home/navigation";
import { Link, useNavigate, useParams } from "react-router-dom";
import postImg from "../../assets/post.jpg";
import Button from "../../components/Button";
import PacmanLoader from "react-spinners/PacmanLoader";
import PostCommentsModal from "../../pop-up/PostCommentsModal";
const People = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({});
  //tao ham de hien thi thong tin bai viet va luot comments
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // New state for tracking the active tab
  const [activeTab, setActiveTab] = useState("posts");
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user:token");
    localStorage.removeItem("user:detail");
    navigate("/account/signin");
  };
  //thao tac follow(unfollow)
  const handleFollowing = async (purpose = "follow") => {
    setLoading(true);
    const response = await fetch(`http://localhost:8000/api/${purpose}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({ id: user.id }),
    });
    const data = await response.json();
    setIsFollowed(data?.isFollowed);
    setLoading(false);
  };

  useEffect(() => {
    const getLoggedInUser = async () => {
      setLoading(true);
      const profileResponse = await fetch("http://localhost:8000/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
      });
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch logged-in user profile");
      }
      const profileData = await profileResponse.json();
      setLoggedInUser(profileData?.user);
      setLoading(false);
    };

    const getPosts = async () => {
      setLoading(true);
      const postsResponse = await fetch(
        `http://localhost:8000/api/people?username=${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        }
      );
      if (!postsResponse.ok) {
        throw new Error("Failed to fetch user posts");
      }
      const postsData = await postsResponse.json();
      setPosts(postsData?.posts);
      setUser(postsData?.userDetail);
      setIsFollowed(postsData?.isFollowed);
      setLoading(false);
    };

    getLoggedInUser();
    getPosts();
    handleCloseModal();
  }, [username]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader />
      </div>
    );

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="pt-4 w-[20%] flex flex-col">
        <div className="h-[30%] flex justify-center items-center border-b">
          <div className="flex flex-col justify-center items-center">
            <img
              src={loggedInUser?.image || avt}
              alt="avt"
              className="w-[75px] h-[75px] rounded-full"
            />
            <div className="my-4 text-center">
              <h3 className="text-xl font-semibold">
                {loggedInUser?.username}
              </h3>
              <p className="text-sm font-light">{loggedInUser?.email}</p>
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
          </div>
          <div className="flex justify-around w-[600px] text-center my-4">
            <div>
              <h4 className="font-bold text-2xl">{posts?.length || 0}</h4>
              <p className="font-light text-lg">Posts</p>
            </div>
            <div>
              <h4 className="font-bold text-2xl">
                {user?.followersCount || 0}
              </h4>
              <p className="font-light text-lg">Followers</p>
            </div>
            <div>
              <h4 className="font-bold text-2xl">
                {user?.followingCount || 0}
              </h4>
              <p className="font-light text-lg">Following</p>
            </div>
          </div>
          <div>
            {!isFollowed ? (
              <Button
                label="Follow"
                disabled={loading}
                onClick={() => handleFollowing("follow")}
              />
            ) : (
              <Button
                label="Unfollow"
                disabled={loading}
                onClick={() => handleFollowing("unfollow")}
              />
            )}
          </div>
          {/* Tab selection */}
          <div className="mt-8 flex justify-center space-x-20 mb-6 w-[80%] border-t-gray-950 border-t-2">
            <div
              className={`flex cursor-pointer text-xl items-center border-t-2 ${
                activeTab === "posts"
                  ? "font-bold border-t-4 border-t-black"
                  : "font-light"
              }`}
              onClick={() => setActiveTab("posts")}
            >
              <IconPhoto className="mx-2" />
              POSTS
            </div>

            <div
              className={`flex cursor-pointer text-xl items-center border-t-2 ${
                activeTab === "shares"
                  ? "font-bold border-t-4 border-t-black"
                  : "font-light"
              }`}
              onClick={() => setActiveTab("shares")}
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
                  reactions = [],
                  comments = [],
                  saved=[]
                }) => (
                  <div
                    key={_id}
                    className="relative w-[400px] mt-6 mx-2 flex flex-col border p-4 rounded-lg bg-white dark:bg-black group"
                    onClick={() =>
                      handleOpenModal({
                        _id,
                        caption,
                        description,
                        image,
                        user,
                        reactions,
                        comments,
                        saved
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
                          {reactions?.length}
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
            {/**Hien thi pop-up khi click vao icon comments */}
            <PostCommentsModal
              isOpen={isModalOpen}
              post={selectedPost}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default People;
