import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import bubbleSvg from '../../assets/icons/bubble.svg';

interface TimeRangeSelectorProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ timeRange, setTimeRange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeOptions = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = (currentIndex + 1) % timeOptions.length;
      setCurrentIndex(nextIndex);
      setTimeRange(timeOptions[nextIndex].value);
    },
    onSwipedRight: () => {
      const nextIndex = (currentIndex - 1 + timeOptions.length) % timeOptions.length;
      setCurrentIndex(nextIndex);
      setTimeRange(timeOptions[nextIndex].value);
    },
  });

  return (
    <>
      {/* mobile selector */}
      <div className="md:hidden absolute top-[100px] left-1/2 -translate-x-1/2">
        <div {...handlers} className="relative w-[200px] h-[200px]">
          <img 
            src={bubbleSvg} 
            alt="time range bubble" 
            className="w-full h-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[24px]">
            {timeOptions[currentIndex].label}
          </span>
        </div>
        
        {/* Pagination dots */}
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

      {/* desktop bubbles */}
      <div className="hidden md:flex absolute top-[14vh] left-[55%] space-x-[2vw]">
        <button
          className="relative w-[13.5vw] h-[13.5vw] group"
          onClick={() => setTimeRange('short_term')}
        >
          <img 
            src={bubbleSvg} 
            alt="4 weeks bubble" 
            className="w-full h-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[1.5vw] min-text-[14px] max-text-[18px]">
            Last 4 Weeks
          </span>
        </button>

        <button
          className="relative w-[13.5vw] h-[13.5vw] group"
          onClick={() => setTimeRange('medium_term')}
        >
          <img 
            src={bubbleSvg} 
            alt="6 months bubble" 
            className="w-full h-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[1.5vw] min-text-[14px] max-text-[18px]">
            Last 6 Months
          </span>
        </button>

        <button
          className="relative w-[13.5vw] h-[13.5vw] group"
          onClick={() => setTimeRange('long_term')}
        >
          <img 
            src={bubbleSvg} 
            alt="all time bubble" 
            className="w-full h-full"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-pixelify text-[1.5vw] min-text-[14px] max-text-[18px]">
            All Time
          </span>
        </button>
      </div>
    </>
  );
};

export default TimeRangeSelector;
