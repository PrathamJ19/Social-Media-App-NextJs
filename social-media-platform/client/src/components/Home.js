import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Home.css'; // Import the CSS file for styling

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]); // State for image previews
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

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

      const currentUsername = localStorage.getItem('username'); // Assuming username is stored in localStorage

      const postsData = res.data.map(post => ({
        ...post,
        isLikedByCurrentUser: post.likes.includes(currentUsername)
      }));
      setPosts(postsData);
    } catch (err) {
      console.error(err);
      setError('Error fetching posts');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/signup');
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
      setImagePreviews([]); // Clear image previews after post creation
      fetchPosts();
      console.log('Post created successfully:', response.data);
    } catch (err) {
      console.error('Error creating post:', err.response || err.message || err);
      setError('Error creating post');
    }
  };

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);

    // Update images state
    setImages(selectedImages);

    // Generate image previews
    const previews = selectedImages.map(image => URL.createObjectURL(image));
    setImagePreviews(previews);
  };

  const handleLike = async (postId, liked) => {
    try {
      const url = liked
        ? `${apiBaseUrl}/posts/unlike/${postId}`
        : `${apiBaseUrl}/posts/like/${postId}`;

      const response = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response from server:', response.data); // Check server response

      // Update the post state to reflect the change in like status
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: response.data.likes,
            isLikedByCurrentUser: !liked  // Toggle like status
          };
        }
        return post;
      }));

      // Update localStorage to reflect liked/unliked state
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};
      likedPosts[postId] = !liked;
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (err) {
      console.error('Error liking/unliking post:', err);
      setError('Error updating like');
    }
  };

  return (
    <div className="home-container">
      {token ? (
        <>
          <header className="header">
            <h2 onClick={handleProfileClick} className="username">Welcome, {username}</h2>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </header>
          <form className="post-form" onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              maxLength="200"
              required
              className="content-input"
            />
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="image-input" />
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <img key={index} src={preview} alt={`Image preview ${index}`} className="image-preview" />
              ))}
            </div>
            <br/>
            <button type="submit" className="post-button">Post</button>
          </form>
          {error && <p className="error-message">{error}</p>}
          <div className="posts-container">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <img src={post.author.profilePicture} alt="Profile" className="profile-picture" />
                  <span className="post-author">{post.author.username}</span>
                </div>
                <p className="post-content">{post.content}</p>
                {post.images.length > 1 ? (
                  <Carousel className="post-carousel">
                    {post.images.map((image, index) => (
                      <Carousel.Item key={index}>
                        <img src={image} alt={`Post image ${index}`} className="post-image" />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  post.images.length === 1 && <img src={post.images[0]} alt="Post" className="post-image" />
                )}
                <button onClick={() => handleLike(post._id, post.isLikedByCurrentUser)} className="like-button">
                  {post.isLikedByCurrentUser ? 'Unlike' : 'Like'}
                </button>
                <span className="like-count">{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Redirecting to login...</p>
      )}
    </div>
  );
};

export default Home;
