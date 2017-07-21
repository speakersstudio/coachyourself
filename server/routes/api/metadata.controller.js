const mongoose = require('mongoose');
        
const   util = require('../../util');

const GameMetadata = require('../../models/game-metadata.model');

module.exports = {

    create: (req, res) => {

        let data = req.body,
            userId = req.user._id;
        
        GameMetadata.create({
            name: data.name,
            description: data.description,
            type: data.type || 'duration',
            min: data.min,
            max: data.max,
            addedUser: userId
        }).then(d => {
            res.json(d);
        });

    },

    update: (req, res) => {

        let data = req.body,
            userId = req.user._id,
            durId = req.params.id || data._id;

        GameMetadata.findOne({})
            .where('_id').equals(durId)
            .exec()
            .then(dur => {
                dur.name = data.name;
                dur.description = data.description;
                dur.min = data.min;
                dur.max = data.max;
                dur.modifiedUser = userId;
                dur.dateModified = Date.now();
                return dur.save();
            })
            .then(dur => {
                res.json(dur);
            });

    },

    delete: (req, res) => {
        let data = req.body,
            userId = req.user._id,
            durId = req.params.id || data._id;

        GameMetadata.findOne({})
            .where('_id').equals(durId)
            .remove()
            .exec()
            .then(dur => {
                res.json({
                    status: "Success",
                    message: "Metadata deleted"
                });
            });
    },

    getAll: (req, res) => {

        GameMetadata.find({})
            // .where('type').equals('duration')
            .exec()
            .then(durs => {
                res.json(durs);
            });

    },

    get: (req, res) => {

        let id = req.params.id;
        if (id == 'duration' || id == 'playerCount') {

            GameMetadata.find({})
                .where('type').equals(id)
                .exec()
                .then(m => {
                    res.json(m);
                }, error => {
                    util.handleError(req, res, error);
                });

        } else {

            GameMetadata.findOne({})
                .where('_id').equals(req.params.id)
                .exec()
                .then(dur => {
                    res.json(dur);
                }, error => {
                    util.handleError(req, res, error);
                });

        }

    },

    backup: (req, res) => {
        GameMetadata.find({})
            .then(m => {
                res.json(m);
            });
    }

}