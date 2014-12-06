var mongoose = require('mongoose');
var time = require('time');
var Schema = mongoose.Schema;

// mongoose Scema:
var ContactsSchema = new Schema({
    name: {
        first: String,
        last: String
    },
    phone_1: String,
    email: String,
    timestamp: Number
});

var TrackChangesSchema = new Schema({
    original_id: String,
    action: String,
    timestamp: Number,
    restore_timestamp: Number,
    contact_obj: {
        name: {
            first: String,
            last: String
        },
        phone_1: String,
        email: String
    }
});



var contacts_model = mongoose.model('Contacts', ContactsSchema);
var track_changes_model = mongoose.model('TrackChanges', TrackChangesSchema);


///////////////////////////////////////////////////////////////
var getTimestamp = function() {
    var timeZone = "Asia/Jerusalem";
    // get timestamp in sec
    var now = new time.Date();
    now.setTimezone(timeZone);
    return Math.round(now.getTime() / 1000);
};
/////////////////////////////////////////////////////////////////


// clean backups: //
var clear_backups = function() {
    track_changes_model.find(function(err, contacts_list) {
        for (var i in contacts_list) {
            console.log("deleting: " + contacts_list[i]._id);
            track_changes_model.remove({
                _id: contacts_list[i]._id
            }, function(err) {});
        }
    });
};
//clear_backups();

var clear_contacts = function() {
    contacts_model.find(function(err, contacts_list) {
        for (var i in contacts_list) {
            console.log("Restore ::: deleting: " + contacts_list[i]._id);
            contacts.remove(contacts_list[i]._id, false, function() {});
        }
    });
};

//clear_contacts();
var actionDone;
var doActions = function(actionsToDo) {
    var change = actionsToDo[actionDone];
    if (!change)
        return;

    switch (change.action) {
        case "insert":
            console.log("Restore ::: inserting " + change.original_id);
            var obj = change.contact_obj;
            obj._id = change.original_id;
            contacts.insert(obj, false, function() {
                actionDone++;
                doActions(actionsToDo);
            });
            break;
        case "update":
            console.log("Restore ::: updating: " + change.original_id);
            contacts.update(change.original_id, change.contact_obj, false, function() {
                actionDone++;
                doActions(actionsToDo);
            });
            break;
        case "remove":
            console.log("Restore ::: deleting: " + change.original_id);
            contacts.remove(change.original_id, false, function() {
                actionDone++;
                doActions(actionsToDo);
            });
            break;
        case "restore":
            actionDone++;
            doActions(actionsToDo);
            break;
    }
};
////////////////////

