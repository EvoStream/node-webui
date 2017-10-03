var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var expressSession = require('express-session');
var flash = require('connect-flash');

//For forgot password
var async = require('async');
var crypto = require('crypto');

var path = require('path');

//Routes
var routes = require(path.join(__dirname, './routes/index'));
var users = require(path.join(__dirname, './routes/users'));
var dashboard = require(path.join(__dirname, './routes/dashboard'));
var streams = require(path.join(__dirname, './routes/streams'));
var apiExplorer = require(path.join(__dirname, './routes/api-explorer'));
var ems = require(path.join(__dirname, './routes/ems'));

//Passport
var passportConfig = require('./auth/passport-config');
var restrict = require('./auth/restrict');
passportConfig();

var app = express();

//Set Winston
var winston = require('winston');

var jsonComment = require('comment-json');
var fs = require('fs');

var fileLogging = path.join(__dirname, '/config/logging.json');

var configLog = jsonComment.parse(fs.readFileSync(fileLogging), null, true);

winston.addColors({
    silly: 'blue',
    debug: 'gray',
    verbose: 'magenta',
    info: 'green',
    warn: 'yellow',
    error: 'red'
});

winston.remove(winston.transports.Console);

var logFileName = path.join(__dirname, '/logs/webui.') + process.pid + "." + new Date().getTime() + "-" + ".log";

// Set Winston Log
winston.add(winston.transports.File, {
    level: configLog.options.level,
    filename: logFileName,
    handleExceptions: configLog.options.handleExceptions,
    json: configLog.options.json,
    maxsize: configLog.options.maxsize,
    timestamp: function () {

        var d = new Date();
        var dISO = d.toISOString();

        var timestamp = dISO + " - " + process.pid;

        return timestamp;
    }
});

winston.add(winston.transports.Console, {
    level: configLog.options.level,
    handleExceptions: configLog.options.handleExceptions,
    colorize: true
});

winston.stream = {
    write: function(message, encoding){
        winston.log("verbose", "[webui] " + message.trim());
    }
};

app.use(require("morgan")("combined", { "stream": winston.stream }));

//Adding uncaughtException to winston
process.on('uncaughtException', function (err) {
    console.log("[webui] UNCAUGHT EXCEPTION ");
    console.log("[webui] [Inside 'uncaughtException' event] " + err.stack || err.message);
    winston.log("error", "[webui] UNCAUGHT EXCEPTION ");
    winston.log("error", "[webui] [Inside 'uncaughtException' event] " + err.stack || err.message);
});


//Removing uncaughtException to console.log
// process.on('uncaughtException', function (err) {
//     console.log(" UNCAUGHT EXCEPTION ");
//     console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//For enabling CORS
var allowCrossDomain = function (req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    next();
};

app.use(allowCrossDomain);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'fav-icon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Set the session
app.use(expressSession(
    {
        secret: 'evostream media server',
        saveUninitialized: false,
        resave: false,
        cookie: {maxAge: 100000000}
    }
));

//authenticate before routing
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//routing page url
app.use('/', routes);
//app.use(restrict);
app.use('/users', users);
app.use('/dashboard', dashboard);
app.use('/streams', streams);
app.use('/api-explorer', apiExplorer);
app.use('/ems', ems);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.use(function(req, res, next){
    //concat the stream of response from ems
    req.pipe(concat(function(data){
        req.body = data;
        next();
    }));
});


console.log("[webui] starting app ");
winston.log("verbose", "[webui] starting app ");

module.exports = app;

