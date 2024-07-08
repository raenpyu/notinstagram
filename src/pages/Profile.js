import React, { useEffect, useState } from 'react';
import { auth, database } from '../services/firebase';
import { ref, get, update } from 'firebase/database';
import { Link } from 'react-router-dom';
import { getDistance } from 'geolib';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realtimeUsers, setRealtimeUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [closestUsers, setClosestUsers] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('사용자가 로그인되어 있지 않습니다.');
        }

        const userId = user.uid;

        // Realtime Database에서 프로필 데이터 가져오기
        const dbRef = ref(database, `users/${userId}`);
        const profileSnapshot = await get(dbRef);
        if (!profileSnapshot.exists()) {
          throw new Error('프로필 데이터를 찾을 수 없습니다.');
        }
        setProfileData(profileSnapshot.val());

        // Realtime Database에서 전체 사용자 목록 가져오기
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          const usersArray = Object.keys(usersData)
            .filter(key => key !== userId) // 현재 사용자를 제외
            .map(key => ({
              id: key,
              ...usersData[key]
            }));
          setRealtimeUsers(usersArray);

          // 가장 가까운 사용자 계산
          const currentUserLocation = profileSnapshot.val().location;
          if (currentUserLocation) {
            const distances = usersArray.map(user => {
              if (user.location) {
                return {
                  ...user,
                  distance: getDistance(
                    { latitude: currentUserLocation.lat, longitude: currentUserLocation.lng },
                    { latitude: user.location.lat, longitude: user.location.lng }
                  ) / 1000 // 미터를 킬로미터로 변환
                };
              } else {
                return { ...user, distance: Infinity };
              }
            });
            distances.sort((a, b) => a.distance - b.distance);
            setClosestUsers(distances.slice(0, 2));
          }
        } else {
          throw new Error('사용자 데이터를 찾을 수 없습니다.');
        }

        // 현재 사용자가 팔로우한 사용자 목록 가져오기
        const followingRef = ref(database, `users/${userId}/following`);
        const followingSnapshot = await get(followingRef);
        if (followingSnapshot.exists()) {
          const followingData = followingSnapshot.val();
          const followingArray = Object.keys(followingData);
          setFollowingUsers(followingArray);
        } else {
          setFollowingUsers([]);
        }

        // 현재 사용자를 팔로우한 사용자(팔로워) 목록 가져오기
        const followersRef = ref(database, 'users');
        const followersSnapshot = await get(followersRef);
        if (followersSnapshot.exists()) {
          const followersData = followersSnapshot.val();
          const followersArray = Object.keys(followersData).filter(key => {
            const user = followersData[key];
            return user.following && user.following[userId];
          }).map(key => ({
            id: key,
            ...followersData[key]
          }));
          setFollowers(followersArray);
        } else {
          setFollowers([]);
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleFollow = async (userIdToFollow) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      // Realtime Database에서 현재 사용자 문서 업데이트
      const currentUserRef = ref(database, `users/${user.uid}/following`);
      await update(currentUserRef, {
        [userIdToFollow]: true
      });

      console.log('팔로우 완료');
    } catch (error) {
      console.error('팔로우 실패:', error.message);
    }
  };

  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p>오류 발생: {error}</p>;
  }

  return (
    <div className="profile">
      <h2>프로필</h2>
      {profileData && (
        <div>
          <p>사용자 이름: {profileData.username}</p>
          <p>이메일: {profileData.email}</p>
          {profileData.registeredAddress && <p>등록된 주소: {profileData.registeredAddress}</p>} {/* 등록된 주소 표시 */}
        </div>
      )}
      <div className="users">
        <h3>사용자 목록</h3>
        <ul>
          {realtimeUsers.map((user, index) => (
            <li key={index}>
              {user.username}
              {!followingUsers.includes(user.id) ? (
                <button onClick={() => handleFollow(user.id)}>팔로우</button>
              ) : (
                <Link to={`/chat/${user.id}`}>
                  <button>채팅</button>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="following">
        <h3>팔로우한 사람</h3>
        <ul>
          {followingUsers.length > 0 ? (
            followingUsers.map((userId, index) => {
              const user = realtimeUsers.find(u => u.id === userId);
              return (
                <li key={index}>
                  {user?.username}
                  <Link to={`/chat/${userId}`}>
                    <button>채팅</button>
                  </Link>
                </li>
              );
            })
          ) : (
            <li>팔로우한 사람이 없습니다.</li>
          )}
        </ul>
      </div>
      <div className="followers">
        <h3>나를 팔로우한 사람</h3>
        <ul>
          {followers.length > 0 ? (
            followers.map((follower, index) => (
              <li key={index}>
                {follower.username}
              </li>
            ))
          ) : (
            <li>나를 팔로우한 사람이 없습니다.</li>
          )}
        </ul>
      </div>
      <div className="closest-users">
        <h3>가장 가까운 사용자</h3>
        <ul>
          {closestUsers.length > 0 ? (
            closestUsers.map((user, index) => (
              <li key={index}>
                {user.username} (거리: {user.distance.toFixed(2)} km)
                <Link to={`/chat/${user.id}`}>
                  <button>채팅</button>
                </Link>
              </li>
            ))
          ) : (
            <li>가장 가까운 사용자가 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
