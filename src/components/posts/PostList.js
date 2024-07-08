import React, { useState, useEffect } from 'react';
import { ref, onValue, get, update, push } from 'firebase/database';
import { database, auth } from '../../services/firebase';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = ref(database, 'posts');
        onValue(postsRef, (snapshot) => {
          const postsData = snapshot.val();
          if (postsData) {
            const postsArray = Object.keys(postsData).map((key) => ({
              id: key,
              ...postsData[key],
              comments: postsData[key].comments || [], // Ensure comments is initialized as an array
              likes: postsData[key].likes || {}, // Ensure likes is initialized as an object
            }));
            // Sort posts by timestamp to show the latest posts first
            postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setPosts(postsArray);
          } else {
            setPosts([]);
          }
          setLoading(false);
        });

        const user = auth.currentUser;
        if (user) {
          const userLikesRef = ref(database, `users/${user.uid}/likes`);
          const userLikesSnapshot = await get(userLikesRef);
          if (userLikesSnapshot.exists()) {
            setLikedPosts(userLikesSnapshot.val());
          }
        }
      } catch (error) {
        console.error('게시물 데이터를 가져오는 중 오류 발생:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      const postRef = ref(database, `posts/${postId}`);
      const postSnapshot = await get(postRef);
      if (!postSnapshot.exists()) {
        throw new Error('포스트를 찾을 수 없습니다.');
      }
      let postData = postSnapshot.val();

      const likedByUser = postData.likes && postData.likes[user.uid];

      if (likedByUser) {
        // 좋아요 취소
        delete postData.likes[user.uid];
        setLikedPosts((prevLikedPosts) => {
          const updatedLikedPosts = { ...prevLikedPosts };
          delete updatedLikedPosts[postId];
          return updatedLikedPosts;
        });
      } else {
        // 좋아요 추가
        postData.likes = {
          ...postData.likes,
          [user.uid]: true
        };
        setLikedPosts((prevLikedPosts) => ({
          ...prevLikedPosts,
          [postId]: true
        }));
      }

      await update(postRef, { likes: postData.likes });
    } catch (error) {
      console.error('좋아요 업데이트 중 오류 발생:', error.message);
    }
  };

  const handleAddComment = async (postId) => {
    const user = auth.currentUser;
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (commentText.trim() === '') {
      return;
    }

    try {
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const username = userData.username;

      const newComment = {
        userId: user.uid,
        username: username,
        timestamp: new Date().toISOString(),
        text: commentText.trim(),
      };

      const postCommentsRef = ref(database, `posts/${postId}/comments`);
      await push(postCommentsRef, newComment);

      setCommentText('');
    } catch (error) {
      console.error('댓글 추가 중 오류 발생:', error);
    }
  };

  if (loading) {
    return <p>로딩 중...</p>;
  }

  return (
    <div>
      <h2>게시물 목록</h2>
      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>작성자: {post.authorName}</p>
          {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ maxWidth: '100%' }} />}
          <button onClick={() => handleLike(post.id)} disabled={!!likedPosts[post.id]}>
            {likedPosts[post.id] ? '좋아요 취소' : '좋아요'} ({Object.keys(post.likes).length})
          </button>
          <div>
            <h4>댓글</h4>
            <ul>
              {post.comments && Object.keys(post.comments).length > 0 ? (
                Object.values(post.comments).map((comment, index) => (
                  <li key={index}>
                    <p><strong>{comment.username}</strong> ({new Date(comment.timestamp).toLocaleString()})</p>
                    <p>{comment.text}</p>
                  </li>
                ))
              ) : (
                <li>댓글이 없습니다</li>
              )}
            </ul>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
            />
            <button onClick={() => handleAddComment(post.id)}>댓글 추가</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
