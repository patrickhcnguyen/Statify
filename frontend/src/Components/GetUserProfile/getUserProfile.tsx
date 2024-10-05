import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
}

const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:8888/user-profile', {
          method: 'GET',
          credentials: 'include', // Access cookies properly
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile(data); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { userProfile, loading, error };
};

export default useUserProfile;
