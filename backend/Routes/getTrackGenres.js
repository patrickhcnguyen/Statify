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
    
    // Get unique artist IDs
    const artistIds = [...new Set(
      tracksData.tracks.flatMap(track => track.artists.map(artist => artist.id))
    )];
    
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
    
    // Collect all unique genres
    const genres = [...new Set(
      artistsData.artists.flatMap(artist => artist.genres)
    )];
    
    res.json({ genres });
  } catch (error) {
    console.error('Error fetching track genres:', error);
    res.status(500).json({ error: 'Failed to fetch track genres' });
  }
});

module.exports = router; 