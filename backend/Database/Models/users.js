const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
    },
    playlists: [
        {
            playlistID: { type: String, required: true }, // Unique ID for the playlist
            name: { type: String, required: true }, // Name of the playlist
            description: { type: String }, // Optional description of the playlist
            trackURIs: [{ type: String }], // Array of track URIs
            createdAt: { type: Date, default: Date.now }, // Timestamp when the playlist was created
        }
    ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;