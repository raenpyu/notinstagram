import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database, auth } from '../../services/firebase';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [hasLiked, setHasLiked] = useState(false); // 좋아요 상태 추가

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const snapshot = await get(ref(database, `posts/${id}`));
        const postData = snapshot.val();
        setPost(postData);

        const user = auth.currentUser;
        if (user && postData.likes && postData.likes[user.uid]) {
          setHasLiked(true);
        }
      } catch (error) {
        console.error('게시물 데이터 가져오기 실패:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (hasLiked) return; // 이미 좋아요를 눌렀다면 더 이상 처리하지 않음

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      const postRef = ref(database, `posts/${id}`);
      const newLikes = { ...post.likes, [user.uid]: true };

      await update(postRef, {
        likes: newLikes,
      });
      setPost((prevPost) => ({
        ...prevPost,
        likes: newLikes,
      }));
      setHasLiked(true); // 좋아요 상태 업데이트
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const username = userData.username;

      const newComment = {
        userId: user.uid,
        username: username, // 작성자의 이름 저장
        timestamp: new Date().toISOString(),
        text: commentText.trim(),
      };
      const updatedComments = post.comments ? [...post.comments, newComment] : [newComment];

      const postRef = ref(database, `posts/${id}`);
      await update(postRef, {
        comments: updatedComments,
      });
      setPost((prevPost) => ({
        ...prevPost,
        comments: updatedComments,
      }));
      setCommentText('');
    } catch (error) {
      console.error('댓글 추가 실패:', error);
    }
  };

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <p>작성자: {post.authorName}</p>
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ maxWidth: '100%' }} />}
      <p>{post.content}</p>
      <button onClick={handleLike} disabled={hasLiked}>
        {hasLiked ? 'Liked' : `Like (${Object.keys(post.likes || {}).length})`}
      </button>
      <div>
        <h4>Comments</h4>
        <ul>
          {post.comments && post.comments.map((comment, index) => (
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

export default PostDetail;
