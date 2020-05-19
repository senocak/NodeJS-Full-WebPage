const   fs                  = require('fs'),
        path                = require('path'),
        express             = require("express"),
        router              = express.Router(),
        AuthController      = require("./controller/AuthController"),
        indexController     = require("./controller/IndexController"),
        YaziController      = require("./controller/Admin/YaziController"),
        KategoriController  = require("./controller/Admin/KategoriController"),
        YorumController     = require("./controller/Admin/YorumController"),
        AyarController      = require("./controller/Admin/AyarController"),
        ApiController       = require("./controller/ApiController");

router.get("/", indexController.index);
router.get("/hakkimda", indexController.hakkimda);
router.get("/sayfa/:sira", indexController.index);
router.get("/yazi/:yazi_url", indexController.yazi);
router.post("/yazi/yorum/ekle", indexController.yorumEklePost);
router.get("/kategori/:kategori_url", indexController.kategoriIndex);
router.get("/kategori/:kategori_url/sayfa/:sira", indexController.kategoriIndex);

router.get("/admin", AuthController.redirectHome, AuthController.indexGet);
router.post("/admin/login", AuthController.redirectHome, AuthController.indexLoginPost);
router.post("/admin/register", AuthController.redirectHome, AuthController.indexRegisterPost);
router.get("/admin/logout", AuthController.redirectLogin, AuthController.indexlogoutGet);

router.get("/admin/yazi", AuthController.redirectLogin, YaziController.yaziListGet);
router.get("/admin/yazi/ekle", AuthController.redirectLogin, YaziController.yaziEkleGet);
router.post("/admin/yazi/ekle", AuthController.redirectLogin, YaziController.yaziEklePost);
router.get("/admin/yazi/:yazi_id/sil", AuthController.redirectLogin, YaziController.yaziSilGet);
router.get("/admin/yazi/:yazi_id/duzenle", AuthController.redirectLogin, YaziController.yaziDuzenleGet);
router.post("/admin/yazi/:yazi_id/duzenle", AuthController.redirectLogin, YaziController.yaziDuzenlePost);
router.get("/admin/yazi/:yazi_id/oneCikarilan", AuthController.redirectLogin, YaziController.yaziOneCikarilan);
router.post("/admin/yazi/sira", AuthController.redirectLogin, YaziController.yaziSiralaPost);

router.get("/admin/kategori", AuthController.redirectLogin, KategoriController.kategoriListGet);
router.get("/admin/kategori/:kategori_id", AuthController.redirectLogin, KategoriController.kategoriListByIdGet);
router.post("/admin/kategori/ekle", AuthController.redirectLogin, KategoriController.kategoriEklePost);
router.get("/admin/kategori/:kategori_id/sil", AuthController.redirectLogin, KategoriController.kategoriSil);
router.get("/admin/kategori/:kategori_id/duzenle", AuthController.redirectLogin, KategoriController.kategoriDuzenleGet);
router.post("/admin/kategori/:kategori_id/duzenle", AuthController.redirectLogin, KategoriController.kategoriDuzenlePost);

router.get("/admin/yorum", AuthController.redirectLogin, YorumController.YorumListGet);
router.get("/admin/yorum/:yorum_id/sil", AuthController.redirectLogin, YorumController.YorumSilGet);

router.get("/admin/ayar", AuthController.redirectLogin, AyarController.index);
router.get("/admin/ayar/stackoverflow/:username", AuthController.redirectLogin, AyarController.fetchStackoverflow);
router.get("/admin/ayar/github/:username", AuthController.redirectLogin, AyarController.fetchGithub);

router.get('/ckeditor/resimler', function (req, res){
    const images = fs.readdirSync(__dirname+'/public/upload')
    var sorted = []
    for (let item of images){
        if(item.split('.').pop() === 'png' || item.split('.').pop() === 'jpg' || item.split('.').pop() === 'jpeg' || item.split('.').pop() === 'svg'){
            sorted.push({"image" : "/upload/"+item})
        }
    }
    res.render("admin.resimler", { sorted });
})
router.post('/ckeditor/resimler/ekle', function (req, res, next){
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('Resim Seçmek Zorundasınız.');
    }
    const resim = req.files.resim
    resim.mv(path.resolve(__dirname+'/public/upload/'+resim.name),function(error){
        if (error)console.log("Hata:"+error);
    })
    res.redirect('back')
});
router.post('/ckeditor/resimler/sil', function(req, res, next){
    var url_del = 'public' + req.body.url_del
    if(fs.existsSync(url_del)){
        fs.unlinkSync(url_del)
    }
    res.redirect('back')
});
////////////////////// API
router.get("/api/yazilar", ApiController.getTumYazilar);    // ?sayfa=1
router.get("/api/yazilar/:yazi_url", ApiController.getYazi);
router.post("/api/yazilar/ekle", ApiController.authenticateJWT, ApiController.postYaziEkle);
router.put("/api/yazilar/:yazi_url", ApiController.authenticateJWT, ApiController.putYaziDuzenle);
router.delete("/api/yazilar/:yazi_url", ApiController.authenticateJWT, ApiController.deleteYaziSil);

router.get("/api/yorumlar", ApiController.getYorumlar); // ?populate=true
router.get("/api/yorumlar/:yazi_url", ApiController.getYorumForYazi); // ?populate=true
router.post("/api/yorumlar/:yazi_url", ApiController.postYorumForYazi);
router.delete("/api/yorumlar/:yorum_id", ApiController.authenticateJWT, ApiController.deleteYorumForYazi);

router.post("/api/login", ApiController.postLogin);
router.post("/api/profile", ApiController.authenticateJWT, ApiController.postProfile);

router.get("/api/kategoriler", ApiController.getTumKategoriler);
router.get("/api/kategoriler/:kategori_url", ApiController.getKategori); //  ?sayfa=1
router.post("/api/kategoriler/ekle", ApiController.authenticateJWT, ApiController.postKategoriEkle);
router.put("/api/kategoriler/:kategori_url", ApiController.authenticateJWT, ApiController.putKategoriDuzenle);
router.delete("/api/kategoriler/:kategori_url", ApiController.authenticateJWT, ApiController.deleteKategoriSil);

module.exports = router;