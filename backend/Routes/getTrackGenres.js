const express = require('express');
const router = express.Router();

router.post('/get-track-genres', async (req, res) => {
  const { trackURIs } = req.body;
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { default: fetch } = await import('node-fetch');
    
    // Extract track IDs from URIs
    const trackIds = trackURIs.map(uri => uri.split(':')[2]);
    
    // Check if we have valid track IDs
    if (!trackIds || trackIds.length === 0) {
      console.error('No valid track IDs found in URIs:', trackURIs);
      return res.status(400).json({ error: 'No valid track IDs found', genres: [] });
    }
    
    // Get tracks' artists
    const tracksResponse = await fetch(
      `https://api.spotify.com/v1/tracks?ids=${trackIds.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const tracksData = await tracksResponse.json();
    
    // Check if tracks data exists and has the expected structure
    if (!tracksData.tracks || !Array.isArray(tracksData.tracks)) {
      console.error('Invalid tracks data:', tracksData);
      return res.status(500).json({ error: 'Invalid response from Spotify API', genres: [] });
    }
    
    // Get unique artist IDs
    const artistIds = [...new Set(
      tracksData.tracks.flatMap(track => 
        track.artists ? track.artists.map(artist => artist.id) : []
      )
    )];
    
    if (artistIds.length === 0) {
      return res.json({ genres: [] });
    }
    
    // Get artists' genres
    const artistsResponse = await fetch(
      `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const artistsData = await artistsResponse.json();
    
    // Check if artists data exists and has the expected structure
    if (!artistsData.artists || !Array.isArray(artistsData.artists)) {
      console.error('Invalid artists data:', artistsData);
      return res.status(500).json({ error: 'Invalid response from Spotify API', genres: [] });
    }
    
    // Collect all unique genres
    const genres = [...new Set(
      artistsData.artists.flatMap(artist => artist.genres || [])
    )];
    
    res.json({ genres });
  } catch (error) {
    console.error('Error fetching track genres:', error);
    res.status(500).json({ error: 'Failed to fetch track genres', genres: [] });
  }
});

module.exports = router; 