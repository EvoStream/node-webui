module.exports = function(req, res, next){
    console.log('restrict req.user '+JSON.stringify(req.user));
    console.log('restrict req.session.fbUser '+JSON.stringify(req.session.fbUser));
    console.log('restrict req.session.googleUser '+JSON.stringify(req.session.googleUser));
    // console.log('restrict req.session.passport.user '+JSON.stringify(req.session.passport.user));
    if(req.isAuthenticated()){
        console.log('restrict if');
        return next();
    }else if(req.session.fbUser){
        console.log('restrict if fbUser');
        return next();
    }else if(req.session.googleUser){
        console.log('restrict if googleUser');
        return next();
    }
    //Add a flash message

    res.redirect('/');
};