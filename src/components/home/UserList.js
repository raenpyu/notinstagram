// src/components/home/UserList.js

import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database'; // ref와 onValue 함수 가져오기
import { database } from '../../services/firebase';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersArray = data ? Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      })) : [];
      setUsers(usersArray);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
