import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState({
    profilePicture: '',
    followers: 0,
    following: 0,
  });
  const [error, setError] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('You need to log in to view profiles.');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/auth/profile/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.message === 'User not found') {
          setProfileNotFound(true);
        } else {
          setProfileData(res.data);

          // Check if current user is viewing their own profile
          const currentUser = localStorage.getItem('username');
          setIsCurrentUser(currentUser === username);

          // Check if current user is following this profile
          const followingRes = await axios.get(`${apiBaseUrl}/auth/is-following/${username}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setIsFollowing(followingRes.data.isFollowing);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching profile data');
      }
    };

    fetchProfileData();
  }, [username, token]);

  const handleFollow = async () => {
    try {
      await axios.post(`${apiBaseUrl}/auth/follow/${username}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsFollowing(true); // Update the state immediately
      setProfileData(prevData => ({ ...prevData, followers: prevData.followers + 1 }));
    } catch (err) {
      console.error('Error following user:', err);
      setError('Error following user');
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`${apiBaseUrl}/auth/unfollow/${username}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsFollowing(false); // Update the state immediately
      setProfileData(prevData => ({ ...prevData, followers: prevData.followers - 1 }));
    } catch (err) {
      console.error(err);
      setError('Error unfollowing user');
    }
  };

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : profileNotFound ? (
        <p>The person you searched for does not exist.</p>
      ) : (
        <>
          <img src={profileData.profilePicture} alt="Profile" style={{ width: '100px', height: '100px' }} />
          <h2>{username}</h2>
          <div>
            <span>Followers: {profileData.followers}</span>
            <span>Following: {profileData.following}</span>
          </div>
          {!isCurrentUser && (
            <>
              {isFollowing ? (
                <button onClick={handleUnfollow}>Unfollow</button>
              ) : (
                <button onClick={handleFollow}>Follow</button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
