require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request');


const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

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
    res.cookie('spotify_auth_state', state);

    const redirectUri = process.env.REDIRECT_URI || `https://api.statify.app/callback`;
    
    const scope = 'user-read-private user-read-email user-read-recently-played user-top-read playlist-modify-public playlist-modify-private ugc-image-upload user-follow-read'
    
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirectUri,
        show_dialog: true,
        state: state
      }));
});

router.get('/logout', (req, res) => {
    res.clearCookie('access_token', { httpOnly: true });
    res.clearCookie('refresh_token', { httpOnly: true });
    res.redirect('/'); 
});

router.get('/check-login-status', (req, res) => {
    const accessToken = req.cookies.access_token;
    
    if (!accessToken) {
        return res.json({ isLoggedIn: false });
    }
    
    // Verify the token is valid by making a request to Spotify
    const options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
    
    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json({ 
                isLoggedIn: true,
                user: {
                    id: body.id,
                    displayName: body.display_name
                }
            });
        } else {
            // Token is invalid
            res.json({ isLoggedIn: false });
        }
    });
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
                redirect_uri: process.env.REDIRECT_URI || 'https://api.statify.app/callback',
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
                    secure: false,
                    sameSite: 'Lax',
                    maxAge: 3600000
                });

                res.cookie('refresh_token', refresh_token, { 
                    path: '/',
                    httpOnly: true,
                    secure: false,
                    sameSite: 'Lax',
                    maxAge: 7 * 24 * 3600000
                });

                console.log('Access token set in cookie:', access_token);
                console.log("Refresh token is:", refresh_token);

                res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000'); 
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
                secure: false,
                sameSite: 'Lax',
                maxAge: 3600000
            });

            res.cookie('refresh_token', refresh_token, { 
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 3600000
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