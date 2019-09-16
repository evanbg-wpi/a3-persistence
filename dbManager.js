const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

const bcrypt = require('bcrypt');
const saltRounds = 10;

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

exports.deleteContent = function (user, contentID) {
    console.log("Delete: ", contentID);
    db.get('content')
        .remove({id: contentID})
        .write()
}

exports.checkPass = function (username, password, cb) {
    process.nextTick(function () {
            let user = db.get('users')
                .find({username: username})
                .value();

            if (user !== null)
                if (bcrypt.compareSync(password, user.password))
                    return cb(null, user);
            return cb(null, null);
        }
    )
};

exports.getUser = function (username, cb) {
    process.nextTick(function () {
        let user = db.get('users')
            .find({username: username})
            .value();

        if (user !== null)
            return cb(null, user);
        else {
            return cb(null, null);
        }
    })
};

/**
 * @return {boolean}
 */
exports.CreateUser = function (username, displayName, password) {
    if (db.get('users').find({username: username}).value() === undefined) {
        console.log("Creating User: ", username);
        let passHash = bcrypt.hashSync(password, saltRounds);
        db.get('users')
            .push({username: username, displayName: displayName, password: passHash})
            .write();

        return true;
    }
    return false;
}
