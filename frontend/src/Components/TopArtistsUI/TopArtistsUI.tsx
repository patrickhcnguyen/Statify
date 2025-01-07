import React from 'react';
import backgroundImage from '../../assets/background/background.svg';
import journalImage from '../../assets/background/journal.svg';
import starImage from '../../assets/icons/star.svg';
import buttonImage from '../../assets/icons/button.svg';

interface TopArtistsUIProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  userProfile: {
    id: string;
    displayName: string;
  };
  topArtists: Array<{ 
    id: string; 
    name: string; 
    albumImageUrl: string;
    genres: string[];
    followers: number;
    randomAlbumImage: string;
    isFollowed: boolean;
  }>;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null;
}

const TopArtistsUI: React.FC<TopArtistsUIProps> = ({ topArtists }) => {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={journalImage} 
          alt="Journal"
          className="w-[100%] h-[75%] max-w-[995px] max-h-[782px]"
        />
        {topArtists[0] && (
          <>
            <img
              src={topArtists[0].albumImageUrl} // artist image
              alt={topArtists[0].name}
              className="absolute w-[13%] max-w-[175px] aspect-square"
              style={{ left: '22%', top: '17%' }}
            />
            <img
              src={topArtists[0].randomAlbumImage}
              alt="Random Album"
              className="absolute w-[13%] max-w-[175px] aspect-square"
              style={{ left: '36%', top: '46%' }}
            />
            <div className="absolute" style={{ left: '37%', top: '18%' }}>
              <span className="font-pixelify text-[48px] text-black">#{1}</span>
              <span 
                className="font-pixelify text-[20px] text-black ml-4"
                style={{ transform: 'translateY(16px)', display: 'inline-block' }}
              >
                {topArtists[0].name}
              </span>
              <div 
                className="font-pixelify text-[20px] text-black"
                style={{ 
                  marginTop: '15%',
                  width: '100%',
                  maxWidth: '186px',
                  minHeight: '112px',
                  marginLeft: '-30px'
                }}
              >
                {`${topArtists[0].name} likes to make ${topArtists[0].genres?.join(', ')}.`}
              </div>
            </div>
            <div 
                className="font-pixelify text-[20px] text-black absolute"
                style={{ 
                  left: '21%', 
                  top: '43.7%',  
                  width: '15%',
                  minHeight: '112px'
                }}
              >
                {`They have ${topArtists[0]?.followers.toLocaleString()} followers${topArtists[0]?.isFollowed ? " and you're one of them!" : '!'}`}
              </div>
            <img
              src={starImage}
              alt="Star 1"
              className="absolute w-[4%] max-w-[75px] aspect-square"
              style={{ left: '44%', top: '39.5%' }}
            />
            <img
              src={starImage}
              alt="Star 2"
              className="absolute w-[4%] max-w-[75px] aspect-square"
              style={{ left: '30%', top: '51.8%' }}
            />
            <img
              src={buttonImage}
              alt="Button 1"
              className="absolute w-[3%] max-w-[75px] aspect-square"
              style={{ left: '33%', top: '60%' }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TopArtistsUI;