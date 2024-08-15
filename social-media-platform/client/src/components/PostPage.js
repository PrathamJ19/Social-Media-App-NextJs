import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/PostPage.css';
import Header from './Header';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { token, username, apiBaseUrl } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      alert('Please log in first.');
      navigate('/login');
    } else {
      fetchPost();
    }
  }, [token, navigate, postId]);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Initialize isLikedByCurrentUser based on response
      const isLikedByCurrentUser = res.data.likes.includes(username);

      setPost({
        ...res.data,
        isLikedByCurrentUser,
      });
      setComments(res.data.comments);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Error fetching post');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const res = await axios.post(`${apiBaseUrl}/posts/${postId}/comments`, 
        { content: newComment }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setComments([...comments, res.data]);
        setNewComment('');
        setError('');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Error adding comment');
    }
  };

  const handleLikeClick = async () => {
    if (!post) return;

    try {
      const url = post.isLikedByCurrentUser
        ? `${apiBaseUrl}/posts/unlike/${post._id}`
        : `${apiBaseUrl}/posts/like/${post._id}`;

      const response = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update post state with new like status
      setPost((prevPost) => ({
        ...prevPost,
        likes: response.data.likes,
        isLikedByCurrentUser: !prevPost.isLikedByCurrentUser,
      }));

      // Update localStorage to reflect liked/unliked state
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};
      likedPosts[post._id] = !post.isLikedByCurrentUser;
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (err) {
      console.error('Error liking/unliking post:', err);
      setError('Error updating like');
    }
  };

  return (
    <div className="post-page-container">
      {post ? (
        <>
          <Header 
            username={username} 
            handleProfileClick={() => navigate(`/profile/${username}`)} 
            handleLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('username');
              navigate('/login');
            }} 
          />
          <Sidebar />
          <RightSidebar />
          <div className="post-card-pp">
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
            <div className="post-actions">
              <button onClick={handleLikeClick} className="like-button1">
                <FontAwesomeIcon 
                  icon={post.isLikedByCurrentUser ? faHeartSolid : faHeartRegular} 
                />
              </button>
              <span className="like-count">
                {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
              </span>
            </div>
            <div className="comments-section">
              <h3>Comments</h3>
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  required
                />
                <button type="submit">Comment</button>
              </form>
              {error && <p className="error-message">{error}</p>}
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <img
                        src={comment.author.profilePicture}
                        alt="Profile"
                        className="comment-profile-picture"
                      />
                      <div>
                        <span className="comment-username">{comment.author.username}</span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading post...</p>
      )}
    </div>
  );
};

export default PostPage;
