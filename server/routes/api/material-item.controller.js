const jwt = require('jwt-simple');
const Busboy = require('busboy');
const contentDisposition = require('content-disposition');
const aws = require('aws-sdk');

const config  = require('../../config')();

const mongoose = require('mongoose');
const MaterialItem = require('../../models/material-item.model');
const HistoryModel = require('../../models/history.model');
const userController = require('./user.controller');

const auth = require('../../auth');

const util = require('../../util'),
        uploadUtil = require('./upload.util');

const whitelist = [
    'name', 'description', 'price', 'color', 'extension', 'tags', 'visible'
];

module.exports = {

    getAll: (req, res) => {
        MaterialItem.find({})
            .where("visible").equals(true)
            .exec()
            .then(ms => {
                res.json(ms);
            });
    },

    get: (req, res) => {

        let userId = req.user._id,
            materialId = req.params.id,
            superAdmin = req.user.superAdmin;

        if (materialId == 'all') {

            // special for super admins - show all items (even hidden ones)

            if (!superAdmin) {
                return auth.unauthorized(req, res);
            }

            MaterialItem.find({}).sort('name').exec()
                .then(m => {
                    res.json(m);
                }, error => {
                    util.handleError(req, res, error);
                });

        } else {

            let materialItem;

            MaterialItem.findOne({})
                .where("_id").equals(materialId)
                .where('visible').equals(true)
                .exec()
                .then(m => {
                    materialItem = m;
                    if (!materialItem) {
                        res.status(404).end();
                        return;
                    }
                    
                    return userController.doesUserOwn(req.user, materialItem._id.toString());
                }).then(access => {
                    
                    if (access && materialItem) {

                        var dateObj = new Date();
                        dateObj.setMinutes(dateObj.getMinutes() + 1); // you have one minute

                        let token = jwt.encode({
                            exp: dateObj.getTime(),
                            iss: materialItem.id
                        }, config.token);

                        HistoryModel.create({
                            user: req.user._id,
                            action: 'material_view',
                            target: materialItem._id
                        });

                        res.json({
                            url: '/download/material/' + token
                        });

                    } else {
                        // the user either doesn't have access, or the file doesn't exist
                        auth.unauthorized(req, res);
                    }

                }, error => {
                    util.handleError(req, res, error);
                });

        }

    },

    create: (req, res) => {
        MaterialItem.create({
            name: 'New Item',
            visible: false
        }).then(m => {
            util.smartUpdate(m, req.body, whitelist);
            return m.save();
        }).then(m => {
            res.json(m);
        })
    },

    delete: (req, res) => {
        let id = req.params.id;

        MaterialItem.find({}).where('_id').equals(id).remove()
            .then(() => {
                res.send('success');
            })
    },

    update: (req, res) => {
        let materialItem = req.body;

        MaterialItem.findOne({})
            .where("_id").equals(req.params.id)
            .exec()
            .then(m => {
                util.smartUpdate(m, materialItem, whitelist);
                return m.save();
            })
            .then(m => {
                res.json(m);
            }, error => {
                util.handleError(req, res, error);
            })
    },

    version: (req, res) => {
        if (req.method == 'POST') {

            uploadUtil.upload(req, res, config.s3_buckets.materials, MaterialItem);

        } else if (req.method == 'DELETE') {

            uploadUtil.delete(req, res, config.s3_buckets.materials, MaterialItem);

        }
    },

    download: (req, res, next) => {
        uploadUtil.download(req, res, config.s3_buckets.materials, MaterialItem);
    },

    backup: (req, res) => {
        return MaterialItem.find({})
            .exec()
            .then(i => {
                res.json(i);
            })
    }

}