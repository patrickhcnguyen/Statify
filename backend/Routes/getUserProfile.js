/**
 this file is used mostly for grabbing the spotify user_id and display_name, which we need in order to create playlists
 */

 const express = require('express');
const request = require('request');
const router = express.Router();

router.get('/user-profile', function(req, res) {
    const accessToken = req.cookies.access_token; 

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const options = {
        url: 'https://api.spotify.com/v1/me', 
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json({
                id: body.id,
                displayName: body.display_name
            });
        } else {
            console.error('Error fetching user profile:', body);
            res.status(response.statusCode).json(body); 
        }
    });
});

router.get('/user-follows', function(req, res) {
    const accessToken = req.cookies.access_token; 

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const options = {
        url: 'https://api.spotify.com/v1/me/following?type=artist',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    }

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json(body);
        } else {
            res.status(response.statusCode).json(body);
        }
    });
});

module.exports = router;