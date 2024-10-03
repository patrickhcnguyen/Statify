import React, { useEffect } from 'react';

const Login: React.FC = () => {
  useEffect(() => {
    window.location.href = 'http://localhost:8888/login';
  }, []);

  return (
    <div>
      <h1>Redirecting to Spotify login...</h1>
    </div>
  );
};

export default Login;