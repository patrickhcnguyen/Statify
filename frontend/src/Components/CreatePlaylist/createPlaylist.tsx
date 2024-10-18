import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface CreatePlaylistProps {
  userId: string;
  displayName: string;
  topTracks: Array<{ name: string; artist: string; albumImageUrl: string; uri: string }>;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null; 
}

const CreatePlaylist: React.FC<CreatePlaylistProps> = ({ userId, displayName, topTracks, timeQuery }) => {
  const [playlistName, setPlaylistName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const location = useLocation(); 

  // Set default playlist name based on time query or the route
  useEffect(() => {
    if (location.pathname === '/track/recent') {
      setPlaylistName('Recently Played');
    } else if (timeQuery) {
      setPlaylistName(`Top Tracks ${new Date().toLocaleDateString()} ${timeQuery}`);
    } else {
      setPlaylistName('Top Tracks');
    }
  }, [timeQuery, location.pathname]);

  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      setError('Playlist name is required');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:8888/create-playlist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          displayName, // Pass the displayName here
          playlistName,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }
  
      const playlist = await response.json();
      const playlistId = playlist.id;
  
      console.log('Created Playlist:', playlist);
  
      await handleAddTracks(playlistId);
      await addPlaylistToFeed(playlistId);
  
      setPlaylistName('');
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Failed to create playlist.');
    } finally {
      setLoading(false);
    }
  };
  

  // sending playlist to database using feed
  const addPlaylistToFeed = async (playlistId: string) => {
    try {
      const response = await fetch('http://localhost:8888/feed', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userId,
          displayName: displayName,

          playlists: [
            {
              playlistID: playlistId,
              name: playlistName,
              trackURIs: topTracks.map(track => track.uri),
            },
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add playlist to feed');
      }
  
      console.log('Playlist added to feed successfully');
    } catch (error) {
      console.error('Error adding playlist to feed:', error);
      setError('Failed to add playlist to feed.');
    }
  };  

  const handleAddTracks = async (playlistId: string) => {
    if (!topTracks || topTracks.length === 0) {
      setError('No tracks available to add.');
      return;
    }

    const trackUris = topTracks.map(track => track.uri);

    try {
      const response = await fetch('http://localhost:8888/add-tracks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId,
          trackUris,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to add tracks: ${errorData}`);
      }

      const data = await response.json();
      console.log('Tracks added successfully:', data);
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      setError('Error adding tracks to playlist');
    }
  };

  return (
    <div className="mt-4 ml-32">
      <h2 className="text-xl font-semibold">Create a New Playlist</h2>
      <input
        type="text"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        placeholder="Playlist name"
        className="border rounded p-2 mb-2 text-gray-500 placeholder-gray-500 w-full" 
      />
      {loading && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full border-4 border-t-4 border-blue-500 h-8 w-8"></div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-4">
        <button
          onClick={handleCreatePlaylist}
          disabled={loading}
          className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition duration-300`}
        >
          {loading ? 'Creating...' : 'Create Playlist'}
        </button>
      </div>
    </div>
  );
};

export default CreatePlaylist;
