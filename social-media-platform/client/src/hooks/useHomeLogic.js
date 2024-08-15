// client/src/hooks/useHomeLogic.js

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { token, username, apiBaseUrl } from '../constants';

const useHomeLogic = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (!token) {
      alert('Please log in first.');
      navigate('/login');
    } else {
      fetchPosts();
    }
  }, [token, navigate]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const postsData = res.data.map(post => ({
        ...post,
        isLikedByCurrentUser: post.likes.includes(username),
        isFollowing: post.author.isFollowing, // Ensure this comes correctly from the backend
      }));
      setPosts(postsData);
      console.log('Posts fetched:', postsData); // Debugging line
    } catch (err) {
      console.error(err);
      setError('Error fetching posts');
    }
  };
  
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate(`/profile/${username}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.length > 200) {
      setError('Content must be 200 characters or less');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await axios.post(`${apiBaseUrl}/posts/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setContent('');
      setImages([]);
      setImagePreviews([]);
      fetchPosts();
      console.log('Post created successfully:', response.data);
    } catch (err) {
      console.error('Error creating post:', err.response || err.message || err);
      setError('Error creating post');
    }
  };

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    setImages(selectedImages);
    const previews = selectedImages.map(image => URL.createObjectURL(image));
    setImagePreviews(previews);
  };

  const handleLike = async (postId, liked) => {
    try {
        const url = liked
            ? `${apiBaseUrl}/posts/unlike/${postId}`
            : `${apiBaseUrl}/posts/like/${postId}`;
        console.log("Request URL:", url); // Add this line to log the URL

        const response = await axios.post(url, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setPosts(posts.map(post => {
            if (post._id === postId) {
                return {
                    ...post,
                    likes: response.data.likes,
                    isLikedByCurrentUser: !liked
                };
            }
            return post;
        }));

        const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};
        likedPosts[postId] = !liked;
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (err) {
        console.error('Error liking/unliking post:', err);
        setError('Error updating like');
    }
};


  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

const fetchUserProfile = async (username) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/auth/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const fetchFollowingUsers = async (username) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/auth/following/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Assumes the API returns an array of users
    } catch (error) {
      console.error('Error fetching following users:', error);
      throw error;
    }
  };

  const handleFollow = async (authorUsername) => {
    try {
      await axios.post(`${apiBaseUrl}/auth/follow/${authorUsername}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the posts after following a user
      fetchPosts();
    } catch (err) {
      console.error('Error following user:', err);
      setError('Error following user');
    }
  };
  
  const handleUnfollow = async (authorUsername) => {
    try {
      await axios.post(`${apiBaseUrl}/auth/unfollow/${authorUsername}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the posts after unfollowing a user
      fetchPosts();
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError('Error unfollowing user');
    }
  };
  
  return {
    content,
    setContent,
    images,
    setImages,
    imagePreviews,
    setImagePreviews,
    posts,
    setPosts,
    error,
    setError,
    handleLogout,
    handleProfileClick,
    handleSubmit,
    handleImageChange,
    handleLike,
    handlePostClick,
    fetchUserProfile,
    fetchFollowingUsers,
    handleFollow,
    handleUnfollow,
  };
};

export default useHomeLogic;
