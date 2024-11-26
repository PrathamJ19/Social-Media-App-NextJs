import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import Next.js router
import axios from 'axios';
import { token, username as storedUsername, apiBaseUrl } from '../constants';

interface Post {
  _id: string;
  content: string;
  images: string[];
  likes: string[];
  author: {
    username: string;
    profilePicture: string;
    isFollowing: boolean;
  };
  isLikedByCurrentUser: boolean; // Remove the '?' to make it required
  isFollowing?: boolean;
}

const useHomeLogic = () => {
  const router = useRouter(); // Use Next.js router
  const username = storedUsername || 'guest'; // Provide a fallback value like 'guest'
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username'); // Get username from localStorage

    if (!storedToken || !storedUsername) {
      alert('Please log in first.');
      router.push('/login'); // Redirect to login page
    } else {
      fetchPosts();
    }
  }, [router]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const postsData: Post[] = res.data.map((post: Post) => ({
        ...post,
        isLikedByCurrentUser: post.likes.includes(username),
        isFollowing: post.author.isFollowing,
        images: post.images || [], // Ensure images is an array, default to an empty array if missing
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
    router.push('/login'); // Redirect to login page
  };

  const handleProfileClick = () => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      router.push(`/profile/${storedUsername}`); // Navigate to the user's profile
    } else {
      alert('Please log in first.');
      router.push('/login'); // Redirect to login page
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content.length > 200) {
      setError('Content must be 200 characters or less');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    images.forEach((image) => {
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
      if (axios.isAxiosError(err)) {
        console.error('Error creating post:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Error creating post');
      } else {
        console.error('Unexpected error:', err);
        setError('Unexpected error');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImages = Array.from(e.target.files as FileList);
    setImages(selectedImages);
    const previews = selectedImages.map((image) => URL.createObjectURL(image));
    setImagePreviews(previews);
  };

  const handleLike = async (postId: string, liked: boolean) => {
    try {
      const url = liked
        ? `${apiBaseUrl}/posts/unlike/${postId}`
        : `${apiBaseUrl}/posts/like/${postId}`;
      console.log('Request URL:', url); // Add this line to log the URL

      const response = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              likes: response.data.likes,
              isLikedByCurrentUser: !liked,
            };
          }
          return post;
        })
      );

      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}') || {};
      likedPosts[postId] = !liked;
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (err) {
      console.error('Error liking/unliking post:', err);
      setError('Error updating like');
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`); // Navigate to the post page
  };

  const fetchUserProfile = async (username: string) => {
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

  const fetchFollowingUsers = async (username: string) => {
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

  const handleFollow = async (authorUsername: string) => {
    try {
      await axios.post(`${apiBaseUrl}/auth/follow/${authorUsername}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts(); // Refresh posts
    } catch (err) {
      console.error('Error following user:', err);
      setError('Error following user');
    }
  };

  const handleUnfollow = async (authorUsername: string) => {
    try {
      await axios.post(`${apiBaseUrl}/auth/unfollow/${authorUsername}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts(); // Refresh posts
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
