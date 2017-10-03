/**
 * user Model
 */
var bcrypt = require('bcryptjs');

var path = require('path');
var loki = require('lokijs');

var winston = require('winston');

var db = new loki(path.join(__dirname, '../data/user.json'));

/*
 * Local User
 */
exports.addUser = function (user, next) {
    winston.log("info", '[webui] user-model: adding user - '+user.email.toString());

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        var emailWithNoPasswordFound = false;

        if (users == null) {
            //add the users collection if it does not exist
            var users = db.addCollection('users');
        } else {
            users.find({'email': user.email.toString().toLowerCase()});

            var email = users.addDynamicView('email');
            email.applyFind({'email': user.email.toString().toLowerCase()});
            var emailData = email.data();

            if( (email.data().length > 0 ) && (typeof(emailData[0].password ) != "undefined")) {

                var response = {
                    error: 'Email address already exists.'
                };
                winston.log("error", '[webui] user-model: email address already exists - '+user.email.toString());
                return next(response);
            }else{

                emailWithNoPasswordFound = true;

            }
        }

        winston.log("info", '[webui] user-model: checking if user has an email with no password - '+emailWithNoPasswordFound);

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {

                    var response = {
                        error: 'Password hashing failed.'
                    };

                    winston.log("error", '[webui] user-model: password hashing failed for user - '+user.email.toString());
                    return next(response);
                }


                if(emailWithNoPasswordFound) {

                    var emailChange = users.get(1);

                    emailChange.email = user.email.toLowerCase();
                    emailChange.password = hash;

                    users.update(emailChange);

                }else{
                    //insert the user
                    users.insert({
                        email: user.email.toString().toLowerCase(),
                        password: hash,
                        resetPasswordToken: undefined,
                        resetPasswordExpires: undefined,
                        googletoken: '',
                        fbtoken: ''
                    });
                }

                //save the database
                db.saveDatabase();

                //load the saved user, need to use dynamic
                var email = users.addDynamicView('email');
                email.applyFind({'email': user.email.toString().toLowerCase()});


                winston.log("info", '[webui] user-model: user information saved to db - '+user.email.toString());
                return next(email.data());

            });
        });


    });

};

exports.findUser = function (email, user) {
    winston.log("info", '[webui] user-model: finding user - '+email);

    //get the users collection
    var users = db.getCollection('users');

    if ((typeof(users) == "undefined") || users == null) {
        var response = {
            error: 'there are no existing users'
        };
        winston.log("error", '[webui] user-model: there are no existing users ');
        return user(response);

    } else {
        var result = users.findOne({'email': email.toLowerCase()});

        if (!result) {
            var response = {
                error: 'there are no existing users'
            };
            winston.log("error", '[webui] user-model: user does not exists - '+email);
            return user(response);
        }

        return user(result);
    }
};

exports.countUser = function (next) {
    winston.log("info", '[webui] user-model: counting user');

    var count = 0;

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if ((typeof(users) == "undefined") || users == null) {
            winston.log("info", '[webui] user-model: zero user ');
            return next(count);
        } else {
            var email = users.addDynamicView('email');
            count = email.data().length;

            if(count > 0){
                //check if local user exists
                var emailData = email.data();

                if(typeof(emailData[0].password ) == "undefined"){
                    count = 0;
                }
            }

            winston.log("info", '[webui] user-model: user count - '+count);
            return next(count);
        }

    });

};

exports.findUserResetToken = function (resetPasswordToken, userResult) {
    winston.log("info", '[webui] user-model: find user and reset token ');

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if ((typeof(users) == "undefined") || users == null) {
            var response = {
                error: 'there are no existing users'
            };

            winston.log("error", '[webui] user-model: there are no existing users ');
            return userResult(response);

        } else {

            var result = users.findOne(
                {
                    '$and': [{
                        'resetPasswordToken': resetPasswordToken,
                    }, {
                        'resetPasswordExpires': {$gt: Date.now()}
                    }]
                }
            );

            winston.log("info", '[webui] user-model: token reset');
            return userResult(result);
        }

    });

};


