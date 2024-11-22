require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request');

// Aggieworks reviewers look here!!!!!!!!!!!!!!

const client_id = "54da85c1c7114ffb810148c9cbdede29";
const client_secret = "e2abdb2c6d594b229a47f11aabeb7f92";
const redirect_uri = 'http://localhost:8888/callback';

const generateRandomString = (length) => {
    return crypto
        .randomBytes(60)
        .toString('hex')
        .slice(0, length);
}

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Spotify Authentication Service");
});

router.get('/login', function(req, res) {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email user-read-recently-played user-top-read playlist-modify-public playlist-modify-private ugc-image-upload';

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
        show_dialog: true // Forces Spotify login prompt to show up
      }));
      
});

router.get('/logout', (req, res) => {
    res.clearCookie('access_token', { httpOnly: true });
    res.clearCookie('refresh_token', { httpOnly: true });
    res.redirect('/'); 
});

router.get('/check-login-status', (req, res) => {
    const accessToken = req.cookies['access_token'];
    
    if (accessToken) {
      res.json({ isLoggedIn: true });
    } else {
      res.json({ isLoggedIn: false });
    }
  });

router.get('/callback', function(req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    } else {
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                const access_token = body.access_token;
                const refresh_token = body.refresh_token;

                res.cookie('access_token', access_token, {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                    maxAge: 3600000
                });

                res.cookie('refresh_token', refresh_token, { 
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                    maxAge: 7 * 24 * 3600000
                });

                console.log('Access token set in cookie:', access_token);
                console.log("Refresh token is:", refresh_token);

                res.redirect('http://localhost:3000'); 
            } else {
                console.error('Token exchange error:', body); 
                res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
            }
        });
    }
});

router.post('/refresh-token', function(req, res) {
    const refresh_token = req.cookies.refresh_token;
    
    if (!refresh_token) {
        return res.status(401).json({ error: 'No refresh token' });
    }

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            
            res.cookie('access_token', access_token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 3600000
            });

            res.json({ success: true });
        } else {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    });
});

module.exports = router;