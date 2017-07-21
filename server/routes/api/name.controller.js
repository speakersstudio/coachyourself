const mongoose = require('mongoose');
        
const   util = require('../../util');

const Game = require('../../models/game.model');
const Name = require('../../models/name.model'),
        HistoryModel = require('../../models/history.model');

module.exports = {

    create: (req, res) => {

        let gameId = req.body.game,
            userId = req.user._id;

        Game.findOne({})
            .where('_id').equals(gameId)
            .populate('names')
            .exec()
            .catch(err => {
                util.catchError(req, res, err);
            })
            .then(game => {
                return game.addName(req.body.name, userId);
            })
            .then(game => {
                let name = {};
                game.names.some(n => {
                    if (n.name && n.name == req.body.name) {
                        name = n;
                        return true;
                    }
                });

                HistoryModel.create({
                    user: userId,
                    action: 'name_create',
                    target: name._id,
                    reference: game._id
                });

                res.json(name);
            })

    },

    getAll: (req, res) => {
        Name.find({})
            .where('dateDeleted').equals(null)
            .populate('votes')
            // .sort('-weight -dateAdded')
            .exec()
            .then(names => {
                res.json(names);
            });
    },

    get: (req, res) => {
        Name.findOne({})
            .where('_id').equals(req.params.id)
            .exec()
            .then(name => {
                res.json(name);
            }, error => {
                util.handleError(req, res, error);
            });
    },

    update: (req, res) => {
        let data = req.body,
            nameID = req.params.id || req.body._id,
            userId = req.user._id,
            oldName;

        Name.findOne({}).where('_id').equals(nameID).exec()
            .then(name => {
                oldName = name.toObject();

                name.name = data.name;
                name.modifiedUser = userId;
                name.dateModified = Date.now();

                return name.save();
            }, error => {
                util.handleError(req, res, error);
            })
            .then(name => {
                let changes = util.findChanges(oldName, name);
                HistoryModel.create({
                    user: req.user._id,
                    action: 'name_edit',
                    changes: changes,
                    target: name._id
                });

                res.json(name);
            }, error => {
                util.handleError(req, res, error);
            });
    },

    backup: (req, res) => {
        Name.find({}).then(n => {
            res.json(n);
        });
    }

    // delete: (req, res) => {
    //     // TODO
    // },

    // vote: (req, res) => {
    //     // TODO
    // }

}