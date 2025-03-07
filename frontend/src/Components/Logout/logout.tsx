import React, { useEffect } from 'react';
import { API_BASE_URL } from '../../config';

const Logout: React.FC = () => {
  useEffect(() => {
    window.location.href = `${API_BASE_URL}/logout`;
  }, []);

  return (
    <div>
      <h1>Logging out...</h1>
    </div>
  );
};

export default Logout;