import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import Navbar from './Components/Navbar/navbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useUserProfile from './Components/GetUserProfile/getUserProfile';
import Feed from './Components/Community/Community';
import LandingPage from './Components/Landing Page/landingPage';
import TopTracksUI from './Components/TopTracksUI/TopTracksUI';
import RecentlyPlayedUI from './Components/RecentlyPlayedUI/RecentlyPlayedUI';
import TopArtistsUI from './Components/TopArtistsUI/TopArtistsUI';
import TopGenreUI from './Components/TopGenre/topGenreUI';
import backgroundImage from './assets/background/background.svg';

const queryClient = new QueryClient();

// TODO: move functionality to different components

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

const App: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('short_term');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topTracks, setTopTracks] = useState<
    Array<{ name: string; artist: string; albumImageUrl: string; uri: string }>
  >([]);
  const [timeQuery, setTimeQuery] = useState<'Last 4 weeks' | 'Last 6 months' | 'All time' | null>(null);
  const location = useLocation();
  const { userProfile } = useUserProfile();

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
    window.location.href = `${API_URL}/login`;
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/logout`, { credentials: 'include' });
    setIsLoggedIn(false);
  };
  return (
    <QueryClientProvider client={queryClient}>
    <div className="min-h-screen">
      {location.pathname === '/' ? (
        <LandingPage />
      ) : (
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
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
                  <TopTracksUI 
                    timeRange={timeRange} 
                    setTimeRange={setTimeRange}
                    userProfile={userProfile || { id: '', displayName: '' }}
                    topTracks={topTracks}
                    timeQuery={timeQuery}
                  />
                </div>
              } 
            />
            <Route
              path="/track/recent"
              element={
                <RecentlyPlayedUI
                  userProfile={userProfile || { id: '', displayName: '' }}
                />
              }
            />
            <Route 
              path="/artist/top" 
              element={
                <TopArtistsUI 
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  userProfile={userProfile || { id: '', displayName: '' }}
                  timeQuery={timeQuery}
                />
              } 
            />
            <Route 
              path="/genre/top" 
              element={
                <TopGenreUI 
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  timeQuery={timeQuery}
                />
              } 
            />
          </Routes>
        </div>
      )}
    </div>
    </QueryClientProvider>
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
