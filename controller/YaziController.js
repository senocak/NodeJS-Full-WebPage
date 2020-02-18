const   Yazi = require("../model/Yazi"),
        Kategori = require("../model/Kategori"),
        fs = require('fs'),
        stackoverflow = JSON.parse(fs.readFileSync('./database/veriler/stackoverflow.json')),
        github = JSON.parse(fs.readFileSync('./database/veriler/github.json'));

module.exports.yaziListGet = async(req, res)=>{
    const yazilar = await Yazi.find({}).sort({ sira: 1 }).populate('kategori')
    var user = {userId:req.session.userId, userEmail : req.session.userEmail }
    const kategoriler = await Kategori.find({}).sort({ tarih: -1 })
    res.render("yazilar", {yazilar, user, kategoriler, stackoverflow, github});
}
module.exports.yaziEkleGet = async(req, res)=>{
    const kategoriler = await Kategori.find({}).sort({ tarih: -1 })
    var user = {userId:req.session.userId, userEmail : req.session.userEmail }
    res.render("yazi_ekle", {kategoriler, user, stackoverflow, github});
}
module.exports.yaziEklePost = async(req, res)=>{
    const myobj = {
        baslik: req.body.baslik,
        icerik: req.body.icerik,
        url: (req.body.baslik).url(),
        kategori: req.body.kategori,
        etiketler: req.body.etiketler
    };
    Yazi.create(myobj, (err, post) => {
        if (err) console.log("Error:"+err);
        res.redirect('/admin/yazi');
    });
}
module.exports.yaziDuzenleGet = async(req, res)=>{
    const yazi_id = req.params.yazi_id
    const yazi = await Yazi.find({"_id":yazi_id}).populate('kategori')
    const kategoriler = await Kategori.find({}).sort({ tarih: -1 })
    var user = {userId:req.session.userId, userEmail : req.session.userEmail }
    res.render("yazi_duzenle", {kategoriler, yazi, user, stackoverflow, github});
}
module.exports.yaziDuzenlePost = async(req, res)=>{
    const yazi_id = req.params.yazi_id
    var myobj = {
        baslik:req.body.baslik,
        icerik:req.body.icerik,
        kategori:req.body.kategori,
        etiketler:req.body.etiketler
    };
    Yazi.updateOne({"_id":yazi_id},myobj, (err, post) => {
        if (err) console.log("Error:"+err);
        res.redirect('/admin/yazi');
    });
}
module.exports.yaziOneCikarilan = async(req, res)=>{
    const yazi_id = req.params.yazi_id
    var yazi = await Yazi.findOne({"_id":yazi_id}).exec(function(err, post) {
        var durum = 0
        if (post.oneCikarilan == 0) {
            durum = 1
        }
        Yazi.updateOne({"_id":yazi_id},{oneCikarilan:durum}, (err, post) => {
            if (err) console.log("Error:"+err);
            res.redirect('/admin/yazi');
        });
    })
}
module.exports.yaziSilGet = async(req, res)=>{
    const yazi_id = req.params.yazi_id;
    Yazi.findOneAndRemove({ _id: yazi_id }, function(err, obj) {});
    res.redirect('/admin/yazi');
}
module.exports.yaziSiralaPost = async(req, res)=>{
    var sira = 0
    for (var i in req.body.item) {
        id = req.body.item[i];
        sira = sira + 1
        console.log(id + " = " +sira);
        Yazi.updateOne({"_id":id},{ sira: sira }, (err, post) => {});
    }
    res.status(200).json({
        "mesaj":"icerikler yeniden siralandi."
    })
}
String.prototype.url = function(){
    var string = this;
    var letters = { "İ": "i", "I": "i", "Ş": "s", "Ğ": "g", "Ü": "u", "Ö": "o", "Ç": "c" };
    string = string.replace(/(([İIŞĞÜÇÖ]))+/g, function(letter){ return letters[letter]; })
    string = string.replace(/ /g, "-").replace('/?/g', "-").replace(/!/g, "-").replace(/&/g, "-").replace(/%/g, "-").replace(/'/g, "-").replace(/:/g, "-");
    return string.toLowerCase();
}