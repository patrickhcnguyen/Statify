import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import Navbar from './Components/Navbar/navbar';
import Hero from './Components/Hero/hero';
import Box from './Components/Box/box';
import TimeRangeSelector from './Components/TimeRangeSelector/TimeRangeSelector';
import useUserProfile from './Components/GetUserProfile/getUserProfile';
import CreatePlaylist from './Components/CreatePlaylist/createPlaylist';
import Recommender from './Components/Recommender/Recommender';
import Feed from './Components/Feed/feed'; 

const App: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('short_term');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topTracks, setTopTracks] = useState<
    Array<{ name: string; artist: string; albumImageUrl: string; uri: string }>
  >([]);
  const [recentTracks, setRecentTracks] = useState<
    Array<{ name: string; artist: string; albumImageUrl: string; uri: string }>
  >([]);
  const [timeQuery, setTimeQuery] = useState<'Last 4 weeks' | 'Last 6 months' | 'All time' | null>(null);
  const location = useLocation();
  const { userProfile } = useUserProfile();

  const renderHeroAndBox = location.pathname !== '/feed';

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await fetch(
          `http://localhost:8888/top-tracks?time_range=${timeRange}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Failed to fetch top tracks');

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const tracks = data.items.map((item: any) => ({
            name: item.name,
            artist: item.artists[0].name,
            albumImageUrl: item.album.images[0]?.url || '',
            uri: item.uri,
          }));

          setTopTracks(tracks);
          console.log('Fetched top tracks:', tracks);
        } else {
          console.warn('No top tracks found in response:', data);
        }
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };

    const fetchRecentTracks = async () => {
      try {
        const response = await fetch(`http://localhost:8888/recently-played`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch recent tracks');

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const tracks = data.items.map((item: any) => ({
            name: item.track.name,
            artist: item.track.artists[0].name,
            albumImageUrl: item.track.album.images[1]?.url || '', // Middle image (300x300)
            uri: item.track.uri,
          }));

          setRecentTracks(tracks);
          console.log('Fetched recent tracks:', tracks);
        } else {
          console.warn('No recent tracks found in response:', data);
        }
      } catch (error) {
        console.error('Error fetching recent tracks:', error);
      }
    };

    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:8888/check-login-status', {
          credentials: 'include',
        });
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    };

    fetchTopTracks();
    fetchRecentTracks();
    checkLoginStatus();
  }, [timeRange]);

  useEffect(() => {
    if (userProfile) {
      console.log('User ID:', userProfile.id);
    }
  }, [userProfile]);

  useEffect(() => {
    if (timeRange === 'short_term') {
      setTimeQuery('Last 4 weeks');
    } else if (timeRange === 'medium_term') {
      setTimeQuery('Last 6 months');
    } else if (timeRange === 'long_term') {
      setTimeQuery('All time');
    }
  }, [timeRange]);

  const handleLogin = () => {
    window.location.href = 'http://localhost:8888/login';
  };

  const handleLogout = async () => {
    await fetch('http://localhost:8888/logout', { credentials: 'include' });
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar
        title="Stats For Spotify"
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/feed" element={<Feed />} />
      </Routes>
      {renderHeroAndBox && ( // added conditional rendering so that /feed doesnt render hero or box
        <>
          <Hero
            title="Welcome to Spotify Stats"
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
          <div className="flex bg-gray-100 h-auto">
            <Box timeRange={timeRange} />
            {(location.pathname.includes('/track/top') ||
              location.pathname.includes('/artist/top') ||
              location.pathname.includes('/genre/top')) && (
              <div className="flex flex-col">
                <TimeRangeSelector
                  currentRange={timeRange}
                  onRangeChange={setTimeRange}
                />
                {location.pathname.includes('/track/top') && recentTracks.length > 0 && userProfile && (
                  <div className="flex flex-col">
                    <CreatePlaylist userId={userProfile.id} topTracks={topTracks} timeQuery={timeQuery} />
                    <Recommender topTracks={topTracks} />
                  </div>
                )}
              </div>
            )}
            {location.pathname.includes('/track/recent') && topTracks.length > 0 && userProfile && (
              <div className="flex flex-col">
                <CreatePlaylist userId={userProfile.id} topTracks={recentTracks} timeQuery={timeQuery} />
                <Recommender topTracks={recentTracks} />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

const Main: React.FC = () => (
  <Router>
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
  </Router>
);

export default Main;
