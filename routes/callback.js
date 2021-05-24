const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const superagent = require('superagent');
fs = require('fs');

router.use(cookieParser());

// GET login page
router.get('/', (req, res, next) => {
    if(!req.query.error && req.query.state === req.cookies.state) {
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
                        redirect_uri: 'http://localhost:3000/callback'
                    })
                    .then(response => {
                        res.cookie('accessToken', response.body.access_token, { maxAge: response.body.expires_in * 1000, httpOnly: true });
                        res.cookie('refreshToken', response.body.refresh_token, { maxAge: 9999999999, httpOnly: true });
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

module.exports = router;