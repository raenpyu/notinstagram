import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword as signIn, createUserWithEmailAndPassword as createUser, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase 초기화 설정
const firebaseConfig = {
  apiKey: "AIzaSyCO6hXf5i_bCXslZc56p_A7fzCtvFOovWw",
  authDomain: "mylogin-f183f.firebaseapp.com",
  databaseURL: "https://mylogin-f183f-default-rtdb.firebaseio.com",
  projectId: "mylogin-f183f",
  storageBucket: "mylogin-f183f.appspot.com",
  messagingSenderId: "772579730730",
  appId: "1:772579730730:web:89594104fec677b52aaa53",
  measurementId: "G-997PN40C32"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// 사용자 프로필 데이터 추가
const addUserProfileData = async (userId, data) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, data);
    console.log('User profile data added successfully.');
  } catch (error) {
    console.error('Failed to add user profile data:', error.message);
    throw error;
  }
};

// 채팅 생성
const createChat = async (userIds) => {
  try {
    const chatRef = push(ref(database, 'chats'));
    const chatId = chatRef.key;
    await set(chatRef, { members: userIds });
    return chatId;
  } catch (error) {
    console.error('Error creating chat:', error.message);
    throw error;
  }
};

// 메시지 전송
const sendMessage = async (chatId, message) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const messageRef = push(ref(database, `messages/${chatId}`));
    await set(messageRef, {
      senderId: user.uid,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
    throw error;
  }
};

// 메시지 수신 대기
const listenForMessages = (chatId, callback) => {
  const messagesRef = ref(database, `messages/${chatId}`);
  onValue(messagesRef, (snapshot) => {
    const messagesData = snapshot.val();
    const messagesArray = messagesData ? Object.values(messagesData) : [];
    callback(messagesArray);
  });
};

// Firebase 인증 관련 기능과 Firestore 컬렉션, 문서 관련 함수들, 그리고 Storage 관련 함수들을 내보내기
export {
  auth,
  database,
  firestore,
  storage,
  signIn,
  createUser,
  signOut,
  onAuthStateChanged,
  addUserProfileData,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  createChat,
  sendMessage,
  listenForMessages,
  storageRef,
  uploadBytes,
  getDownloadURL
};
