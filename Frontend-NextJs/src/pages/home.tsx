import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/home.module.css';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import useHomeLogic from '../hooks/useHomeLogic';
import RightSidebar from '../components/rightSidebar';
import Notification from '../components/notification';
import { useRouter } from 'next/router';
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
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Add state to detect mobile screen

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
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    // Update `isMobile` based on screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Check initial window size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLikeWithNotification = async (postId: string, liked: boolean) => {
    await handleLike(postId, liked);
    setNotification(liked ? 'Unliked' : 'Liked');
  };

  const handleProfileNavigation = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const handlePostNavigation = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleImageInteraction = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
  };

  return (
    <div className={styles['home-container']}>
      {isClient && localStorage.getItem('token') ? (
        <>
          <Header handleLogout={handleLogout} />
          <div className={styles['main-content']}>
            {!isMobile && <Sidebar />} {/* Hide sidebar on mobile */}
            <div className={styles['content']}>
              <form className={styles['post-form']} onSubmit={handleSubmit}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={200}
                  required
                  className={styles['content-input']}
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className={styles['image-input']}
                />
                <div className={styles['image-previews']}>
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Image preview ${index}`}
                      className={styles['image-preview']}
                    />
                  ))}
                </div>
                <br />
                <button type="submit" className={styles['post-button']}>
                  Post
                </button>
              </form>
              {error && <p className={styles['error-message']}>{error}</p>}
              <div className={styles['posts-container']}>
                {posts.map((post: Post, index: number) => (
                  <div
                    key={post._id}
                    className={styles['post-card']}
                    style={{ minWidth: '100%' }}
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).classList.contains(styles['post-image'])) {
                        handlePostNavigation(post._id);
                      }
                    }}
                  >
                    <div className={styles['post-header']}>
                      <img
                        src={post.author.profilePicture}
                        alt="Profile"
                        className={styles['profile-picture']}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileNavigation(post.author.username);
                        }}
                      />
                      <span
                        className={styles['post-author']}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileNavigation(post.author.username);
                        }}
                      >
                        {post.author.username}
                      </span>
                    </div>
                    <p className={styles['post-content']}>{post.content}</p>
                    {post.images?.length > 1 ? (
                      <Carousel className={styles['post-carousel']} onClick={handleImageInteraction}>
                        {post.images.map((image, index) => (
                          <Carousel.Item key={index}>
                            <img
                              src={image}
                              alt={`Post image ${index}`}
                              className={styles['post-image']}
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
                          className={styles['post-image']}
                          onClick={handleImageInteraction}
                        />
                      )
                    )}
                    <div className={styles['post-actions']}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeWithNotification(post._id, post.isLikedByCurrentUser);
                        }}
                        className={styles['like-button1']}
                      >
                        <FontAwesomeIcon
                          icon={post.isLikedByCurrentUser ? faHeartSolid : faHeartRegular}
                        />
                      </button>
                      <span className={styles['like-count']}>
                        {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!isMobile && <RightSidebar />} {/* Hide right sidebar on mobile */}
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
