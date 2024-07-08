// src/components/home/Home.js

import React, { useEffect, useState } from 'react';
import { auth, database } from '../../services/firebase'; // database import 추가
import { ref, update } from 'firebase/database'; // update import 추가
import axios from 'axios';
import logo from './mylogo.png'; // 로고 이미지 경로를 임포트
import './Home.css'; // CSS 파일을 추가하여 스타일링을 관리

const Home = () => {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [registeredAddress, setRegisteredAddress] = useState(''); // 등록된 주소 상태 추가
  const [networkType, setNetworkType] = useState('unknown'); // 네트워크 유형 상태 추가

  const handleAddressSubmit = async () => {
    try {
      const response = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
        headers: {
          Authorization: `KakaoAK 5e7b34f66367c38c8a0b3cd26776f736`
        },
        params: {
          query: address
        }
      });

      if (response.data.documents.length === 0) {
        throw new Error('주소를 찾을 수 없습니다.');
      }

      const location = response.data.documents[0];
      const coords = {
        lat: parseFloat(location.y),
        lng: parseFloat(location.x)
      };

      setCoords(coords);

      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, {
          location: coords,
          registeredAddress: location.address_name // 등록된 주소 추가
        });
      }

      setRegisteredAddress(location.address_name); // 등록된 주소 설정

      console.log('주소 등록 완료');
    } catch (error) {
      console.error('주소 등록 실패:', error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 네트워크 유형 감지 함수
  useEffect(() => {
    const updateNetworkType = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const type = connection.effectiveType;
        setNetworkType(type);
      }
    };

    updateNetworkType();
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkType);
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkType);
      }
    };
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <img src={logo} alt="My Logo" className="home-logo" />
        <h1>Home</h1>
        <span>{networkType.toUpperCase()}</span> {/* 네트워크 유형 표시 */}
      </header>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="도로명 주소를 입력하세요"
          />
          <button onClick={handleAddressSubmit}>주소 등록</button>
          {coords && <p>좌표: {coords.lat}, {coords.lng}</p>}
          {registeredAddress && <p>등록된 주소: {registeredAddress}</p>} {/* 등록된 주소 표시 */}
        </div>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default Home;
