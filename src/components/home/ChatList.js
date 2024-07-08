import React, { useState, useEffect } from 'react';
import { database, auth } from '../../services/firebase';

const generateChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

const ChatList = () => {
  const [followers, setFollowers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        const followersRef = database.ref(`follows/${user.uid}`);
        followersRef.on('value', (snapshot) => {
          const data = snapshot.val();
          const followersArray = data ? Object.keys(data) : [];
          setFollowers(followersArray);
        });

        return () => followersRef.off();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChatClick = (followerId) => {
    const chatId = generateChatId(currentUser.uid, followerId);
    window.location.href = `/chat/${followerId}`;
  };

  return (
    <div>
      <h2>Chat List</h2>
      {followers.map(follower => (
        <div key={follower}>
          <button onClick={() => handleChatClick(follower)}>{follower}</button>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
