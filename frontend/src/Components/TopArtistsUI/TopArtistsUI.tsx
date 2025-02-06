import React, { useState, useEffect } from 'react';
import backgroundImage from '../../assets/background/background.svg';
import journalImage from '../../assets/background/journal.svg';
import starImage from '../../assets/icons/star.svg';
import buttonImage from '../../assets/icons/button.svg';
import arrowImage from '../../assets/icons/arrow.svg';
import jellyfishImage from '../../assets/icons/jellyfish.svg';
import heartImage from '../../assets/icons/heart.svg';
import ribbonImage from '../../assets/icons/ribbon.svg';
import cardboardCatImage from '../../assets/icons/cardboardCat.svg';
import pageFlipLeft from '../../assets/icons/pageFlipLeft.svg';
import pageFlipRight from '../../assets/icons/pageFlipRight.svg';

// mobile images
import journalMobile from '../../assets/background/journal mobile.png';
import jellyfishMobile from '../../assets/icons/jellyfish mobile.svg';
import ribbonMobile from '../../assets/icons/ribbon mobile.svg';
import cardboardCatMobile from '../../assets/icons/cardboardCat mobile.svg';

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
    // monthlyListeners?: number;
    topTracks?: Array<{
      name: string;
      uri: string;
    }>;
    recommendedTracks?: Array<{
      name: string;
      uri: string;
    }>;
  }>;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null;
}

