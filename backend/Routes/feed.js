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

module.exports = router;
