module.exports = function(){
    var passport = require('passport');
    var passportLocal = require('passport-local');
    var bcrypt = require('bcryptjs');
    var winston = require('winston');

    var path = require('path');
    
    //using portable database
    var userService = require(path.join(__dirname, '../models/user'));

    passport.use('local-user', new passportLocal.Strategy({usernameField: 'email'}, function(email, password, next) {
        winston.log("info", '[webui] passport: checking user '+email);

        userService.findUser(email, function(user){

            if (user == null) {
                winston.log("error", '[webui] passport: user not found '+email);
                return next(null, null);
            }

            if (typeof user ['error'] !== "undefined" ) {
                winston.log("error", '[webui] passport: user not found '+email);
                return next(null, null);
            }

            if(typeof user.password !== 'undefined' && user.password ){
                bcrypt.compare(password, user.password, function(err, res){

                    if(err){
                        winston.log("error", '[webui] passport: bcrypt err '+JSON.stringify(err));
                        return next(err);
                    }
                    if(res === false){
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
        winston.log("info", '[webui] passport: serialize user ');
        next(null, user);
    });

    passport.deserializeUser(function(user, next) {
        winston.log("info", '[webui] passport: deserialize user');
        
        userService.findUser(user.email, function(user) {

            if (typeof user ['error'] !== "undefined") {
                winston.log("error", '[webui] passport: deserialize - user not found '+JSON.stringify(user));
                return next(user['error'],user);
            }
            next(null, user);
        });
    });
};