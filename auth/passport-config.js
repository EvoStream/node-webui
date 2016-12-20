module.exports = function(){
    var passport = require('passport');
    var passportLocal = require('passport-local');
    var bcrypt = require('bcrypt');

    var path = require('path');
    
    //using portable database
    var userService = require(path.join(__dirname, '../models/user'));

    passport.use('local-user', new passportLocal.Strategy({usernameField: 'email'}, function(email, password, next) {
        console.log('passport.use local-user');
        console.log('');
        console.log('userService.findUser ');
        console.log('userService.findUser email '+email);
        console.log('userService.findUser password '+password);
        userService.findUser(email, function(user){

            var errorText = '';

            if (typeof user ['error'] !== "undefined") {
                return next(user['error']);
            }
            if (!user) {
                return next(null, null);
            }

            console.log('userService.findUser user '+ JSON.stringify(user));


            if(typeof user.password !== 'undefined' && user.password ){
                bcrypt.compare(password, user.password, function(err, same){
                    console.log('password '+password);
                    console.log('user.password '+user.password);
                    console.log('same '+same);
                    if(err){
                        return next(err);
                    }
                    if(!same){
                        return next(null, null);
                    }
                    next(null, user);
                });
            }else{
                return next(null, null);
            }

        })
    }));



    passport.serializeUser(function(user, next) {
        console.log('serializeUser user '+JSON.stringify(user));
        next(null, user);
    });

    passport.deserializeUser(function(user, next) {
        console.log('deserializeUser user '+JSON.stringify(user));
        userService.findUser(user.email, function(user) {

            console.log('user '+ JSON.stringify(user));
            // console.log('err '+ JSON.stringify(err));

            if (typeof user ['error'] !== "undefined") {
                return next(user['error'],user);
            }
            next(null, user);
        });
        
    });
};