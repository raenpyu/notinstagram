import React from 'react';

const FollowList = () => {
  return (
    <div className="follow-list">
      <h2>Follow</h2>
      <div className="user">
        <span>User1</span>
        <button>Follow</button>
      </div>
      <div className="user">
        <span>User2</span>
        <button>Follow</button>
      </div>
    </div>
  );
};

export default FollowList;
