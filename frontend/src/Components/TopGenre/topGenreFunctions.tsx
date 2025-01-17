import { useState, useEffect } from 'react';

export interface GenreData {
  name: string;
  count: number;
}

export const useTopGenres = (timeRange: string) => {
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

  return { genres, error };
};

export const calculateChartData = (genres: GenreData[]) => {
  const totalTracks = genres.reduce((total, genre) => total + genre.count, 0);
  
  return genres.map(genre => ({
    ...genre,
    percentage: ((genre.count / totalTracks) * 100).toFixed(1), 
  }));
};

export const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index, chartData }: any) => {
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

export const COLORS = [
  '#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#577590',
  '#f3722c', '#f9844a', '#90be6d', '#4d908e', '#277da1'
]; 