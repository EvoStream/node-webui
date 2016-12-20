var express = require('express');
var router = express.Router();
var path = require('path');
var config = require(path.join(__dirname, '../config/dbConfig'));


var socialConfig = require(path.join(__dirname, '../config/socialAuthConfig'));
var userService = require(path.join(__dirname, '../services/user-service-portable'));
var passport = require('passport');
// var request = require('request');

//For forgot password
var async = require('async');
var crypto = require('crypto');

/* GET index page. */
router.get('/', function (req, res, next) {

    var user1 = userService.addUser();
    console.log('user1 ' + JSON.stringify(user1));

    res.render('index', {title: 'Express'});


});


/* GET index page. */
router.get('/insert', function (req, res, next) {

    userService.addUser(req.body, function (next) {
        console.log('next ' + JSON.stringify(next));
        //
        // var userCount = userService.countUser();
        // console.log('userCount '+userCount );
        //
        res.render('index', {title: 'insert Express'});

    });


});


router.get('/count', function (req, res, next) {

    var userCount = userService.countUser();
    console.log('userCount ' + userCount);

    res.render('index', {title: 'Express'});


});


router.get('/all', function (req, res, next) {

    var userAll = userService.findAllUser();
    console.log('userAll ' + JSON.stringify(userAll));

    res.render('index', {title: 'Express'});


});


module.exports = router;
