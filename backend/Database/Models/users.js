const mongoose = require('mongoose');

// userID and displayName are separate from each other, userID is what the user uses to login with, displayName is what the user displays on their profile

const userSchema = new mongoose.Schema({
    userID: { 
        type: String,
        required: true,
        unique: true,
    },
    displayName: { 
        type: String,
        required: true
    },
    playlists: [
        {
            playlistID: { type: String, required: true }, // Unique ID for the playlist
            name: { type: String, required: true }, // Name of the playlist
            trackURIs: [{ type: String }], // Array of track URIs
            createdAt: { type: Date, default: Date.now }, // Timestamp when the playlist was created
            imageBase64: { type: String, required: false }, // URL of the playlist image
            userID: { type: String, required: true }
        }
    ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;