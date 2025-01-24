import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom'; 
import smallStar from '../../assets/icons/smallStar.svg';

interface NavbarProps {
  title: string;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:8888/check-login-status', {
          credentials: 'include'
        });
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMenuOpen(true);
    } else {
      const timer = setTimeout(() => {
        setIsMenuOpen(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const [isClick, setIsClick] = useState(false);

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      window.location.href = 'http://localhost:8888/login';
    }
  };

  const handleLogoutClick = async () => {
    try {
      await fetch('http://localhost:8888/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-center bg-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - always visible */}
          <Link to="/" className="text-[24px] font-picnic text-white">
            Statify
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/track/top" className="text-[25px] font-pixelify text-white">Top Tracks</Link>
            <img src={smallStar} alt="star" className="w-6 h-6" />
            <Link to="/artist/top" className="text-[25px] font-pixelify text-white">Top Artists</Link>
            <img src={smallStar} alt="star" className="w-6 h-6" />
            <Link to="/genre/top" className="text-[25px] font-pixelify text-white">Top Genres</Link>
            <img src={smallStar} alt="star" className="w-6 h-6" />
            <Link to="/track/recent" className="text-[25px] font-pixelify text-white">Recently Played</Link>
            <img src={smallStar} alt="star" className="w-6 h-6" />
            <Link to="/feed" className="text-[25px] font-pixelify text-white">Community</Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-8 w-8" />
            ) : (
              <Bars3Icon className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay - Always rendered but transformed */}
        <div className={`
          md:hidden fixed top-16 left-0 right-0 
          bg-[#53648f] backdrop-blur-sm p-4 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          h-screen
        `}>
          <div className="flex flex-col space-y-8 pt-8">
            <Link to="/track/top" className="text-[25px] font-pixelify text-white hover:text-purple-300 transition-colors">Top Tracks</Link>
            <Link to="/artist/top" className="text-[25px] font-pixelify text-white hover:text-purple-300 transition-colors">Top Artists</Link>
            <Link to="/genre/top" className="text-[25px] font-pixelify text-white hover:text-purple-300 transition-colors">Top Genres</Link>
            <Link to="/track/recent" className="text-[25px] font-pixelify text-white hover:text-purple-300 transition-colors">Recently Played</Link>
            <Link to="/feed" className="text-[25px] font-pixelify text-white hover:text-purple-300 transition-colors">Community</Link>
            {isLoggedIn ? (
              <button
                className="text-[25px] font-pixelify text-white hover:text-purple-300 transition-colors text-left"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            ) : (
              <button
                className="text-[25px] font-pixelify text-white hover:text-purple-300 transition-colors text-left"
                onClick={handleLoginClick}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
