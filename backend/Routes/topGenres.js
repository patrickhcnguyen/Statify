const express = require('express');
const request = require('request');
const router = express.Router();

// Counting frequency of each genre based on artists the user listens to
function countGenres(artists) {
    const genreCount = {};
    artists.forEach(artist => {
        artist.genres.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
    });
    return genreCount;
}

router.get('/top-genres', function(req, res) {
    const accessToken = req.cookies.access_token; 

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeRange = req.query.time_range || 'short_term'; 

    const options = {
        url: 'https://api.spotify.com/v1/me/top/artists',
        qs: {
            limit: 50,  
            time_range: timeRange  
        },
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const artists = body.items;  
            const genreCount = countGenres(artists);  

            // Sort genres by frequency and take the top genres
            const sortedGenres = Object.keys(genreCount).sort((a, b) => genreCount[b] - genreCount[a]);
            const topGenres = sortedGenres.slice(0, 10);  // Get top 10 genres

            res.json({ topGenres, genreCount });  
        } else {
            console.error('Error fetching top genres:', body);
            res.status(response.statusCode).json(body); 
        }
    });
});

module.exports = router;