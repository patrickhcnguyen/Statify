const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../Database/Models/users');
const request = require('request');

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

        // Add new playlists while preserving existing ones
        const newPlaylists = playlists.map(playlist => ({
            playlistID: playlist.playlistID,
            name: playlist.name,
            trackURIs: playlist.trackURIs,
            createdAt: new Date(),
            imageBase64: playlist.imageBase64,
            userID: userID  // Ensure userID is set for each playlist
        }));

        // Get existing playlists with their userIDs
        const existingPlaylists = user.playlists.map(playlist => ({
            ...playlist.toObject(),
            userID: userID  // Ensure existing playlists have userID
        }));

        // Merge existing playlists with new ones
        user.playlists = [...existingPlaylists, ...newPlaylists];

        await user.save();
        console.log('Saved user with playlists:', user.playlists.length);

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
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get current user's ID using existing endpoint
        const options = {
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            json: true
        };

        request.get(options, async function(error, response, body) {
            if (error || response.statusCode !== 200) {
                return res.status(401).json({ message: 'Failed to verify user' });
            }

            const currentUserID = body.id;

            // Check if the userID matches the current user
            if (currentUserID !== userID) {
                return res.status(403).json({ 
                    message: 'Unauthorized: You can only delete your own playlists' 
                });
            }

            const user = await User.findOne({ userID });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const playlistIndex = user.playlists.findIndex(
                playlist => playlist.playlistID === playlistId
            );

            if (playlistIndex === -1) {
                return res.status(404).json({ message: 'Playlist not found' });
            }

            user.playlists.splice(playlistIndex, 1);
            await user.save();

            res.status(200).json({ message: 'Playlist deleted successfully' });
        });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ message: 'Error deleting playlist' });
    }
});

module.exports = router;
