const express = require('express');
const router = express.Router();
const User = require('../Database/Models/users');
// error bc im not using cors or mongoose rn
router.post('/feed', async (req, res) => {
    const { userID, playlistName, playlistDescription, trackURIs } = req.body;

    try {
        let user = await User.findOne({ userID });

        if (!user) {
            user = new User({
                userID,
                playlists: []
            });
        }

        user.playlists.push({
            playlistID: new mongoose.Types.ObjectId(), 
            name: playlistName,
            description: playlistDescription,
            trackURIs, 
            createdAt: new Date()
        });

        await user.save();

        res.status(200).json({ message: 'Playlist added to feed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding playlist to feed' });
    }
});

module.exports = router;
