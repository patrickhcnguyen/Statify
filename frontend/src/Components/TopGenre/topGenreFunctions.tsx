import { useState, useEffect } from 'react';

export interface GenreData {
  name: string;
  count: number;
}

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