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
        
        var pluckedT = _.pluck(trends, 'tName_h');


        var changefreq_value = 'daily';
        var priority_value = '0.3';  

        var urlArr = [];

        for (var i = 0; i < pluckedT.length; i++) {
            var element = {}; 
            // console.log('line 41 ~~~ pluckedT[i]  ='.red,pluckedT[i]);
            element.url = pluckedT[i];
            element.changefreq = 'daily';
            element.priority = 0.3 ;
            // console.log('line 45 ~~~  element'.white, element);
            // console.log('line 46 ~~~  before url Arr  '.blue, urlArr);
            urlArr.push(element);
            // console.log('line 48 ~~~  after url Arr  '.blue, urlArr);
        };

        
        console.log( ' urlArr =~~~~~~~~~~~~~~~~ line 51 ~~~ white '.white, urlArr);


        req.trends = urlArr;
        // console.log(' req, trends  ==', req.trends);

        req.newurl = {url: '/page-6/', changefreq: 'monthly', priority: 0.7}


        next();// No need to return anything.
    }); 
}


//~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/ DB retrieval  ends ~~~~~~~~~~~~~~~~~/~~~~~~~~~~~~~~~~~~~~~~/



var sitemap = sm.createSitemap ({
      hostname: 'http://rushnwash.com/#/trend/',
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
    console.log(' req. newurl  = '.blue, req.newurl); 

    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
    // console.log('docs  = '.red,docs);

    });

    sitemap.toXML( function (xml) {
      res.header('Content-Type', 'application/xml');
      res.send( xml );
  });



  var users = req.trends;


    _.each(users, function(user){
        sitemap.add(user); 
        console.log('user line 110 ='.white,user);
    });

  sitemap.add({url: '/page-4/', changefreq: 'monthly', priority: 0.7});
  sitemap.add({url: '/page-5/'});
  sitemap.add(req.newurl); 
  console.log('sitemap.urls ======'.white, sitemap.urls);

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