const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.get('/top-artists', async function(req, res) {
    const accessToken = req.cookies.access_token; 

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeRange = req.query.time_range || 'short_term'; 

    try {
        const { default: fetch } = await import('node-fetch');
        
        // Get top artists
        const artistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?' + new URLSearchParams({
            limit: '20',
            time_range: timeRange
        }), {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const artistsData = await artistsResponse.json();

        // Get artist IDs and check if user follows them
        const artistIds = artistsData.items.map(artist => artist.id);
        const followCheckUrl = `https://api.spotify.com/v1/me/following/contains?type=artist&ids=${artistIds.join(',')}`;
        
        const followsResponse = await fetch(followCheckUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const followsData = await followsResponse.json();

        // Only get monthly listeners for the first artist to avoid rate limits
        // let monthlyListeners = 0;
        // if (artistsData.items.length > 0) {
        //     try {
        //         const monthlyListenersResponse = await axios({
        //             method: 'GET',
        //             url: 'https://spotify-artist-monthly-listeners.p.rapidapi.com/artists/spotify_artist_monthly_listeners',
        //             params: { spotify_artist_id: artistsData.items[0].id },
        //             headers: {
        //                 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        //                 'X-RapidAPI-Host': 'spotify-artist-monthly-listeners.p.rapidapi.com'
        //             }
        //         });
        //         monthlyListeners = monthlyListenersResponse.data?.monthly_listeners || 0;
        //     } catch (error) {
        //         console.error('Error fetching monthly listeners:', error);
        //         monthlyListeners = 0;
        //     }
        // }

        // Combine artist data with follow status
        const enrichedItems = await Promise.all(artistsData.items.map(async (artist, index) => {
            const albumsResponse = await fetch(
                `https://api.spotify.com/v1/artists/${artist.id}/albums?limit=1&market=US`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            const albumsData = await albumsResponse.json();
            
            const topTracksResponse = await fetch(
                `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            const topTracksData = await topTracksResponse.json();

            // Get random tracks by artist using search
            const searchResponse = await fetch(
                `https://api.spotify.com/v1/search?q=artist:"${encodeURIComponent(artist.name)}"&type=track&market=US&limit=50`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            const searchData = await searchResponse.json();

            let artistTracks = [];
            if (searchData?.tracks?.items) {
                artistTracks = searchData.tracks.items
                    .filter(track => track.artists.some(a => a.id === artist.id))
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(track => ({
                        name: track.name,
                        uri: track.uri
                    }));
            }

            return {
                ...artist,
                randomAlbumImage: albumsData.items[0]?.images[0]?.url || '',
                isFollowed: followsData[index],
                topTracks: topTracksData.tracks?.map(track => ({
                    name: track.name,
                    uri: track.uri
                })) || [],
                recommendedTracks: artistTracks
            };
        }));

        res.json({ ...artistsData, items: enrichedItems });
    } catch (error) {
        console.error('Error fetching top artists:', error);
        res.status(500).json({ error: 'Failed to fetch top artists' });
    }
});

module.exports = router;
