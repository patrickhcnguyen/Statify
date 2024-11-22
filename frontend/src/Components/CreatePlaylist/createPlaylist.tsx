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
  const [gradientUrls, setGradientUrls] = useState<{
    radialUrl: string;
    conicUrl: string;
    cssGradient: string;
  } | null>(null);

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

  const generateGradientFromGenres = async (trackURIs: string[]) => {
    try {
      // Get genres for the tracks
      const genresResponse = await fetch('http://localhost:8888/get-track-genres', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackURIs }),
      });

      const { genres } = await genresResponse.json();
      
      // Get 3 random genres
      const randomGenres = genres
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      console.log('Selected random genres:', randomGenres);

      // Get colors from GPT
      const colorResponse = await fetch('http://localhost:8888/generate-gradient-colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genres: randomGenres }),
      });

      const { colors } = await colorResponse.json();
      console.log('Generated colors:', colors);

      // Generate gradient
      const gradientResponse = await fetch('http://localhost:8888/gradients/generate-gradients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          color1: colors[0],
          color2: colors[1],
          color3: colors[2],
        }),
      });

      const gradientData = await gradientResponse.json();
      console.log('Generated gradient URLs:', gradientData);

      // Update state and return the data
      setGradientUrls(gradientData);
      return gradientData;
    } catch (error) {
      console.error('Error generating gradient:', error);
      throw error;
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      setError('Playlist name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, generate the gradient and get the data directly
      const trackURIs = topTracks.map(track => track.uri);
      const gradientData = await generateGradientFromGenres(trackURIs);

      if (!gradientData?.radialUrl) {
        throw new Error('Failed to generate gradient');
      }

      // Create playlist
      const response = await fetch('http://localhost:8888/create-playlist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          displayName,
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

      // Add tracks
      await handleAddTracks(playlistId);

      // Add to feed with gradient URL
      await addPlaylistToFeed(playlistId, gradientData.radialUrl);

      // Update the playlist image
      await updatePlaylistImage(playlistId, gradientData.radialUrl);

      setPlaylistName('');
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Failed to create playlist.');
    } finally {
      setLoading(false);
    }
  };
  

  // sending playlist to database using feed
  const addPlaylistToFeed = async (playlistId: string, imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const base64data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const feedResponse = await fetch('http://localhost:8888/feed', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userId,
          displayName: displayName,
          playlists: [{
            playlistID: playlistId,
            name: playlistName,
            trackURIs: topTracks.map(track => track.uri),
            imageBase64: base64data,
            userID: userId
          }]
        }),
      });

      if (!feedResponse.ok) {
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

  const updatePlaylistImage = async (playlistId: string, imageUrl: string) => {
    try {
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Convert blob to base64 using a Promise
      const base64data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      // Send to our backend endpoint
      const updateResponse = await fetch(`http://localhost:8888/update-playlist-image/${playlistId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64data
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.details || 'Failed to update playlist image');
      }
      
      console.log('Playlist image updated successfully');
    } catch (error) {
      console.error('Error updating playlist image:', error);
      throw error; // Re-throw to be handled by the caller
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
      
      {/* Add gradient display */}
      {gradientUrls && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Playlist Mood Gradient</h3>
          <div className="grid grid-cols-2 gap-4">
            <img src={gradientUrls.radialUrl} alt="Radial Gradient" className="w-full rounded" />
            <img src={gradientUrls.conicUrl} alt="Conic Gradient" className="w-full rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePlaylist;
