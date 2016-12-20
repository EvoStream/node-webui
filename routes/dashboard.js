var express = require('express');
var router = express.Router();
var path = require('path');
var restrict = require(path.join(__dirname, '../auth/restrict'));

/* GET dashboard listing. */
router.get('/', restrict, function(req, res, next) {
// router.get('/', function(req, res, next) {
    console.log('dashboard part '+JSON.stringify(req.session));

    // emsService.checkEmsConnection(function(result){
    //     console.log('inside checkEmsConnection result '+JSON.stringify(result));
    // });

    var vm = {
        title: 'Dashboard - Evostream Web UI ',
        email: req.user ? req.user.email : null,
        dashboardActive: "active",
        layout: 'admin/layout',
    }
    res.render('admin/dashboard', vm);

    // res.render('admin/dashboard');


});

module.exports = router;