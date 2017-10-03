var express = require('express');
var router = express.Router();
var path = require('path');
var restrict = require(path.join(__dirname, '../auth/restrict'));
var winston = require('winston');

router.get('/', restrict, function(req, res, next) {
    winston.log("info", '[webui] dashboard: index page');

    var vm = {
        title: 'Dashboard - Evostream Web UI ',
        email: req.user ? req.user.email : null,
        dashboardActive: "active",
        layout: 'admin/layout',
    }
    res.render('admin/dashboard', vm);
});

module.exports = router;