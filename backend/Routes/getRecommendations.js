const express = require('express');
const router = express.Router();

router.post('/get-recommendations', async (req, res) => {
  const { topTracks } = req.body;
  const accessToken = req.cookies.access_token;

  console.log('Access Token from getRecommendations:', accessToken);
  console.log('Received Top Tracks:', topTracks);

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required.' });
  }
  if (!topTracks || topTracks.length === 0) {
    return res.status(400).json({ error: 'Top tracks are required.' });
  }

  const topTracksIds = topTracks.map(track => track.split(':')[2]); // extract ids of songs
  
  const limitedTracksIds = topTracksIds.slice(0, 5); 

  const endpoint = `https://api.spotify.com/v1/recommendations?limit=5&seed_tracks=${limitedTracksIds.join(',')}`;

  try {
    const { default: fetch } = await import('node-fetch');

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Spotify API Error:', errorBody);
      return res.status(response.status).json({ error: 'Failed to fetch recommendations.', details: errorBody });
    }

    const data = await response.json();
    const recommendedTracks = data.tracks.map(track => ({
      name: track.name,
      artists: track.artists.map(artist => artist.name).join(', '),
      image: track.album.images[0]?.url, // Get the first image
      url: track.external_urls.spotify // URL to the song
    }));

    console.log(
      recommendedTracks.map(
        ({ name, artists }) =>
          `${name} by ${artists}`
      )
    );

    return res.json(recommendedTracks);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
