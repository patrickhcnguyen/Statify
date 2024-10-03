import React, { useEffect } from 'react';

const Logout: React.FC = () => {
  useEffect(() => {
    window.location.href = 'http://localhost:8888/logout';
  }, []);

  return (
    <div>
      <h1>Logging out...</h1>
    </div>
  );
};

export default Logout;