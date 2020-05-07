const   express         = require('express'),
        app             = new express(),
        Route           = require("./route"),
        mongoose        = require('mongoose'),
        expressEdge     = require('express-edge'),
        cookieParser    = require('cookie-parser'),
        session         = require('express-session'),
        fileUpload      = require("express-fileupload"),
        logger          = require('morgan'),
        edge            = require('edge.js'),
        moment          = require('moment'),
        dotenv          = require('dotenv').config();
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
    expires: new Date(Date.now() + (30 * 86400 * 1000)) ,
    secret: 'anil-senocak',
    resave: true,
    saveUninitialized: true,
}));
edge.global('date', function (tarih, format){
    return moment(tarih).format(format)
})
mongoose.connect(process.env.MongoConnection, { useNewUrlParser: true }).then(() => console.error(`Mongo Bağlandı`)).catch(error => console.error(`Mongo Bağlantı Hatası:${error}`))
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.listen(process.env.PORT, () => { console.log(`http://localhost:${process.env.PORT}`); });