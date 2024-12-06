 // src/app/profile/[username]/page.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Carousel from "react-bootstrap/Carousel";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import RightSidebar from "../../components/rightSidebar";
import styles from "../../styles/profile.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { token, apiBaseUrl } from "../../constants";
import { useFollowContext } from "../../context/FollowContext";
import NotificationFollowed from "../../components/notificationFollowed";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';


  interface ProfileData {
    profilePicture: string;
    followers: number;
    following: number;
  }

  interface Post {
    _id: string;
    content: string;
    images: string[];
    likes: string[];
    author: {
      username: string;
      profilePicture: string;
    };
    isLikedByCurrentUser: boolean;
  }

  const Profile: React.FC = () => {
    const router = useRouter(); // Next.js router
    const { username } = router.query; // Dynamic route parameter
    const { refreshFollowedUsers } = useFollowContext();

    const [profileData, setProfileData] = useState<ProfileData>({
      profilePicture: '',
      followers: 0,
      following: 0,
    });

    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string>('');
    const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [profileNotFound, setProfileNotFound] = useState<boolean>(false);
    const [notification, setNotification] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  handleResize(); // Initialize on component mount
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);


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

            const currentUser = localStorage.getItem('username');
            setIsCurrentUser(currentUser === username);

            const followingRes = await axios.get(`${apiBaseUrl}/auth/is-following/${username}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setIsFollowing(followingRes.data.isFollowing);

            const postsRes = await axios.get(`${apiBaseUrl}/posts/user/${username}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}') || {};
            const updatedPosts = postsRes.data.map((post: Post) => ({
              ...post,
              isLikedByCurrentUser: likedPosts[post._id] || false,
            }));

            setPosts(updatedPosts);
          }
        } catch (err) {
          console.error(err);
          setError('Error fetching profile data');
        }
      };

      if (username) fetchProfileData();
    }, [username]);

    const handleFollow = async () => {
      try {
        await axios.post(`${apiBaseUrl}/auth/follow/${username}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(true);
        setProfileData((prevData) => ({ ...prevData, followers: prevData.followers + 1 }));
        setNotification('Followed');
        refreshFollowedUsers(); // Refresh the list of followed users
      } catch (err) {
        console.error('Error following user:', err);
        setError('Error following user');
      }
    };

    const handleUnfollow = () => {
      setShowConfirmation(true);
    };

    const confirmUnfollow = async () => {
      try {
        await axios.post(`${apiBaseUrl}/auth/unfollow/${username}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(false);
        setProfileData((prevData) => ({ ...prevData, followers: prevData.followers - 1 }));
        setNotification('Unfollowed');
        refreshFollowedUsers(); // Refresh the list of followed users
      } catch (err) {
        console.error('Error unfollowing user:', err);
        setError('Error unfollowing user');
      }
      setShowConfirmation(false);
    };

    const cancelUnfollow = () => {
      setShowConfirmation(false);
    };

    const handlePostNavigation = (postId: string) => {
      router.push(`/post/${postId}`); // Navigate to post page
    };

    const handleProfileNavigation = (username: string) => {
      router.push(`/profile/${username}`); // Navigate to profile page
    };

    const handleLike = async (postId: string, liked: boolean) => {
      try {
        const url = liked
          ? `${apiBaseUrl}/posts/unlike/${postId}`
          : `${apiBaseUrl}/posts/like/${postId}`;

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
              isLikedByCurrentUser: !liked,
            };
          }
          return post;
        }));

        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}') || {};
        likedPosts[postId] = !liked;
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      } catch (err) {
        console.error('Error liking/unliking post:', err);
        setError('Error updating like');
      }
    };

  return (
    <div className={styles.profileContainer}>
      {error ? (
        <p>{error}</p>
      ) : profileNotFound ? (
        <p>The person you searched for does not exist.</p>
      ) : (
        <>
          <Header
            handleLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('username');
              router.push('/login');
            }}
          />
          {!isMobile && (
          <>
            <Sidebar />
            <RightSidebar />
          </>
        )}
          <div className={styles.profileContent}>
            <div className={styles.profilePictureContainer}>
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className={styles.profilePicture2}
                />
              ) : (
                <img
                  src="https://faizawsbucket.s3.us-east-1.amazonaws.com/default-profile-pic.jpg" // Provide a fallback image
                  alt="Default Profile"
                  className={styles.profilePicture2}
                />
              )}
              <h2 className={styles.username2}>{username}</h2>
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileStats}>
                <div className={styles.followersCount}>
                  <span>{profileData.followers}</span>
                  <span>Followers</span>
                </div>
                <div>
                  <span>{profileData.following}</span>
                  <span>Following</span>
                </div>
              </div>
              {!isCurrentUser && (
                <div className={styles.profileActions}>
                  {isFollowing ? (
                    <button className={styles.followButton} onClick={handleUnfollow}>Unfollow</button>
                  ) : (
                    <button className={styles.followButton} onClick={handleFollow}>Follow</button>
                  )}
                  {notification && (
                    <NotificationFollowed
                      message={notification}
                      onClose={() => setNotification('')}
                    />
                  )}
                </div>
              )}
            </div>

            <div className={styles.userPosts}>
            <hr />
              {posts.length === 0 ? (
                <p className={styles.postEmpty}>This user hasn't posted anything yet.</p>
              ) : (
                posts.map(post => (
                  <div
                    key={post._id}
                    className={styles.postCard}
                    style={{ minWidth: '100%' }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains(styles.postImage)) {
                        handlePostNavigation(post._id);
                      }
                    }}
                  >
                    <div className={styles.postHeader}>
                      <img
                        src={post.author.profilePicture}
                        alt="Profile"
                        className={styles.profilePicture}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileNavigation(post.author.username);
                        }}
                      />
                      <span
                        className={styles.postAuthor}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileNavigation(post.author.username);
                        }}
                      >
                        {post.author.username}
                      </span>
                    </div>
                    <p className={styles.postContent}>{post.content}</p>
                    {post.images.length > 1 ? (
                      <Carousel className={styles.postCarousel} onClick={(e) => e.stopPropagation()}>
                        {post.images.map((image, index) => (
                          <Carousel.Item key={index}>
                            <img src={image} alt="Post" className={styles.postImage} />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    ) : post.images.length === 1 ? (
                      <img
                        src={post.images[0]}
                        alt="Post"
                        className={styles.postImage}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : null}
                    <div className={styles.postActions}>
                      <FontAwesomeIcon
                        icon={post.isLikedByCurrentUser ? faHeartSolid : faHeartRegular}
                        className={styles.likeIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post._id, post.isLikedByCurrentUser);
                        }}
                      />
                      <span className={styles['like-count']}>
                          {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                        </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {showConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationModal}>
            <p>Are you sure you want to unfollow?</p>
            <button onClick={confirmUnfollow}>Yes</button>
            <button onClick={cancelUnfollow}>No</button>
          </div>
        </div>
      )}
    </div>
  );
  };

  export default Profile;
