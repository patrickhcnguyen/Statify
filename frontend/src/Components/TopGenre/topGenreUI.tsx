import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import TimeRangeSelector from '../TimeRangeSelector/TimeRangeSelector';
import { useGenres } from '../../hooks/useGenres';
import { GenreData } from './topGenreFunctions';

interface ChartDataEntry extends GenreData {
  percentage: string;
}

interface TopGenreUIProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null;
}

const COLORS = [
  '#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#577590',
  '#f3722c', '#f9844a', '#90be6d', '#4d908e', '#277da1'
];

const TopGenreUI: React.FC<TopGenreUIProps> = ({ timeRange, setTimeRange, timeQuery }) => {
  const { genres, error } = useGenres(timeRange);

  const totalTracks = genres.reduce((total: number, genre: GenreData) => total + genre.count, 0);

  const chartData = genres.map((genre: GenreData) => ({
    ...genre,
    percentage: ((genre.count / totalTracks) * 100).toFixed(1), 
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, index }: any) => {
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
        fontFamily="pixelify"
      >
        {`${chartData[index].percentage}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative">
      <div className="container mx-auto px-4 pt-12 flex flex-col items-center">
        <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
        <h2 className="text-3xl font-bold mb-6 text-center font-pixelify mt-72 md:mt-52">Your Top Genres</h2>
        {error && <p className="text-red-500 text-center mb-4 ">Error: {error}</p>}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl gap-2 md:gap-44">
          {/* Pie Chart */}
          <div>
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
                  isAnimationActive={false}
                >
                  {chartData.map((entry: ChartDataEntry, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <img 
              src="https://media.giphy.com/media/10YpWPBU7GAYwM/giphy.gif"
              alt="Dancing GIF"
              className="w-64 h-64"
            />
            <div className="rounded-lg p-4">
              <ul className="grid grid-cols-1 gap-2">
                {chartData.map((entry: ChartDataEntry, index: number) => (
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
  );
};

export default TopGenreUI;