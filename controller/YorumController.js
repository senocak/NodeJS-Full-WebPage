const   path = require('path'),
        express = require("express"),
        Yazi = require("../model/Yazi"),
        Yorum = require("../model/Yorum"),
        Kategori = require("../model/Kategori"),
        fs = require('fs'),
        stackoverflow = JSON.parse(fs.readFileSync('./database/veriler/stackoverflow.json')),
        github = JSON.parse(fs.readFileSync('./database/veriler/github.json'));

module.exports.YorumListGet = async(req, res)=>{
    const yorumlar = await Yorum.find({}).populate('yazi')
    var user = {userId:req.session.userId, userEmail : req.session.userEmail }
    const kategoriler = await Kategori.find({}).sort({ tarih: -1 })
    res.render("yorum", {yorumlar, user, kategoriler, stackoverflow, github});
}
module.exports.YorumSilGet = async(req, res)=>{
    const yorum_id = req.params.yorum_id;
    Yorum.findOneAndRemove({ _id: yorum_id }, function(err, obj) {});
    res.redirect('/admin/yorum');
}