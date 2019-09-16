exports.getContentForUser = function (user) {
    return db.get('content')
        .filter({username: user.username})
        .sortBy('type')
        .value();
};

exports.addContent = function (user, type, text) {
    let id = db.get('content')
        .size()
        .value();
    console.log("Adding ", type, " for ", user.username, ": ", text);
    db.get('content')
        .push({id: id, username: user.username, type: type, text: text})
        .write();
};

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({users: [], content: []})
    .write();

exports.getUser = function (username, cb) {
    process.nextTick(function () {
        let user = db.get('users')
            .find({username: username})
            .value();
        console.log("Found user: ", user);
        if (user !== null)
            return cb(null, user);
        else
            return cb(null, null);
    });
}

exports.findById = function (id, cb) {
    process.nextTick(function () {
        var idx = id - 1;
        if (records[idx]) {
            cb(null, records[idx]);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
}

exports.CreateUser = function (username, password) {
    console.log("Creating User");
    db.get('users')
        .push({username: username, password: password})
        .write();
}
