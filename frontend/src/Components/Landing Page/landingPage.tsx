import React from 'react';
import Navbar from '../../Components/Navbar/navbar';
import backgroundImage from '../../assets/background/background.svg';

const LandingPage: React.FC = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Navbar title={''} isLoggedIn={false} 
         onLogin={function (): void {
      }} onLogout={function (): void {
      }} />
      <div className="container mx-auto px-4 h-full flex flex-col justify-start">
        <div className="text-center pt-20 md:pt-40">
          <h1 className="text-[80px] leading-none font-bold mb-10 font-picnic text-white 
                        md:text-[90px] lg:text-[150px]">
            Welcome to Statify
          </h1>
          <div className="max-w-[968px] mx-auto">
            <p className="text-[45px] font-pixelify text-white leading-tight
                          lg:text-[40px] md:text-[30px]">
              View your most listened tracks, artists, and genres and switch between 3 different time periods. Your data updates every day!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;