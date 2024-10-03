const express = require('express');
const request = require('request');
const router = express.Router();

router.get('/top-artists', function(req, res) {
    const accessToken = req.cookies.access_token; // Get the access token from cookies

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get's time range from time query, defaults to 'short_term'
    const timeRange = req.query.time_range || 'short_term'; 

    const options = {
        url: 'https://api.spotify.com/v1/me/top/artists',
        qs: {
            limit: 20,
            time_range: timeRange 
        },
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(body);  
        } else {
            console.error('Error fetching top artists:', body);
            res.status(response.statusCode).json(body);  
        }
    });
});

module.exports = router;
