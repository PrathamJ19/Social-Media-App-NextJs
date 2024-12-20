import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
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
  isLikedByCurrentUser: boolean;
  isFollowing?: boolean;
}

interface ErrorResponse {
  message?: string;
}

const useHomeLogic = () => {
  const router = useRouter();
  const username = storedUsername || 'guest';
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    // If no token or username is found, redirect to login
    if (!storedToken || !storedUsername) {
      alert('Please log in first.');
      router.push('/login');
    } else {
      fetchPosts(storedToken);
    }
  }, [router]);

  const handleAxiosError = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<ErrorResponse>;
    if (axiosError.response?.status === 401) {
      setError('Login token expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      router.push('/login');
    } else {
      setError(axiosError.response?.data?.message || 'Error occurred.');
    }
  } else {
    setError('Unexpected error occurred.');
  }
};


  const fetchPosts = async (authToken: string) => {
    try {
      const res = await axios.get(`${apiBaseUrl}/posts`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const postsData: Post[] = res.data.map((post: Post) => ({
        ...post,
        isLikedByCurrentUser: post.likes.includes(username),
        isFollowing: post.author.isFollowing,
        images: post.images || [],
      }));
      setPosts(postsData);
    } catch (err) {
      handleAxiosError(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const handleProfileClick = () => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      router.push(`/profile/${storedUsername}`);
    } else {
      alert('Please log in first.');
      router.push('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content.length > 200) {
      setError('Content must be 200 characters or less');
      return;
    }

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Login token expired. Please log in again.');
      router.push('/login');
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
          Authorization: `Bearer ${storedToken}`,
        },
      });
      setContent('');
      setImages([]);
      setImagePreviews([]);
      fetchPosts(storedToken);
    } catch (err) {
      handleAxiosError(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImages = Array.from(e.target.files as FileList);
    setImages(selectedImages);
    const previews = selectedImages.map((image) => URL.createObjectURL(image));
    setImagePreviews(previews);
  };

  const handleLike = async (postId: string, liked: boolean) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Login token expired. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      const url = liked
        ? `${apiBaseUrl}/posts/unlike/${postId}`
        : `${apiBaseUrl}/posts/like/${postId}`;

      const response = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
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
      handleAxiosError(err);
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const fetchUserProfile = async (username: string) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Login token expired. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const fetchFollowingUsers = async (username: string) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Login token expired. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/following/${username}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleFollow = async (authorUsername: string) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Login token expired. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      await axios.post(`${apiBaseUrl}/auth/follow/${authorUsername}`, null, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      fetchPosts(storedToken);
    } catch (err) {
      handleAxiosError(err);
    }
  };

  const handleUnfollow = async (authorUsername: string) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Login token expired. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      await axios.post(`${apiBaseUrl}/auth/unfollow/${authorUsername}`, null, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      fetchPosts(storedToken);
    } catch (err) {
      handleAxiosError(err);
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
