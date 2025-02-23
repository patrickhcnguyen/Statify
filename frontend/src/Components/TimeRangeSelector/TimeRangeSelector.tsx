import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import bubbleSvg from '../../assets/icons/bubble.svg';

interface TimeRangeSelectorProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ timeRange, setTimeRange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSwipe, setCanSwipe] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeOptions = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!canSwipe || currentIndex >= timeOptions.length - 1) return;
      setCurrentIndex(prev => prev + 1);
      setTimeRange(timeOptions[currentIndex + 1].value);
      setCanSwipe(false);
      setTimeout(() => setCanSwipe(true), 800);
    },
    onSwipedRight: () => {
      if (!canSwipe || currentIndex <= 0) return;
      setCurrentIndex(prev => prev - 1);
      setTimeRange(timeOptions[currentIndex - 1].value);
      setCanSwipe(false);
      setTimeout(() => setCanSwipe(true), 800);
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
      
      if (e.deltaX > 25 && currentIndex < timeOptions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeRange(timeOptions[currentIndex + 1].value);
        setCanSwipe(false);
        setTimeout(() => setCanSwipe(true), 800);
      } else if (e.deltaX < -25 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setTimeRange(timeOptions[currentIndex - 1].value);
        setCanSwipe(false);
        setTimeout(() => setCanSwipe(true), 800);
      }
    }
  };

  const handleTapLeft = () => {
    if (!canSwipe || currentIndex <= 0) return;
    setCurrentIndex(prev => prev - 1);
    setTimeRange(timeOptions[currentIndex - 1].value);
    setCanSwipe(false);
    setTimeout(() => setCanSwipe(true), 800);
  };

  const handleTapRight = () => {
    if (!canSwipe || currentIndex >= timeOptions.length - 1) return;
    setCurrentIndex(prev => prev + 1);
    setTimeRange(timeOptions[currentIndex + 1].value);
    setCanSwipe(false);
    setTimeout(() => setCanSwipe(true), 800);
  };

  return (
    <>
      <div className="md:hidden absolute top-[100px] left-1/2 -translate-x-1/2">
        <div className="relative w-[200px]" ref={containerRef}>
          <div className="relative">
            {/* Left Tap Area */}
            <div 
              onClick={handleTapLeft}
              className={`absolute left-0 top-0 w-[20%] h-full z-10 ${
                currentIndex > 0 ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            />

            {/* Right Tap Area */}
            <div 
              onClick={handleTapRight}
              className={`absolute right-0 top-0 w-[20%] h-full z-10 ${
                currentIndex < timeOptions.length - 1 ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            />

            <div 
              {...handlers}
              onWheel={handleWheel}
              className="w-full overflow-hidden touch-pan-y"
            >
              <div className="relative w-[200px] h-[200px]">
                <img 
                  src={bubbleSvg} 
                  alt="time range bubble" 
                  className="w-full h-full"
                  draggable="false"
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[24px]">
                  {timeOptions[currentIndex].label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {timeOptions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setTimeRange(timeOptions[index].value);
                }}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentIndex === index ? 'bg-green-400' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* desktop bubbles */}
      <div className="hidden md:flex absolute space-x-12">
        <button
          className="relative w-48 aspect-square group"
          onClick={() => setTimeRange('short_term')}
        >
          <img 
            src={bubbleSvg} 
            alt="4 weeks bubble" 
            className="w-full h-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[20px]">
            Last 4 Weeks
          </span>
        </button>

        <button
          className="relative w-48 aspect-square group"
          onClick={() => setTimeRange('medium_term')}
        >
          <img 
            src={bubbleSvg} 
            alt="6 months bubble" 
            className="w-full h-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[20px]">
            Last 6 Months
          </span>
        </button>

        <button
          className="relative w-48 aspect-square group"
          onClick={() => setTimeRange('long_term')}
        >
          <img 
            src={bubbleSvg} 
            alt="all time bubble" 
            className="w-full h-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[20px]">
            All Time
          </span>
        </button>
      </div>
    </>
  );
};

export default TimeRangeSelector;
