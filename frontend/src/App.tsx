import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import Navbar from './Components/Navbar/navbar';
import Box from './Components/Box/box';
import TimeRangeSelector from './Components/TimeRangeSelector/TimeRangeSelector';
import useUserProfile from './Components/GetUserProfile/getUserProfile';
import CreatePlaylist from './Components/CreatePlaylist/createPlaylist';
import Recommender from './Components/Recommender/Recommender';
import Feed from './Components/Community/Community';
import LandingPage from './Components/Landing Page/landingPage';
import TopTracksUI from './Components/TopTracksUI/TopTracksUI';

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
        
        if (!data.isLoggedIn) {
          // Try to refresh the token
          const refreshResponse = await fetch('http://localhost:8888/refresh-token', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (refreshResponse.ok) {
            setIsLoggedIn(true);
            return;
          }
        }
        
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
      console.log('display_name:', userProfile.displayName)
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
    <div className="min-h-screen">
      {location.pathname === '/' ? (
        <LandingPage />
      ) : (
        <>
          <Navbar
            title="Stats For Spotify"
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
          <Routes>
            <Route path="/feed" element={<Feed />} />
            <Route 
              path="/track/top" 
              element={
                <div>
                  <TopTracksUI timeRange={timeRange} />
                  <div className="fixed bottom-4 right-4 flex flex-col gap-4">
                    <TimeRangeSelector
                      currentRange={timeRange}
                      onRangeChange={setTimeRange}
                    />
                    {topTracks.length > 0 && userProfile && (
                      <>
                        <CreatePlaylist 
                          userId={userProfile.id} 
                          displayName={userProfile.displayName} 
                          topTracks={topTracks} 
                          timeQuery={timeQuery} 
                        />
                        <Recommender topTracks={topTracks} />
                      </>
                    )}
                  </div>
                </div>
              } 
            />
            <Route
              path="*"
              element={
                <div className="flex bg-gray-100 h-auto">
                  <Box timeRange={timeRange} />
                  {(location.pathname.includes('/artist/top') ||
                    location.pathname.includes('/genre/top')) && (
                    <TimeRangeSelector
                      currentRange={timeRange}
                      onRangeChange={setTimeRange}
                    />
                  )}
                  {location.pathname.includes('/track/recent') && topTracks.length > 0 && userProfile && (
                    <div className="flex flex-col">
                      <CreatePlaylist 
                        userId={userProfile.id} 
                        displayName={userProfile.displayName} 
                        topTracks={recentTracks} 
                        timeQuery={timeQuery} 
                      />
                      <Recommender topTracks={recentTracks} />
                    </div>
                  )}
                </div>
              }
            />
          </Routes>
        </>
      )}
    </div>
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
