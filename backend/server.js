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
    // Only log error in production environment
    if (process.env.NODE_ENV === 'production') {
      console.error(`Error reading secret ${secretName}:`, err);
    }
    return null; // Return null instead of falling back immediately
  }
}

// Get configuration from environment or secrets
const getConfig = (envName, secretName) => {
  // First try environment variable
  if (process.env[envName]) {
    return process.env[envName];
  }
  
  // Then try Docker secret
  const secretValue = readSecret(secretName);
  if (secretValue) {
    return secretValue;
  }
  
  return null;
};

// Read configuration
const mongoURI = getConfig('MONGODBURI', 'mongodb_uri');
const openaiApiKey = getConfig('OPENAI_API_KEY', 'openai_api_key');
const rapidApiKey = getConfig('RAPIDAPI_KEY', 'rapidapi_key');
const clientId = getConfig('CLIENT_ID', 'client_id');
const clientSecret = getConfig('CLIENT_SECRET', 'client_secret');
const redirectUri = getConfig('REDIRECT_URI', 'redirect_uri') || 'https://api.statify.app/callback';

process.env.MONGODBURI = mongoURI;
process.env.OPENAI_API_KEY = openaiApiKey;
process.env.RAPIDAPI_KEY = rapidApiKey;
process.env.CLIENT_ID = clientId;
process.env.CLIENT_SECRET = clientSecret;
process.env.REDIRECT_URI = redirectUri;

// Connect to MongoDB if URI is available
if (mongoURI) {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('MongoDB connected successfully');
      const db = mongoose.connection;
      console.log(`Connected to database: ${db.name}`);
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
} else {
  console.error('MongoDB URI not available. Database connection skipped.');
}

app.use(cors({
  origin: ['https://www.statify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

app.use(cookieParser());
app.get('/health', (req, res) => {
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

// Add this before your other routes
app.get('/cors-test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

const PORT = process.env.PORT || 80;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
