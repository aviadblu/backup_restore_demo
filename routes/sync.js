var contacts = require('../models/contacts');

app.post('/sync', function(req, res) {

	var action = req.body.action;

	if (action == "insert") {
		contacts.insert(req.body.obj, function(err) {
			//TODO 
			console.log("insert")
		});
	}
	if (action == "update") {
		contacts.insert(req.body.id, req.body.obj, function(err) {
			//TODO 
		});
	}
	if (action == "remove") {
		contacts.insert(req.body.id, function(err) {
			//TODO 
		});
	}
});