

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); 

// Function to read secret files
function readSecret(secretName) {
  const fs = require('fs');
  const path = `/run/secrets/${secretName}`;
  
  try {
    return fs.readFileSync(path, 'utf8').trim();
  } catch (err) {
    console.error(`Error reading secret ${secretName}:`, err);
    return process.env[secretName.toUpperCase()]; // Fall back to environment variable
  }
}

// Read secrets
const mongoURI = process.env.MONGODB_URI || readSecret('mongodb_uri');
const openaiApiKey = process.env.OPENAI_API_KEY || readSecret('openai_api_key');
const rapidApiKey = process.env.RAPIDAPI_KEY || readSecret('rapidapi_key');
const clientId = process.env.CLIENT_ID || readSecret('client_id');
const clientSecret = process.env.CLIENT_SECRET || readSecret('client_secret');
const redirectUri = process.env.REDIRECT_URI || readSecret('redirect_uri');

process.env.MONGODBURI = mongoURI;
process.env.OPENAI_API_KEY = openaiApiKey;
process.env.RAPIDAPI_KEY = rapidApiKey;
process.env.CLIENT_ID = clientId;
process.env.CLIENT_SECRET = clientSecret;
process.env.REDIRECT_URI = redirectUri;

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
    'https://accounts.spotify.com',
    'https://statify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(cookieParser());
app.get('/health', (req, res) => {
  console.log('Health endpoint hit!');
  res.status(200).json({ status: 'ok' });
});

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

app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


const PORT = process.env.PORT || 8888;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server address info:`, server.address());
}).on('error', (err) => {
  console.error('Error starting server:', err);
  // Exit with error code to make the container restart
  process.exit(1);
});

module.exports = app;
