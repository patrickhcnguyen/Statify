import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

interface UserProfile {
  id: string;
  displayName: string;
}

const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      console.log("Attempting to check login status...");
      try {
        console.log("Sending request to:", `${API_BASE_URL}/check-login-status`);
        
        const response = await fetch(`${API_BASE_URL}/check-login-status`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          console.error("Response not OK:", response.status);
          throw new Error('Failed to check login status');
        }
        
        const data = await response.json();
        console.log("Login status data:", data);
        
        setIsLoggedIn(data.isLoggedIn);
        
        if (data.isLoggedIn && data.user) {
          console.log("Logged in as:", data.user.displayName);
          fetchUserProfile();
        } else {
          console.log("User not logged in according to response");
          setLoading(false);
          setError('User not logged in');
        }
      } catch (err) {
        console.error("Error checking login status:", err);
        setLoading(false);
        setError('Failed to check login status');
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user-profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile({
          id: data.id,
          displayName: data.displayName,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = () => {
    window.location.href = `${API_BASE_URL}/login`;
  };

  return { userProfile, loading, error, isLoggedIn, login };
};

export default useUserProfile;
