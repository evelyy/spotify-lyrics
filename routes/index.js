const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const superagent = require('superagent');
const axios = require('axios');


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
                    const accessToken = `Bearer ${req.cookies.geniusAccessToken}`;
                    console.log(accessToken);
                    // genius call
                    axios
                        .get('api.genius.com/search?q=west+lachie', {
                            headers: {
                                Authorization: accessToken
                            }
                        })
                        .then(geniusRes => {
                            console.log(JSON.parse(geniusRes).hits);
                        })
                        .catch(geniusErr => {
                            console.log(geniusErr.Error);
                        })
                    // superagent
                    //     .get('api.genius.com/search')
                    //     .send(Authorization, accessToken)
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
                        albumArt: track.album.images[1].url 
                    });
                })
                .catch(spotifyErr => {
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