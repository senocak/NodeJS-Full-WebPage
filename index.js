const   express = require('express'),
        app = new express(),
        Route = require("./route"),
        expressEdge = require('express-edge'),
        fileUpload = require("express-fileupload"),
        cookieParser = require('cookie-parser'),
        edge = require('edge.js'),
        moment = require('moment'),
        port = 3000,
        db = require("./database/db"),
        session = require('express-session'),
        redisStore  = require('connect-redis')(session),
        //redis = require('redis'),
        //client  = redis.createClient(),
        logger = require('morgan');
app.use(session({
    //store: new redisStore({ host: '157.230.22.123', port: 3330, client: client,ttl : 260}),
    //store: new redisStore({host: 'localhost', port: 6379, client: client, ttl : 260}),
    expires: new Date(Date.now() + (30 * 86400 * 1000)) ,
    secret: 'anil-senocak',
    resave: true,
    saveUninitialized: true,
}));
edge.global('date', function (tarih, format) {
    return moment(tarih).format(format)
})
app.use(expressEdge);
app.use(fileUpload());
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(Route);
app.set('views', __dirname + '/views');

app.listen(port, () => { console.log('http://localhost:'+port) });