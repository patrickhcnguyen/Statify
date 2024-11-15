const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../Database/Models/users');

router.post('/feed', async (req, res) => {
    const { userID, displayName, playlists } = req.body; 
    console.log('Received playlists data:', playlists.map(p => ({
        ...p,
        imageBase64: p.imageBase64 ? 'Base64 data present' : 'No base64 data'
    })));

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
            console.log('Adding playlist with image:', playlist.imageBase64?.substring(0, 100) + '...');
            user.playlists.push({
                playlistID: playlist.playlistID,
                name: playlist.name,
                trackURIs: playlist.trackURIs,
                createdAt: new Date(),
                imageBase64: playlist.imageBase64
            });
        });

        await user.save();
        console.log('Saved user with playlists:', user.playlists);

        res.status(200).json({ message: 'Playlist(s) added to feed successfully!' });
    } catch (error) {
        console.error('Error adding playlist to feed:', error);
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

router.delete('/feed/playlist/:playlistId', async (req, res) => {
    const { playlistId } = req.params;
    const { userID } = req.query;

    if (!playlistId || !userID) {
        return res.status(400).json({ message: 'PlaylistID and userID are required' });
    }

    try {
        const user = await User.findOne({ userID });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the index of the playlist to remove
        const playlistIndex = user.playlists.findIndex(
            playlist => playlist.playlistID === playlistId
        );

        if (playlistIndex === -1) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Remove the playlist
        user.playlists.splice(playlistIndex, 1);
        await user.save();

        res.status(200).json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ message: 'Error deleting playlist' });
    }
});

module.exports = router;
