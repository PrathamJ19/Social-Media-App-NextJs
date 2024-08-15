import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Home.css';
import Header from './Header';
import Sidebar from './Sidebar';
import useHomeLogic from '../hooks/useHomeLogic';
import RightSidebar from './RightSidebar';
import Notification from './Notification'; // Import the Notification component
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const Home = () => {
  const navigate = useNavigate(); // Initialize navigate
  const {
    content,
    setContent,
    images,
    imagePreviews,
    posts,
    error,
    handleLogout,
    handleProfileClick,
    handleSubmit,
    handleImageChange,
    handleLike,
    handlePostClick,
    fetchUserProfile,
    handleFollow,
    handleUnfollow
  } = useHomeLogic();
  
  const [notification, setNotification] = useState('');

  const handleLikeWithNotification = async (postId, liked) => {
    await handleLike(postId, liked);
    setNotification(liked ? 'Unliked' : 'Liked');
  };

  const handleProfileNavigation = (username) => {
    navigate(`/profile/${username}`);
  };

  const handlePostNavigation = (postId) => {
    navigate(`/post/${postId}`); // Navigate to post detail page
  };

  const handleImageInteraction = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking on the image
  };

  return (
    <div className="home-container">
      {localStorage.getItem('token') ? (
        <>
          <Header 
            username={localStorage.getItem('username')} 
            handleProfileClick={handleProfileClick} 
            handleLogout={handleLogout} 
          />
          <div className="main-content">
            <Sidebar username={localStorage.getItem('username')} />
            <div className="content">
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
                <br />
                <button type="submit" className="post-button">Post</button>
              </form>
              {error && <p className="error-message">{error}</p>}
              <div className="posts-container">
                {posts.map((post) => (
                  <div 
                    key={post._id} 
                    className="post-card" 
                    style={{ minWidth: '100%' }}
                    onClick={(e) => {
                      // Only navigate if the click was not on an image
                      if (!e.target.classList.contains('post-image')) {
                        handlePostNavigation(post._id);
                      }
                    }}
                  >
                    <div className="post-header">
                      <img 
                        src={post.author.profilePicture} 
                        alt="Profile" 
                        className="profile-picture" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent post click handler
                          handleProfileNavigation(post.author.username);
                        }}
                      />
                      <span 
                        className="post-author" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent post click handler
                          handleProfileNavigation(post.author.username);
                        }}
                      >
                        {post.author.username}
                      </span>
                    </div>
                    <p className="post-content">{post.content}</p>
                    {post.images.length > 1 ? (
                      <Carousel className="post-carousel" onClick={handleImageInteraction}>
                        {post.images.map((image, index) => (
                          <Carousel.Item key={index}>
                            <img 
                              src={image} 
                              alt={`Post image ${index}`} 
                              className="post-image" 
                              onClick={handleImageInteraction} // Handle image interaction
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    ) : (
                      post.images.length === 1 && 
                      <img 
                        src={post.images[0]} 
                        alt="Post" 
                        className="post-image" 
                        onClick={handleImageInteraction} // Handle image interaction
                      />
                    )}
                    <div className="post-actions">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleLikeWithNotification(post._id, post.isLikedByCurrentUser); 
                        }} 
                        className="like-button1"
                      >
                        <FontAwesomeIcon 
                          icon={post.isLikedByCurrentUser ? faHeartSolid : faHeartRegular} 
                        />
                      </button>
                      <span className="like-count">{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <RightSidebar />
          </div>
          <Notification message={notification} duration={3000} /> {/* Use the Notification component */}
        </>
      ) : (
        <p>Redirecting to login...</p>
      )}
    </div>
  );
};

export default Home;
