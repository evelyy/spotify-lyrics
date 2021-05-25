const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const superagent = require('superagent');
const axios = require('axios');
const Genius = require("genius-lyrics");
const Client = new Genius.Client("top-secret-optional-key");


router.use(cookieParser());

// GET home page
router.get('/', (req, res, next) => {
    if(req.cookies.spotifyAccessToken) {
        if(req.cookies.geniusAccessToken) {
            // we have both tokens !
            superagent
                .get('https://api.spotify.com/v1/me/player')
                .set('Authorization', `Bearer ${req.cookies.spotifyAccessToken}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .then(spotifyRes => {
                    // console.log(spotifyRes);
                    const track = JSON.parse(spotifyRes.text).item;
                    // console.log(track);
                    const accessToken = `Bearer ${req.cookies.geniusAccessToken}`;
                    console.log(accessToken);
                    // genius call
                    const term = encodeURIComponent(`${track.name} ${track.artists[0].name}`)
                    const config = {};
                    config.headers = {};
                    config.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36";
                    config.headers["Authorization"] = accessToken;
                    // axios.get(`api.genius.com/search?q=${term}`, config)
                    //     .then(geniusRes => {
                    //         console.log(geniusRes);
                    //     })
                    //     .catch(geniusErr => {
                    //         console.log(geniusErr);
                    //     })
                    // superagent
                    //     .get('api.genius.com/search')
                    //     .send('Authorization', accessToken)
                    //     // .set('Accept', 'application/json')
                    //     .send('q', `west lachie`)
                    //     .then(geniusRes => {
                    //         console.log(geniusRes);
                    //     })
                    //     .catch(geniusErr => {
                    //         console.log(geniusErr.response.res.text);
                    //     })
                    res.render('playing', { 
                        title: `now playing: ${track.name}`, 
                        trackName: track.name, 
                        artistName: track.artists[0].name, 
                        albumArt: track.album.images[1].url,
                        artistLink: track.artists[0].external_urls.spotify,
                        trackLink: track.external_urls.spotify
                    });
                })
                .catch(spotifyErr => {
                    console.log(spotifyErr);
                    res.render('error');
                    next(createError(spotifyErr));
                })
            
        } else {
            res.redirect('/login/genius');
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;