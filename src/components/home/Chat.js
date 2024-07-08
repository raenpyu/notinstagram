import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, database } from '../../services/firebase';
import { ref, get, onValue, push, set } from 'firebase/database';

const generateChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

const Chat = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('사용자가 로그인되어 있지 않습니다.');
        }

        // 채팅 상대의 사용자 이름 가져오기
        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          setUsername(userSnapshot.val().username);
        } else {
          throw new Error('사용자 데이터를 찾을 수 없습니다.');
        }

        // 채팅 ID 생성 및 새 메시지 듣기
        const chatId = generateChatId(user.uid, userId);
        const messagesRef = ref(database, `chats/${chatId}`);
        onValue(messagesRef, (snapshot) => {
          const messagesData = snapshot.val();
          if (messagesData) {
            setMessages(Object.values(messagesData));
          } else {
            setMessages([]);
          }
          setLoading(false);
        });

      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchChatData();
  }, [userId]);

  const handleSendMessage = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      const chatId = generateChatId(user.uid, userId);
      const messagesRef = ref(database, `chats/${chatId}`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        senderId: user.uid,
        message: newMessage,
        timestamp: new Date().toISOString()
      });

      setNewMessage('');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p>오류 발생: {error}</p>;
  }

  return (
    <div className="chat">
      <h2>{username}와의 채팅</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.senderId === auth.currentUser.uid ? '나' : username}:</strong> {msg.message}
          </li>
        ))}
      </ul>
      <input 
        type="text" 
        value={newMessage} 
        onChange={(e) => setNewMessage(e.target.value)} 
        placeholder="메시지를 입력하세요..."
      />
      <button onClick={handleSendMessage}>전송</button>
    </div>
  );
};

export default Chat;
