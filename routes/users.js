var express = require('express');
var router = express.Router();
var path = require('path');
var winston = require('winston');

var userService = require(path.join(__dirname, '../models/user'));
var restrict = require(path.join(__dirname, '../auth/restrict'));

/* GET users listing. */
router.get('/', function(req, res, next) {
  //
});

/* GET /users/view listing. */
router.get('/logout', restrict, function(req, res, next) {
    winston.log("info", "[webui] user logging out.....");
    winston.log("info", "[webui] user session "+JSON.stringify(req.session));

    winston.log("info", '(typeof req.session.passport !== undefined) '+ (typeof req.session.passport !== 'undefined')  );
    // winston.log("verbose", "req.session.passport.length " +req.session.passport.length );


    if(typeof req.session.passport !== 'undefined'){

        winston.log("verbose", "req.session.passport.user " + JSON.stringify(req.session.passport.user));

        //delete facebook token and google token
        var user = req.session.passport.user;

        user.googletoken = '';
        user.fbtoken = '';

        userService.updateUser(user, function (userResult) {
            console.log('upateuser response');

            winston.log("verbose", "userResult " + JSON.stringify(userResult));

        });
    }

    req.logout();
    req.session.destroy();
    res.redirect('/');


});



router.get('/check-google-login', function (req, res, next) {
    // console.log('POST: api/send-youtube req.body ' + JSON.stringify(req.body));
    // console.log('GET: api/send-youtube req.query ' + JSON.stringify(req.query));

    // var data = req.query;
    // var parameters = null;

    console.log('req.session '+ JSON.stringify(req.session));

    var result = {
        'status': 'not-login'
    };

    if ( typeof req.session.googleUser !== 'undefined' && req.session.googleUser.googletoken ) {

        result = {
            'status': 'login'
        };

    }

    res.json(result);

});



router.get('/check-fb-login', function (req, res, next) {
    // console.log('POST: api/send-youtube req.body ' + JSON.stringify(req.body));
    // console.log('GET: api/send-youtube req.query ' + JSON.stringify(req.query));

    // var data = req.query;
    // var parameters = null;

    console.log('req.session '+ JSON.stringify(req.session));

    var result = {
        'status': 'not-login'
    };

    if ( typeof req.session.fbUser !== 'undefined' && req.session.fbUser.fbtoken ) {

        result = {
            'status': 'login'
        };

    }

    //else look if local user has a token

    res.json(result);

});

module.exports = router;
