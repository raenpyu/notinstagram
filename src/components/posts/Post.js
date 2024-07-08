import React, { useState, useEffect } from 'react';
import { ref, update, get } from 'firebase/database';
import { database } from '../../services/firebase';

const Post = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false); // 좋아요 상태 추가
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchUserLikeStatus = async () => {
      const user = auth.currentUser;
      if (user && post.likedBy && post.likedBy.includes(user.uid)) {
        setLiked(true);
      }
    };
    fetchUserLikeStatus();
  }, [post]);

  const handleLike = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (liked) return; // 이미 좋아요를 누른 경우 처리 방지

    try {
      const postRef = ref(database, `posts/${post.id}`);
      const updatedLikedBy = [...post.likedBy, user.uid];
      await update(postRef, {
        likes: likes + 1,
        likedBy: updatedLikedBy,
      });
      setLikes(likes + 1);
      setLiked(true);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      const postRef = ref(database, `posts/${post.id}`);
      const newComment = {
        userId: user.uid,
        username: userData ? userData.username : '익명', // 댓글 작성자 이름 추가
        timestamp: new Date().toISOString(),
        text: commentText.trim(),
      };

      const postSnapshot = await get(postRef);
      const postData = postSnapshot.val();
      const updatedComments = postData.comments ? [...postData.comments, newComment] : [newComment];

      await update(postRef, {
        comments: updatedComments,
      });
      setComments(updatedComments);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="post">
      <h3>{post.title}</h3>
      <p>작성자: {post.authorName}</p>
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ maxWidth: '100%' }} />}
      <p>{post.content}</p>
      <button onClick={handleLike} disabled={liked}>
        Like ({likes})
      </button>
      <div>
        <h4>Comments</h4>
        <ul>
          {comments.map((comment, index) => (
            <li key={index}>
              <p><strong>User:</strong> {comment.username}</p>
              <p><strong>Time:</strong> {new Date(comment.timestamp).toLocaleString()}</p>
              <p>{comment.text}</p>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment"
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default Post;
