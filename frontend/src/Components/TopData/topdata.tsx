import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Track {
  name: string;
  artist: string;
  albumImageUrl: string;
}

interface TopTracksProps {
  timeRange: string;
}

interface Artist {
  name: string;
  albumImageUrl: string;
}

interface TopArtistsProps {
  timeRange: string;
}

interface GenreData {
  name: string;
  count: number;
}


const COLORS = [
  '#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#577590',
  '#f3722c', '#f9844a', '#90be6d', '#4d908e', '#277da1'
];

export const TopTracks: React.FC<TopTracksProps> = ({ timeRange }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await fetch(`http://localhost:8888/top-tracks?time_range=${timeRange}`, {
          method: 'GET',
          credentials: 'include', // fix is here, now i can access cookeis properly
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Response Text:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
          
        const data = await response.json();
        const trackData = data.items.map((item: any) => {
          const albumImageUrl = item.album.images[0]?.url || '';
          console.log('Album Image URL:', albumImageUrl); // Log the album image URL
          return {
            name: item.name,
            artist: item.artists[0].name,
            albumImageUrl: albumImageUrl,
          };
        });
        
        setTracks(trackData);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
        setError('Error fetching top tracks.');
      }
    };

    fetchTopTracks();
  }, [timeRange]);

  return (
    <div>
      <h2>Top Tracks</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {tracks.map((track, index) => (
          <li key={index} className="flex items-center mb-4">
            <img 
              src={track.albumImageUrl} 
              alt={track.name} 
              className="w-36 h-36 object-cover mr-4" // adjust image size here
            />
            <div>
              <p className="font-bold">{index + 1}. {track.name}</p>
              <p>{track.artist}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const TopArtists: React.FC<TopArtistsProps> = ({ timeRange }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const response = await fetch(`http://localhost:8888/top-artists?time_range=${timeRange}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Response Text:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const artistData = data.items.map((item: any) => ({
          name: item.name,
          albumImageUrl: item.images[0]?.url || '',
        }));
        setArtists(artistData);
      } catch (error) {
        console.error('Error fetching top artists:', error);
        setError('Error fetching top artists.');
      }
    };

    fetchTopArtists();
  }, [timeRange]);

  return (
    <div>
      <h2>Top Artists</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {artists.map((artist, index) => (
          <li key={index} className="flex items-center mb-4">
            <img 
            src={artist.albumImageUrl} 
            alt={artist.name} 
            className="w-36 h-36 mr-4" />
            <div>
              <p className="font-bold">{index + 1}. {artist.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const TopGenres: React.FC<{ timeRange: string }> = ({ timeRange }) => {
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
    <div className="flex items-start">
      <div className="mr-4">
        <h2>Top Genres</h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {genres.length > 0 && (
          <div className="flex flex-col items-center">
            <PieChart width={400} height={450} style={{ marginTop: '20px' }}>
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
          </div>
        )}
      </div>
      <div className="ml-auto">
        {/* cat gif lol */}
        <img 
          src="https://media.giphy.com/media/10YpWPBU7GAYwM/giphy.gif?cid=790b7611gj5ebi3gkg9eiuz4yfw10azwdkwp2jqkwukvuzaa&ep=v1_gifs_search&rid=giphy.gif&ct=g" 
          alt="Dancing GIF"
          className="w-64 h-64"
        /> 
        {/* Legend */}
        <ul className="mt-4">
          {chartData.map((entry, index) => (
            <li key={`legend-${index}`} className="flex items-center">
              <span 
                className="w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-sm">{entry.name} - {entry.percentage}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const Recent: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchRecentlyPlayed();
  }, []);
  const fetchRecentlyPlayed = async () => {
    try {
      const response = await fetch(`http://localhost:8888/recently-played`, {
        method: 'GET',
        credentials: 'include', 
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Response Text:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const trackData = data.items.map((item: any) => ({
        name: item.track.name, 
        artist: item.track.artists[0].name, 
        albumImageUrl: item.track.album.images[1]?.url || '', // Choose middle image (300x300)
      }));
      setTracks(trackData);
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
      setError('Error fetching recently played tracks.');
    }
  };
  return (
    <div>
      <h2>Recently Played Tracks</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {tracks.map((track, index) => (
          <li key={index} className="flex items-center mb-4">
            <img src={track.albumImageUrl} alt={track.name} className="w-16 h-16 mr-4" />
            <div>
              <p className="font-bold">{index + 1}. {track.name}</p>
              <p>{track.artist}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};