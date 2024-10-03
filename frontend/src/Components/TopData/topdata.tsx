import React, { useEffect, useState } from 'react';

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

interface Genre {
  name: string;
}

interface GenreProps {
  timeRange: string;
}

export const TopTracks: React.FC<TopTracksProps> = ({ timeRange }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await fetch(`http://localhost:8888/top-tracks?time_range=${timeRange}`, {
          method: 'GET',
          credentials: 'include',
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

export const TopGenres: React.FC<GenreProps> = ({ timeRange }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
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
        const genreData = data.topGenres.map((genre: string) => ({
          name: genre,
        }));
        setGenres(genreData);
      } catch (error) {
        console.error('Error fetching top genres:', error);
        setError('Error fetching top genres.');
      }
    };

    fetchTopGenres();
  }, [timeRange]);

  return (
    <div>
      <h2>Top Genres</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {genres.map((genre, index) => (
          <li key={index}>
            {index + 1}. {genre.name}
          </li>
        ))}
      </ul>
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
        albumImageUrl: item.track.album.images[0]?.url || '',
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
            <img 
            src={track.albumImageUrl} 
            alt={track.name} 
            className="w-36 h-36 mr-4" />
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

