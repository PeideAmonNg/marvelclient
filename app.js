var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const https = require('https');

var md5 = require('md5');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var common = require('./common')
var config = common.config();

var mongoPath = config.db;
var dbName = config.name;
// var mongoPath = 'mongodb://admin1:admin1spassword@ds133601.mlab.com:33601/heroku_cf7f9xz3';
// var mongoPath = 'mongodb://localhost:27017/';
// var mongoPath = 'mongodb://admin1:admin1spassword@ds133601.mlab.com:33601/heroku_cf7f9xz3';


// console.log("mongoPath " + mongoPath);

app.get("/characterCount", function (req, res) {
  MongoClient.connect(mongoPath, function (err, db) {   
    if(err) throw err;

    // var dbo = db.db("marvelclient");
      var dbo = db.db(dbName);
    dbo.collection('characterCount').findOne({}, function(err1, r1) {
      console.log(r1);
      if(r1){
        delete r1._id;
        console.log(r1);
        console.log("sending " + r1);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(r1));

      }else{
        console.log("r1 is null");
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({}));
      }

    });
  });
});

var publicKey = '78a5f1faa9fa3362e2c83c492ca54dc0';
var privateKey = '6ff2fe0b8e5c4cbc656bc443bac33891b044c193';

var count = new Map();

// Get the number of characters with name prefixing 'char'
function getCharacters(char, timestamp, hash){
    return new Promise(function(resolve, reject) {
      // someAsyncOperation(function(){              
      https.get('https://gateway.marvel.com:443/v1/public/characters?ts=' + timestamp + '&apikey=' + publicKey +
      '&nameStartsWith=' + char + '&limit=1&hash=' + hash, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
          // console.log(data);
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          data = JSON.parse(data);
          console.log(char);
          try {
            var total = data.data.total;
            count.set(char, total); 
            console.log(data.data.results[0].id);
          }
          catch(err) {
            console.log(data);
          }         
          
          resolve("cool");
          
        });
      }).on("error", (err) => {
        reject(err);
        console.log("Error: " + err.message); 
      }); 
        // }
        // , function(err, result) {
        //     if (err) return reject(err);
        //     resolve(result);
        // });
    });
}


var insert = function(date){
  // Connect to the db
  MongoClient.connect("mongoPath", function (err, db) {   
    if(err) throw err;

    var timestamp = Date.now();
    var hash = md5(timestamp + privateKey + publicKey);

    // var dbo = db.db("marvelclient");
      var dbo = db.db(dbName);

    console.log('making request');

    const possible = '123456789abcdefghijklmnopqrstuvwxyz';
    var randomPrefix = possible.charAt(Math.floor(Math.random() * possible.length));
    // console.log('randomPrefix ' + randomPrefix);


    var promises = [];

    for (var i = 0; i < possible.length; i++) {
      var char = possible.charAt(i);
      console.log("current char " + char);
      
      promises.push(getCharacters(char, timestamp, hash));

    }

    Promise.all(promises).then(function() {
      // returned data is in arguments[0], arguments[1], ... arguments[n]
      // you can process it here
      console.log("done");
      // console.log(count);

      var characterCount = 0;

      count.forEach(function(value, key, map) {
        characterCount += value;
      });

      var randomChar = Math.floor(Math.random() * characterCount) + 1;

      var selectedChar = '';
      count.forEach(function(value, key, map) {
        if(!selectedChar){
          if(randomChar <= value){
            selectedChar = key;          
          }else{
            randomChar -= value;
          }
        }
      });      

      dbo.collection('characterCount').deleteMany({}, function(err1, r1) {
        dbo.collection('characterCount').insertOne(count, function(err, r) {
          if(err){throw err};
          db.close();
        });   
      });
      

      console.log(selectedChar);
      // console.log(characterCount);

  //     var offset = Math.floor(Math.random() * count.get(selectedChar));

  //     https.get('https://gateway.marvel.com:443/v1/public/characters?ts=' + timestamp + '&apikey=' + publicKey +
  //     '&nameStartsWith=' + selectedChar + '&limit=1&offset=' + offset + '&hash=' + hash, (resp) => {
  //       let data = '';

  //       // A chunk of data has been recieved.
  //       resp.on('data', (chunk) => {
  //         data += chunk;
  //         // console.log(data);
  //       });

  //       // The whole response has been received. Print out the result.
  //       resp.on('end', () => {
  //         data = JSON.parse(data);
  //         count.set(char, data.data.total);          
  //         console.log(data.data.results[0].id);


  //         dbo.collection('inserts').insertOne(data.data.results[0], function(err, r) {
  //           assert.equal(null, err);
  //           assert.equal(1, r.insertedCount);

  //           // Insert multiple documents
  //           // dbo.collection('inserts').insertMany([{a:2}, {a:3}], function(err, r) {
  //           //   assert.equal(null, err);
  //           //   assert.equal(2, r.insertedCount);

  //           // });

  //           db.close();
  //         });   
  //       });
  //     }).on("error", (err) => {
  //       console.log("Error: " + err.message); 
  //     });; 

    }, function(err) {
      // error occurred
    });

  });

    
}


// var lastMinute = 0;

// new Every day, update the character count from the marvel api.
setInterval(function() {
  var date = new Date();
  insert(date);
  // if ( date.getMinutes() != lastMinute ) {
  //   lastMinute = date.getMinutes();
  //   console.log(date.getSeconds());
  //   console.log(date.getMinutes());

  // }

}, 86400000);
// }, 60000);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
