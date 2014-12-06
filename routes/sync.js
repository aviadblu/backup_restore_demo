var express = require('express');
var contacts = require('../models/contacts');

module.exports = (function() {
    'use strict';
    var sync = express.Router();

    sync.post('/', function(req, res) {
        var action = req.body.action;
        if (action == "insert") {
            contacts.insert(req.body.obj, function(err) {
                //TODO
                if (err)
                    res.send(err);
                else
                    res.send({
                        status: "Contact inserted"
                    });
            });
        }
        if (action == "update") {
            contacts.update(req.body.id, req.body.obj, function(err) {
                //TODO 
                if (err)
                    res.send(err);
                else
                    res.send({
                        status: "Contact updated"
                    });
            });
        }
        if (action == "remove") {
            contacts.remove(req.body.id, function(err) {
                //TODO 
                if (err)
                    res.send(err);
                else
                    res.send({
                        status: "Contact " + req.body.id + " deleted"
                    });
            });
        }
    });

    sync.get('/all', function(req, res) {
        contacts.getall(req.body, function(data) {
            res.send(data);
        });
    });

    return sync;
})();