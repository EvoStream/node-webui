var bcrypt = require('bcrypt');

var path = require('path');
var loki = require('lokijs');

var db = new loki(path.join(__dirname, '../data/user.json'));

/*
 * Local User
 */
exports.addUser = function (user, next) {

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

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
                return next(response);
            }
        }

        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {

                var response = {
                    error: 'Password hashing failed.'
                };
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

            console.log('email.data() ' + JSON.stringify(email.data()));

            var response = email.data();

            return next(email.data());

        });

    });

};

exports.findUser = function (email, user) {

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {
            var response = {
                error: 'there are no existing users'
            };
            return user(response);

        } else {
            var result = users.findOne({'email': email.toLowerCase()});

            console.log('findUser result ' + JSON.stringify(result));
            return user(result);
        }

    });
};

exports.countUser = function (next) {

    var count = 0;

    //load the database
    db.loadDatabase({}, function () {


        console.log('db.loadDatabase db.loadDatabase ');

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {

            console.log('users 0 ');

            return next(count);
        } else {
            var email = users.addDynamicView('email');

            console.log('email.data().length ' + email.data().length);

            count = email.data().length;

            return next(count);
        }

    });

};

/*
 * Forgot Password functions
 */

exports.findUserResetToken = function (resetPasswordToken, userResult) {
    // User.findOne({
    //     resetPasswordToken: resetPasswordToken,
    //     resetPasswordExpires: {$gt: Date.now()}
    // }, function (err, user) {
    //     next(err, user);
    // });

    console.log('findUserResetToken findUserResetToken ');


    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {
            var response = {
                error: 'there are no existing users'
            };
            return userResult(response);

        } else {
            // var result = users.findOne({
            //     'resetPasswordToken' : resetPasswordToken,
            //     'resetPasswordExpires': {$gt: Date.now()}
            // });

            var result = users.findOne(
                {'$and': [{
                    'resetPasswordToken' : resetPasswordToken,
                },{
                    'resetPasswordExpires': {$gt: Date.now()}
                }]
                }
            );

            console.log('findUser result ' + JSON.stringify(result));
            return userResult(result);
        }

    });

};


exports.updateUser = function (user, userResult) {
    console.log('insisde updateUser');
    // User.update(user, function (err) {
    //     if (err) {
    //         return next(err);
    //     }
    //     next(null);
    // });

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {
            var response = {
                error: 'there are no existing users'
            };
            return userResult(response);

        } else {
            // var result = users.findOne({
            //     resetPasswordToken: resetPasswordToken,
            //     resetPasswordExpires: {$gt: Date.now()}
            // });
            //
            // console.log('findUser result ' + JSON.stringify(result));
            // return user(result);

            var result = users.findOne({'email': user.email.toLowerCase()});

            result = user;

            // result.resetPasswordToken = user.resetPasswordToken;
            // result.resetPasswordExpires = user.resetPasswordExpires; // 1 hour

            users.update(result);

            //save
            db.saveDatabase();

            console.log('findUser result ' + JSON.stringify(result));

            userResult(result);
        }

    });

};

exports.updateUserPassword = function (user, next) {
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }

        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // User.update(user, function (err) {
        //     if (err) {
        //         return next(err);
        //     }
        //     next(null);
        // });


        //load the database
        db.loadDatabase({}, function () {

            //get the users collection
            var users = db.getCollection('users');
            // console.log('users.data ' + JSON.stringify(users.data));

            if (users == null) {
                var response = {
                    error: 'there are no existing users'
                };
                return next(response);

            } else {

                var result = users.findOne({'email': user.email.toLowerCase()});

                result.password = hash;
                result.resetPasswordToken = undefined;
                result.resetPasswordExpires = undefined;

                users.update(result);

                //save
                db.saveDatabase();

                console.log('findUser result ' + JSON.stringify(result));

                return next(result);
            }

        });

    });
};


/*
 * Facebook User
 */
exports.addFbUser = function (fbUser, response) {

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

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

        console.log('email.data() ' + JSON.stringify(email.data()));

        return response(email.data());

    });

};

exports.findFbEmailUpdateToken = function (fbUser, response) {
    // FbUser.findOneAndUpdate({'facebook.email': fbUser.email}, fbUser , function (err, fbUser) {
    //     next(err, User);
    // });
    //
    //
    // User.update(user, function (err) {
    //     if (err) {
    //         return next(err);
    //     }
    //     next(null);
    // });

    // User.findOneAndUpdate({'email': fbUser.email}, fbUser, function (err, fbUser) {
    //     next(err, User);
    // });


    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {
            var result = {
                error: 'there are no existing users'
            };
            return response(result);

        } else {

            var result = users.findOne({'email': fbUser.email.toLowerCase()});

            result.fbtoken = fbUser.fbtoken;

            users.update(result);

            //save
            db.saveDatabase();

            console.log('findUser result ' + JSON.stringify(result));

            return response(result);
        }

    });
};


/*
 * Google User
 */

exports.addGoogleUser = function (googleUser, response) {

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

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

        console.log('email.data() ' + JSON.stringify(email.data()));

        return response(email.data());

    });
};



exports.findGoogleEmailUpdateToken = function (googleUser, response) {

    console.log('inside findGoogleEmailUpdateToken findGoogleEmailUpdateToken ');

    // GoogleUser.findOneAndUpdate({'google.email': googleUser.email}, googleUser , function (err, googleUser) {
    //     next(err, googleUser);
    // });

    // User.findOneAndUpdate({'email': googleUser.email}, googleUser, function (err, googleUser) {
    //     next(err, googleUser);
    // });

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if (users == null) {
            var result = {
                error: 'there are no existing users'
            };
            return response(result);

        } else {

            var result = users.findOne({'email': googleUser.email.toLowerCase()});

            result.googletoken = googleUser.googletoken;

            users.update(result);

            //save
            db.saveDatabase();

            console.log('findUser result ' + JSON.stringify(result));

            return response(result);
        }

    });


};


