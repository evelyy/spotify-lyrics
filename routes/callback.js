const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const superagent = require('superagent');
const fs = require('fs');
const { response } = require('express');

router.use(cookieParser());

// GET login page
router.get('/spotify', (req, res, next) => {
    if(!req.query.error && req.query.state === req.cookies.spotifyState) {
        // read sensitive info from file and then post to spotify api for auth token
        fs.readFile('./tokens.json', 'utf8', (error, data) => {
            if (error) {
                console.log(`Error reading file from disk: ${error}`);
            } else {
                const json_data = JSON.parse(data);
                const code = Buffer.from(`${json_data[0].client_id}:${json_data[0].client_secret}`).toString('base64');
                superagent
                    .post('https://accounts.spotify.com/api/token')
                    .set('Authorization', `Basic ${code}`)
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({
                        grant_type: 'authorization_code',
                        code: req.query.code,
                        redirect_uri: 'http://localhost:3000/callback/spotify'
                    })
                    .then(response => {
                        res.cookie('spotifyAccessToken', response.body.access_token, { maxAge: response.body.expires_in * 1000, httpOnly: true });
                        res.cookie('spotifyRefreshToken', response.body.refresh_token, { maxAge: 9999999999, httpOnly: true });
                        res.redirect('/');
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        })
    } else {
        next(createError(406))
    }
});

// get genius api callback and deal with it
router.get('/genius', (req, res, next) => {
    // console.log(req.query);
    if(!req.query.error && req.query.state === req.cookies.geniusState) {
        fs.readFile('./tokens.json', 'utf8', (fileError, fileData) => {
            if(fileError) {
                console.log(`Error reading file from disk: ${fileError}`);
            } else {
                const json_data = JSON.parse(fileData);
                const geniusClientID = json_data[0].genius_client_id;
                const geniusClientSecret = json_data[0].genius_client_secret;
                superagent
                    .post('https://api.genius.com/oauth/token')
                    .send({
                        code: req.query.code,
                        client_secret: geniusClientSecret,
                        grant_type: 'authorization_code',
                        client_id: geniusClientID,
                        redirect_uri: 'http://localhost:3000/callback/genius',
                        response_type: 'code'
                    })
                    .then(geniusRes => {
                        console.log(geniusRes.body.access_token);
                        res.cookie('geniusAccessToken', geniusRes.body.access_token, { maxAge: 999999999999999999, httpOnly: true });
                        res.redirect('/');
                    })
                    .catch(geniusErr => {
                        console.log(geniusErr);
                    })
            }
        });

    } else {
        next(createError(406))
    }
})

module.exports = router;