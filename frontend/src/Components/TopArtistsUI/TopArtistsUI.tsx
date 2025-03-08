import React, { useState } from 'react';
import journalImage from '../../assets/background/journal.svg';
import starImage from '../../assets/icons/star.svg';
import buttonImage from '../../assets/icons/button.svg';
import jellyfishImage from '../../assets/icons/jellyfish.svg';
import heartImage from '../../assets/icons/heart.svg';
import ribbonImage from '../../assets/icons/ribbon.svg';
import cardboardCatImage from '../../assets/icons/cardboardCat.svg';
import pageFlipLeft from '../../assets/icons/pageFlipLeft.svg';
import pageFlipRight from '../../assets/icons/pageFlipRight.svg';

import { useQuery } from '@tanstack/react-query';
import useArtistData from '../../hooks/artistData';
import { Artist } from '../../hooks/artistData';

// mobile images
import journalMobile from '../../assets/background/journal mobile.png';
import jellyfishMobile from '../../assets/icons/jellyfish mobile.svg';
import ribbonMobile from '../../assets/icons/ribbon mobile.svg';

import { API_BASE_URL } from '../../config';
const API_URL = API_BASE_URL;

interface TopArtistsUIProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  userProfile: {
    id: string;
    displayName: string;
  };
  timeQuery: string | null;
}

