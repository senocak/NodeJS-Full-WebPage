let     
        bcrypt          = require('bcrypt'),
        jwt             = require('jsonwebtoken'),
        Yazi            = require("../model/Yazi"),
        Kategori        = require("../model/Kategori"),
        Yorum           = require("../model/Yorum"),
        Kullanici       = require("../model/Kullanici"),
        NOTFOUND        = {"mesaj":"Kayıt Bulunamadı"},
        STATUS_CODE     = 200;

module.exports.getTumYazilar = async(req, res)=>{
    var sayfa       = req.query.sayfa,
        limit       = 6;
    if (sayfa == undefined || sayfa == "" || sayfa == "0" || sayfa == 0 || sayfa == 1 || !Number.isInteger(sayfa)) {
        sayfa = 0
    }
    var yazilar        = await Yazi.find({}).sort({oneCikarilan: -1}).sort({ sira: 1 }).populate('kategori').limit(limit).skip((sayfa * limit)),
        yazilar_toplam = await Yazi.find({}).sort({oneCikarilan: -1}).sort({ sira: 1 }).populate('kategori').countDocuments()

    res.status(STATUS_CODE).json({
        yazilar: yazilar,
        "sayfa":{
            "aktif": sayfa == 0 ? 1 : parseInt(sayfa),
            "toplam": yazilar_toplam
        }
    });
}
module.exports.getTumKategoriler = async(req, res)=>{
    var kategoriler = await Kategori.find({}).sort({ tarih: -1 });
    res.json(kategoriler);
}
module.exports.getYazi = async(req, res)=>{
    var yazi_url    = req.params.yazi_url,
        yazi        = await Yazi.findOne({url:yazi_url}).populate('kategori');
    if (yazi == null || yazi == undefined || yazi.length == 0) {
        yazi        = NOTFOUND
        STATUS_CODE = 404
    }
        res.status(STATUS_CODE).json(yazi);
}
module.exports.getYorumlar = async(req, res)=>{
    var populate = req.query.populate,
        yorumlar = await Yorum.find({}).sort({ tarih: -1 });
    if (populate == 1 || populate == "1") {
        yorumlar = await Yorum.find({}).sort({ tarih: -1 }).populate("yazi");
    }
    res.json(yorumlar);
}
module.exports.getYorumForYazi = async(req, res)=>{
    var yazilar     = await Yazi.findOne({url: req.params.yazi_url}),
        yorum       = NOTFOUND,
        populate    = req.query.populate

    if (yazilar == undefined || yazilar == null) {
        STATUS_CODE = 400
    }else{
        if (populate == 1 || populate == "1") {
            yorum = await Yorum.find({yazi:yazilar._id}).populate("yazi");
        }else{
            yorum = await Yorum.find({yazi:yazilar._id})
        }
    }
    res.status(STATUS_CODE).json(yorum);
}
module.exports.getKategori = async(req, res)=>{
    var kategori_url    = req.params.kategori_url,
        kategoriler     = await Kategori.findOne({url:kategori_url});
        if (kategoriler == null) {
            STATUS_CODE = 400
            kategoriler = NOTFOUND
        }
    res.status(STATUS_CODE).json(kategoriler);
}
module.exports.postLogin = async(req, res)=>{
    const   email        = req.body.email,
            sifre        = req.body.sifre
        let kullanici    = await Kullanici.findOne({email:email, sifre:sifre}).countDocuments(),
            auth         = "";
        if (kullanici == "0") {
            STATUS_CODE = 400
            auth        = NOTFOUND
        }else{
            kullanici   = await Kullanici.findOne({email:email, sifre:sifre})
            STATUS_CODE = 200
            auth        = "Bearer " + jwt.sign({ email: kullanici.email, sifre: bcrypt.hashSync(kullanici.sifre, 8) }, process.env.jwtKey, {expiresIn: 86400})
        }
    res.status(STATUS_CODE).json({auth});
}
module.exports.postProfile = async(req, res)=>{
    const   email       = req.email.email,
            sifre       = req.email.sifre,
            kullanici   = await Kullanici.findOne({email:email})
   res.status(STATUS_CODE).json({
       "email": kullanici.email,
       "github_username": kullanici.github_username,
       "stackoverflow_username": kullanici.stackoverflow_username
   })
}
module.exports.authenticateJWT = (req, res, next)=>{
    let token = req.headers.authorization
    if (token) {
        token = token.split(' ')[1]
        jwt.verify(token, process.env.jwtKey, (err, email) => {
            if (err) {
                NOTFOUND.mesaj = err.message
                return res.status(401).json(NOTFOUND);
            }
            req.email = email;
            next();
        });
    } else {
        NOTFOUND.mesaj = {"mesaj":"Token must be provided"}
        return res.status(401).json(NOTFOUND);
    }
}