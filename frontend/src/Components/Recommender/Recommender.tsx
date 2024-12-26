import React, { useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

interface Track {
  name: string;
  artist: string;
  uri: string;
}

interface RecommenderProps {
  topTracks: Track[];
  selectedTracks: string[];
  displayedTracks: Track[];
}

const Recommender: React.FC<RecommenderProps> = ({ topTracks, selectedTracks, displayedTracks }) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState<Array<any>>([]);
  const [canSwipe, setCanSwipe] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentTrack < recommendedTracks.length - 1) {
        setCurrentTrack(prev => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentTrack > 0) {
        setCurrentTrack(prev => prev - 1);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 10,
    swipeDuration: 500
  });

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      
      if (!canSwipe) return;
      
      if (e.deltaX > 25 && currentTrack < recommendedTracks.length - 1) {
        setCurrentTrack(prev => prev + 1);
        setCanSwipe(false);
        setTimeout(() => setCanSwipe(true), 800);
      } else if (e.deltaX < -25 && currentTrack > 0) {
        setCurrentTrack(prev => prev - 1);
        setCanSwipe(false);
        setTimeout(() => setCanSwipe(true), 800);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && currentTrack > 0) {
      setCurrentTrack(prev => prev - 1);
    } else if (e.key === 'ArrowRight' && currentTrack < recommendedTracks.length - 1) {
      setCurrentTrack(prev => prev + 1);
    }
  };

  const handleTapLeft = () => {
    if (currentTrack > 0) {
      setCurrentTrack(prev => prev - 1);
    }
  };

  const handleTapRight = () => {
    if (currentTrack < recommendedTracks.length - 1) {
      setCurrentTrack(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const preventHorizontalScroll = (e: WheelEvent) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      };

      containerRef.current.addEventListener('wheel', preventHorizontalScroll, { passive: false });
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        containerRef.current?.removeEventListener('wheel', preventHorizontalScroll);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentTrack]);

  const getRandomTracks = (count: number) => {
    const shuffled = [...displayedTracks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(track => track.uri);
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const tracksToUse = selectedTracks.length > 0 
        ? selectedTracks 
        : getRandomTracks(5);

      const response = await fetch('http://localhost:8888/get-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          topTracks: tracksToUse,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendedTracks(data);
      setCurrentTrack(0);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-[296px]">
        <h3 className="text-white font-pixelify text-[2.1vw] min-text-[24px] max-text-[32px] leading-tight">
          {selectedTracks.length > 0 
            ? `${selectedTracks.length}/5 tracks selected for recommendations!`
            : 'Click on tracks above to select for recommendations, or I\'ll pick 5 random ones!'}
        </h3>
      </div>
      
      <button 
        onClick={getRecommendations}
        disabled={loading}
        className="w-[296px] h-[45px] rounded-[15px] bg-white/50 font-pixelify text-black hover:opacity-80 transition-opacity mt-6"
      >
        {loading ? 'Loading...' : 'Get recommendations'}
      </button>

      {recommendedTracks.length > 0 && (
        <div className="mt-4 w-[296px]" ref={containerRef}>
          <div className="relative">
            {/* Left Tap Area */}
            <div 
              onClick={handleTapLeft}
              className={`absolute left-0 top-0 w-[20%] h-full z-10 ${
                currentTrack > 0 ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            />

            {/* Right Tap Area */}
            <div 
              onClick={handleTapRight}
              className={`absolute right-0 top-0 w-[20%] h-full z-10 ${
                currentTrack < recommendedTracks.length - 1 ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            />

            <div 
              {...handlers}
              onWheel={handleWheel}
              className="w-full overflow-hidden touch-pan-y"
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out w-full"
                style={{ transform: `translateX(-${currentTrack * 296}px)` }}
              >
                {recommendedTracks.map((track) => (
                  <div 
                    key={track.url}
                    className="w-[296px] flex-shrink-0"
                  >
                    <div className="flex items-center gap-4 p-[5px] select-none">
                      <img 
                        src={track.image} 
                        alt={track.name} 
                        className={`w-[7vw] h-[7vw] min-w-[70px] min-h-[70px] max-w-[120px] max-h-[120px] object-cover ${
                          selectedTracks.includes(track.uri) ? 'ring-2 ring-white' : ''
                        }`}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <h4 className="font-pixelify text-white text-lg truncate">{track.name}</h4>
                        <p className="font-pixelify text-white/70 text-sm mt-1 truncate">{track.artists}</p>
                        <a 
                          href={track.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-2 text-green-400 hover:underline font-picnic text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Listen on Spotify
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4 mb-4">
            {recommendedTracks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTrack(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentTrack === index ? 'bg-green-400' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommender;
