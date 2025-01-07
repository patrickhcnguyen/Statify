import React, { useState, useEffect } from 'react';
import backgroundImage from '../../assets/background/background.svg';
import journalImage from '../../assets/icons/journal.svg';
import arrowImage from '../../assets/icons/arrow.svg';
import buttonImage from '../../assets/icons/button.svg';
import cardboardCatImage from '../../assets/icons/cardboardCat.svg';
import heartImage from '../../assets/icons/heart.svg';
import ribbonImage from '../../assets/icons/ribbon.svg';
import shelfImage from '../../assets/icons/shelf.svg';
import TimeRangeSelector from '../TimeRangeSelector/TimeRangeSelector';

interface Artist {
  id: string;
  name: string;
  albumImageUrl: string;
}

interface TopArtistsUIProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  userProfile: {
    id: string;
    displayName: string;
  };
  topArtists: Array<{ id: string; name: string; albumImageUrl: string }>;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null;
}

const TopArtistsUI: React.FC<TopArtistsUIProps> = ({
  timeRange,
  setTimeRange,
  userProfile,
  topArtists,
  timeQuery,
}) => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="container mx-auto px-4 py-8">
        <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
        
        <div className="mt-8">
          <h2 className="text-white text-2xl font-bold mb-4">
            Your Top Artists - {timeQuery}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topArtists.map((artist, index) => (
              <div
                key={artist.id}
                className="relative"
                style={{
                  backgroundImage: `url(${shelfImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'bottom',
                  padding: '10px',
                }}
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={artist.albumImageUrl}
                    alt={artist.name}
                    className="object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-white font-bold truncate">{artist.name}</h3>
                  <p className="text-gray-300 text-sm">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopArtistsUI;