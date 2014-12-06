var express = require('express');
var contacts = require('../models/contacts');

module.exports = (function() {
    'use strict';
    var snapshots = express.Router();

    snapshots.post('/', function(req, res) {
        var action = req.body.action;
        if (action == "remove_snaphot") {
            contacts.remove_snaphot(req.body.timestamp, function(err) {
                if (err)
                    res.send(err);
                else
                    res.send({
                        status: "snapshot " + req.body.timestamp + " removed"
                    });
            });
        }

        if (action == "restore") {
            contacts.restore_snapshot(req.body.timestamp, true, function(err, data) {
                //TODO
                if (err)
                    res.send(err);
                else
                    res.send(data);
            });
        }
    });

    snapshots.get('/all', function(req, res) {
        contacts.getall_changes(req.body, function(data) {
            res.send(data);
        });
    });

    return snapshots;
})();