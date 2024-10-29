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
  const [playlistImages, setPlaylistImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlaylistImage = async (playlistId: string) => {
    try {
      const response = await fetch(`http://localhost:8888/playlist-image/${playlistId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlist image');
      }

      const data = await response.json();
      return data.images[0]?.url || null;
    } catch (err) {
      console.error('Error fetching playlist image:', err);
      return null;
    }
  };

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
        setFeedData(data);

        // Fetch images for all playlists
        const images: Record<string, string> = {};
        for (const user of data) {
          for (const playlist of user.playlists) {
            const imageUrl = await fetchPlaylistImage(playlist.playlistID);
            if (imageUrl) {
              images[playlist.playlistID] = imageUrl;
            }
          }
        }
        setPlaylistImages(images);
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
    <div className="feed-container p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">User Playlists Feed</h2>
      {feedData.length === 0 ? (
        <p>No playlists available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedData
            .flatMap(user => 
              user.playlists.map(playlist => ({
                ...playlist,
                displayName: user.displayName
              }))
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((playlist) => (
              <div key={playlist.playlistID} className="playlist-card bg-gray-100 p-4 rounded-lg shadow-md">
                {playlist.trackURIs.length > 0 ? (
                  <img
                    src={playlistImages[playlist.playlistID] || 'default-image-url'} 
                    className="w-full aspect-square object-cover mb-2 rounded"
                    alt={playlist.name}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-200 flex items-center justify-center mb-2 rounded">
                    <span className="text-sm text-center px-2">No image available</span>
                  </div>
                )}

                <h3 className="font-bold text-base sm:text-lg truncate">{playlist.name}</h3>
                <p className="text-gray-600 text-sm">Created by {playlist.displayName}</p>
                <p className="text-gray-500 text-xs mt-2">Created on: {new Date(playlist.createdAt).toLocaleDateString()}</p>
                <a
                  href={`https://open.spotify.com/playlist/${playlist.playlistID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-4 block text-sm"
                >
                  View on Spotify
                </a>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
