import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/navbar';
import backgroundImage from '../../assets/background/background.svg';
import shelfImage from '../../assets/icons/shelf.svg';
import TimeRangeSelector from '../TimeRangeSelector/TimeRangeSelector';
import CreatePlaylist from '../CreatePlaylist/createPlaylist';
import Recommender from '../Recommender/Recommender';

interface Track {
  name: string;
  artist: string;
  albumImageUrl: string;
  uri: string;
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
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

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

  const handleTrackClick = (track: Track) => {
    const newSelection = new Set(selectedTracks);
    if (newSelection.has(track.uri)) {
      newSelection.delete(track.uri);
    } else if (newSelection.size < 5) {
      newSelection.add(track.uri);
    }
    setSelectedTracks(newSelection);
  };

  const renderShelf = (startIndex: number) => {
    const shelfTracks = tracks.slice(startIndex, startIndex + 4);
    
    return (
      <div className="relative ml-[5%]">
        <div className="relative">
          <div className="absolute bottom-[2vw] left-[4%] flex gap-[3.8vw]">
            {shelfTracks.map((track, index) => (
              <div 
                key={startIndex + index} 
                className={`relative cursor-pointer transition-all duration-200 ${
                  selectedTracks.has(track.uri) 
                    ? 'scale-110 ring-4 ring-white/50' 
                    : 'hover:scale-105'
                }`}
                onClick={() => handleTrackClick(track)}
              >
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
        <div className="absolute top-[35vh] left-[70%] -translate-x-1/2 flex flex-col items-center">
          <CreatePlaylist 
            userId={userProfile.id} 
            displayName={userProfile.displayName} 
            topTracks={topTracks} 
            timeQuery={timeQuery} 
          />
          <div className="mt-[5vw]">
            <Recommender topTracks={topTracks} />
          </div>
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