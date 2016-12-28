const fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var notes = require('./routes/notes');
var FileStreamRotator = require('file-stream-rotator');
var error = require('debug')('notes:error');

const session = require('express-session');
// Save our session data to disk
const FileStore = require('session-file-store')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Error Handling
process.on('uncaughtException', function(err) {
  error("I've crashed!!! - "+ (err.stack || err));
});

/*
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    // util.log(err.message);
    res.status(err.status || 500);
    error((err.status || 500) +' '+ error.message);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
*/

// Logging Setup
var accessLogStream;
// console.log('process.env.REQUEST_LOG_FILE: ' + process.env.REQUEST_LOG_FILE);
if (process.env.REQUEST_LOG_FILE) {
    var logDirectory = path.dirname(process.env.REQUEST_LOG_FILE + '/.');
    // console.log('logDirectory:' + logDirectory);
    // console.log('fs.existsSync(logDirectory): ' + fs.existsSync(logDirectory));
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    accessLogStream = FileStreamRotator.getStream({
      filename: process.env.REQUEST_LOG_FILE,
      // var rotatingLogStream = require('file-stream-rotator').getStream({filename:"/tmp/test.log", frequency:"daily", verbose: false});
      // filename: '/' + process.env.REQUEST_LOG_FILE + '/',
      // filename: "/logs/test",
      frequency: 'daily',
      verbose: false
    });
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));
app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
    stream: accessLogStream ? accessLogStream : process.stdout
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new FileStore({ path: "sessions" }),
  secret: 'keyboard mouse',resave: true,saveUninitialized: true
}));
users.initPassport(app);

// Routers
app.use('/', index);
// app.use('/', routes);
app.use('/users', users.router);
app.use('/notes', notes);

// Handle Bower Packages
/*
app.use('/vendor/bootstrap', express.static(
  path.join(__dirname, 'bower_components', 'bootstrap', 'dist')));
*/  
// app.use('/vendor/bootstrap/css', express.static(path.join(__dirname, 'cyborg')));
app.use('/vendor/bootstrap/css', express.static(path.join(__dirname, 'bower_components', 'bootstrap', 'dist', 'css')));
app.use('/vendor/bootstrap/fonts', express.static(path.join(__dirname, 'bower_components', 'bootstrap', 'dist', 'fonts')));
app.use('/vendor/bootstrap/js', express.static(path.join(__dirname, 'bower_components', 'bootstrap', 'dist', 'js')));
app.use('/vendor/jquery', express.static(path.join(__dirname, 'bower_components', 'jquery', 'dist')));
/*
app.use('/vendor/jquery', express.static(
  path.join(__dirname, 'bower_components', 'jquery', 'dist')));
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
/*
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/

app.use(function(err, req, res, next) {
  // util.log(err.message);
  res.status(err.status || 500);
  error((err.status || 500) +' '+ error.message);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