var contacts = {
    getall: function(req_body, callback) {
        contacts_model.find(function(err, contacts_list) {
            if (err)
                callback(err);
            callback(contacts_list);
        });
    },
    getall_changes: function(req_body, callback) {
        track_changes_model.find(function(err, contacts_list) {
            if (err)
                callback(err);
            callback(contacts_list);
        });
    },
    insert: function(obj, track, callback) {
        //TODO
        var timestamp = getTimestamp();
        obj.timestamp = timestamp;
        contacts_model.create(obj, function(err, contact) {

            if (track) {
                // track changes:
                delete obj._id;
                delete obj.__v;
                var track_changes_object = {
                    original_id: contact._id,
                    action: "insert",
                    timestamp: timestamp,
                    contact_obj: obj
                };
                track_changes_model.create(track_changes_object, function(err) {})
                /////////////////
            }

            if (err)
                callback(err);
            else
                callback();
        });
    },
    update: function(id, obj, track, callback) {
        //TODO
        contacts_model.findById(id, function(err, contact) {
            var timestamp = getTimestamp();
            if (err) {
                callback(err);
                return;
            }

            // fields that can be updated:
            contact.name.first = obj.name && obj.name.first ? obj.name.first : contact.name.first;
            contact.name.last = obj.name && obj.name.last ? obj.name.last : contact.name.last;
            contact.phone_1 = obj.phone_1 ? obj.phone_1 : contact.phone_1;
            contact.email = obj.email ? obj.email : contact.email;
            contact.timestamp = timestamp;

            if (track) {
                // track changes:
                var contact_bu = contact.toObject();
                delete contact._id;
                delete contact.__v;

                var track_changes_object = {
                    original_id: contact._id,
                    action: "update",
                    timestamp: timestamp,
                    contact_obj: contact_bu
                };
                track_changes_model.create(track_changes_object, function(err) {});
                ///////////////////
            }

            contact.save(function(err) {
                if (err) {
                    callback(err);
                    return;
                }

                callback();
            });
        });
    },
    remove: function(id, track, callback) {
        //TODO
        if (track) {
            // track changes:
            contacts_model.findById(id, function(err, contact) {
                if (!contact) {
                    callback();
                    return;
                }

                var contact_bu = contact.toObject();
                delete contact._id;
                delete contact.__v;

                var timestamp = getTimestamp();

                var track_changes_object = {
                    original_id: contact._id,
                    action: "remove",
                    timestamp: timestamp,
                    contact_obj: contact_bu
                };
                track_changes_model.create(track_changes_object, function(err) {});
            });
            ///////////////////
        }

        contacts_model.remove({
            _id: id
        }, function(err) {
            if (err) {
                callback(err);
                return;
            }

            callback();

        });
    },
    restore_snapshot: function(timestamp, track, callback) {

        console.log("restoring to " + timestamp);
        // check if it's old the 30 days:
        var time_gap = getTimestamp() - timestamp;

        if (time_gap < 0) {
            callback(false, {
                error: "I can not predict the future"
            });
            return;
        }

        if ((time_gap / 3600 / 24) > 30) {
            callback(false, {
                error: "Snapshots avaliable only for 30 days!"
            });
            return;
        }

        // delete all contacts:
        clear_contacts();
        ///////////////////////

        track_changes_model.find({
            timestamp: {
                $lt: timestamp
            }
        }, function(err, changes) {
            //console.log(changes);


            if (track) {
                // track:
                var track_changes_object = {
                    original_id: 0,
                    action: "restore",
                    timestamp: getTimestamp(),
                    restore_timestamp: timestamp
                };
                track_changes_model.create(track_changes_object, function(err) {});
                ///////////////////////
            }

            // recognize deadzones between restore points:
            var deadzones = [];
            var c = 0;
            var start, end, overlapped;
            for (var i in changes) {
                var change = changes[i].toObject();
                if (change.action == "restore") {
                    start = change.restore_timestamp;
                    end = change.timestamp;
                    overlapped = false;
                    // check for overlapping:
                    // if overlapping, it's not a deadzone

                    for (var j in deadzones) {
                        if (end > deadzones[j].start) {
                            overlapped = true;
                            break;
                        }
                    }

                    /////////////////////////
                    if (!overlapped) {
                        deadzones[c] = {
                            start: start,
                            end: end
                        };
                        c++;
                    }
                }
            }
            ///////////////////////////////////////////////
            var actionsToDo = [];

            for (var i in changes) {
                // iterate over change records
                var change = changes[i].toObject();
                var inDeadZone = false;

                // check if not in deadzone:
                // deadzone is between restore point to the next actual restored data
                for (var j in deadzones) {
                    var deadzone = deadzones[j];
                    if (change.timestamp > deadzone.start && change.timestamp < deadzone.end) {
                        inDeadZone = true;
                    }
                }
                ////////////////////////////

                // push all the action need to be done:
                if (!inDeadZone) {
                    actionsToDo.push(change);
                }
            }

            // apply all the action needed to restored to timestamp:
            console.log("Applying actions:");
            actionDone = 0;
            doActions(actionsToDo);
            ///////////////////////////////////////////////////////

            callback(false, {
                status: "done!"
            });
        }).sort({
            timestamp: -1
        });
    }
};

module.exports = contacts;