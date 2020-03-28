const   mongoose    = require('mongoose'),
        dotenv      = require('dotenv').config({path:__dirname+'/./../.env'})
        fs          = require('fs');
mongoose.connect(process.env.MongoConnection, { useNewUrlParser: true })
        .then(() =>  console.error('Connected to Mongo'))
        .catch(err => console.error('Something wrong', err))
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const Kategori = require('../model/Kategori');
Kategori.collection.drop();
let kategoris = fs.readFileSync('../database/veriler/kategoris.json');
let kategoriler = JSON.parse(kategoris);
for(var kategori in kategoriler){
    Kategori.create([
        {
            _id:kategoriler[kategori]._id,
            baslik: kategoriler[kategori].baslik,
            url: kategoriler[kategori].url,
            resim: kategoriler[kategori].resim,
            sira: kategoriler[kategori].sira
        }
    ]);
}

const Yazi = require('../model/Yazi');
Yazi.collection.drop();
let yazis = fs.readFileSync('../database/veriler/yazis.json');
let yazilar = JSON.parse(yazis);
for(var yazi in yazilar){
    Yazi.create([
        {
            _id: yazilar[yazi]._id,
            baslik: yazilar[yazi].baslik,
            url: yazilar[yazi].url,
            icerik: yazilar[yazi].icerik,
            kategori: yazilar[yazi].kategori,
            tarih: yazilar[yazi].tarih,
            oneCikarilan: yazilar[yazi].oneCikarilan,
            etiketler: yazilar[yazi].etiketler,
        }
    ]);
}

const Yorum = require('../model/Yorum');
Yorum.collection.drop();
let yorums = fs.readFileSync('../database/veriler/yorums.json');
let yorumlar = JSON.parse(yorums);
for(var yorum in yorumlar){
    Yorum.create([
        {
            _id: yorumlar[yorum]._id,
            email: yorumlar[yorum].email,
            yorum: yorumlar[yorum].yorum,
            yazi: yorumlar[yorum].yazi
        }
    ]);
}
const Kullanici = require('../model/Kullanici');
Kullanici.collection.drop();
Kullanici.create([
    {
        _id:"5cb9bb7ab9acda2d6cf92b37",
        email: 'lorem@ipsum.com',
        sifre: 'lorem',
        github_username: "senocak",
        github_value:"github_value",
        stackoverflow_username:"11922928",
        stackoverflow_value:"stackoverflow_value"
    }
])
//module.exports = Kategori, Yazi, Yorum, Kullanici;