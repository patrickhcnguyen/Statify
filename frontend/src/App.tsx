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
import TestDataPage from './pages/TestDataPage';

const queryClient = new QueryClient();

// TODO: move functionality to different components

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

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
  const [topArtists, setTopArtists] = useState<Array<{ 
    id: string; 
    name: string; 
    albumImageUrl: string;
    genres: string[];
    followers: number;
    randomAlbumImage: string;
    isFollowed: boolean;
    // monthlyListeners?: number;
    topTracks?: Array<{
        name: string;
        uri: string;
    }>;
    recommendedTracks?: Array<{
        name: string;
        uri: string;
    }>;
  }>>([]);



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

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const response = await fetch(
          `http://localhost:8888/top-artists?time_range=${timeRange}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Failed to fetch top artists');

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const artists = data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            albumImageUrl: item.images[0]?.url || '',
            genres: item.genres || [],
            followers: item.followers.total || 0,
            randomAlbumImage: item.randomAlbumImage || '',
            isFollowed: item.isFollowed || false,
            monthlyListeners: item.monthlyListeners || 0,
            topTracks: item.topTracks || [],
            recommendedTracks: item.recommendedTracks || []
          }));

          setTopArtists(artists);
          console.log('Fetched top artists:', artists);
        } else {
          console.warn('No top artists found in response:', data);
        }
      } catch (error) {
        console.error('Error fetching top artists:', error);
      }
    };

    fetchTopArtists();
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
                  recentTracks={recentTracks}
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
                  topArtists={topArtists}
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
            <Route path="/test" element={<TestDataPage />} />
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
