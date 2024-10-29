const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../Database/Models/users');

router.post('/feed', async (req, res) => {
    const { userID, displayName, playlists } = req.body; 

    if (!displayName) {
        return res.status(400).json({ message: 'displayName is required' });
    }

    try {
        let user = await User.findOne({ userID });

        if (!user) {
            user = new User({
                userID,
                displayName, 
                playlists: []
            });
        } else {
            user.displayName = displayName; 
        }

        playlists.forEach(playlist => {
            user.playlists.push({
                playlistID: playlist.playlistID || new mongoose.Types.ObjectId(), 
                name: playlist.name,
                trackURIs: playlist.trackURIs, 
                createdAt: new Date()
            });
        });

        await user.save();

        res.status(200).json({ message: 'Playlist(s) added to feed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding playlist(s) to feed' });
    }
});

router.get('/feed', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching feed data' });
    }
});

router.get('/playlist-image/:playlistId', async (req, res) => {
  const accessToken = req.cookies.access_token;
  const { playlistId } = req.params;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playlist data');
    }

    const data = await response.json();
    res.json({ images: data.images });
  } catch (error) {
    console.error('Error fetching playlist image:', error);
    res.status(500).json({ error: 'Failed to fetch playlist image' });
  }
});

module.exports = router;
