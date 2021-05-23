const express = require('express');
const path = require('path');
const createError = require('http-errors');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const callbackRouter = require('./routes/callback');

const app = express();
const PORT = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/callback', callbackRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    // set locals, log err in dev
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}.`)
})