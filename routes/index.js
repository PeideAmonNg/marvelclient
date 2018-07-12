var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var common = require('../common')
var config = common.config();

// var mongoPath = config.db;
// var mongoPath = 'mongodb://localhost:27017/';

// var mongoPath = 'mongodb://admin1:admin1spassword@ds133601.mlab.com:33601/heroku_cf7f9xz3';
var mongoPath = "mongodb://admin1:admin1spassword@ds133601.mlab.com:33601/heroku_cf7f9xz3";

/* GET home page. */
router.get('/', function(req, res, next) {
	MongoClient.connect(mongoPath, function (err, db) {   
	    if(err) throw err;
	    // var dbo = db.db("marvelclient");
	    var dbo = db.db("heroku_cf7f9xz3");
	    dbo.collection('inserts').find({}).toArray(function(err, docs) {
	    	// const map1 = docs.map(x => x.name);
			// res.render('index', { title: 'Marvel Characters', d: JSON.stringify(docs)});    	
			res.render('index', { title: 'R M C'});    	
	    });
	});

	

});

module.exports = router;
