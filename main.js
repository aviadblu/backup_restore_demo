var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/home_assignment');
var bodyParser = require('body-parser');
var morgan = require('morgan');


var sync = require('./routes/sync');
var snapshots = require('./routes/snapshots');




app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/sync', sync);
app.use('/snapshots', snapshots);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	console.log("error handler");
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

module.exports = app;


console.log("app started 8080");
app.listen(8080);