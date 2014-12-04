var express = require('express');
app = express();

var sync = require('./routes/sync');
var snapshots = require('./routes/snapshots');


console.log("app started 8084");
app.listen(8084);