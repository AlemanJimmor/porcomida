var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Busssiness = require('../app/models/bussiness');
var db = mongoose.connection;
var haversine = require('haversine');

router.get('/', function(req, res) {
  res.render('usuarios', { title: 'Usuarios' });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    db.collection('users').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*users
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('users').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

router.post('/searchnearby', function(req, res) {
    var all = req.body;
    var Pickup = req.body.chkPickup;
    var Delivery = req.body.chkDelivery;
    var Credit = req.body.chkCredit;
    var Open = req.body.chkOpen;
    var Promo = req.body.chkPromo;
    var lat = parseFloat(req.body.latitude);
    var lng = parseFloat(req.body.longitude);
    var distan = parseFloat(req.body.chkDistance);
    var price = parseFloat(req.body.chkPrice);
    var busqueda = req.body.txtSearch;
    var sDistan = req.body.sortDistance;
    var sOrder = req.body.sortOrder;
    var sRank = req.body.sortRank;

    console.log('ranking : '+sRank + ':'+sDistan+'-'+sOrder);

    var sortIndex = "_id"; 
    var sorDir = "$natural";

    if(sRank==1||sRank==-1) { sortIndex = "BUSSINESS.RANK";};
    if(sOrder==1||sOrder==-1) { sortIndex = "BUSSINESS.MINORDER"; };

    if(sDistan==1) { sortIndex= ""};


    //var db = mongo.db("mongodb://localhost:27017/xcomida", {native_parser:true});
   if (sRank == 1) {
        db.collection('users').find({loc:{$near:[lat, lng], $maxDistance:distan}, 
            'MENU.NAME':{$regex:busqueda,$options:'i'}, 
            'BUSSINESS.MINORDER': {$lt: price}, 
            'BUSSINESS.PICKUP': Pickup, 
            'BUSSINESS.DELIVERY': Delivery, 
            'BUSSINESS.CREDITCARD': Credit, 
            'BUSSINESS.PROMO': Promo}).sort({'BUSSINESS.RANK': 1}).toArray(function (err, items) {
        res.json(items);
        });
   };

    if (sRank == -1) {
        db.collection('users').find({loc:{$near:[lat, lng], $maxDistance:distan}, 
            'MENU.NAME':{$regex:busqueda,$options:'i'}, 
            'BUSSINESS.MINORDER': {$lt: price}, 
            'BUSSINESS.PICKUP': Pickup, 
            'BUSSINESS.DELIVERY': Delivery, 
            'BUSSINESS.CREDITCARD': Credit, 
            'BUSSINESS.PROMO': Promo}).sort({'BUSSINESS.RANK': -1}).toArray(function (err, items) {
        res.json(items);
        });
    };

    if (sOrder == 1) {
        db.collection('users').find({loc:{$near:[lat, lng], $maxDistance:distan}, 
            'MENU.NAME':{$regex:busqueda,$options:'i'}, 
            'BUSSINESS.MINORDER': {$lt: price}, 
            'BUSSINESS.PICKUP': Pickup, 
            'BUSSINESS.DELIVERY': Delivery, 
            'BUSSINESS.CREDITCARD': Credit, 
            'BUSSINESS.PROMO': Promo}).sort({'BUSSINESS.MINORDER': 1}).toArray(function (err, items) {
        res.json(items);
        });
    };

    if (sOrder == -1) {
        db.collection('users').find({loc:{$near:[lat, lng], $maxDistance:distan}, 
            'MENU.NAME':{$regex:busqueda,$options:'i'}, 
            'BUSSINESS.MINORDER': {$lt: price}, 
            'BUSSINESS.PICKUP': Pickup, 
            'BUSSINESS.DELIVERY': Delivery, 
            'BUSSINESS.CREDITCARD': Credit, 
            'BUSSINESS.PROMO': Promo}).sort({'BUSSINESS.MINORDER': -1}).toArray(function (err, items) {
        res.json(items);
        });
    };

    /*
    if (sOrder == 0 && sRank == 0 && sDistan == 0) {
        db.collection('users').find({loc:{$near:[lat, lng], $maxDistance:distan}, 
            'MENU.NAME':{$regex:busqueda,$options:'i'}, 
            'BUSSINESS.MINORDER': {$lt: price}, 
            'BUSSINESS.PICKUP': Pickup, 
            'BUSSINESS.DELIVERY': Delivery, 
            'BUSSINESS.CREDITCARD': Credit, 
            'BUSSINESS.PROMO': Promo}).toArray(function (err, items) {
        res.json(items);
        });
    };*/

    if (sOrder == 0 && sRank == 0 && sDistan == 0) {
        //db.collection('users').aggregate([{$geoNear:{near:[20.514633,-100.796675],distanceField:"distance",maxDistance:1,spherical:false}}])
        db.collection('users').find({loc:{$near:[lat, lng], $maxDistance:distan}, 
            'MENU.NAME':{$regex:busqueda,$options:'i'}, 
            'BUSSINESS.MINORDER': {$lt: price}, 
            'BUSSINESS.PICKUP': Pickup, 
            'BUSSINESS.DELIVERY': Delivery, 
            'BUSSINESS.CREDITCARD': Credit, 
            'BUSSINESS.PROMO': Promo}).toArray(function (err, items) {

                for (var i =0; i< items.length; i++) {
                    var start = {
                      latitude: lat,
                      longitude: lng
                    };
                    var end = {
                      latitude: items[i].loc.lat,
                      longitude: items[i].loc.lng
                    };
                    var dist = haversine(start, end, {unit: 'km'});
                    items[i].dist = dist;
                };
            console.log(items);
        res.json(items);
        });
    };
    


});

router.post('/restaurants', function(req, res) {
    var search = req.body.idSearch;
    console.log(search);
    //var db = mongo.db("mongodb://localhost:27017/xcomida", {native_parser:true});
    //Bus.findById(search, function (err, items) {
   Busssiness.findOne({_id:search}, function (err, items) {
        res.json(items);
    });
});

router.post('/suggestions', function(req, res) {
    var lat = parseFloat(req.body.latitude);
    var lng = parseFloat(req.body.longitude);
    var categ = req.body.category;
    console.log(categ);
    //var db = mongo.db("mongodb://localhost:27017/xcomida", {native_parser:true});
    db.collection('users').find({loc:{$near:[lat, lng], $maxDistance:0.1}, 'BUSSINESS.CATEGORY':{$regex:categ, $options:'i'}}).toArray(function (err, items) {
        
        for (var i =0; i< items.length; i++) {
                    var start = {
                      latitude: lat,
                      longitude: lng
                    };
                    var end = {
                      latitude: items[i].loc.lat,
                      longitude: items[i].loc.lng
                    };
                    var dist = haversine(start, end, {unit: 'km'});
                    items[i].dist = dist;
                };
        res.json(items);
    });
});

module.exports = router;