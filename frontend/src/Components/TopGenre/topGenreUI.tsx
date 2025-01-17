import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import TimeRangeSelector from '../TimeRangeSelector/TimeRangeSelector';
import backgroundImage from '../../assets/background/background.svg';

interface TopGenreUIProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null;
}

interface GenreData {
  name: string;
  count: number;
}

const COLORS = [
  '#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#577590',
  '#f3722c', '#f9844a', '#90be6d', '#4d908e', '#277da1'
];

const TopGenreUI: React.FC<TopGenreUIProps> = ({ timeRange, setTimeRange, timeQuery }) => {
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopGenres = async () => {
      try {
        const response = await fetch(`http://localhost:8888/top-genres?time_range=${timeRange}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Response Text:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const genreData = data.topGenres
          .map((genre: string) => ({
            name: genre,
            count: data.genreCount[genre] || 0,
          }))
          .filter((genre: GenreData) => genre.count > 0)
          .slice(0, 10);
        
        setGenres(genreData);
      } catch (error) {
        console.error('Error fetching top genres:', error);
        setError('Error fetching top genres.');
      }
    };

    fetchTopGenres();
  }, [timeRange]);

  // Calculate total count for percentage calculations
  const totalTracks = genres.reduce((total, genre) => total + genre.count, 0);

  // Prepare the chart data with percentages
  const chartData = genres.map(genre => ({
    ...genre,
    percentage: ((genre.count / totalTracks) * 100).toFixed(1), 
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }: any) => {
    const radius = outerRadius + 10; 
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="dark-gray"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${chartData[index].percentage}%`}
      </text>
    );
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
      
      <div className="flex items-center justify-center pt-[25vh]">
        <div className="bg-transparent mt-[50px] p-8 max-w-4xl w-full mx-4">
          <h2 className="text-3xl font-bold mb-6 text-center font-pixelify">Your Top Genres</h2>
          {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2">
              {genres.length > 0 && (
                <PieChart width={400} height={450}>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={renderCustomLabel}
                    labelLine={false}
                    fill="#8884d8"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </div>

            <div className="w-full md:w-1/2 mt-8 md:mt-0">
              <img 
                src="https://media.giphy.com/media/10YpWPBU7GAYwM/giphy.gif"
                alt="Dancing GIF"
                className="w-64 h-64 mx-auto mb-6"
              />
              <div className="rounded-lg p-4">
                <ul className="grid grid-cols-2 gap-2">
                  {chartData.map((entry, index) => (
                    <li key={`legend-${index}`} className="flex items-center">
                      <span 
                        className="w-3 h-3 mr-2 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                      />
                      <span className="text-sm font-pixelify">
                        {entry.name} - {entry.percentage}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopGenreUI;