import React, { useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '../services/firebase';

const ChatButton = () => {
  useEffect(() => {
    const updateDatabase = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          await set(ref(database, `users/${user.uid}/chat`), {
            message: "Hello, World!"
          });
        }
      } catch (error) {
        console.error('데이터베이스 업데이트 실패:', error);
      }
    };

    updateDatabase();
  }, []);

  return (
    <button onClick={() => {}}>채팅</button>
  );
};

export default ChatButton;
