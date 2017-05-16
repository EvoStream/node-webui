var express = require('express');
var router = express.Router();
var path = require('path');

var winston = require('winston');

var socialConfig = require(path.join(__dirname, '../config/social-auth-config'));

//using portable database
var userService = require(path.join(__dirname, '../models/user'));

var passport = require('passport');

//For forgot password
var async = require('async');
var crypto = require('crypto');

/* GET index page. */
router.get('/', function (req, res, next) {

    //Check if a index user exists
    if (req.user) {
        return res.redirect('dashboard');
    }

    //Get the total number of Local Users
    userService.countUser(function (count) {

        if ((count > 0)) {
            res.redirect('login');
        } else {

            var vm = {
                title: 'Create User Account - Evostream Web UI ',
                layout: 'index/layout',
                error: req.flash('error')
            };
            res.render('index/welcome', vm);

        }
    });
});


/* GET index page. */
router.get('/javascript-error', function (req, res, next) {

    var vm = {
        title: 'Evostream Web UI - Enable Javascript',
        message: 'Please enable javascript to be able to use the Evostream Web UI'
    };
    res.render('index/disabledjs', vm);

});

/* POST Add Account Form */
router.post('/', function (req, res, next) {
    userService.addUser(req.body, function (response) {

        if (typeof response[0] !== "undefined") {
            req.login(req.body, function (err) {

                var vm = {
                    title: 'Account Creation Succesfull',
                    layout: 'index/layout'
                }
                res.render('index/success', vm);
            });
        } else {

            var errorText = '';

            if (typeof response ['error'] !== "undefined") {
                errorText = response ['error'];
            }

            var vm = {
                title: 'Evostream Web UI Welcome Page',
                layout: 'index/layout',
                input: req.body,
                error: 'Something went wrong. ' + errorText
            }
            delete vm.input.password;
            res.render('index/welcome', vm);
        }


    });
});

/* GET index page. */
router.get('/login', function (req, res, next) {
    userService.countUser(function (count) {

        if ((count > 0)) {
            var vm = {
                title: 'Evostream Web UI Login',
                layout: 'index/layout',
                error: req.flash('error')
            }
            res.render('index/loginform', vm);
        } else {

            //Redirect to index
            res.redirect('/');

        }
    });


});

/* POST Login Form */
router.post('/login', function (req, res, next) {
        if (req.body.rememberMe) {
            // req.session.cookie.maxAge = 30 * 24 * 3600 * 1000; // 30 days
            req.session.cookie.maxAge = 5 * 60 * 1000; // 5 minutes
        }
        next();
    },
    passport.authenticate('local-user', {
            failureRedirect: '/',
            successRedirect: '/dashboard',
            failureFlash: 'Invalid credentials'
        }
    )
);


router.get('/fblogin', function (req, res, next) {

    var fullUrl = req.protocol + '://' + req.get('host') + '/fbcallback';
    var data = "url=" + fullUrl;

    if (typeof req.query.page !== 'undefined' && req.query.page) {
        data = "url=" + fullUrl + "&page=" + req.query.page;
    } else {
        data = "url=" + fullUrl + "&page=dashboard";
    }


    var buffer = new Buffer(data);
    var webuiUrl = buffer.toString('base64');
    var fbAuth = new Buffer(socialConfig.fbAuthLogin, 'base64');

    res.redirect(fbAuth + "=" + webuiUrl);

});

router.get('/fbcallback', function (req, res, next) {

    //Set the page to redirect from
    var redirectPage = '/dashboard';
    
    if(req.query.status == 'success'){
        if (req.query.page == 'fblive') {
            redirectPage = '/streams#/fblive';
        }

        //Find if Facebook User already exists
        userService.findUser(req.query.email, function (fbUser) {

            if (fbUser.error) {

                //Add the Facebook User
                winston.log("info", "Add the Facebook User " );

                userService.addFbUser(req.query, function (response) {
                    if (response.length == 0) {
                        res.redirect('/');
                    }

                    req.session.fbUser = req.query;
                    res.redirect(redirectPage);
                });
            } else {
                userService.findFbEmailUpdateToken(req.query, function (response) {
                    if (response.length == 0) {
                        res.redirect('/');
                    }

                    req.session.fbUser = req.query;
                    res.redirect(redirectPage);

                });
            }

        });
    }else{
        var vm = {
            title: 'Evostream Web UI Login',
            layout: 'index/layout',
            error: 'Invalid Facebook Login Information'
        }
        res.render('index/loginform', vm);
    }




});


