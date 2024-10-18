const express = require('express');
const request = require('request');
const router = express.Router();

router.post('/create-playlist', async (req, res) => {
    const accessToken = req.cookies.access_token; 
    console.log('Access Token from createPlaylists.js is:', accessToken);

    
    const userId = req.body.userId; 
    const playlistName = req.body.playlistName || 'New Playlist'; 

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const options = {
        url: `https://api.spotify.com/v1/users/${userId}/playlists`,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: playlistName,
            description: 'Playlist created by Patty :)',
            public: false // set true for public playlists
        })
    };

    request.post(options, (error, response, body) => {
        if (error || response.statusCode !== 201) {
            console.error('Error creating playlist:', body);
            return res.status(response.statusCode).json({ error: 'Failed to create playlist', details: body });
        }

        const playlist = JSON.parse(body);
        console.log('Playlist created successfully:', playlist);
        res.status(201).json(playlist); 
    });
});

module.exports = router;