import React from 'react';

interface HeroProps {
  title: string;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const Hero: React.FC<HeroProps> = ({ title, isLoggedIn, onLogin, onLogout }) => {
  return (
    <div className="w-full h-40 flex flex-col items-center justify-center bg-white">
      <h1 className="pb-2 text-2xl font-bold">
        {title}
      </h1>
      {isLoggedIn ? (
        <p className="mt-2 text-lg">View your most listened tracks, artists and genres and switch between 3 different time periods. Your data is updated approximately every day!</p>
      ) : (
        <p className="mt-2 text-lg">
          Please login
        </p>
      )}
    </div>
  );
};

export default Hero;
