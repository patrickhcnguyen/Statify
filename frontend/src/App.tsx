import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/navbar';
import Hero from './Components/Hero/hero';
import Box from './Components/Box/box';
import TimeRangeSelector from './Components/TimeRangeSelector/TimeRangeSelector';

const App: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('short_term');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const location = useLocation(); 

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:8888/check-login-status', {
          credentials: 'include',
        });

        const data = await response.json();
        console.log("Login Status:", data.isLoggedIn);
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

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
      <Hero title="Welcome to Stats For Spotify" isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />
      <div className="flex bg-gray-100">
        <Box timeRange={timeRange} /> 
        {location.pathname.includes('/track/top') || location.pathname.includes('/artist/top') || location.pathname.includes('/genre/top') ? (
          <div className="flex flex-col">
            <TimeRangeSelector
              currentRange={timeRange}
              onRangeChange={handleTimeRangeChange}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

const Main: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default Main;
