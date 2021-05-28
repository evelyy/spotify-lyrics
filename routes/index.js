const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const getLyrics = require('../getLyrics');
const superagent = require('superagent');
const fs = require('fs');

var geniusKey;
fs.readFile('./tokens.json', 'utf8', (error, data) => {
    if(error) {
        console.log('error');
    } else {
        const json_data = JSON.parse(data);
        geniusKey = data.genius_api_token;
    }
});

router.use(cookieParser());

// GET home page
router.get('/', async (req, res, next) => {
    if(req.cookies.spotifyAccessToken) {
        if(req.cookies.geniusAccessToken) {
            // we have both tokens !
            const track = await spotifyFetch(req).catch('fuck');
            if(!track)
                res.render('nothing_playing')
            else {
                var trackName;
                // remove the most common remaster syntax so genius can parse
                if (track.name.includes(' - ') && track.name.toUpperCase().includes('REMASTER')) {
                    trackName = track.name.split(' - ')[0];
                } else {
                    trackName = track.name;
                }
                var lyrics = await geniusFetch(track, req.cookies.geniusAccessToken, trackName);
                // if nothing is found function returns null
                if (lyrics)
                    lyrics = lyrics.split('\n');
                else
                    lyrics = 'No lyrics found!';
                res.render('playing', { 
                    title: `now playing: ${track.name}`, 
                    trackName: track.name,
                    artistName: track.artists[0].name, 
                    albumArt: track.album.images[1].url,
                    artistLink: track.artists[0].external_urls.spotify,
                    trackLink: track.external_urls.spotify,
                    lastfmTrackName: encodeURI(trackName),
                    lastfmArtistName: encodeURIComponent(track.artists[0].name),
                    lyrics: lyrics
                });
            }
        } else {
            res.redirect('/login/genius');
        }
    } else {
        res.redirect('/login/spotify');
    }
});

async function spotifyFetch(req) {
    return new Promise((resolve, reject) => {
        superagent
        .get('https://api.spotify.com/v1/me/player')
        .set('Authorization', `Bearer ${req.cookies.spotifyAccessToken}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then(spotifyRes => {
            let response = JSON.parse(spotifyRes.text)
            if (response.is_playing)
                resolve(response.item);
            else
                resolve(null)
        })
        .catch(spotifyErr => {
            reject(spotifyErr);
        })
    })
    
}

async function geniusFetch(track, apiKey, trackName) {
    config = {
        apiKey: apiKey,
        title: trackName,
        artist: track.artists[0].name
    }
    let lyrics = await getLyrics(config).catch('whoops');
    return lyrics;
}

module.exports = router;