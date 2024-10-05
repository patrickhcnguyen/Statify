import React from 'react';
import { useLocation } from 'react-router-dom';
import { TopArtists, TopTracks, TopGenres, Recent } from '../TopData/topdata';

interface BoxProps {
  timeRange: string; 
}

const Box: React.FC<BoxProps> = ({ timeRange }) => { 
  const location = useLocation();
  const pathname = location.pathname;

  const renderComponent = () => {
    switch (pathname) {
      case '/track/top':
        return <TopTracks timeRange={timeRange} />; 
      case '/artist/top':
        return <TopArtists timeRange={timeRange} />; 
      case '/genre/top':
        return <TopGenres timeRange={timeRange} />; 
      case '/track/recent':
        return <Recent />;
      default:
        return <div>Select a category to view the stats.</div>;
    }
  };
  
  return (
    <div className="border-black border-2 p-4 w-3/5 bg-gray-100 ml-12 mt-4 drop-shadow-2xl">
      <h1 className="text-lg font-bold">Music Stats</h1>
      {renderComponent()}
    </div>
  );
};

export default Box;
