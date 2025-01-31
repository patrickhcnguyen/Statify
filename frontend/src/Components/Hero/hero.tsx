import React from 'react';

interface HeroProps {
  title: string;
}

const Hero: React.FC<HeroProps> = ({ title}) => {
  return (
    <div className="w-full h-40 flex flex-col items-center justify-center bg-white">
      <h1 className="pb-2 text-2xl font-bold">
        {title}
      </h1>
      <p className="mt-2 text-lg">View your most listened tracks, artists and genres and switch between 3 different time periods. Your data is updated approximately every day!</p>
    </div>
  );
};

export default Hero;
