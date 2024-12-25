import React from 'react';
import bubbleSvg from '../../assets/icons/bubble.svg';

interface TimeRangeSelectorProps {
  currentRange: string;
  onRangeChange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ currentRange, onRangeChange }) => {
  return (
    <div className="absolute top-[14vh] left-[55%] flex space-x-[2vw]">
      <button
        className="relative w-[13.5vw] h-[13.5vw] group"
        onClick={() => onRangeChange('short_term')}
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
        onClick={() => onRangeChange('medium_term')}
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
        onClick={() => onRangeChange('long_term')}
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
  );
};

export default TimeRangeSelector;
