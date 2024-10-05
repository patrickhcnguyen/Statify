const express = require('express');
const request = require('request');
const router = express.Router();

router.post('/add-tracks', (req, res) => {
    const accessToken = req.cookies.access_token;
    const playlistId = req.body.playlistId;
    const trackUris = req.body.trackUris;
  
    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    if (!playlistId || !trackUris) {
      return res.status(400).json({ error: 'Missing playlistId or trackUris' });
    }
  
    const options = {
      url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    };
  
    request.post(options, (error, response, body) => {
      if (error || response.statusCode !== 201) {
        console.error('Error adding tracks to playlist:', body);
        return res.status(response.statusCode).json({ error: 'Failed to add tracks', details: body });
      }
  
      const responseBody = JSON.parse(body);
      console.log('Tracks added successfully:', responseBody);
      res.status(201).json(responseBody);
    });
  });
  

module.exports = router;
