const express = require('express');
const request = require('request');
const router = express.Router();

router.get('/recently-played', function(req, res) {
    const accessToken = req.cookies.access_token; 

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const options = {
        url: 'https://api.spotify.com/v1/me/player/recently-played',
        qs: {
            limit: 20, 
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
            console.error('Error fetching recently played:', body);
            res.status(response.statusCode).json(body);  
        }
    });
});

module.exports = router;