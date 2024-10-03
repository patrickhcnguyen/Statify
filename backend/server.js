const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://accounts.spotify.com'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, 
}));

app.use(cookieParser());

const authRoutes = require('./Routes/auth');
const topArtistsRoutes = require('./Routes/topArtists');
const topTrackRoutes = require('./Routes/topTracks');
const topGenreRoutes = require('./Routes/topGenres');
const recentlyPlayedRoutes = require ('./Routes/recentlyPlayed');

app.use(authRoutes);
app.use(topArtistsRoutes);
app.use(topTrackRoutes);
app.use(topGenreRoutes);
app.use(recentlyPlayedRoutes);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});