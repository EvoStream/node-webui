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

    winston.log("verbose", "winston index " );

    //Check if a index user exists
    if (req.user) {
        return res.redirect('dashboard');
    }

    //Get the total number of Local Users
    userService.countUser(function (count) {
        console.log('using userService');
        console.log('count ' + count);

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
    console.log('POST: Add Account Form req.body ' + req.body);
    userService.addUser(req.body, function (response) {

        console.log('userService response' + JSON.stringify(response));

        if (typeof response[0] !== "undefined") {

            console.log('for login ');

            //res.redirect('/dashboard');
            req.login(req.body, function (err) {
                // res.redirect('/dashboard');

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

    console.log('login page  ');
    userService.countUser(function (count) {
        console.log('using userService');
        console.log('count ' + count);

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
        console.log('post/login req--- ' + JSON.stringify(req.body));
        if (req.body.rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 3600 * 1000; // 30 days
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

        // fullUrl = req.protocol + '://' + req.get('host') + '/fbcallback' + '?page=' +req.query.page ;

        data = "url=" + fullUrl + "&page=" + req.query.page;
    } else {
        data = "url=" + fullUrl + "&page=dashboard";
    }


    var buffer = new Buffer(data);
    var webuiUrl = buffer.toString('base64');
    var fbAuth = new Buffer(socialConfig.fbAuthLogin, 'base64');


    // res.redirect("http://webuiauth.evostream.com/verify/fblogin/user?webuiurl=" + webuiUrl);
    res.redirect(fbAuth + "=" + webuiUrl);

});

router.get('/fbcallback', function (req, res, next) {

    console.log('fbcallback fbcallback fbcallback fbcallback fbcallback fbcallback fbcallback ');
    console.log('fbcallback parameters ' + JSON.stringify(req.query));

    //Set the page to redirect from
    var redirectPage = '/dashboard';
    
    if(req.query.status == 'success'){
        if (req.query.page == 'fblive') {
            redirectPage = '/streams#/fblive';
        }

        //Find if Facebook User already exists
        userService.findUser(req.query.email, function (fbUser) {

            if (typeof fbUser ['error'] !== "undefined") {
                console.log('userService.findUser fbUser [error] ' + fbUser ['error']);
                res.redirect('/');
            }

            if (!fbUser) {
                console.log('userService.findUser !fbUser ');

                console.log('Add the fbuser');
                //Add the Facebook User

                userService.addFbUser(req.query, function (response) {
                    console.log('before if err');

                    if (response.length == 0) {
                        res.redirect('/');
                    }

                    console.log('addFbUser after if err - redirect to dashboard');

                    req.session.fbUser = req.query;
                    res.redirect(redirectPage);
                });
            } else {
                console.log('Find and Update the fbuser ' + JSON.stringify(fbUser));

                userService.findFbEmailUpdateToken(req.query, function (response) {
                    console.log('findFbEmailUpdateToken before if err');

                    if (response.length == 0) {
                        res.redirect('/');
                    }

                    console.log('findFbEmailUpdateToken after if err - redirect to dashboard');
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

    // res.redirect("http://webuiauth.evostream.com/verify/googlelogin/user?webuiurl=" + webuiUrl);
    res.redirect(googleAuth + "=" + webuiUrl);

});

router.get('/googlecallback', function (req, res, next) {

    console.log('googlecallback googlecallback googlecallback googlecallback googlecallback googlecallback googlecallback ');
    console.log('parameters ' + JSON.stringify(req.query));

    if(req.query.status == 'success'){
        
        //Set the page to redirect from
        var redirectPage = '/dashboard';

        if (req.query.page == 'youtube') {
            redirectPage = '/streams#/youtube';
        }

        //Find if Google User already exists
        userService.findUser(req.query.email, function (googleUser) {

            if (typeof googleUser ['error'] !== "undefined") {
                console.log('userService.findUser fbUser [error] ' + googleUser ['error']);
                res.redirect('/');
            }

            if (!googleUser) {
                console.log('userService.findGoogleEmail !googleUser ');

                console.log('Add the googleUser');
                //Add the Google User

                userService.addGoogleUser(req.query, function (response) {
                    console.log('before if err');
                    if (response.length == 0) {
                        res.redirect('/');
                    }
                    console.log('addGoogleUser after if err - redirect to dashboard');
                    req.session.googleUser = req.query;
                    res.redirect(redirectPage);

                });
            } else {
                console.log('Find and Update the googleUser ' + JSON.stringify(googleUser));

                userService.findGoogleEmailUpdateToken(req.query, function (response) {
                    console.log('findGoogleEmailUpdateToken before if err');
                    if (response.length == 0) {
                        res.redirect('/');
                    }
                    console.log('findGoogleEmailUpdateToken after if err - redirect to dashboard');
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

            console.log('token ' + token);
            console.log('req.body ' + JSON.stringify(req.body));

            userService.findUser(req.body.email, function (user) {
                // next(err, user);
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    console.log('No account with that email address exists.');
                    return res.redirect('/forgotpassword');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                console.log('forgot password user ' + JSON.stringify(user));

                userService.updateUser(user, function (userResult) {
                    console.log('upateuser response');
                    done(userResult.error, token, userResult);
                });
            });
        },
        function (token, user, done) {

            //Redirect to Reset Password
            // res.redirect('/resetpassword/'+token);

            var reserUrl = 'http://' + req.headers.host + '/resetpassword?token=' + token;
            res.redirect(reserUrl);

        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgotpassword');
    });
});

// router.get('/resetpassword/:token', function(req, res) {
// router.get('/resetpassword', function(req, res) {
//     console.log('render resetpassword');
//         var vm = {
//             title: 'Reset Password',
//             layout: 'index/layout'
//         }
//         // res.render('index/forgotpassword', vm);
//         res.render('index/resetpassword', vm);
//
// });
// router.get('/resetpassword/:token', function(req, res) {
router.get('/resetpassword', function (req, res) {
    console.log('request query ' + JSON.stringify(req.query));
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
    console.log('request post body ' + JSON.stringify(req.body));
    async.waterfall([
        function (done) {
            userService.findUserResetToken(req.body.token, function (userResult) {
                // next(err, user);
                if (!userResult) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                userResult.password = req.body.rpassword;
                console.log('reset user ' + JSON.stringify(userResult));

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
