const express = require('express');
const router = express.Router();

router.put('/update-playlist-image/:playlistId', async (req, res) => {
  const { playlistId } = req.params;
  const { imageBase64 } = req.body;
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'No access token found' });
  }

  try {
    // First verify the access token and scopes
    const verifyResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!verifyResponse.ok) {
      console.error('Token verification failed:', await verifyResponse.text());
      return res.status(401).json({ error: 'Invalid access token. Please re-authenticate.' });
    }

    console.log('Base64 Image Data:', imageBase64.substring(0, 100) + '...');

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg'
      },
      body: imageBase64.split(',')[1]
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return res.status(response.status).json({ 
        error: 'Failed to update playlist image',
        details: errorText,
        status: response.status
      });
    }

    res.status(200).json({ message: 'Playlist image updated successfully' });
  } catch (error) {
    console.error('Error updating playlist image:', error);
    res.status(500).json({ 
      error: 'Failed to update playlist image', 
      details: error.message 
    });
  }
});

module.exports = router;