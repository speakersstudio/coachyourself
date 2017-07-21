const mongoose = require('mongoose'),
    Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path');

const config = require('./config')();

const Game = require('./models/game.model'),
    GameMetadata = require('./models/game-metadata.model'),
    NameVote = require('./models/name-vote.model'),
    Name = require('./models/name.model'),
    Note = require('./models/note.model'),
    Tag = require('./models/tag.model'),

    // set these to a Date.now() value to trigger a re-seed
    metadataBackupTime = 1493844345382,
    gameBackupTime = 1493844345382,
    nameBackupTime = 1493844345382,
    tagBackupTime = 1493844345382,
    noteBackupTime = 1493844345382;

const ShauvonID = "58c6e5bcd036281f4ce07dff";

mongoose.Promise = Promise;
mongoose.connect(config.mongodb.uri);

function fixUsers(arr) {
    arr.forEach((item) => {
        if (item.addedUser == 1) {
            item.addedUser = ShauvonID;
        }
        if (item.modifiedUser == 1) {
            item.modifiedUser = ShauvonID;
        }
    });
    return arr;
}

function deleteMetadata() {
    console.log('Deleting metadata items');
    return GameMetadata.find({}).remove().exec();
}

function seedMetadata() {
    const items = fixUsers(require('./models/seeds/game-metadata.seed.json'));
    return GameMetadata.create(items)
        .then(() => {
            console.log("Metadata fully seeded");
            console.log('--');
        });
}

function deleteTags() {
    console.log('Deleting tags');
    return Tag.find({}).remove().exec();
}

function seedTags() {
    const tags = fixUsers(require('./models/seeds/tag.seed.json'));

    return Tag.create(tags)
        .then(() => {
            console.log("Tags fully seeded");
            console.log('--');
        });
            
}

function deleteGames() {
    console.log('Deleting games and names');
    return Game.find({}).remove().exec()
        .then(() => {
            return Name.find({}).remove().exec();
        });
        // .then(() => {
        //     return Note.find({})
        //         .$where('this.tag === "" && this.metadata === ""')
        //         .remove();
        // });
}

function seedGames() {
    // return seedGame(0);
    const games = require('./models/seeds/game.seed.json'),
        names = require('./models/seeds/name.seed.json');

    return Game.create(games).then(() => {
            return Name.create(names);
        }).then(() => {
            console.log("Games and names fully seeded");
            console.log(' -- ');
        })
}

function deleteNotes() {
    console.log('Deleting notes');
    return Note.find({}).remove().exec();
}

function seedNotes() {
    const notes = require('./models/seeds/note.seed.json');

    return Note.create(notes)
        .then(() => {
            console.log('notes fully seeded');
            console.log(' -- ');
        });
}

const DBInfo = require('./models/dbinfo.model');

module.exports = {
    resetGames: function(done) {
        console.log('re-seeding all of the game database');
        return deleteMetadata()
            .then(seedMetadata)
            .then(deleteTags)
            .then(seedTags)
            .then(deleteGames)
            .then(seedGames)
            .then(() => {
                return DBInfo.findOne({}).where('key').equals('game').exec();
            })
            .then(dbi => {
                if (!dbi) {
                    return DBInfo.create({
                        key: 'game',
                        latest: Date.now()
                    });
                } else {
                    dbi.latest = Date.now();
                    return dbi.save();
                }
            })
            .then(() => {
                if (done) {
                    process.exit(0);
                }
            });
    },

    resetNotes: function(done) {
        return deleteNotes()
            .then(seedNotes)
            .then(() => {
                return DBInfo.findOne({}).where('key').equals('note').exec();
            })
            .then(dbi => {
                if (!dbi) {
                    return DBInfo.create({
                        key: 'note',
                        latest: Date.now()
                    });
                } else {
                    dbi.latest = Date.now();
                    return dbi.save();
                }
            })
            .then(() => {
                if (done) {
                    process.exit(0);
                }
            });

    },

    clear: function() {
        return deleteMetadata()
            .then(deleteTags)
            .then(deleteGames)
            .then(deleteNotes)
            .then(() => {
                process.exit(0);
            });
    },

    checkForSeed: function() {
        return DBInfo.count({}).exec()
            .then(count => {
                if (count == 0) {
                    return DBInfo.create({});
                }
            })
            .then(() => {
                return DBInfo.findOne({}).where('key').equals('game').exec()
            })
            .then(info => {
                if (!info) {
                    return DBInfo.create({
                        key: 'game',
                        latest: 0
                    });
                } else {
                        return Promise.resolve(info);
                    }
            })
            .then(info => {

                let dbGameTime = info.latest;
                // dbNoteTime = dbi.note;

                if (!dbGameTime || 
                        dbGameTime < metadataBackupTime ||
                        dbGameTime < gameBackupTime ||
                        dbGameTime < nameBackupTime ||
                        dbGameTime < tagBackupTime) {
                    console.log("Game backup is more recent than game database!");
                    return this.resetGames(false);
                } else {
                    console.log('No need to reset game database...');
                    return Promise.resolve(true);
                }
            })
            .then(() => {
                return DBInfo.findOne({}).where('key').equals('note').exec()
            })
            .then(info => {
                if (!info) {
                    return DBInfo.create({
                        key: 'note',
                        latest: 0
                    });
                } else {
                        return Promise.resolve(info);
                    }
            })
            .then(info => {

                let dbNoteTime = info.latest;
                if (!dbNoteTime || 
                    dbNoteTime < noteBackupTime) {
                        console.log("Note backup is more recent than note database!");
                        return this.resetNotes(false);
                    } else {
                        console.log('No need to reset note database...');
                        return Promise.resolve(true);
                    }
            })
            .then(() => {
                process.exit(0);
            })
    }
}