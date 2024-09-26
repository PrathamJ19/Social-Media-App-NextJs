import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Home.css';
import Header from './Header';
import Sidebar from './Sidebar';
import useHomeLogic from '../hooks/useHomeLogic';
import RightSidebar from './RightSidebar';
import Notification from './Notification';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

interface Author {
  username: string;
  profilePicture: string;
}

interface Post {
  _id: string;
  author: Author;
  content: string;
  images: string[];
  likes: string[];
  isLikedByCurrentUser: boolean; // Ensure that it's always a boolean
}

const Home: React.FC = () => {
  const navigate = useNavigate();
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
    handleUnfollow,
  } = useHomeLogic();

  const [notification, setNotification] = useState<string>('');

  const handleLikeWithNotification = async (postId: string, liked: boolean) => {
    await handleLike(postId, liked);
    setNotification(liked ? 'Unliked' : 'Liked');
  };

  const handleProfileNavigation = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handlePostNavigation = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleImageInteraction = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
  };

  return (
    <div className="home-container">
      {localStorage.getItem('token') ? (
        <>
          <Header handleLogout={handleLogout} />
          <div className="main-content">
            <Sidebar />
            <div className="content">
              <form className="post-form" onSubmit={handleSubmit}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={200}
                  required
                  className="content-input"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="image-input"
                />
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
                {posts.map((post: Post, index: number) => (
                  <div
                    key={post._id}
                    className="post-card"
                    style={{ minWidth: '100%' }}
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).classList.contains('post-image')) {
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
                          e.stopPropagation();
                          handleProfileNavigation(post.author.username);
                        }}
                      />
                      <span
                        className="post-author"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileNavigation(post.author.username);
                        }}
                      >
                        {post.author.username}
                      </span>
                    </div>
                    <p className="post-content">{post.content}</p>
                    {post.images?.length > 1 ? (
                      <Carousel className="post-carousel" onClick={handleImageInteraction}>
                        {post.images.map((image, index) => (
                          <Carousel.Item key={index}>
                            <img
                              src={image}
                              alt={`Post image ${index}`}
                              className="post-image"
                              onClick={handleImageInteraction}
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    ) : (
                      post.images?.length === 1 && (
                        <img
                          src={post.images[0]}
                          alt="Post"
                          className="post-image"
                          onClick={handleImageInteraction}
                        />
                      )
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
                      <span className="like-count">
                        {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <RightSidebar />
          </div>
          <Notification message={notification} duration={3000} />
        </>
      ) : (
        <p>Redirecting to login...</p>
      )}
    </div>
  );
};

export default Home;
