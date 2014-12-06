var express = require('express');
var contacts = require('../models/contacts');


// id's for testing 
//aviad: 5481bdd4a6d688ff38000002 
//moshe: 5481bf1ea806f4a239000001 
//david: 5481bf48a806f4a239000002 
//shlomo: 5481bf56a806f4a239000003


module.exports = (function() {
	'use strict';
	var sync = express.Router();
	
	sync.post('/', function(req, res) {
		var action = req.body.action;
		if (action == "insert") {
			contacts.insert(req.body.obj, function(err) {
				//TODO
				if(err)
					res.send(err);
				else
					res.send({status:"contact inserted"});
			});
		}
		if (action == "update") {
			contacts.update(req.body.id, req.body.obj, function(err) {
				//TODO 
				if(err)
					res.send(err);
				else
					res.send({status:"contact updated"});
			});
		}
		if (action == "remove") {
			contacts.remove(req.body.id, function(err) {
				//TODO 
				if(err)
					res.send(err);
				else
					res.send({status:"contact "+ req.body.id + " deleted"});
			});
		}	
	});
	
	sync.get('/all', function(req, res) {
		contacts.getall(req.body, function(data) {
			//TODO
			res.send(data);
		});
	});
	
	return sync;
})();