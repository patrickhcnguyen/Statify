import React, { useState } from 'react';
import useMusicData from "../../hooks/useMusicData";
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
}

const RecentlyPlayedUI: React.FC<RecentlyPlayedUIProps> = ({ 
  userProfile,
}) => {
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const { musicData, isLoading, error } = useMusicData('recently-played');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-white font-pixelify text-2xl">Loading...</p>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 font-pixelify text-2xl">Error loading tracks</p>
    </div>;
  }

  const tracks = Array.isArray(musicData) ? musicData : [];

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
    if (!tracks.length) return null;
    
    const shelfTracks = tracks.slice(startIndex, startIndex + 4);
    if (!shelfTracks.length) return null;

    return (
      <div className="relative">
        <div className="relative">
          <div className="absolute bottom-[2.19rem] left-10 flex gap-16 z-10">
            {shelfTracks.map((track: Track, index: number) => (
              <div 
                key={`${startIndex}-${index}`}
                className={`relative cursor-pointer transition-all duration-200 group ${
                  selectedTracks.has(track.uri) 
                    ? 'scale-105' 
                    : 'hover:scale-105'
                }`}
                onClick={() => handleTrackClick(track)}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 z-20">
                  <p className="font-pixelify text-white text-center text-[14px] truncate">
                    {track.name}
                  </p>
                </div>

                <img 
                  src={track.albumImageUrl}
                  alt={track.name}
                  className={`w-28 aspect-square object-cover z-10 ${
                    selectedTracks.has(track.uri) ? 'ring-2 ring-white' : ''
                  }`}
                />

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
    if (!tracks.length) return null;
    
    const shelfTracks = tracks.slice(startIndex, startIndex + 2);
    if (!shelfTracks.length) return null;

    return (
      <div className="relative">
        <div className="absolute bottom-[19px] left-1/2 -translate-x-1/2 flex gap-[25vw] z-10 w-full justify-center">
          {shelfTracks.map((track: Track, index: number) => (
            <div 
              key={`${startIndex}-${index}`}
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

  if (!tracks.length) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-white font-pixelify text-2xl">No recently played tracks found</p>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile section */}
      <div className="md:hidden">
        {/* shelves */}
        <h1 className="text-center mt-10 text-white text-[48px] font-pixelify">
          Recently Played
        </h1>
        <div className="flex flex-col space-y-48 mt-[20rem] mb-[10rem]">
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
            topTracks={musicData}
            timeQuery={null}
          />
        </div>
        {/* recommender */}
        <div className="flex justify-center mb-8">
          <Recommender 
            topTracks={musicData}
            selectedTracks={Array.from(selectedTracks)}
            displayedTracks={tracks}
          />
        </div>
      </div>

      {/* Desktop section */}
      <div className="hidden md:block">
        <div 
          className="flex-1 bg-cover bg-center bg-no-repeat min-h-screen relative"
        >
          <div className="absolute top-16 right-[21rem] flex flex-col items-center">
            <div className="flex flex-col items-center">
              <div className="absolute top-52">
                <CreatePlaylist 
                  userId={userProfile.id} 
                  displayName={userProfile.displayName} 
                  topTracks={musicData}
                  timeQuery={null}
                />
              </div>
              
              <div className="absolute top-96">
                <Recommender 
                  topTracks={musicData}
                  selectedTracks={Array.from(selectedTracks)}
                  displayedTracks={tracks}
                />
              </div>
            </div>
          </div>
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

export default RecentlyPlayedUI; 