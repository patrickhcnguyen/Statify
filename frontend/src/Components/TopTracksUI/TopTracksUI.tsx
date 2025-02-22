import React, { useState, useEffect } from 'react';
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
          uri: item.uri,
        }));
        
        setTracks(trackData);
        setSelectedTracks(new Set());
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
    // fix shelf track sizing 
    const shelfTracks = tracks.slice(startIndex, startIndex + 4);
      return (
      <div className="relative">
        <div className="relative">
          <div className="absolute bottom-[2.19rem] left-10 flex gap-16 z-10">
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
                {/* track name */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 z-20">
                  <p className="font-pixelify text-white text-center text-[14px] truncate">
                    {track.name}
                  </p>
                </div>

                {/* album image */}
                <img 
                  src={track.albumImageUrl}
                  alt={track.name}
                  className={`w-28 aspect-square object-cover z-10 ${
                    selectedTracks.has(track.uri) ? 'ring-2 ring-white' : ''
                  }`}
                />

                {/* artist name */}
                <div className="absolute top-[7.5rem] left-1/2 -translate-x-1/2 w-24 z-20">
                  <p className="font-pixelify text-white text-center text-[14px] truncate">
                    {track.artist}
                  </p>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                                bg-black/80 p-2 rounded-lg whitespace-nowrap z-30">
                  <p className="font-pixelify text-white text-[14px]">
                    {track.name}
                  </p>
                  <p className="font-pixelify text-white/70 text-[14px] mt-1">
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

  const renderMobileShelf = (startIndex: number) => {
    const shelfTracks = tracks.slice(startIndex, startIndex + 2);
    return (
      <div className="relative">
        <div className="absolute bottom-[19px] left-1/2 -translate-x-1/2 flex gap-[25vw] z-10 w-full justify-center">
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
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[30vw] z-20">
                <p className="font-pixelify text-white text-center text-[14px] truncate">
                  {track.name}
                </p>
              </div>

              <img 
                src={track.albumImageUrl}
                alt={track.name}
                className={`w-[25vw] h-[25vw] min-w-[90px] min-h-[90px] object-cover z-10 ${
                  selectedTracks.has(track.uri) ? 'ring-2 ring-white' : ''
                }`}
              />

              <div className="absolute bottom-[-23px] left-1/2 -translate-x-1/2 w-[30vw] z-20">
                <p className="font-pixelify text-white text-center text-[12px] truncate">
                  {track.artist}
                </p>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                            bg-black/80 p-2 rounded-lg whitespace-nowrap z-30">
                <p className="font-pixelify text-white text-[12px]">
                  {track.name}
                </p>
                <p className="font-pixelify text-white/70 text-[10px] mt-1">
                  {track.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
        <img 
          src={shelfImage} 
          alt="shelf" 
          className="w-[80%] min-w-[300px] max-w-[720px] h-auto relative z-0 mx-auto"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile section */}
      <div className="md:hidden">
        <div className="flex justify-center"> 
          <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
        </div>
        {/* shelves */}
        <div className="flex flex-col space-y-48 mt-[30rem] mb-[10rem]">
          {[0, 2, 4, 6, 8, 10, 12, 14].map((startIndex) => (
            <div key={startIndex}>
              {renderMobileShelf(startIndex)}
            </div>
          ))}
        </div>
        {/* create playlist */}
        <div className="flex justify-center mt-[-6rem] mb-[2rem]">
          <CreatePlaylist 
            userId={userProfile.id} 
            displayName={userProfile.displayName} 
            topTracks={topTracks} 
            timeQuery={timeQuery} 
          />
        </div>
        {/* recommender */}
        <div className="flex justify-center mb-8">
          <Recommender 
            topTracks={topTracks} 
            selectedTracks={Array.from(selectedTracks)}
            displayedTracks={tracks}
          />
        </div>
      </div>

      {/* Desktop section */}
      <div className="hidden md:block">
  <div 
    className="flex-1 bg-cover bg-center bg-no-repeat min-h-screen relative"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  > 
    <div className="absolute top-16 right-[21rem] flex flex-col items-center">
      <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
      <div className="absolute top-52">
        <CreatePlaylist 
          userId={userProfile.id} 
          displayName={userProfile.displayName} 
          topTracks={topTracks} 
          timeQuery={timeQuery} 
        />
      </div>
      <div className="absolute top-96">
        <Recommender 
          topTracks={topTracks} 
          selectedTracks={Array.from(selectedTracks)}
        displayedTracks={tracks}
        />
      </div>
    </div>
        {/* Rendering shelves */}
          <div className="flex flex-col ml-4">
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
    </div>
  );
};

export default TopTracksUI; 