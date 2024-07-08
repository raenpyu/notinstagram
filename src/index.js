import React from 'react';
import { createRoot } from 'react-dom/client'; // react-dom/client에서 createRoot import
import './index.css';
import App from './App';

// createRoot를 사용하여 렌더링합니다.
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
