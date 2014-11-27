var colors = require('colors'); 
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('underscore');
var sm = require('sitemap');

//~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/ DB retrieval ~~~~~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  console.log(' db opened');
});

mongoose.connect('mongodb://localhost/news');



var trendSchema = mongoose.Schema({
    tName: String,
    tName_h: String,    
    region: String
  });


var Trend = mongoose.model('Trend', trendSchema);




function getTrends(req, res, next) {

     Trend.find(function(err, trends) {
      if (err) return console.error(err);
          // console.dir(trends);
        var plucked = _.pluck(trends, 'tName');
        // console.log('plucked values =='.red, plucked);
        
        var plucked = _.pluck(trends, 'tName');

        req.trends = plucked;
        console.log(' req, trends  ==', req.trends);
        next();// No need to return anything.
    }); 

}


//  Trend.find(function(err, trends) {
//   if (err) return console.error(err);
//       // console.dir(trends);
//     var plucked = _.pluck(trends, 'tName');
//     console.log('plucked values =='.red, plucked);
// }); 

//~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/ DB retrieval  ends ~~~~~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/



var sitemap = sm.createSitemap ({
      hostname: 'http://example.com',
      cacheTime: 600000,        // 600 sec - cache purge period
      urls: [
        { url: '/page-1/',  changefreq: 'daily', priority: 0.3 },
        { url: '/page-2/',  changefreq: 'monthly',  priority: 0.7 },
        { url: '/page-3/' }     // changefreq: 'weekly',  priority: 0.5
      ]
    });


//~~~~~~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/ ROUTES ~~~~~~~~~~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/


router.get('/sitemap.xml', getTrends, function(req, res) {
    console.log(' req .trends  = '.blue, req.trends); 

    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
    // console.log('docs  = '.red,docs);

    });

    sitemap.toXML( function (xml) {
      res.header('Content-Type', 'application/xml');
      res.send( xml );
  });

  sitemap.add({url: '/page-4/', changefreq: 'monthly', priority: 0.7});
  sitemap.add({url: '/page-5/'});

});






/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        console.log('docs  = '.green,docs);
        res.render('userlist', {
            "userlist" : docs
        });
    });
});






/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
	res.render('helloworld', { title: 'Hello, World!' })
});



/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("userlist");
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

module.exports = router;