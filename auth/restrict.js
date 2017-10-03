/**
 * restrict user authentication
 */
module.exports = function(req, res, next){
    var winston = require('winston');

    winston.log("verbose", '[webui] restirct: checking user authentication');

    if(req.isAuthenticated()){
        return next();
    }else if(req.session.fbUser){
        return next();
    }else if(req.session.googleUser){
        return next();
    } 
    res.redirect('/');
};