const TopArtistsUI: React.FC<TopArtistsUIProps> = ({ 
  timeRange, 
  setTimeRange,
  timeQuery 
}) => {
  const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const { currentArtist, isLoading, error } = useArtistData(timeRange, currentArtistIndex);

  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['artistRecommendations', currentArtist?.id],
    queryFn: async () => {
      if (!currentArtist?.id) return [];
      
      const response = await fetch(`${API_BASE_URL}/artist-recommendations/${currentArtist.id}`, {
        credentials: 'include'
      });
      
      if (response.status === 429) {
        const data = await response.json();
        await new Promise(resolve => setTimeout(resolve, (data.retryAfter || 30) * 1000));
        throw new Error('Rate limited');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      return response.json();
    },
    enabled: !!currentArtist?.id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000)
  });

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!currentArtist) {
    return <div>No artist data available</div>;
  }

  const formatGenres = (genres: string[] = []) => {
    if (!genres || !currentArtist) return { displayText: '', hasMore: false };
    
    // Check if genres array is empty
    if (genres.length === 0) {
      return {
        displayText: `${currentArtist.name} likes to make music.`,
        hasMore: false
      };
    }
    
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
    >

      {/* mobile view */}
      {currentArtist && (
        <div className="block md:hidden overflow-x-hidden w-full">
          {/* journal image */}
          <div className="relative min-h-screen overflow-x-hidden">
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
            </div>
            {/* artist number */}
            <div className="font-pixelify text-[48px] text-black absolute left-56 top-16">
              #{currentArtistIndex + 1}
            </div>
            {/* artist name and genre list */}
            <div className="font-pixelify text-[32px] text-black absolute left-[19rem] top-24">
              {currentArtist.name}
              <div className="font-pixelify text-[18px] text-black mt-4 -ml-10">
                {currentArtist.name} likes to make {currentArtist.genres.join(', ')}
              </div>
            </div>
          </div>
          {/* followers */}
          <div className="font-pixelify text-[18px] text-black absolute left-2 top-[19rem] w-40">
            {`They have ${currentArtist.followers.toLocaleString()} followers${currentArtist.isFollowed ? " and you're one of them!" : '!'}`}
          </div>
          {/* album image */}
          <div className="absolute left-40 top-[22rem]">
            <img 
              src={currentArtist.randomImageUrl}
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
                  {currentArtist.topTracks?.slice(0, 5).map((track: { name: string; uri: string }, index: number) => (
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
                      {recommendations.map((track: { name: string; uri: string }, index: number) => (
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
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="relative">
            <img 
              src={journalImage} 
              alt="Journal"
              className="w-full h-full object-cover -mt-10"
            />

            {/* Content container - everything inside the journal */}
            <div className="absolute inset-0">
              {currentArtist && (
                <>
                  {/* Navigation buttons in corners of content container */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center">
                    {currentArtistIndex > 0 && (
                      <img 
                        src={pageFlipLeft}
                        alt="Previous Artist"
                        className="absolute -bottom-2 -left-2 w-[100px] cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={handlePrevArtist}
                      />
                    )}
                    {currentArtistIndex < 14 && (
                      <img 
                        src={pageFlipRight}
                        alt="Next Artist"
                        className="absolute -bottom-4 right-2 w-[100px] cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={handleNextArtist}
                      />
                    )}
                  </div>

                  {/* Time range buttons */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex justify-center gap-8">
                    <button 
                      className={`font-pixelify text-xl hover:text-green-700 transition-colors duration-200 ${timeRange === 'short_term' ? 'text-green-700' : 'text-black'}`}
                      onClick={() => setTimeRange('short_term')}
                    >
                      Last 4 weeks
                    </button>
                    <button 
                      className={`font-pixelify text-xl hover:text-green-700 transition-colors duration-200 ${timeRange === 'medium_term' ? 'text-green-700' : 'text-black'}`}
                      onClick={() => setTimeRange('medium_term')}
                    >
                      Last 6 months
                    </button>
                    <button 
                      className={`font-pixelify text-xl hover:text-green-700 transition-colors duration-200 ${timeRange === 'long_term' ? 'text-green-700' : 'text-black'}`}
                      onClick={() => setTimeRange('long_term')}
                    >
                      All Time
                    </button>
                  </div>
                  <div className="absolute ml-12 top-16">
                    <img
                      src={currentArtist.albumImageUrl}
                      alt={currentArtist.name}
                      className="w-[175px] aspect-square"
                    />
                  </div>

                  {/* Random album image */}
                  <div className="absolute left-64 top-[45%]">
                    <img
                      src={currentArtist.randomImageUrl}
                      alt="Random Album"
                      className="w-[175px] aspect-square"
                    />
                  </div>

                  {/* Artist info section */}
                  <div className="absolute left-72 top-16">
                    <span className="font-pixelify text-[48px] text-black">#{currentArtistIndex + 1}</span>
                    <span className="font-pixelify text-[20px] text-black ml-4 inline-block translate-y-4">
                      {currentArtist.name}
                    </span>
                    {/* genre */}
                    <div className="font-pixelify text-[20px] text-black mt-[15%] -ml-8 max-w-[186px]">
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

                  {/* followers */}
                  <div className="absolute left-12 top-72 w-44 font-pixelify text-[20px] text-black">
                    {`They have ${currentArtist.followers.toLocaleString()} followers${currentArtist.isFollowed ? " and you're one of them!" : '!'}`}
                  </div>

                  {/* Decorative elements */}
                  <img
                    src={starImage}
                    alt="Star 1"
                    className="absolute w-[75px] aspect-square left-96 top-60"
                  />
                  <img
                    src={starImage}
                    alt="Star 2"
                    className="absolute w-[75px] aspect-square left-40 top-96"
                  />
                  <img
                    src={buttonImage}
                    alt="Button"
                    className="absolute w-[50px] aspect-square left-80 bottom-36"
                  />
                  <img
                    src={heartImage}
                    alt="Heart"
                    className="absolute w-[50px] aspect-square right-72 bottom-96"
                  />

                  {/* Jellyfish section with top tracks */}
                  <div className="absolute right-72 top-24">
                    <div className="relative">
                      <img
                        src={jellyfishImage}
                        alt="Jellyfish"
                        className="w-full h-full max-w-[200px]"
                      />
                      <div className="absolute inset-0 flex top-12 justify-center">
                        <span className="font-pixelify text-[18px] text-black text-center w-24">
                          Their top 5 songs are
                        </span>
                      </div>
                    </div>

                    <div className="absolute ml-56 top-12 flex flex-col gap-2 w-[180px]">
                      {currentArtist.topTracks?.slice(0, 5).map((track: { name: string; uri: string }, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-[20px] font-bold">{index + 1}.</span>
                          <a 
                            href={`https://open.spotify.com/track/${track.uri.split(':')[2]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[20px] font-pixelify hover:text-green-700 transition-colors duration-200 truncate"
                          >
                            {track.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ribbon and recommendations section */}
                  <div className="absolute right-72 bottom-56">
                    <div className="relative">
                      <img
                        src={ribbonImage}
                        alt="Ribbon"
                        className="w-[200px] h-[140px]"
                      />

                      {/* recommendations */}
                      <div className="absolute inset-0 flex items-center justify-center top-44">
                        <div className="flex flex-col gap-3 w-[144px]">
                          {recommendationsLoading ? (
                            <div className="font-pixelify text-[20px] text-black">Loading recommendations...</div>
                          ) : recommendations.length > 0 ? (
                            recommendations.map((track: { uri: string; name: string }, index: number) => (
                              <a 
                                key={track.uri}
                                href={`https://open.spotify.com/track/${track.uri.split(':')[2]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[20px] font-pixelify hover:text-green-700 transition-colors duration-200 truncate"
                              >
                                {index + 1}. {track.name}
                              </a>
                            ))
                          ) : (
                            <div>No recommendations found</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cardboard Cat section */}
                  <div className="absolute right-20 bottom-20">
                    <img
                      src={cardboardCatImage}
                      alt="Cardboard Cat"
                      className="w-[175px] h-[140px]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-pixelify text-[16px] text-black text-center max-w-[120px]">
                        Some more songs you'd like by them!
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopArtistsUI;