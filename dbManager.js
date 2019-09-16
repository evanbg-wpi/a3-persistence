const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({users: [], content: [], id: 0})
    .write();

exports.getAllContent = function () {
    return db.get('content')
        .sortBy('type')
        .value();
}

exports.getContentForUser = function (user) {
    return db.get('content')
        .filter({username: user.username})
        .sortBy('type')
        .value();
};

exports.addOrUpdateContent = function (user, type, text, id) {
    if (id === undefined || id === '') {
        id = db.get('id')
            .value();
        console.log("got id: ", id);
        console.log("new id: ", id + 1);
        console.log("Adding ", type, " for ", user.username, ": ", text);
        db.get('content')
            .push({id: id, username: user.username, type: type, text: text})
            .write();
        db.update('id', n => n + 1).write()

    } else {
        console.log('Updating content ', id);
        let contentStore = db.get('content').find({id: parseInt(id, 10)});
        contentStore.assign({type: type, text: text}).value();
    }
};

exports.deleteContent = function(user, contentID) {
    console.log("Delete: ", contentID);
    db.get('content')
        .remove({id: contentID})
        .write()
}

exports.getUser = function (username, cb) {
    process.nextTick(function () {
        let user = db.get('users')
            .find({username: username})
            .value();
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
    if (db.get('users').find({username: username}).value() === undefined) {
        console.log("Creating User: ", username);
        db.get('users')
            .push({username: username, password: password})
            .write();
    }
}
