var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var common = require('../common')
var config = common.config();

var mongoPath = config.db;

/* GET home page. */
router.get('/', function(req, res, next) {
	MongoClient.connect(mongoPath, function (err, db) {   
	    if(err) throw err;
	    var dbo = db.db("marvelclient");
	    dbo.collection('inserts').find({}).toArray(function(err, docs) {
	    	const map1 = docs.map(x => x.name);
			// res.render('index', { title: 'Marvel Characters', d: JSON.stringify(docs)});    	
			res.render('index', { title: 'R M C', d: [docs[docs.length-1]]});    	
	    });
	});

	

});

module.exports = router;
