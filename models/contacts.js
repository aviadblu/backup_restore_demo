var mongoose     = require('mongoose');
var time = require('time');
var Schema       = mongoose.Schema;

// mongoose Scema:
var ContactsSchema = new Schema({
	name:{
		first: String,
		last: String
	},
    phone_1: String,
    email: String,
    timestamp: Number
});

var SnapshotsListSchema = new Schema({
	timestamp: Number
});


var contacts_model = mongoose.model('Contacts', ContactsSchema);
var snapshots_model = mongoose.model('ContactsSnapshots', ContactsSchema);
var snapshots_list_model = mongoose.model('SnapshotsList', SnapshotsListSchema);


///////////////////////////////////////////////////////////////
var getTimestamp = function(){
	var timeZone = "Asia/Jerusalem";
	// get timestamp in sec
	var now = new time.Date();
    now.setTimezone(timeZone);
    return Math.round(now.getTime()/1000);
};

var create_snapshot = function() {
	var snapshot_timestamp = getTimestamp();
	
	// add snapshot to the list
	snapshots_list_model.create({timestamp:snapshot_timestamp}, function(err) {});
	///////////////////////////
	
	contacts_model.find(function(err, contacts_list) {
        for(var i in contacts_list) {
        	var contact = contacts_list[i];
        	contact.timestamp = snapshot_timestamp;
        	contact._id = undefined;
        	snapshots_model.create(contact, function(err) {
	
		    });
        }
    });
};

/////////////////////////////////////////////////////////////////


var contacts = {
	getall:function(req_body, callback) {
		contacts_model.find(function(err, contacts_list) {
            if (err)
                callback(err);
            callback(contacts_list);
        });
	},
	getall_snapshots:function(req_body, callback) {
		snapshots_model.find(function(err, contacts_list) {
            if (err)
                callback(err);
            callback(contacts_list);
        });
	},
	insert:function(obj, callback) {
    	//TODO
    	
    	// create snapshot:
        create_snapshot();
        ///////////////////
        
    	obj.timestamp = getTimestamp();
    	contacts_model.create(obj, function(err) {
	        if (err)
	            callback(err);
	        else
	        	callback();
	    });
  	},
  	update:function(id, obj, callback) {
    	//TODO
    	contacts_model.findById(id, function(err, contact) {

                if (err) {
                    callback(err);
                    return;
                }
                
                // create snapshot:
                create_snapshot();
                ///////////////////

                
                // fields that can be updated:
                contact.name.first = obj.name.first ? obj.name.first : contact.name.first;
                contact.name.last = obj.name.last ? obj.name.last : contact.name.last;
                contact.phone_1 = obj.phone_1 ? obj.phone_1 : contact.phone_1;
                contact.email = obj.email ? obj.email : contact.email;
                contact.timestamp = getTimestamp();

				
				contact.save(function(err) {
                    if (err) {
	                    callback(err);
	                    return;
	                }
	                
                    callback();
                });


        });
  	},
  	remove:function(id, callback) {
    	//TODO
    	
    	// create snapshot:
        create_snapshot();
        ///////////////////
        
    	contacts_model.remove({
	        _id : id
	    }, function(err, scene) {
	        if (err) {
                callback(err);
                return;
            }
            
            callback();

	    });
  	},
  	remove_snaphot:function(timestamp,callback) {
  		snapshots_list_model.remove({
	        timestamp : timestamp
	    }, function(err) {

	    });
	    
    	snapshots_model.remove({
	        timestamp : timestamp
	    }, function(err) {
	    	if(err) {
	    		callback(err);
	    	}
	    	else {
	    		callback();
	    	}
	    });
  	},
  	restore_snapshot:function(timestamp,callback) {
  		snapshots_list_model.findOne({ timestamp: {$lt: timestamp}}, function (err, snapshot){
		  // doc is a Document
		  if(err) {
	    		callback(err);
	    	}
	    	else {
	    		if(snapshot) {
	    			// load snapshot:
	    			console.log("snapshot " + snapshot.timestamp + " restored");
	    			snapshots_model.find({timestamp:snapshot.timestamp},function(err, contacts_list) {
			            if (err) {
			                callback(err);
			            }
			            else {
			            	callback(false,contacts_list);
			            }
			        });
	    		}
	    		else {
	    			console.log("no snapshot avalibale");
	    			callback(false,{error: "no snapshot avalibale"});
	    		}
	    	}
		});
  	}
};

module.exports = contacts;