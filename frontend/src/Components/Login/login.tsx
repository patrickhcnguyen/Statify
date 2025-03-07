import React, { useEffect } from 'react';
import { API_BASE_URL } from '../../config';

const Login: React.FC = () => {
  useEffect(() => {
    console.log('Redirecting to:', `${API_BASE_URL}/login`);
    window.location.href = `${API_BASE_URL}/login`;
  }, []);

  return (
    <div>
      <h1>Redirecting to Spotify login...</h1>
    </div>
  );
};

export default Login;