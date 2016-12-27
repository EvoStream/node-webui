module.exports = function(req, res, next){
    var winston = require('winston');

    winston.log("verbose", '[webui] passport deserialize user');
    if(req.isAuthenticated()){
        return next();
    }else if(req.session.fbUser){
        return next();
    }else if(req.session.googleUser){
        return next();
    }
    res.redirect('/');
};