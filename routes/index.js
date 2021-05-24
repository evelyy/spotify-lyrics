const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const superagent = require('superagent');


router.use(cookieParser());

// GET home page
router.get('/', (req, res, next) => {
    if(req.cookies.accessToken) {
        console.log(req.cookies.accessToken);
        superagent
            .get('https://api.spotify.com/v1/me/player')
            .set('Authorization', `Bearer ${req.cookies.accessToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .then(spotifyRes => {
                const track = JSON.parse(spotifyRes.text).item
                res.render('playing', { trackName: track.name, artistName: track.artists[0].name});
            })
            .catch(spotifyErr => {
                res.render('error');
                next(createError(spotifyErr));
            })

    } else {
        res.redirect('/login');
    }
});

module.exports = router;