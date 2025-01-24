import React from 'react';
import Navbar from '../../Components/Navbar/navbar';
import backgroundImage from '../../assets/background/background.svg';

const LandingPage: React.FC = () => {
  return (
    <div 
    // fix bg image 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Navbar title={''} isLoggedIn={false} onLogin={function (): void {
        throw new Error('Function not implemented.');
      }} onLogout={function (): void {
        throw new Error('Function not implemented.');
      }} />
      <div className="container mx-auto px-4 h-full flex flex-col justify-start">
        <div className="text-center pt-[20vh]">
          {/* fix welcome message  */}
          <h1 className="text-[150px] leading-none font-bold mb-10 font-picnic text-white 
                       lg:text-[120px] md:text-[90px] sm:text-[60px] xs:text-[40px]">
            Welcome to Statify
          </h1>
          <div className="max-w-[968px] mx-auto">
            <p className="text-[50px] font-pixelify text-white leading-tight
                        lg:text-[40px] md:text-[30px] sm:text-[30px] xs:text-[25px]">
              View your most listened tracks, artists, and genres and switch between 3 different time periods. Your data updates every day!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;