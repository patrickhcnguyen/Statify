const express = require('express');
const request = require('request');
const router = express.Router();

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
        console.log('Follow status:', followsData);

        // Combine artist data with follow status
        const enrichedItems = await Promise.all(artistsData.items.map(async (artist, index) => {
            const albumsResponse = await fetch(
                `https://api.spotify.com/v1/artists/${artist.id}/albums?limit=1&market=US`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            const albumsData = await albumsResponse.json();
            
            return {
                ...artist,
                randomAlbumImage: albumsData.items[0]?.images[0]?.url || '',
                isFollowed: followsData[index]
            };
        }));

        res.json({ ...artistsData, items: enrichedItems });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