router.get('/googlelogin', function (req, res, next) {

    var fullUrl = req.protocol + '://' + req.get('host') + '/googlecallback';
    if (typeof req.query.page !== 'undefined' && req.query.page) {
        fullUrl = fullUrl + '?page=' + req.query.page;
    } else {
        fullUrl = fullUrl + '?page=dashboard';
    }


    var buffer = new Buffer(fullUrl);
    var webuiUrl = buffer.toString('base64');
    var googleAuth = new Buffer(socialConfig.googleAuthLogin, 'base64');

    res.redirect(googleAuth + "=" + webuiUrl);

});

router.get('/googlecallback', function (req, res, next) {

    if(req.query.status == 'success'){
        
        //Set the page to redirect from
        var redirectPage = '/dashboard';

        if (req.query.page == 'youtube') {
            redirectPage = '/streams#/youtube';
        }

        //Find if Google User already exists
        userService.findUser(req.query.email, function (googleUser) {

            if (googleUser.error) {
                //Add the Google User
                userService.addGoogleUser(req.query, function (response) {
                    if (response.length == 0) {
                        res.redirect('/');
                    }
                    req.session.googleUser = req.query;
                    res.redirect(redirectPage);

                });
            } else {

                userService.findGoogleEmailUpdateToken(req.query, function (response) {
                    if (response.length == 0) {
                        res.redirect('/');
                    }
                    req.session.googleUser = req.query;
                    res.redirect(redirectPage);

                });
            }
        });
    }else{
        var vm = {
            title: 'Evostream Web UI Login',
            layout: 'index/layout',
            error: 'Invalid Google Login Information'
        }
        res.render('index/loginform', vm);
    }
});

router.get('/forgotpassword', function (req, res, next) {

    var vm = {
        title: 'Forgot Password',
        layout: 'index/layout',
        error: req.flash('error')
    }
    res.render('index/forgotpassword', vm);
});


router.post('/forgotpassword', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {

            userService.findUser(req.body.email, function (user) {
                // next(err, user);
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    console.log('No account with that email address exists.');
                    return res.redirect('/forgotpassword');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                userService.updateUser(user, function (userResult) {
                    console.log('upateuser response');
                    done(userResult.error, token, userResult);
                });
            });
        },
        function (token, user, done) {

            //Redirect to Reset Password
            var reserUrl = 'http://' + req.headers.host + '/resetpassword?token=' + token;
            res.redirect(reserUrl);

        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgotpassword');
    });
});


router.get('/resetpassword', function (req, res) {
    userService.findUserResetToken(req.query.token, function (userResult) {
        if (!userResult) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgotpassword');
        }
        var vm = {
            title: 'Reset Password',
            layout: 'index/layout',
            token: req.query.token,
            error: req.flash('error')
        };
        res.render('index/resetpassword', vm);
    });

});


router.post('/resetpassword', function (req, res) {
    async.waterfall([
        function (done) {
            userService.findUserResetToken(req.body.token, function (userResult) {
                
                if (!userResult) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                userResult.password = req.body.rpassword;

                userService.updateUserPassword(userResult, function (err) {
                    // done(err, token, user);

                    req.login(userResult, function (err) {
                        // res.redirect('/dashboard');

                        var vm = {
                            title: 'Password Reset Succesfull',
                            layout: 'index/layout',
                        }
                        res.render('index/successreset', vm);
                    });
                });
            });
        },
    ], function (err) {
        res.redirect('/');
    });
});

module.exports = router;
