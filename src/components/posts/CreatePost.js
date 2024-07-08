import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, get } from 'firebase/database'; // get 메소드 추가
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage'; // ref를 storageRef로 별칭 지정
import { auth, database, storage } from '../../services/firebase'; // Firebase 관련 서비스 import

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate(); // react-router-dom의 useNavigate 훅 사용하여 라우팅 처리

  // 이미지 변경 시 호출되는 핸들러 함수
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]); // 선택된 이미지 파일을 state에 저장
    }
  };

  // 게시물 제출 시 호출되는 핸들러 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser; // 현재 로그인된 사용자 가져오기
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      let imageUrl = '';

      // 이미지가 선택된 경우, Storage에 이미지 업로드 후 다운로드 URL 가져오기
      if (image) {
        const imageRef = storageRef(storage, `images/${image.name}`); // Storage 경로 설정
        await uploadBytes(imageRef, image); // 이미지 업로드
        imageUrl = await getDownloadURL(imageRef); // 업로드된 이미지의 다운로드 URL 가져오기
      }

      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const username = userData.username;

      // 새로운 게시물 데이터 Realtime Database에 저장
      const newPostRef = push(ref(database, 'posts')); // 'posts' 경로에 새 게시물 추가를 위한 참조 만들기
      await set(newPostRef, { // 새 게시물 데이터 설정
        title,
        content,
        author: user.uid,
        authorName: username, // 작성자의 이름 저장
        imageUrl,
        likes: 0,
        comments: [],
        timestamp: new Date().toISOString(),
      });

      navigate('/posts'); // 게시물 목록 페이지로 이동
    } catch (error) {
      console.error('게시물 작성 실패:', error);
    }
  };

  return (
    <div>
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Image</label>
          <input type="file" onChange={handleImageChange} />
        </div>
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
