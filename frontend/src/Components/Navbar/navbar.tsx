import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom'; 
import smallStar from '../../assets/icons/smallStar.svg';

interface NavbarProps {
  title: string;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      window.location.href = 'http://localhost:8888/login';
    }
  };

  const handleLogoutClick = async () => {
    await fetch('http://localhost:8888/logout', {
      method: 'GET',
      credentials: 'include',
    });
    onLogout();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-8">
          <Link to="/" className="text-[24px] font-picnic text-white flex items-center">
            Statify
          </Link>
          
          <Link to="/track/top" className="text-[25px] font-pixelify text-white flex items-center">
            Top Tracks
          </Link>
          <img src={smallStar} alt="star" className="w-6 h-6" />
          
          <Link to="/artist/top" className="text-[25px] font-pixelify text-white flex items-center">
            Top Artists
          </Link>
          <img src={smallStar} alt="star" className="w-6 h-6" />
          
          <Link to="/genre/top" className="text-[25px] font-pixelify text-white flex items-center">
            Top Genres
          </Link>
          <img src={smallStar} alt="star" className="w-6 h-6" />
          
          <Link to="/track/recent" className="text-[25px] font-pixelify text-white flex items-center">
            Recently Played
          </Link>
          <img src={smallStar} alt="star" className="w-6 h-6" />
          
          <Link to="/feed" className="text-[25px] font-pixelify text-white flex items-center">
            Community
          </Link>
          
          <div className="relative flex items-center">
            <button
              className="flex items-center text-[25px] font-pixelify text-white"
              onClick={toggleDropdown}
            >
              {isLoggedIn ? 'Account' : 'Login'}
              <ChevronDownIcon className="w-6 h-6 ml-1" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 py-2 px-4 bg-black bg-opacity-50 rounded-lg">
                {isLoggedIn ? (
                  <button
                    className="text-[20px] text-white font-pixelify hover:text-blue-300 transition-colors whitespace-nowrap"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    className="text-[20px] text-white font-pixelify hover:text-blue-300 transition-colors whitespace-nowrap"
                    onClick={handleLoginClick}
                  >
                    Login with Spotify
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
