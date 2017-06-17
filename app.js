var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';
var config = require('./config/mongo')[env];
var expressHandlebars = require('express-handlebars');


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
var hbs = expressHandlebars.create({
  partialsDir: path.join(__dirname, '/views/shared'),
  defaultLayout: path.join(__dirname, '/views/layout'),
  extname: ".hbs"
});

app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session setup to use mongo as backing store
app.use(session({
  secret: 'jhjhj-fdsaf-44asd47-fdadfs',
  cookie: {
    maxAge: 2628000000
  },
  resave: false,
  saveUninitialized: true,
  store: new(require('express-sessions'))({
    storage: 'mongodb',
    db: config.database,
    collection: 'sessions', // optional
    expire: 86400 // optional
  })
}));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
