var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');



router.get('/', function(req, res) {
  res.render('layouts/busqueda',{});
});

router.get('/searchnearby', function(req, res) {
    var db = mongo.db("mongodb://localhost:27017/xcomida", {native_parser:true});
    db.collection('users').find({loc:{$near:[37.407202, -122.10716]}}).toArray(function (err, items) {
        res.json(items);
    });
});

module.exports = router;