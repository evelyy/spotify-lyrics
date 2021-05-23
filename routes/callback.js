const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');

router.use(cookieParser());

// GET login page
router.get('/', (req, res, next) => {
    if(!req.query.error && req.query.state === req.cookies.state) {
        res.cookie('accessToken', req.query.code, { maxAge: 900000, httpOnly: true });
        res.redirect('/');
    } else {
        next(createError(406))
    }
});

module.exports = router;