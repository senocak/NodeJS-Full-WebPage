const   express = require('express'),
        app = new express(),
        Route = require("./route"),
        mongoose = require('mongoose'),
        session = require('express-session'),
        expressEdge = require('express-edge'),
        fileUpload = require("express-fileupload"),
        cookieParser = require('cookie-parser'),
        logger = require('morgan'),
        edge = require('edge.js'),
        moment = require('moment'),
        dotenv = require('dotenv'),
        redisStore  = require('connect-redis')(session),
        redis = require('redis'),
        client  = redis.createClient();
dotenv.config();
app.use(expressEdge);
app.use(fileUpload());
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(Route);
app.set('views', __dirname + '/views');
app.use(session({
    //store: new redisStore({ host: '157.230.22.123', port: 3330, client: client, ttl : 260}),
    store: new redisStore({host: process.env.RedisHost, port: process.env.RedisPort, client: client, ttl : 260}),
    expires: new Date(Date.now() + (process.env.SessionExpireDay * 86400 * 1000)) ,
    secret: 'anil-senocak',
    resave: true,
    saveUninitialized: true,
}));
edge.global('date', function (tarih, format) {
    return moment(tarih).format(format)
})
mongoose.connect(process.env.MongoConnection, { useNewUrlParser: true }).then(() =>  console.error('Connected to Mongo')).catch(err => console.error('Something wrong', err))
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.listen(process.env.PORT, () => { console.log(`http://localhost:${process.env.PORT}`); });