const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/artist/:id', async (req, res) => {
  const { id } = req.params;
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { default: fetch } = await import('node-fetch');
    
    // Fetch artist details
    const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const artistData = await artistResponse.json();

    // Get artist images in different sizes
    // images[0] = largest (640x640)
    // images[1] = medium (320x320)
    // images[2] = smallest (160x160)
    const images = {
      header: artistData.images[0]?.url, // Largest image for header
      profile: artistData.images[1]?.url, // Medium image for profile/bio
      thumbnail: artistData.images[2]?.url // Smallest image for thumbnails
    };

    // Fetch top tracks (to get album artwork)
    const topTracksResponse = await fetch(
      `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const topTracksData = await topTracksResponse.json();

    // Get latest album artwork
    const latestAlbumImage = topTracksData.tracks[0]?.album.images[0]?.url;

    res.json({
      name: artistData.name,
      images: {
        ...images,
        latestAlbumArt: latestAlbumImage
      },
      genres: artistData.genres,
      topTracks: topTracksData.tracks
        .slice(0, 5)
        .map(track => ({
          name: track.name,
          duration_ms: track.duration_ms,
          albumImage: track.album.images[0]?.url,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls.spotify
        }))
    });

  } catch (error) {
    console.error('Error in artist details route:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;