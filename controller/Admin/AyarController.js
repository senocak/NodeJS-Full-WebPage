const   path = require('path'),
        fs = require('fs'),
        stackoverflow = JSON.parse(fs.readFileSync('./database/veriler/stackoverflow.json')),
        github = JSON.parse(fs.readFileSync('./database/veriler/github.json')),
        axios = require('axios');

module.exports.index = async(req, res)=>{
    res.render("admin.ayar", { stackoverflow, github })
}
module.exports.fetchGithub = async(req, res)=>{
    var github = await axios.get('https://api.github.com/users/'+req.params.username).then(function (response) {return response.data;})
    console.log(github)
    //fs.writeFile ("demo.json", github, function(err) {});
    res.json({"status":true, "data": github})
}