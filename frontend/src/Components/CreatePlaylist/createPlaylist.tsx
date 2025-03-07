import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';

interface CreatePlaylistProps {
  userId: string;
  displayName: string;
  topTracks: Array<{ name: string; artist: string; albumImageUrl: string; uri: string }>;
  timeQuery: 'Last 4 weeks' | 'Last 6 months' | 'All time' | null; 
}

const CreatePlaylist: React.FC<CreatePlaylistProps> = ({ userId, displayName, topTracks, timeQuery }) => {
  const [playlistName, setPlaylistName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
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
      // Log the track URIs for debugging
      console.log('Track URIs being sent:', trackURIs);
      
      if (!trackURIs || trackURIs.length === 0) {
        throw new Error('No track URIs available');
      }

      // Get genres for the tracks
      const genresResponse = await fetch(`${API_BASE_URL}/get-track-genres`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackURIs }),
      });

      if (!genresResponse.ok) {
        const errorData = await genresResponse.text();
        throw new Error(`Failed to get track genres: ${errorData}`);
      }

      const { genres } = await genresResponse.json();
      
      // Check if we have genres
      if (!genres || genres.length === 0) {
        throw new Error('No genres found for these tracks');
      }
      
      // Get 3 random genres, or use defaults if not enough
      let randomGenres = genres
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      // If we don't have 3 genres, pad with defaults
      while (randomGenres.length < 3) {
        randomGenres.push('pop');
      }

      console.log('Selected random genres:', randomGenres);

      // Get colors from GPT
      const colorResponse = await fetch(`${API_BASE_URL}/generate-gradient-colors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genres: randomGenres }),
      });

      if (!colorResponse.ok) {
        const errorData = await colorResponse.text();
        throw new Error(`Failed to generate colors: ${errorData}`);
      }

      const { colors } = await colorResponse.json();
      console.log('Generated colors:', colors);

      // Generate gradient
      const gradientResponse = await fetch(`${API_BASE_URL}/gradients/generate-gradients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          color1: colors[0] || '#ff0000',
          color2: colors[1] || '#00ff00',
          color3: colors[2] || '#0000ff',
        }),
      });

      if (!gradientResponse.ok) {
        const errorData = await gradientResponse.text();
        throw new Error(`Failed to generate gradient: ${errorData}`);
      }

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

  const handleAddTracks = async (playlistId: string) => {
    if (!topTracks || topTracks.length === 0) {
      throw new Error('No tracks available to add.');
    }

    const trackUris = topTracks.map(track => track.uri);

    const response = await fetch(`${API_BASE_URL}/add-tracks`, {
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
    return data;
  };

  const addPlaylistToFeed = async (playlistId: string, imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      const base64data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const feedResponse = await fetch(`${API_BASE_URL}/feed`, {
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
        const errorData = await feedResponse.text();
        throw new Error(`Failed to add playlist to feed: ${errorData}`);
      }

      console.log('Playlist added to feed successfully');
    } catch (error) {
      console.error('Error adding playlist to feed:', error);
      throw error;
    }
  };

  const updatePlaylistImage = async (playlistId: string, imageUrl: string) => {
    try {
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Convert blob to base64 using a Promise
      const base64data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      // Send to our backend endpoint
      const updateResponse = await fetch(`${API_BASE_URL}/update-playlist-image/${playlistId}`, {
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
      throw error;
    }
  };

  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      if (!playlistName) {
        throw new Error('Playlist name is required');
      }

      // First, generate the gradient
      const trackURIs = topTracks.map(track => track.uri);
      const gradientData = await generateGradientFromGenres(trackURIs);

      if (!gradientData?.radialUrl) {
        throw new Error('Failed to generate gradient');
      }

      // Create playlist
      const response = await fetch(`${API_BASE_URL}/create-playlist`, {
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
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || 'Failed to create playlist';
        } catch {
          errorMessage = `Failed to create playlist: ${errorText}`;
        }
        throw new Error(errorMessage);
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

      return playlist;
    },
    onSuccess: () => {
      setPlaylistName('');
      setError(null);
    },
    onError: (error: Error) => {
      console.error('Error creating playlist:', error);
      setError(error.message || 'Failed to create playlist.');
    }
  });

  const handleCreatePlaylist = () => {
    // Check if topTracks exists and has items
    if (!topTracks || topTracks.length === 0) {
      setError('No tracks available to create a playlist. Please try again later.');
      return;
    }
    
    createPlaylistMutation.mutate();
  };

  return (
    <div className="flex flex-col items-center">

      <div className="w-[325px] flex justify-center">
        <button 
          onClick={handleCreatePlaylist}
          disabled={createPlaylistMutation.isPending || !topTracks || topTracks.length === 0}
          className={`text-[30px] font-pixelify text-white mb-4 hover:opacity-80 transition-opacity whitespace-nowrap flex items-center justify-center ${(!topTracks || topTracks.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Create a new playlist!
        </button>
      </div>
      <input
        type="text"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        placeholder="Playlist name"
        className="w-[296px] h-[45px] rounded-[15px] bg-white/50 px-4 font-pixelify text-black placeholder-gray-600 outline-none focus:outline-none text-center"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {createPlaylistMutation.isPending && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full border-4 border-t-4 border-blue-500 h-8 w-8"></div>
        </div>
      )}
    </div>
  );
};

export default CreatePlaylist;
