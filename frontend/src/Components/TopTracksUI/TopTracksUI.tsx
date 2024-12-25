import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/navbar';
import backgroundImage from '../../assets/background/background.svg';
import shelfImage from '../../assets/icons/shelf.svg';
import TimeRangeSelector from '../TimeRangeSelector/TimeRangeSelector';
import CreatePlaylist from '../CreatePlaylist/createPlaylist';

interface Track {
  name: string;
  artist: string;
  albumImageUrl: string;
}

interface TopTracksUIProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  userProfile: {
    id: string;
    displayName: string;
  };
  topTracks: Array<{ name: string; artist: string; albumImageUrl: string; uri: string }>;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null;
}

const TopTracksUI: React.FC<TopTracksUIProps> = ({ 
  timeRange, 
  setTimeRange, 
  userProfile,
  topTracks,
  timeQuery 
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await fetch(`http://localhost:8888/top-tracks?time_range=${timeRange}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
          
        const data = await response.json();
        const trackData = data.items.slice(0, 16).map((item: any) => ({
          name: item.name,
          artist: item.artists[0].name,
          albumImageUrl: item.album.images[0]?.url || '',
        }));
        
        setTracks(trackData);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
        setError('Error fetching top tracks.');
      }
    };

    fetchTopTracks();
  }, [timeRange]);

  const renderShelf = (startIndex: number) => {
    const shelfTracks = tracks.slice(startIndex, startIndex + 4);
    
    return (
      <div className="relative ml-[5%]">
        <div className="relative">
          <div className="absolute bottom-[2vw] left-[4%] flex gap-[3.8vw]">
            {shelfTracks.map((track, index) => (
              <div key={startIndex + index} className="relative">
                <img 
                  src={track.albumImageUrl}
                  alt={track.name}
                  className="w-[7vw] h-[7vw] min-w-[70px] min-h-[70px] max-w-[120px] max-h-[120px] object-cover"
                />
              </div>
            ))}
          </div>
          <img 
            src={shelfImage} 
            alt="shelf" 
            className="w-[50%] min-w-[300px] max-w-[720px] h-auto relative"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title={''} isLoggedIn={false} onLogin={function (): void {
        throw new Error('Function not implemented.');
      }} onLogout={function (): void {
        throw new Error('Function not implemented.');
      }} />
      <div 
        className="flex-1 bg-cover bg-center bg-no-repeat min-h-screen"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <TimeRangeSelector currentRange={timeRange} onRangeChange={setTimeRange} />
        <div className="absolute top-[35vh] left-[70%] -translate-x-1/2">
          <CreatePlaylist 
            userId={userProfile.id} 
            displayName={userProfile.displayName} 
            topTracks={topTracks} 
            timeQuery={timeQuery} 
          />
        </div>
        <div className="flex flex-col">
          <div className="mt-[25vh] space-y-[20vh]">
            {[0, 4, 8, 12].map((startIndex) => (
              <div key={startIndex}>
                {renderShelf(startIndex)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTracksUI; 