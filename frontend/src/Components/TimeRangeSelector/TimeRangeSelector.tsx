import React from 'react';

interface TimeRangeSelectorProps {
  currentRange: string;
  onRangeChange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ currentRange, onRangeChange }) => {
  return (
    <div className="mt-4 ml-12 space-x-4"> 
      <button
        className={`px-4 py-2 rounded-full ${currentRange === 'short_term' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
        onClick={() => onRangeChange('short_term')}
      >
        Last 4 Weeks
      </button>
      <button
        className={`px-4 py-2 rounded-full ${currentRange === 'medium_term' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
        onClick={() => onRangeChange('medium_term')}
      >
        Last 6 Months
      </button>
      <button
        className={`px-4 py-2 rounded-full ${currentRange === 'long_term' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
        onClick={() => onRangeChange('long_term')}
      >
        All Time
      </button>
    </div>
  );
};

export default TimeRangeSelector;
