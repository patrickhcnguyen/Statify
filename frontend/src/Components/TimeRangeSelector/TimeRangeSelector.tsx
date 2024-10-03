import React from 'react';

interface TimeRangeSelectorProps {
  currentRange: string;
  onRangeChange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ currentRange, onRangeChange }) => {
  return (
    <div>
      <button onClick={() => onRangeChange('short_term')} className={currentRange === 'short_term' ? 'active' : ''}>
        Last 4 weeks
      </button>
      <button onClick={() => onRangeChange('medium_term')} className={currentRange === 'medium_term' ? 'active' : ''}>
        Last 6 months
      </button>
      <button onClick={() => onRangeChange('long_term')} className={currentRange === 'long_term' ? 'active' : ''}>
        All time
      </button>
    </div>
  );
};

export default TimeRangeSelector;
