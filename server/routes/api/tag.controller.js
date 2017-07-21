const mongoose = require('mongoose');
        
const   util = require('../../util');

const Game = require('../../models/game.model');
const Name = require('../../models/name.model');
const Tag = require('../../models/tag.model'),
        HistoryModel = require('../../models/history.model');

module.exports = {

    create: (req, res) => {

        Tag.create({}).then(tag => {
            util.smartUpdate(tag, req.body, [
                'name', 'description'
            ]);

            tag.addedUser = req.user._id;
            tag.dateModified = Date.now();
            tag.modifiedUser = req.user._id;
            tag.dateModified = Date.now();

            return tag.save();
        }).then(tag => {
            res.json(tag);
        });

    },

    getAll: (req, res) => {
        Tag.find({})
            .exec()
            .then(tags => {
                res.json(tags);
            })
    },

    get: (req, res) => {
        Tag.findOne({})
            .where('_id').equals(req.params.id)
            .exec()
            .then(tag => {
                res.json(tag);
            }, error => {
                util.handleError(req, res, error);
            });
    },

    update: (req, res) => {
        let data = req.body,
            tagId = req.params.id || req.body._id,
            userId = req.user._id;

        Tag.findOne({}).where('_id').equals(tagId).exec()
            .then(tag => {
                let oldTag = tag.toObject();

                util.smartUpdate(tag, data, [
                    'name', 'description'
                ]);

                tag.modifiedUser = userId;
                tag.dateModified = Date.now();

                let changes = util.findChanges(oldTag, tag);
                HistoryModel.create({
                    user: req.user._id,
                    action: 'tag_update',
                    target: tag._id,
                    changes: changes
                });

                return tag.save();
            }, error => {
                util.handleError(req, res, error);
            })
            .then(tag => {
                res.json(tag);
            });
    },

    delete: (req, res) => {
        let tagId = req.params.id;
        Tag.find({})
            .where('_id').equals(tagId)
            .exec()
            .then(tag => {
                
                HistoryModel.create({
                    user: req.user._id,
                    action: 'tag_delete',
                    target: tag.name
                });

                return util.iterate(tag.games, gameId => {
                    return Game.findOne({}).where('_id').equals(gameId).exec().then(game => {
                        util.removeFromObjectIdArray(game.tags, tag);
                        return game.save();
                    });
                });
            })
            .then(() => {
                return Tag.find({}).where('_id').equals(tagId).remove();
            })
            .then(() => {
                res.send('Success');
            });
    },

    backup: (req, res) => {
        Tag.find({}).exec().then(t => {
            res.json(t);
        });
    }

}