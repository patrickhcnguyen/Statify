

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); 

const mongoURI = process.env.MONGODBURI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    const db = mongoose.connection; // Get the connection instance
    console.log(`Connected to database: ${db.name}`); // Use `db.name` to get the database name
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://accounts.spotify.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(cookieParser());

const authRoutes = require('./Routes/auth');
const topArtistsRoutes = require('./Routes/topArtists');
const topTrackRoutes = require('./Routes/topTracks');
const topGenreRoutes = require('./Routes/topGenres');
const recentlyPlayedRoutes = require ('./Routes/recentlyPlayed');
const getUserProfileRoutes = require('./Routes/getUserProfile');
const createPlaylistRoute = require('./Routes/createPlaylists');
const addTracksRoute = require('./Routes/addItems');
const getRecommendationsRoute = require('./Routes/getRecommendations');
const getCommunityRoute = require('./Routes/community');
const gradientRoutes = require('./Routes/gradientURLs');
const getTrackGenresRoute = require('./Routes/getTrackGenres');
const gptGradientRoute = require('./Routes/gptGradient');
const updatePlaylistImageRoute = require('./Routes/updatePlaylistImage');
const getArtistDetailsRoute = require('./Routes/getArtistDetails');
app.use(authRoutes);
app.use(topArtistsRoutes);
app.use(topTrackRoutes);
app.use(topGenreRoutes);
app.use(recentlyPlayedRoutes);
app.use(getUserProfileRoutes);
app.use(createPlaylistRoute);
app.use(addTracksRoute);
app.use(getRecommendationsRoute);
app.use(getCommunityRoute);
app.use('/gradients', gradientRoutes);
app.use(getTrackGenresRoute);
app.use(gptGradientRoute);
app.use(updatePlaylistImageRoute);
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(getArtistDetailsRoute);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 8888;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
