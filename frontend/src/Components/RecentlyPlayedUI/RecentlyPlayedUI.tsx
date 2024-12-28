import React, { useState, useEffect } from 'react';
import backgroundImage from '../../assets/background/background.svg';
import shelfImage from '../../assets/icons/shelf.svg';
import CreatePlaylist from '../CreatePlaylist/createPlaylist';
import Recommender from '../Recommender/Recommender';

interface Track {
  name: string;
  artist: string;
  albumImageUrl: string;
  uri: string;
}

interface RecentlyPlayedUIProps {
  userProfile: {
    id: string;
    displayName: string;
  };
  recentTracks: Array<{ name: string; artist: string; albumImageUrl: string; uri: string }>;
}

const RecentlyPlayedUI: React.FC<RecentlyPlayedUIProps> = ({ 
  userProfile,
  recentTracks,
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const response = await fetch('http://localhost:8888/recently-played', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
          
        const data = await response.json();
        const trackData = data.items.slice(0, 16).map((item: any) => ({
          name: item.track.name,
          artist: item.track.artists[0].name,
          albumImageUrl: item.track.album.images[0]?.url || '',
          uri: item.track.uri,
        }));
        
        setTracks(trackData);
        setSelectedTracks(new Set());
      } catch (error) {
        console.error('Error fetching recent tracks:', error);
        setError('Error fetching recent tracks.');
      }
    };

    fetchRecentTracks();
  }, []);

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
          <div className="absolute bottom-[2.3vw] left-[4%] flex gap-[3.8vw] z-10">
            {shelfTracks.map((track, index) => (
              <div 
                key={startIndex + index} 
                className={`relative cursor-pointer transition-all duration-200 group ${
                  selectedTracks.has(track.uri) 
                    ? 'scale-105' 
                    : 'hover:scale-105'
                }`}
                onClick={() => handleTrackClick(track)}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[8.75vw] min-w-[90px] max-w-[126px] z-20">
                  <p className="font-pixelify text-white text-center text-[1vw] min-text-[12px] max-text-[14px] truncate">
                    {track.name}
                  </p>
                </div>

                <img 
                  src={track.albumImageUrl}
                  alt={track.name}
                  className={`w-[7vw] h-[7vw] min-w-[70px] min-h-[70px] max-w-[120px] max-h-[120px] object-cover z-10 ${
                    selectedTracks.has(track.uri) ? 'ring-2 ring-white' : ''
                  }`}
                />

                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-[8.75vw] min-w-[90px] max-w-[126px] z-20">
                  <p className="font-pixelify text-white text-center text-[0.9vw] min-text-[10px] max-text-[12px] truncate">
                    {track.artist}
                  </p>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 p-2 rounded-lg whitespace-nowrap z-30">
                  <p className="font-pixelify text-white text-[0.9vw] min-text-[12px] max-text-[14px]">
                    {track.name}
                  </p>
                  <p className="font-pixelify text-white/70 text-[0.8vw] min-text-[10px] max-text-[12px] mt-1">
                    {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <img 
            src={shelfImage} 
            alt="shelf" 
            className="w-[50%] min-w-[300px] max-w-[720px] h-auto relative z-0"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="flex-1 bg-cover bg-center bg-no-repeat min-h-screen pb-[20vh]"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute top-[35vh] left-[70%] -translate-x-1/2 flex flex-col items-center">
          <CreatePlaylist 
            userId={userProfile.id} 
            displayName={userProfile.displayName} 
            topTracks={recentTracks} 
            timeQuery={null} 
          />
          <div className="mt-[5vw]">
            <Recommender 
              topTracks={recentTracks} 
              selectedTracks={Array.from(selectedTracks)}
              displayedTracks={tracks}
            />
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

export default RecentlyPlayedUI; 