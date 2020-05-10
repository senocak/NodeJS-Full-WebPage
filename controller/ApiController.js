let     
        bcrypt          = require('bcrypt'),
        jwt             = require('jsonwebtoken'),
        Yazi            = require("../model/Yazi"),
        Kategori        = require("../model/Kategori"),
        Yorum           = require("../model/Yorum"),
        Kullanici       = require("../model/Kullanici"),
        RESPONSE_MESAJ  = {"mesaj":"Kayıt Bulunamadı"},
        STATUS_CODE     = 200,
        path            = require('path'),
        fs              = require('fs')

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
        yazi        = RESPONSE_MESAJ
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
        yorum       = RESPONSE_MESAJ,
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
            kategoriler = RESPONSE_MESAJ
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
            auth        = RESPONSE_MESAJ
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
module.exports.postKategoriEkle = async(req, res)=>{
    if (req.files == null || req.files == undefined) {
        RESPONSE_MESAJ.mesaj = "Resim Eklemek Zorundasınız"
        STATUS_CODE = 400
    }else{
        const   resim   =   req.files.resim,
                baslik  =   req.body.baslik
        if (baslik == null || baslik == undefined || baslik == "") {
            STATUS_CODE = 403
            RESPONSE_MESAJ.mesaj = "Baslik Eklenmeli"
        }else{
            const   myobj       = { baslik: req.body.baslik, url: baslik.url(), resim: resim.name }
            const kategori = await Kategori.create(myobj).catch(function(err){
                if (err == null) {
                    return true
                }else{
                    RESPONSE_MESAJ.mesaj = err.message
                    return false
                }
            });
            if (kategori) {
                const resim_ekle  = await resim.mv(path.resolve(__dirname+'/../public/kategori/'+resim.name)).then((err)=>{return err == null ? true : err.message})
                if (resim_ekle) {
                    STATUS_CODE = 201
                    RESPONSE_MESAJ.mesaj = "Kategori Eklendi"
                }else{
                    STATUS_CODE = 400
                    RESPONSE_MESAJ.mesaj = "Resim Eklerken Bir Problem Oluştu"
                }
            }else{
                STATUS_CODE = 400
            }
        }
    }
    res.status(STATUS_CODE).json(RESPONSE_MESAJ)
}
module.exports.postKategoriDuzenle = async(req, res)=>{
    let kategori = await Kategori.findOne({url: req.params.kategori_url});
    if (kategori == null) {
        STATUS_CODE = 400
        RESPONSE_MESAJ.mesaj = "Kategori Yok"
    }else{
        let     baslik  = (req.body.baslik != null  && req.body.baslik != undefined && req.body.baslik != "")   ? req.body.baslik : null,
                resim   = (req.files != null        && req.files != undefined       && req.files != "")         ? req.files.resim : null,
                myobj   = {}
        if (baslik == null && resim == null) {
            myobj = {}
        }else if (baslik != null && resim == null) {
            myobj = { baslik: req.body.baslik, url: baslik.url() }
        }else if (baslik == null && resim != null) {
            myobj = {resim: resim.name }
        }else{
            myobj = { baslik: req.body.baslik, url: baslik.url(), resim: resim.name }
        }
        const kategoriUpdated = await Kategori.updateOne({"_id":kategori._id}, myobj).catch(function(err){
            return err == null ? true : err.message
        });
        if (kategoriUpdated) {
            RESPONSE_MESAJ.mesaj = "Kategori Güncellendi"
            if (resim != null) {
                const resim_ekle  = await resim.mv(path.resolve(__dirname+'/../public/kategori/'+resim.name)).then((err)=>{return err == null ? true : err.message})
                if (resim_ekle) {
                    STATUS_CODE = 200
                    RESPONSE_MESAJ.mesaj = "Kategori Resim ile Güncellendi"
                    fs.unlinkSync(__dirname+'/../public/kategori/'+kategori.resim);
                }else{
                    STATUS_CODE = 400
                    RESPONSE_MESAJ.mesaj = "Resim Güncelleme Hatası:"+resim_ekle
                }
            }
        }else{
            STATUS_CODE = 400
            RESPONSE_MESAJ.mesaj = kategoriUpdated
        }
    }
    res.status(STATUS_CODE).json(RESPONSE_MESAJ);
}
module.exports.postKategoriSil = async(req, res)=>{
    let kategori = await Kategori.findOne({url: req.params.kategori_url});
    if (kategori == null) {
        STATUS_CODE = 400
        RESPONSE_MESAJ.mesaj = "Kategori Yok"
    }else{
        const kategoriDeleted = await Kategori.findOneAndRemove({ _id: kategori._id }).catch(function(err){
            return err == null ? true : err.message
        });
        if (kategoriDeleted) {
            try{
                fs.unlinkSync(__dirname+'/../public/kategori/'+kategori.resim);
            } catch(err) {
                console.log("Dosya Silinme Hatası: "+err)
            }
            STATUS_CODE = 204
            RESPONSE_MESAJ.mesaj = "Kategori Silindi"
        }else{
            STATUS_CODE = 400
            RESPONSE_MESAJ.mesaj = kategoriDeleted
        }
    }
    res.status(STATUS_CODE).json(RESPONSE_MESAJ);
}
module.exports.authenticateJWT = (req, res, next)=>{
    let token = req.headers.authorization
    if (token) {
        token = token.split(' ')[1]
        jwt.verify(token, process.env.jwtKey, (err, email) => {
            if (err) {
                RESPONSE_MESAJ.mesaj = err.message
                return res.status(401).json(RESPONSE_MESAJ);
            }
            req.email = email;
            next();
        });
    } else {
        RESPONSE_MESAJ.mesaj = {"mesaj":"Token must be provided"}
        return res.status(401).json(RESPONSE_MESAJ);
    }
}

String.prototype.url = function(){
    var string = this;
    var letters = { "İ": "i", "I": "i", "Ş": "s", "Ğ": "g", "Ü": "u", "Ö": "o", "Ç": "c" };
    string = string.replace(/(([İIŞĞÜÇÖ]))+/g, function(letter){ return letters[letter]; })
    string = string.replace(/ /g, "-").replace('/?/g', "-").replace(/!/g, "-").replace(/&/g, "-").replace(/%/g, "-").replace(/'/g, "-").replace(/:/g, "-");
    return string.toLowerCase();
}