exports.updateUser = function (user, userResult) {
    winston.log("info", '[webui] user-model: update user - '+user.email);

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if ((typeof(users) == "undefined") || users == null) {
            var response = {
                error: 'there are no existing users'
            };
            winston.log("error", '[webui] user-model: there are no existing users ');
            return userResult(response);

        } else {

            var result = users.findOne({'email': user.email.toLowerCase()});

            result.resetPasswordToken = user.resetPasswordToken;
            result.resetPasswordExpires = user.resetPasswordExpires; // 1 hour

            //remove tokens
            result.fbtoken = user.fbtoken;
            result.googletoken = user.googletoken; // 1 hour

            users.update(result);

            //save
            db.saveDatabase();

            winston.log("info", '[webui] user-model: user successfully updated - '+user.email);

            userResult(result);
        }

    });

};


exports.findUserOldPassword = function (user, next) {
    winston.log("info", '[webui] user-model: find and check old password for user - '+user.email);

    //load the database
    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');

        if ((typeof(users) == "undefined") || users == null) {
            var response = {
                status: false,
                error: 'there are no existing users'
            };
            winston.log("error", '[webui] user-model: there are no existing users ');
            return next(response);

        } else {

            var result = users.findOne({'email': user.email.toLowerCase()});
            bcrypt.compare(user.oldpassword, result.password, function (err, res) {

                if (err) {
                    var response = {
                        status: false,
                        error: 'match password failed'
                    };
                    winston.log("error", '[webui] user-model: user old password did not match - '+user.email);
                    return next(response);
                }
                if (res === false) {
                    var response = {
                        status: false,
                        error: 'user old password did not match'
                    };
                    winston.log("error", '[webui] user-model: user old password did not match - '+user.email);
                    return next(response);
                } else {
                    var response = {
                        status: true,
                        message: 'password match'
                    };

                    winston.log("info", '[webui] user-model: password match for user - '+user.email);
                    return next(response);
                }
            });
        }
    });
};


exports.updateUserPassword = function (user, next) {
    winston.log("info", '[webui] user-model: update user password for user - '+user.email);

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {

            if (err) {
                var response = {
                    status: false,
                    error: 'hashing failed'
                };
                winston.log("error", '[webui] user-model: password hashing failed for user - '+user.email.toString());
                return next(response);
            }

            user.password = hash;
            user.resetPasswordToken = '';
            user.resetPasswordExpires = '';

            //load the database
            db.loadDatabase({}, function () {

                //get the users collection
                var users = db.getCollection('users');

                if ((typeof(users) == "undefined") || users == null) {
                    var response = {
                        error: 'there are no existing users',
                        status: false
                    };
                    winston.log("error", '[webui] user-model: there are no existing users ');
                    return next(response);

                } else {

                    var result = users.findOne({'email': user.email.toLowerCase()});

                    result.password = hash;
                    result.resetPasswordToken = undefined;
                    result.resetPasswordExpires = undefined;
                    result.status = true;

                    users.update(result);

                    //save
                    db.saveDatabase();

                    winston.log("info", '[webui] user-model: password updated for user - '+user.email);
                    return next(result);
                }

            });
        });
    });

};


/*
 * Facebook User
 */
exports.addFbUser = function (fbUser, response) {
    winston.log("info", '[webui] user-model: adding facebook user - '+fbUser.email.toString());

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
    winston.log("info", '[webui] user-model: find facebook user and update token - '+fbUser.email.toString());

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if ((typeof(users) == "undefined") || users == null) {
            var result = {
                error: 'there are no existing users'
            };
            winston.log("info", '[webui] user-model: there are no existing users');
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
    winston.log("info", '[webui] user-model: adding google user - '+googleUser.email.toString());

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
    winston.log("info", '[webui] user-model: find google user and update token - '+googleUser.email.toString());

    db.loadDatabase({}, function () {

        //get the users collection
        var users = db.getCollection('users');
        // console.log('users.data ' + JSON.stringify(users.data));

        if ((typeof(users) == "undefined") || users == null) {
            var result = {
                error: 'there are no existing users'
            };
            winston.log("info", '[webui] user-model: there are no existing users');
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


