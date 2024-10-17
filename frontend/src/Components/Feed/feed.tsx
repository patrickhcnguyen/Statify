import React, { useEffect, useState } from 'react';

interface Playlist {
  playlistID: string;
  name: string;
  description?: string;
  trackURIs: string[];
}

interface FeedProps {
  userID: string;
}

const Feed: React.FC<FeedProps> = ({ userID }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`http://localhost:8888/feed/${userID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        const data = await response.json();
        setPlaylists(data.playlists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [userID]);

  return (
    <div className="mt-4 ml-32">
      <h2 className="text-xl font-semibold">Your Playlist Feed</h2>
      <ul className="mt-2">
        {playlists.map((playlist) => (
          <li key={playlist.playlistID} className="mb-4 p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">{playlist.name}</h3>
            {playlist.description && <p className="text-gray-600">{playlist.description}</p>}
            <p className="text-sm text-gray-500">{playlist.trackURIs.length} tracks</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feed;