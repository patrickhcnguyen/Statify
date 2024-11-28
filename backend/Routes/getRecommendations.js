const express = require('express');
const router = express.Router();

router.post('/get-recommendations', async (req, res) => {
  const { topTracks } = req.body;
  const accessToken = req.cookies.access_token;

  console.log('Starting recommendation process...');
  console.log('Access Token:', accessToken?.substring(0, 20) + '...');
  console.log('Received Top Tracks:', topTracks);

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required.' });
  }
  if (!topTracks || topTracks.length === 0) {
    return res.status(400).json({ error: 'Top tracks are required.' });
  }

  try {
    const { default: fetch } = await import('node-fetch');
    
    // Step 1: Get track details
    const trackIds = topTracks.map(track => track.split(':')[2]);
    console.log('Track IDs:', trackIds);

    const tracksUrl = `https://api.spotify.com/v1/tracks?ids=${trackIds.join(',')}`;
    console.log('Fetching tracks from:', tracksUrl);

    const tracksResponse = await fetch(tracksUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('Tracks response status:', tracksResponse.status);
    const tracksData = await tracksResponse.json();
    console.log('Tracks data received:', tracksData.tracks?.length, 'tracks');

    // Step 2: Get artist IDs
    const artistIds = [...new Set(
      tracksData.tracks.flatMap(track => track.artists.map(artist => artist.id))
    )];
    console.log('Artist IDs:', artistIds);

    // Step 3: Get artist details
    const artistsUrl = `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`;
    console.log('Fetching artists from:', artistsUrl);

    const artistsResponse = await fetch(artistsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('Artists response status:', artistsResponse.status);
    const artistsData = await artistsResponse.json();
    console.log('Artists data received:', artistsData.artists?.length, 'artists');

    // Step 4: Get genres and random artist
    const genres = [...new Set(
      artistsData.artists.flatMap(artist => artist.genres)
    )].slice(0, 2);
    console.log('Selected genres:', genres);

    const randomArtist = artistsData.artists[
      Math.floor(Math.random() * artistsData.artists.length)
    ];
    console.log('Selected random artist:', randomArtist.name);

    // Step 5: Search for recommendations (MODIFIED)
    // Do multiple searches with different criteria for variety
    const searchQueries = [
      encodeURIComponent(`genre:${genres[0]}`),
      encodeURIComponent(`genre:${genres[1]}`),
      encodeURIComponent(randomArtist.name),
    ];

    let allTracks = [];
    
    // Perform multiple searches
    for (const query of searchQueries) {
      const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10&market=US`;
      console.log('Searching:', searchUrl);

      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.tracks?.items) {
          allTracks = [...allTracks, ...searchData.tracks.items];
        }
      }
    }

    // Remove duplicates by track ID
    allTracks = [...new Map(allTracks.map(track => [track.id, track])).values()];

    // Shuffle the tracks
    allTracks = allTracks.sort(() => Math.random() - 0.5);

    // Step 6: Format recommendations (MODIFIED)
    const recommendedTracks = allTracks
      // Remove original tracks
      .filter(track => !trackIds.includes(track.id))
      // Remove tracks from the same artists (keep only one track per artist)
      .filter((track, index, self) => 
        index === self.findIndex(t => t.artists[0].id === track.artists[0].id)
      )
      .map(track => ({
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '),
        image: track.album.images[0]?.url,
        url: track.external_urls.spotify,
        uri: track.uri
      }))
      .slice(0, 5);

    console.log('Final recommendations:', recommendedTracks);
    
    if (recommendedTracks.length === 0) {
      console.log('No recommendations found after filtering');
      return res.status(404).json({ error: 'No recommendations found' });
    }

    return res.json(recommendedTracks);
  } catch (error) {
    console.error('Error in recommendation process:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
