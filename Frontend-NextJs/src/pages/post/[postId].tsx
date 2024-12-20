import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../../styles/postPage.module.css';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import RightSidebar from '../../components/rightSidebar';
import { token, username, apiBaseUrl } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

interface Post {
  _id: string;
  content: string;
  images: string[];
  author: {
    username: string;
    profilePicture: string;
  };
  likes: string[];
  isLikedByCurrentUser: boolean;
  comments: Comment[];
}

interface Comment {
  _id: string;
  content: string;
  author: {
    username: string;
    profilePicture: string;
  };
  createdAt: string;
}

const PostPage: React.FC = () => {
  const router = useRouter();
  const { postId } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [removedImages, setRemovedImages] = useState<string[]>([]);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      alert('Please log in first.');
      router.push('/login'); // Next.js navigation
    } else if (postId) {
      fetchPost();
    }
  }, [token, postId]);

  const fetchPost = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const postData = {
      ...res.data,
      isLikedByCurrentUser: res.data.likes.includes(username), // Derive the `isLikedByCurrentUser` flag
      images: res.data.images || [], // Ensure images is an array, default to an empty array
    };

    setPost(postData);
    setComments(res.data.comments || []); // Ensure comments is an array, default to an empty array

    console.log('Post fetched:', postData); // Debugging line
  } catch (err) {
    console.error('Error fetching post:', err);
    setError('Error fetching post');
  }
};

if (!post) {
    return <p>Loading post...</p>;
  }

    const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', post?.content || '');
    post?.images.forEach((image) => {
      if (image.startsWith('blob:')) {
        formData.append('images', image); // Add new images
      }
    });
    removedImages.forEach((image) => formData.append('removedImages', image)); // Send removed images

    try {
      await axios.put(`${apiBaseUrl}/posts/${postId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refetch post after successful edit
      await fetchPost();
      alert('Post updated successfully.');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Error updating post');
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post deleted successfully.');
      router.push('/home');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Error deleting post');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).slice(0, 3 - post.images.length);
      const imageUrls = newImages.map((file) => URL.createObjectURL(file));

      setPost((prev) =>
        prev
          ? { ...prev, images: [...prev.images, ...imageUrls] }
          : null
      );
    }
  };

  const handleRemoveImage = (index: number) => {
  const imageToRemove = post?.images[index];
  setRemovedImages((prev) => [...prev, imageToRemove]);
  setPost((prev) =>
    prev
      ? {
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        }
      : null
  );
};


  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const res = await axios.post(
        `${apiBaseUrl}/posts/${postId}/comments`,
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

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPost((prevPost) =>
        prevPost && {
          ...prevPost,
          likes: response.data.likes,
          isLikedByCurrentUser: !prevPost.isLikedByCurrentUser, // Toggle the boolean value
        }
      );

      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      likedPosts[post._id] = !post.isLikedByCurrentUser;
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (err) {
      console.error('Error liking/unliking post:', err);
      setError('Error updating like');
    }
  };

  return (
  <div className={styles.postPageContainer}>
    {post ? (
      <>
        <Header
          handleLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            router.push('/login'); // Next.js navigation
          }}
        />
        {!isMobile && <Sidebar />}
        <div className={styles.postCard}>
          <div className={styles.postHeader}>
          <div className={styles.authorContainer}>
          <img
            src={post.author.profilePicture}
            alt="Profile"
            className={styles.profilePicture}
          />
          <span className={styles.postAuthor}>{post.author.username}</span>
          </div>
          {post.author.username === username && (
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
        {isEditing && (
          <>
            <div className={styles.modalOverlay} onClick={() => setIsEditing(false)}></div>
            <div className={styles.editModal}>
              <form onSubmit={handleEditSubmit}>
                <textarea
                  value={post.content}
                  onChange={(e) =>
                    setPost((prev) => (prev ? { ...prev, content: e.target.value } : null))
                  }
                  placeholder="Edit your post content..."
                  className={styles.editTextArea}
                />
                <div className={styles.imageUploadSection}>
                  <h4>Images (Max 3)</h4>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                  <div className={styles.imagePreview}>
                    {post.images.map((image, index) => (
                      <div key={index} className={styles.imageContainer}>
                        <img src={image} alt={`Post image ${index}`} />
                        <button onClick={() => handleRemoveImage(index)}>✖</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                  <button type="submit">Save Changes</button>
                  <button type="button" onClick={handleDeletePost}>
                    Delete Post
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

          <p className={styles.postContent}>{post.content}</p>
          {post.images.length > 1 ? (
            <Carousel className={styles.postCarousel}>
              {post.images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={image}
                    alt={`Post image ${index}`}
                    className={styles.postImage}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            post.images.length === 1 && (
              <img
                src={post.images[0]}
                alt="Post"
                className={styles.postImage}
              />
            )
          )}
          <div className={styles.postActions}>
            <button onClick={handleLikeClick} className={styles.likeButton}>
              <FontAwesomeIcon
                icon={post.isLikedByCurrentUser ? faHeartSolid : faHeartRegular}
              />
            </button>
            <span className={styles.likeCount}>
              {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
            </span>
          </div>
          <div className={styles.commentsSection}>
            <h3>Comments</h3>
            <form
              onSubmit={handleCommentSubmit}
              className={styles.commentForm}
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                required
              />
              <button type="submit">Comment</button>
            </form>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <div key={comment._id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <img
                      src={comment.author.profilePicture}
                      alt="Profile"
                      className={styles.commentProfilePicture}
                    />
                    <div>
                      <span className={styles.commentUsername}>
                        {comment.author.username}
                      </span>
                      <span className={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
          {!isMobile && <RightSidebar />}
        </div>
      </>
    ) : (
      <p>Loading post...</p>
    )}
  </div>
);

};

export default PostPage;
