import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // firebase/auth 모듈에서 가져오기

const Navbar = () => {
  const handleLogout = async () => {
    try {
      const auth = getAuth(); // getAuth로 현재 auth 인스턴스 가져오기
      await signOut(auth); // signOut 함수 호출 시 auth 인스턴스 전달
      window.location.reload();
    } catch (error) {
      console.error('로그아웃 실패:', error.message);
    }
  };

  return (
    <nav>
      <Link to="/">홈</Link>
      <Link to="/profile">프로필</Link>
      <Link to="/login">로그인</Link>
      <Link to="/create-post">게시물 작성</Link>
      <Link to="/posts">게시물 목록</Link>
      <button onClick={handleLogout}>로그아웃</button>
    </nav>
  );
};

export default Navbar;