const TopArtistsUI: React.FC<TopArtistsUIProps> = ({ topArtists, timeRange, setTimeRange }) => {
  const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<Array<{name: string; uri: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchRecommendations = async (artistId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8888/artist-recommendations/${artistId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const currentArtist = topArtists[currentArtistIndex];
    if (currentArtist?.id) {
      fetchRecommendations(currentArtist.id);
    }
  }, [currentArtistIndex, topArtists]);

  const handlePrevArtist = () => {
    if (currentArtistIndex > 0) {
      setCurrentArtistIndex(prev => prev - 1);
    }
  };

  const handleNextArtist = () => {
    if (currentArtistIndex < 14) {
      setCurrentArtistIndex(prev => prev + 1);
    }
  };

  const currentArtist = topArtists[currentArtistIndex];

  const formatGenres = (genres: string[] = []) => {
    if (!genres || !currentArtist) return { displayText: '', hasMore: false };
    
    const text = `${currentArtist.name} likes to make ${genres.join(', ')}.`;
    if (!isExpanded && text.length > 50) {
      return {
        displayText: text.slice(0, 50) + '...',
        hasMore: true
      };
    }
    return {
      displayText: text,
      hasMore: text.length > 50
    };
  };

  const { displayText, hasMore } = formatGenres(currentArtist?.genres);

  // Base positions
  const positions = {
    stars: isExpanded ? "28%" : "18%",
    randomAlbum: isExpanded ? "76%" : "66%",
    arrows: isExpanded ? "60%" : "50%",
    recommendations: isExpanded ? "76%" : "66%"
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative overflow-x-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }} >

      {/* mobile view */}
      {currentArtist && (
        <div className="block md:hidden overflow-x-hidden w-full">
          {/* journal image */}
          <div className="relative pt-10 min-h-screen overflow-x-hidden">
            <img 
              src={journalMobile}
              alt="Journal"
              className="w-full h-auto object-contain"
            />
            {/* artist image */}
            <div className="absolute top-24 left-2 flex items-center gap-4">
              {/* Artist image */}
              <img
                src={currentArtist.albumImageUrl}
                alt={currentArtist.name}
                className="w-[200px] aspect-square"
              />
              {/* artist genre list */}
              <div className="font-pixelify text-[18px] text-black">
                {currentArtist.name} likes to make {currentArtist.genres.join(', ')}
              </div>
            </div>
            {/* artist number */}
            <div className="font-pixelify text-[48px] text-black absolute left-56 top-16">
              #{currentArtistIndex + 1}
            </div>
            {/* artist name */}
            <div className="font-pixelify text-[32px] text-black absolute left-[19rem] top-24" >
              {currentArtist.name}
            </div>
          </div>
          {/* followers */}
          <div className="font-pixelify text-[18px] text-black absolute left-2 top-[19rem] w-40">
            {`They have ${currentArtist.followers.toLocaleString()} followers${currentArtist.isFollowed ? " and you're one of them!" : '!'}`}
          </div>
          {/* album image */}
          <div className="absolute left-40 top-[22rem]">
            <img 
              src={currentArtist.randomAlbumImage}
              alt={currentArtist.name}
              className="w-[200px] aspect-square"
            />
          </div>
          {/* left star  and button*/}
          <div className="absolute left-2 top-[26rem]">
            <img 
              src={starImage}
              alt="Star"
              className="w-[75px] aspect-square"
            />
            <img 
              src={buttonImage}
              alt="Button"
              className="w-[50px] aspect-square relative left-14 top-10"
            />
          </div>
          {/* right star */}
          <div className="absolute right-2 top-[18rem]">
            <img 
              src={starImage}
              alt="Star"
              className="w-[75px] aspect-square"
            />
          </div>
          {/*  container for jellyfish + top 5 songs + heart + ribbon + cardboard cat*/}
          <div className="absolute top-[32rem]">
            <div className="relative">
              <img 
                src={jellyfishMobile}
                alt="Jellyfish"
                className='relative pt-40'
              />
              <div className="absolute top-48 left-5 flex items-center justify-center">
                <span className="font-pixelify text-[18px] text-black text-center w-[50%]">
                  Their top 5 songs are
                </span>
              </div>
              {/* top 5 songs */}
              <div className="absolute top-52 left-[16rem] flex items-center justify-center">
                <span className="font-pixelify text-[18px] text-black text-center">
                  {currentArtist.topTracks?.slice(0, 5).map((track, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-[18px] font-bold">{index + 1}.</span>
                      <a 
                        href={`https://open.spotify.com/track/${track.uri.split(':')[2]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[18px] hover:text-green-700 transition-colors duration-200 truncate max-w-[150px]"
                      >
                        {track.name}
                      </a>
                    </div>
                  ))}
                </span>
              </div>
              {/* heart */}
              <div className="absolute top-[28rem] left-32">
                <img 
                  src={heartImage}
                  alt="Heart"
                  className="w-[50px] aspect-square"
                />
              </div>
              {/* ribbon */}
              <div className="relative bottom-12 left-8">
                <img 
                  src={ribbonMobile}
                  alt="Ribbon"
                  className="w-[275px] aspect-square"
                />
              </div>
              {/* cardboard cat */}
              <div className="relative bottom-28 left-52">
                <div className="absolute">
                  <img 
                    src={cardboardCatImage}
                    alt="Cardboard Cat"
                    className="w-[225px] aspect-square"
                  />
                  <div className="relative flex bottom-36 justify-center">
                    <span className="font-pixelify text-[16px] text-black text-center max-w-[120px]">
                      Some more songs you'd like by them!
                    </span>
                  </div>
                  {/* song recommendations */}
                  {/* move to be centered with text in cat */}
                  <div className="absolute right-60 top-14">
                    <span className="font-pixelify text-[16px] text-black text-center">
                      {recommendations.map((track, index) => (
                        <div key={track.uri} className="flex flex-col items-start gap-2">
                          <a 
                            href={`https://open.spotify.com/track/${track.uri.split(':')[2]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black hover:text-green-900 cursor-pointer truncate max-w-[120px]"
                          >
                            {index + 1}. {track.name}
                          </a>
                        </div>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* switch between time periods */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 mb-8">
            <button 
              className={`font-pixelify text-[16px] hover:text-green-700 transition-colors duration-200 ${timeRange === 'short_term' ? 'text-green-700' : 'text-black'}`}
              onClick={() => setTimeRange('short_term')}
            >
              Last 4 weeks
            </button>

            <button 
              className={`font-pixelify text-[16px] hover:text-green-700 transition-colors duration-200 ${timeRange === 'medium_term' ? 'text-green-700' : 'text-black'}`}
              onClick={() => setTimeRange('medium_term')}
            >
              Last 6 months
            </button>

            <button 
              className={`font-pixelify text-[16px] hover:text-green-700 transition-colors duration-200 ${timeRange === 'long_term' ? 'text-green-700' : 'text-black'}`}
              onClick={() => setTimeRange('long_term')}
            >
              All Time
            </button>
          </div>
          {/* buttons to switch between pages - mobile */}
          <div className="flex justify-between absolute bottom-0 left-2 right-2"> {/* Container for both buttons */}
            <div className="w-[40px]"> {/* Left button container */}
              {currentArtistIndex > 0 && (
                <img 
                  src={pageFlipLeft}
                  alt="Previous Artist"
                  className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handlePrevArtist}
                />
              )}
            </div>
            <div className="w-[40px]"> {/* Right button container */}
              {currentArtistIndex < 14 && (
                <img 
                  src={pageFlipRight}
                  alt="Next Artist"
                  className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handleNextArtist}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* desktop view */}
      <div className="hidden md:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={journalImage} 
          alt="Journal"
          className="w-[100%] h-[75%] max-w-[1300px] max-h-[782px]"
          style={{ transform: 'scale(1.1)' }}
        />
        {currentArtistIndex > 0 && (
          <img 
            src={pageFlipLeft}
            alt="Previous Artist"
            className="absolute w-[10%] h-auto max-w-[100px] cursor-pointer hover:scale-105 transition-transform duration-200"
            style={{ left: '16.3%', bottom: '8%' }}
            onClick={handlePrevArtist}
          />
        )}
        {currentArtistIndex < 14 && (
          <img 
            src={pageFlipRight}
            alt="Next Artist"
            className="absolute w-[10%] h-auto max-w-[100px] cursor-pointer hover:scale-105 transition-transform duration-200"
            style={{ right: '18%', bottom: '7%' }}
            onClick={handleNextArtist}
          />
        )}
        {currentArtist && (
          <>
            <img
              src={currentArtist.albumImageUrl}
              alt={currentArtist.name}
              className="absolute w-[13%] max-w-[175px] aspect-square"
              style={{ left: '20%', top: '17%' }}
            />
            <img
              src={currentArtist.randomAlbumImage}
              alt="Random Album"
              className="absolute w-[13%] max-w-[175px] aspect-square"
              style={{ left: '36%', top: '46%' }}
            />
            <div className="absolute" style={{ left: '35%', top: '18%' }}>
              <span className="font-pixelify text-[48px] text-black">#{currentArtistIndex + 1}</span>
              <span 
                className="font-pixelify text-[20px] text-black ml-4"
                style={{ transform: 'translateY(16px)', display: 'inline-block' }}
              >
                {currentArtist.name}
              </span>
              <div 
                className="font-pixelify text-[20px] text-black"
                style={{ 
                  marginTop: '15%',
                  width: '100%',
                  maxWidth: '186px',
                  minHeight: isExpanded ? 'auto' : '112px',
                  marginLeft: '-30px'
                }}
              >
                {displayText}
                {hasMore && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-green-700 hover:text-green-900 ml-2 underline cursor-pointer"
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
            <div 
                className="font-pixelify text-[20px] text-black absolute"
                style={{ 
                  left: '21%', 
                  top: '43.7%',  
                  width: '14%',
                  minHeight: '112px'
                }}
              >
                {`They have ${currentArtist.followers.toLocaleString()} followers${currentArtist.isFollowed ? " and you're one of them!" : '!'}`}
              </div>
              <div 
                className="font-pixelify text-[20px] text-black absolute"
                style={{ 
                  left: '32%', 
                  top: '71%',  
                  width: '25%',
                  minHeight: '28'
                }}
              >
                {/* {`${topArtists[0]?.monthlyListeners?.toLocaleString() || 'Loading...'} monthly listeners`} */}
                {/* 1000 monthly listeners */}
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
              style={{ left: '32.5%', top: '60%' }}
            />
            <img
              src={heartImage}
              alt="Heart"
              className="absolute w-[3%] max-w-[75px] aspect-square"
              style={{ left: '64%', top: '45%' }}
            />
            <img
              src={ribbonImage}
              alt="Ribbon"
              className="absolute w-[20%] h-[14%] max-w-[300px] max-h-[151px]"
              style={{ left: '55%', top: '50%' }}
            />
            <img
              src={cardboardCatImage}
              alt="Cardboard Cat"
              className="absolute w-[10%] h-[14%] max-w-[175] max-h-[151px]"
              style={{ left: '68%', top: '65%' }}
            />
            <div 
              className="font-pixelify text-[20px] text-black absolute flex items-center justify-center text-center"
              style={{ 
                left: '68%', 
                top: '67%',
                width: '10%',
                minHeight: '28px',
                padding: '0 8px'
              }}
            >
              Some more songs you'd like by them!
            </div>
            {/* <img
              src={arrowImage}
              alt="Arrow"
              className="absolute w-[3%] max-w-[75px] aspect-square"
              style={{ left: '37%', top: '66%' }}
            /> */}
            <img
              src={jellyfishImage}
              alt="Jellyfish"
              className="w-[21%] absolute h-[39%] max-w-[250px]"
              style={{ left: '51%', top: '14%' }}
            />
            <div 
              className="font-pixelify text-[20px] text-black absolute flex justify-center text-center"
              style={{ 
                left: '55%',
                top: '18%',
                width: '10%',
                minHeight: '112px'
              }}
            >
              Their top 5 songs are
            </div>
            <div
              className="font-pixelify text-[20px] text-black absolute flex flex-col gap-2"
              style={{ 
                left: '68%',
                top: positions.stars,
                width: '15%',
                minHeight: '193px'
              }}
            >
              {currentArtist.topTracks?.slice(0, 5).map((track, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[20px] font-bold">{index + 1}.</span>
                  <a 
                    href={`https://open.spotify.com/track/${track.uri.split(':')[2]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[20px] hover:text-green-700 transition-colors duration-200 truncate"
                  >
                    {track.name}
                  </a>
                </div>
              ))}
            </div>
            
            {/* Recommended Songs Links */}
            <div 
              className="font-pixelify text-[20px] text-black absolute flex flex-col gap-3"
              style={{ 
                left: '53%',
                top: positions.recommendations,
                width: '12%'
              }}
            >
              {loading ? (
                <div>Loading recommendations...</div>
              ) : recommendations.length > 0 ? (
                recommendations.map((track, index) => (
                  <a 
                    key={track.uri}
                    href={`https://open.spotify.com/track/${track.uri.split(':')[2]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left hover:text-green-700 transition-colors duration-200 truncate"
                  >
                    {index + 1}. {track.name}
                  </a>
                ))
              ) : (
                <div>No recommendations found</div>
              )}
            </div>
          </>
        )}
        <button 
          className={`font-pixelify text-[20px] absolute hover:text-green-700 transition-colors duration-200 ${timeRange === 'short_term' ? 'text-green-700' : 'text-black'}`}
          style={{ left: '20%', top: '80%', width: '12%', minHeight: '28px' }}
          onClick={() => setTimeRange('short_term')}
        >
          Last 4 weeks
        </button>

        <button 
          className={`font-pixelify text-[20px] absolute hover:text-green-700 transition-colors duration-200 ${timeRange === 'medium_term' ? 'text-green-700' : 'text-black'}`}
          style={{ left: '31%', top: '80%', width: '12%', minHeight: '28px' }}
          onClick={() => setTimeRange('medium_term')}
        >
          Last 6 months
        </button>

        <button 
          className={`font-pixelify text-[20px] absolute hover:text-green-700 transition-colors duration-200 ${timeRange === 'long_term' ? 'text-green-700' : 'text-black'}`}
          style={{ left: '40%', top: '80%', width: '12%', minHeight: '28px' }}
          onClick={() => setTimeRange('long_term')}
        >
          All Time
        </button>
      </div>
    </div>
    </div>
  );
};

export default TopArtistsUI;