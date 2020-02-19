const   path = require('path'),
        fs = require('fs'),
        stackoverflow = JSON.parse(fs.readFileSync('./database/veriler/stackoverflow.json')),
        github = JSON.parse(fs.readFileSync('./database/veriler/github.json')),
        axios = require('axios'),
        Kategori = require("../../model/Kategori"),
        Kullanici = require("../../model/Kullanici");

module.exports.index = async(req, res)=>{
    const kategoriler = await Kategori.find({}).sort({ tarih: -1 })
    res.render("admin.ayar", { kategoriler, stackoverflow, github })
}
module.exports.fetchStackoverflow = async(req, res)=>{
    const username = req.params.username
    const stackoverflow = await axios.get('https://api.stackexchange.com/2.2/users/'+username+'?order=desc&sort=reputation&site=stackoverflow').then(function (response) {return response.data;})
    setTimeout(function() {
        fs.writeFile('./database/veriler/stackoverflow.json', JSON.stringify(stackoverflow), function (error) {
            if (error){
                res.status(400).json({"status":false, "data": error})
            }else{
                res.status(200).json({"status":true, "data": stackoverflow})
            }
        });
    }, 3500);
}
module.exports.fetchGithub = async(req, res)=>{
    const username = req.params.username
    const github = await axios.get('https://api.github.com/users/'+username).then(function (response) {return response.data;})
    setTimeout(function() {
        fs.writeFile('./database/veriler/github.json', JSON.stringify(github), function (error) {
            if (error){
                res.status(400).json({"status":false, "data": error})
            }else{
                res.status(200).json({"status":true, "data": github})
            }
        });
    }, 3500);
}
