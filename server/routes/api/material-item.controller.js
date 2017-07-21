const fs = require('fs');
const path = require('path');
const mime = require('mime');
const jwt = require('jwt-simple');
const Busboy = require('busboy');
const contentDisposition = require('content-disposition');
const aws = require('aws-sdk');

const config  = require('../../config')();

const mongoose = require('mongoose');
const MaterialItem = require('../../models/material-item.model');
const Package = require('../../models/package.model');
const Subscription = require('../../models/subscription.model');
const Team = require('../../models/team.model');
const HistoryModel = require('../../models/history.model');
const userController = require('./user.controller');

const subCtrl = require('./subscription.controller');
const auth = require('../../auth');

const util = require('../../util');

const materialFolderName = '../../../materials';

const whitelist = [
    'name', 'description', 'price', 'color', 'fileslug', 'extension', 'tags', 'visible'
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
            superAdmin = req.user.superAdmin,
            access = false;

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
                            url: '/download/' + token
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
        const s3 = new aws.S3();

        if (req.method == 'POST') {

            let busboy = new Busboy({ headers: req.headers }),
                fileData,
                ver,
                description,
                destinationFileName,
                fileExtension,
                materialId = req.params.id,

                fileIsUploaded,
                finalFileName,

                updatedItem,

                finishFile = () => {
                    s3.copyObject({
                        Bucket: config.s3_buckets.materials,
                        CopySource: encodeURI(config.s3_buckets.materials + '/' + destinationFileName),
                        Key: finalFileName
                    }, (err, data) => {
                        if (err) {
                            console.error('AWS Error on copy', err);
                        } else {
                            s3.deleteObject({
                                Bucket: config.s3_buckets.materials,
                                Key: destinationFileName
                            }, (err, data) => {
                                if (err) {
                                    console.error('AWS Error on delete', err);

                                    res.status(500).json(err);
                                    return;
                                } else {
                                    console.log('New version file ready!');

                                    res.json(updatedItem);
                                }
                            })
                        }
                    })
                };

            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                fileExtension = filename.substr(filename.lastIndexOf('.'), filename.length);
                // tempLocation = path.join(__dirname, materialFolderName, materialId + fileExtension);
                // tempLocation = filename;
                destinationFileName = materialId + fileExtension;

                // file.pipe(fs.createWriteStream(tempLocation));
                let params = {
                    Bucket: config.s3_buckets.materials,
                    Key: destinationFileName,
                    Body: file
                };
                s3.upload(params, function(err, data) {
                    if (err) {
                        console.error('AWS Error on upload', err);
                    } else {
                        fileIsUploaded = true;
                        if (finalFileName) {
                            finishFile();
                        }
                    }
                })
            });
            busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
                if (fieldname == 'ver' && val != 'undefined') {
                    ver = val;
                } else if (fieldname == 'description' && val != 'undefined') {
                    description = val;
                }
            });
            busboy.on('finish', () => {

                MaterialItem.findOne({}).where('_id').equals(materialId).exec()
                    .then(item => {

                        if (!ver || ver == 'undefined') {
                            ver = 0;
                            item.versions.forEach(v => {
                                if (v.ver >= ver) {
                                    ver = v.ver;
                                }
                            });
                            ver++;
                        }

                        item.versions.push({
                            ver: ver,
                            extension: fileExtension.replace('.', ''),
                            description: description
                        });

                        return item.save();
                    })
                    .then(item => {
                        updatedItem = item;
                        
                        let lastVersionId = item.versions[item.versions.length - 1]._id.toString();

                        finalFileName = lastVersionId + fileExtension;
                        if (fileIsUploaded) {
                            finishFile();
                        }

                    })

            });
            req.pipe(busboy);

        } else if (req.method == 'DELETE') {

            let materialId = req.params.id,
                versionId = req.params.toId;

            MaterialItem.findOne({}).where('_id').equals(materialId).exec()
                .then(item => {
                    let version = item.versions[util.indexOfObjectId(item.versions, versionId)];

                    let filename = materialId + '.' + version.ver + '.' + version.extension;

                    s3.deleteObject({
                        Bucket: config.s3_buckets.materials,
                        Key: filename
                    }, (err, data) => {
                        if (err) {
                            console.error('AWS Error on delete', err);
                        }
                    })

                    item.versions = util.removeFromObjectIdArray(item.versions, versionId);
                    return item.save();
                })
                .then(item => {
                    res.json(item);
                });

        }
    },

    download: (req, res, next) => {
        const s3 = new aws.S3();

        let token = req.params.token,
            decoded = jwt.decode(token, config.token),
            id = decoded.iss;

        if (decoded.exp > Date.now()) {
            MaterialItem.findOne({})
                .where("_id").equals(id)
                .exec()
                .catch(err => {
                    res.status(500).json(err);
                })
                .then(m => {
                    // the user has access to the file!

                    let filename = m.dlfilename(),
                        params = {
                            Bucket: config.s3_buckets.materials,
                            Key: m.filename()
                        },
                        exists, notExists;

                    s3.getObjectTagging(params, function(err, data) {
                        if (err) {
                            res.status(err.statusCode).send(err.message);
                        } else {
                            res.setHeader('Content-Disposition', contentDisposition(filename));

                            s3.getObject(params).createReadStream().pipe(res);
                        }
                    })

                });
        } else {
            auth.unauthorized(req,res);
        }
    },

    backup: (req, res) => {
        return MaterialItem.find({})
            .exec()
            .then(i => {
                res.json(i);
            })
    }

}