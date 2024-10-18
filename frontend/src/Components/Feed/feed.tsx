import React, { useEffect, useState } from 'react';

interface Playlist {
  playlistID: string;
  name: string;
  trackURIs: string[];
  createdAt: string;
}

interface User {
  userID: string;
  displayName: string; 
  playlists: Playlist[];
}

const Feed: React.FC = () => {
  const [feedData, setFeedData] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('http://localhost:8888/feed', {
          method: 'GET',
          credentials: 'include', 
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch feed data');
        }
  
        const data = await response.json();
        console.log('Fetched feed data:', data);
        setFeedData(data);
      } catch (err) {
        setError('Failed to load feed');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFeed();
  }, []);
  

  if (loading) {
    return <div>Loading feed...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="feed-container p-4">
      <h2 className="text-xl font-semibold mb-4">User Playlists Feed</h2>
      {feedData.length === 0 ? (
        <p>No playlists available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedData.map((user) => (
            user.playlists.map((playlist) => (
              <div key={playlist.playlistID} className="playlist-card bg-gray-100 p-4 rounded-lg shadow-md">
                {playlist.trackURIs.length > 0 ? (
                  <img
                    src={`https://i.scdn.co/image/${playlist.trackURIs[0]}`} 
                    // alt={playlist.name}
                    className="w-full h-48 object-cover mb-2 rounded"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-2 rounded">
                    <span>No image available</span>
                  </div>
                )}

                <h3 className="font-bold text-lg">{playlist.name}</h3>
                <p className="text-gray-600">Created by {user.displayName}</p>
                <p className="text-gray-500 text-sm mt-2">Created on: {new Date(playlist.createdAt).toLocaleDateString()}</p>
                <a
                  href={`https://open.spotify.com/playlist/${playlist.playlistID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-4 block"
                >
                  View on Spotify
                </a>
              </div>
            ))
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
