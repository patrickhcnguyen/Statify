import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/navbar';
import backgroundImage from '../../assets/background/background.svg';
import shelfImage from '../../assets/icons/shelf.svg';

interface Track {
  name: string;
  artist: string;
  albumImageUrl: string;
}

interface TopTracksUIProps {
  timeRange: string;
}

const TopTracksUI: React.FC<TopTracksUIProps> = ({ timeRange }) => {
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
      <div className="relative">
        <img 
          src={shelfImage} 
          alt="shelf" 
          className="w-[720px] h-[35px]"
        />
        <div className="absolute -top-[100px] left-[60px] flex space-x-[50px]">
          {shelfTracks.map((track, index) => (
            <div key={startIndex + index} className="relative">
              <img 
                src={track.albumImageUrl}
                alt={track.name}
                className="w-[100px] h-[100px] object-cover rounded-full"
              />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-bold text-xl">
                {startIndex + index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar title={''} isLoggedIn={false} onLogin={function (): void {
        throw new Error('Function not implemented.');
      }} onLogout={function (): void {
        throw new Error('Function not implemented.');
      }} />
      <div 
        className="h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="flex flex-col items-center">
          <div className="mt-[302px] space-y-[210px]">
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