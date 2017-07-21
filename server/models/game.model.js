const mongoose = require('mongoose');

const Note = require('./note.model');
const Name = require('./name.model');
const GameMetadata = require('./game-metadata.model');
const Tag = require('./tag.model');
const HistoryModel = require('./history.model');

const util = require('../util');

const GameSchema = new mongoose.Schema({
    legacyID: Number,
    names: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Name' }],
    description: String,
    duration: { type: mongoose.Schema.Types.ObjectId, ref: 'GameMetadata' },
    playerCount: { type: mongoose.Schema.Types.ObjectId, ref: 'GameMetadata' },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    addedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateAdded: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now },
    dateDeleted: Date,
    deletedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

GameSchema.methods.addNote = function(note, userId) {
    const game = this;
    if (typeof note == 'string') {
        note = {
            description: note,
            addedUser: userId
        }
    }
    note.game = game._id;
    note.addedUser = userId;
    return Note.create(note).then(n => {
        game.notes.push(n._id);
        return game.save();
    });
};

GameSchema.methods.addName = function(name, userId) {
    const game = this;

    return Name.create({
        name: name,
        addedUser: userId,
        game: game._id
    }).then(n => {
        game.names.push(n);
        return game.save();
    });
}

GameSchema.methods.addMetadata = function(metadata) {
    const game = this;
    let metadataId;

    if (typeof metadata == 'object') {
        metadataId = metadata._id;
    } else {
        metadataId = metadata;
    }

    //find the new metadata item
    return GameMetadata.findOne({}).where('_id').equals(metadataId).exec()
        .then(newmetadata => {
            let type = newmetadata.type;
            let oldmetaid = game[type] && game[type]._id ? game[type]._id : game[type];

            // remove this game from the old metadata item
            return GameMetadata.findOne({}).where('_id').equals(oldmetaid).exec()
                .then(m => {
                    if (m) {
                        m.games.splice(m.games.indexOf(game._id), 1);
                        return m.save();
                    }
                })
                .then(oldmetadata => {
                    game[type] = newmetadata;
                    newmetadata.games.push(game._id);
                    return newmetadata.save()
                })
                .then(() => {
                    return game.save();
                });
        });
        
}

GameSchema.methods.removeTag = function(tagId, userId) {
    let index = util.indexOfObjectId(this.tags, tagId),
        game = this;

    game.tags.splice(index, 1);

    let query = Tag.findOne({}).where('_id').equals(tagId);

    return query.exec()
        .then(tag => {
            let index = util.indexOfObjectId(tag.games, game._id);
            if (index > -1) {
                tag.games.splice(index, 1);
            }

            HistoryModel.create({
                action: 'game_tag_remove',
                target: game._id,
                user: userId,
                reference: tag.name
            });

            if (tag.games.length == 0 && !tag.description) {
                return tag.remove();
            } else {
                return tag.save();
            }
        })
        .then(() => {
            return game.save()
        });
}

GameSchema.methods.addTag = function(tagName, tagId, userId) {
    const game = this;

    let query = Tag.findOne({});
    if (tagName) {
        query.where('name').equals(tagName);
    } else if (tagId) {
        query.where('_id').equals(tagId);
    }
    
    return query.exec()
        .then(tag => {
            return addTag(tag, tagName, userId, game);
        })
        .then(t => {
            return game.save();
        });
}

function addTag(tag, name, userId, game) {
    if (tag) {
        // the tag exists, so we can just add it
        game.tags.push(tag);
        tag.games.push(game._id);

        HistoryModel.create({
            user: userId,
            action: 'game_tag_add',
            target: game._id.toString(),
            reference: tag._id.toString()
        });
        
        return tag.save();
    } else if (name) {
        // the tag doesn't exist, so we have to create it
        return Tag.create({
            name: name,
            addedUser: userId
        }).then(t => {
            game.tags.push(t);
            t.games.push(game._id);

            HistoryModel.create({
                user: userId,
                action: 'game_tag_add',
                target: game._id.toString(),
                reference: t._id.toString()
            });

            return t.save();
        });
    }
}

const Game = mongoose.model('Game', GameSchema);

module.exports = Game;