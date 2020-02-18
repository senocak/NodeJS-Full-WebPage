var     path = require('path'),
        express = require("express"),
        Yazi = require("../model/Yazi"),
        Kategori = require("../model/Kategori"),
        Yorum = require("../model/Yorum"),
        fs = require('fs'),
        stackoverflow = JSON.parse(fs.readFileSync('./database/veriler/stackoverflow.json')),
        github = JSON.parse(fs.readFileSync('./database/veriler/github.json'));

module.exports.hakkimda = async(req, res)=>{
    const kategoriler = await Kategori.find({}).sort({ tarih: -1 });
    res.render("hakkimda", {kategoriler, stackoverflow, github});
}
module.exports.index = async(req, res, next)=>{
    const limit = 9;
    var sira = req.params.sira;
    var aktif = sira;
    if (typeof sira === "undefined" | sira == "1") {
        sira = 0;
        aktif = 1;
    }else{
        sira = sira - 1;
        sira = sira * limit;
    }
    const yazilar = await Yazi.find({}).populate('kategori').sort({oneCikarilan: -1}).sort({ sira: 1 }).limit(limit).skip(sira); //.count()
    const aktif_sayfa_yazilar = await Yazi.find({}).populate('kategori').sort({ tarih: -1 }).limit(limit).skip(sira).countDocuments()
    if (aktif_sayfa_yazilar == "0") {
        res.redirect('/');
        console.log("Please seed the db first."); // If there is no post at all. It will redirect forever.
    }else{
        var toplam = await Yazi.find({}).countDocuments();
        toplam = toplam / limit;
        const kategoriler = await Kategori.find({}).sort({ tarih: -1 });
        const baseUrl = "/";
        res.render("index", {yazilar, toplam, aktif, kategoriler, baseUrl, stackoverflow, github});
    }
}
module.exports.kategoriIndex = async(req, res, next)=>{
    const kategori_url = req.params.kategori_url;
    const kategori = await Kategori.find({url:kategori_url});
    const kategori_id = kategori[0]._id;
    const limit = 6;
    var sira = req.params.sira;
    var aktif = sira;
    if (typeof sira === "undefined" | sira == "1") {
        sira = 0;
        aktif = 1;
    }else{
        sira = sira - 1;
        sira = sira * limit;
    }
    const yazilar = await Yazi.find({kategori:kategori_id}).populate('kategori').sort({oneCikarilan: -1}).sort({ tarih: -1 }).limit(limit).skip(sira); //.count()
    const aktif_sayfa_yazilar = await Yazi.find({}).populate('kategori').sort({ tarih: -1 }).limit(limit).skip(sira).countDocuments()
    if (aktif_sayfa_yazilar == "0") {
        res.redirect('/');
        console.log("Please seed the db first."); // If there is no post at all. It will redirect forever.
    }else{
        var toplam = await Yazi.find({kategori:kategori_id}).countDocuments();
        toplam = toplam / limit;
        const kategoriler = await Kategori.find({}).sort({ tarih: -1 });
        const baseUrl = "/kategori/"+kategori_url+"/";
        res.render("index", {yazilar, toplam, aktif, kategoriler, baseUrl, stackoverflow, github});
    }
}
module.exports.yorumEklePost = async(req, res)=>{
    const myobj = {
        email: req.body.email,
        yorum: req.body.yorum,
        yazi:req.body.yazi_id
    };
    Yorum.create(myobj, (err, post) => {
        if (err) console.log("Error:"+err);
        res.redirect('/yazi/'+req.body.yazi_url);
    });
}
module.exports.yazi = async(req, res)=>{
    const yazi_url = req.params.yazi_url;
    const yazilar = await Yazi.find({url:yazi_url}).populate('kategori');
    var yazi_id;
    yazilar.forEach(element => { yazi_id = element._id; });
    const yorumlar = await Yorum.find({yazi:yazi_id}).sort({ tarih: -1 }).populate('yazi');
    const kategoriler = await Kategori.find({}).sort({ tarih: -1 });
    res.render("yazi", {yazilar, yorumlar, kategoriler, stackoverflow, github});
}