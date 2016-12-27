var bcrypt = require('bcrypt');

var path = require('path');
var loki = require('lokijs');

var winston = require('winston');

var db = new loki(path.join(__dirname, '../data/user.json'));

/*
 * Local User
 */
exports.addUser = function (user, next) {
    winston.log("info", '[webui] add user');

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if (users == null) {
            //add the users collection if it does not exist
            var users = db.addCollection('users');
        } else {
            users.find({'email': user.email.toString().toLowerCase()});

            var email = users.addDynamicView('email');
            email.applyFind({'email': user.email.toString().toLowerCase()});

            if (email.data().length > 0) {

                var response = {
                    error: 'Email address already exists.'
                };
                winston.log("error", '[webui] add user - email address already exists');
                return next(response);
            }
        }

        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {

                var response = {
                    error: 'Password hashing failed.'
                };

                winston.log("error", '[webui] add user - password hashing failed');
                return next(response);
            }

            //insert the user
            users.insert({
                email: user.email.toString().toLowerCase(),
                password: hash,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined,
                googletoken: undefined,
                fbtoken: undefined
            });

            //save the database
            db.saveDatabase();

            //load the saved user, need to use dynamic
            var email = users.addDynamicView('email');
            email.applyFind({'email': user.email.toString().toLowerCase()});

            var response = email.data();

            return next(email.data());

        });

    });

};

exports.findUser = function (email, user) {
    winston.log("info", '[webui] find user');

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if (users == null) {
            var response = {
                error: 'there are no existing users'
            };
            winston.log("error", '[webui] find user - there are no existing users');
            return user(response);

        } else {
            var result = users.findOne({'email': email.toLowerCase()});
            return user(result);
        }

    });
};

exports.countUser = function (next) {
    winston.log("info", '[webui] count user');

    var count = 0;

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if (users == null) {
            return next(count);
        } else {
            var email = users.addDynamicView('email');
            count = email.data().length;

            return next(count);
        }

    });

};

/*
 * Forgot Password functions
 */

exports.findUserResetToken = function (resetPasswordToken, userResult) {
    winston.log("info", '[webui] find user and reset token');

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if (users == null) {
            var response = {
                error: 'there are no existing users'
            };

            winston.log("error", '[webui] find user and reset token - there are no existing users');
            return userResult(response);

        } else {

            var result = users.findOne(
                {'$and': [{
                    'resetPasswordToken' : resetPasswordToken,
                },{
                    'resetPasswordExpires': {$gt: Date.now()}
                }]
                }
            );

            return userResult(result);
        }

    });

};


exports.updateUser = function (user, userResult) {
    winston.log("info", '[webui] update user');

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if (users == null) {
            var response = {
                error: 'there are no existing users'
            };
            winston.log("error", '[webui] update user - there are no existing users');
            return userResult(response);

        } else {

            var result = users.findOne({'email': user.email.toLowerCase()});

            result = user;

            // result.resetPasswordToken = user.resetPasswordToken;
            // result.resetPasswordExpires = user.resetPasswordExpires; // 1 hour

            users.update(result);

            //save
            db.saveDatabase();

            userResult(result);
        }

    });

};

exports.updateUserPassword = function (user, next) {
    winston.log("info", '[webui] update user password');

    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }

        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        //load the database
        db.loadDatabase({}, function () {

            //get the users collection
            var users = db.getCollection('users');

            if (users == null) {
                var response = {
                    error: 'there are no existing users'
                };
                winston.log("error", '[webui] update user - there are no existing users');
                return next(response);

            } else {

                var result = users.findOne({'email': user.email.toLowerCase()});

                result.password = hash;
                result.resetPasswordToken = undefined;
                result.resetPasswordExpires = undefined;

                users.update(result);

                //save
                db.saveDatabase();

                return next(result);
            }

        });

    });
};


/*
 * Facebook User
 */
exports.addFbUser = function (fbUser, response) {
    winston.log("info", '[webui] add facebook user');

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if (users == null) {
            //add the users collection if it does not exist
            var users = db.addCollection('users');
        }

        //insert the user
        users.insert(fbUser);

        //save the database
        db.saveDatabase();

        //load the saved user, need to use dynamic
        var email = users.addDynamicView('email');
        email.applyFind({'email': fbUser.email.toString().toLowerCase()});

        return response(email.data());

    });

};

exports.findFbEmailUpdateToken = function (fbUser, response) {
    winston.log("info", '[webui] find facebook user and update token');

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {
            var result = {
                error: 'there are no existing users'
            };
            winston.log("error", '[webui] find facebook user and update token - there are no existing users');
            return response(result);

        } else {

            var result = users.findOne({'email': fbUser.email.toLowerCase()});

            result.fbtoken = fbUser.fbtoken;

            users.update(result);

            //save
            db.saveDatabase();

            return response(result);
        }

    });
};


/*
 * Google User
 */

exports.addGoogleUser = function (googleUser, response) {
    winston.log("info", '[webui] add google user');

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if (users == null) {
            //add the users collection if it does not exist
            var users = db.addCollection('users');
        }

        //insert the user
        users.insert(googleUser);

        //save the database
        db.saveDatabase();

        //load the saved user, need to use dynamic
        var email = users.addDynamicView('email');
        email.applyFind({'email': googleUser.email.toString().toLowerCase()});

        return response(email.data());

    });
};



exports.findGoogleEmailUpdateToken = function (googleUser, response) {
    winston.log("info", '[webui] find google user and update token');

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {
            var result = {
                error: 'there are no existing users'
            };
            winston.log("error", '[webui] find google user and update token - there are no existing users');
            return response(result);

        } else {

            var result = users.findOne({'email': googleUser.email.toLowerCase()});

            result.googletoken = googleUser.googletoken;

            users.update(result);

            //save
            db.saveDatabase();

            return response(result);
        }

    });


};


