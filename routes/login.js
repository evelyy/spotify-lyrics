const express = require('express');
const router = express.Router();
const fs = require('fs');

// GET login page
router.get('/', (req, res, next) => {
    // create url to request to spotify api code to then get access token
    fs.readFile('./tokens.json', 'utf8', (error, data) => {
        if (error) {
            console.log(`Error reading file from disk: ${error}`);
        } else {
            const clientID = JSON.parse(data)[0].client_id;
            const scopes = encodeURIComponent('user-read-playback-state');
            const redirectURI = encodeURIComponent('http://localhost:3000/callback');
            const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            res.cookie('spotifyState', state, { maxAge: 900000, httpOnly: true });
            res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=${scopes}&redirect_uri=${redirectURI}&state=${state}`);
        }
    }
)});

router.get('/genius', (req, res, next) => {
    fs.readFile('./tokens.json', 'utf8', (error, data) => {
        if (error) {
            console.log(`Error reading file from disk: ${error}`);
        } else {
            const clientID = JSON.parse(data)[0].genius_client_id;
            const scope = '';
            const redirect_uri = encodeURIComponent('http://localhost:3000/callback/genius');
            const response_type = 'code';
            const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            res.cookie('geniusState', state, { maxAge: 900000, httpOnly: true });
            res.redirect(`https://api.genius.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}&response_type=${response_type}`);
        }
    }
)});

module.exports = router;