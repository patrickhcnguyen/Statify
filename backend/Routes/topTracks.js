const express = require('express');
const request = require('request');
const router = express.Router();

router.get('/top-tracks', function(req, res) {
    const accessToken = req.cookies.access_token;
    console.log("access token is:", accessToken)
    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeRange = req.query.time_range || 'short_term'; 

    const options = {
        url: 'https://api.spotify.com/v1/me/top/tracks',
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
        if (error) {
            console.error('Request error:', error);
            return res.status(500).json({ error: 'Error fetching data from Spotify' });
        }
        
        if (response.statusCode === 200) {
            res.json(body);  
        } else {
            console.error('Error fetching top tracks:', body);
            res.status(response.statusCode).json(body);  
        }
    });
});

module.exports = router;