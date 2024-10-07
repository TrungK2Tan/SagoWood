import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import avt from '../../src/assets/avt.jpg'; // Import default avatar image
import { navigations } from '../../src/modules/Home/navigation'; // Import navigation items
import { IconLogout } from '@tabler/icons-react';

const SuggestedUsersPage = () => {
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Fetch user details and data stats
  useEffect(() => {
    // Fetch user details from local storage
    const storedUser = JSON.parse(localStorage.getItem('user:detail'));
    setUser(storedUser);

    // Function to fetch suggested users
    const fetchSuggestedUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/suggestions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('user:token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch suggested users');
        const data = await response.json();
        setSuggestedUsers(data.suggestions);
      } catch (error) {
        console.error('Error fetching suggested users:', error.message);
      }
    };

    // Function to fetch post count
    const fetchPostsCount = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/posts-stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('user:token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch post count');
        const data = await response.json();
        setPostsCount(data.postsCount);
      } catch (error) {
        console.error('Error fetching post count:', error.message);
      }
    };

    // Function to fetch followers count
    const fetchFollowersCount = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/followers-stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('user:token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch followers count');
        const data = await response.json();
        setFollowersCount(data.followersCount);
      } catch (error) {
        console.error('Error fetching followers count:', error.message);
      }
    };

    // Function to fetch following count
    const fetchFollowingCount = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/following-stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('user:token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch following count');
        const data = await response.json();
        setFollowingCount(data.followingCount);
      } catch (error) {
        console.error('Error fetching following count:', error.message);
      }
    };

    // Fetch all necessary data
    fetchSuggestedUsers();
    fetchPostsCount();
    fetchFollowersCount();
    fetchFollowingCount();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user:token');
    localStorage.removeItem('user:detail');
    navigate('/account/signin');
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/** Left Sidebar */}
      <div className="w-[20%] flex flex-col border-r">
        <div className="h-[30%] flex justify-center items-center border-b">
          <div className="flex flex-col justify-center items-center">
            <img
              src={user?.image || avt}
              alt="avt"
              className="w-[75px] h-[75px] rounded-full"
            />
            <div className="my-4 text-center">
              <h3 className="text-xl font-semibold">{user?.username}</h3>
              <p className="text-sm font-light">{user?.email}</p>
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

        {/** Navigation Links */}
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

        {/** Logout Section */}
        <div className="h-[15%] pt-10">
          <div
            className="flex ml-12 cursor-pointer hover:text-green-500"
            onClick={handleLogout}
          >
            <span className="mr-2">  <IconLogout /></span>
            Log Out
          </div>
        </div>
      </div>

      {/** Main Content */}
      <div className="w-[80%] items-center flex flex-col p-8">
        <h2 className="text-xl font-semibold mb-4">Suggested Users</h2>
        {suggestedUsers.length === 0 ? (
          <p className="text-gray-500">No suggested users available.</p>
        ) : (
          <div >
            {suggestedUsers.map((suggestedUser) => (
              <div
                key={suggestedUser._id}
                className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer"
                onClick={() => navigate(`/user/${suggestedUser.username}`)}
              >
                <img
                  src={suggestedUser.image || avt}
                  alt={suggestedUser.username}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="font-semibold">{suggestedUser.username}</p>
                  <p className="text-gray-500">{suggestedUser.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedUsersPage;
