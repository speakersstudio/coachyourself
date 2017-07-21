const mongoose = require('mongoose');
const jwt = require('jwt-simple');
const aws = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const contentDisposition = require('content-disposition');

const config  = require('../../config')();
const auth = require('../../auth');

const MaterialItem = require('../../models/material-item.model');
const Package = require('../../models/package.model');
const Subscription = require('../../models/subscription.model');

const userController = require('./user.controller');

const util = require('../../util');

const whitelist = [
    'slug', 'name', 'description', 'color', 'price', 'visible'
];

module.exports = {

    getAll: (req, res) => {

        Package.find({})
            .where('visible').equals('true')
            // .populate('materials.materialItem')
            // .select('name description price dateModified dateAdded')
            .populate({
                path: 'materials packages',
                match: {visible: true}
            })
            .exec((err, packages) => {
                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                }

                res.json(packages);
            });

    },

    backup: (req, res) => {
        Package.find({}).exec()
            .then(p => {
                res.json(p);
            });
    },

    get: (req, res) => {

        let userId = req.user._id,
            packageId = req.params.id,
            superAdmin = req.user.superAdmin,
            access = false;

        if (packageId == 'all') {

            // special for super admins - show all items (even hidden ones)

            if (!superAdmin) {
                return auth.unauthorized(req, res);
            }

            Package.find({}).sort('name')
                .populate('packages materials')
                .exec()
                .then(p => {
                    res.json(p);
                }, error => {
                    util.handleError(req, res, error);
                });

        } else {

            let pkg;

            Package.findOne({})
                .where("_id").equals(packageId)
                .exec()
                .then(p => {
                    pkg = p;
                    if (!pkg) {
                        res.status(404).end();
                        return;
                    }
                    
                    return userController.doesUserOwn(req.user, null, packageId);
                }, error => {
                    util.handleError(req, res, error);
                }).then(access => {
                    
                    if (access && pkg) {

                        var dateObj = new Date();
                        dateObj.setMinutes(dateObj.getMinutes() + 1); // you have one minute

                        let token = jwt.encode({
                            exp: dateObj.getTime(),
                            iss: pkg.id
                        }, config.token);

                        res.json({
                            url: '/downloadPackage/' + token
                        });

                    } else {
                        // the user either doesn't have access, or the file doesn't exist
                        auth.unauthorized(req, res);
                    }

                });

        }

    },

    create: (req, res) => {
        Package.create({
            name: 'New Package',
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

        Package.find({}).where('_id').equals(id).remove()
            .then(() => {
                res.send('success');
            })
    },

    update: (req, res) => {
        let packageData = req.body;

        Package.findOne({})
            .where("_id").equals(req.params.id)
            .exec()
            .then(p => {
                util.smartUpdate(p, packageData, whitelist);
                return p.save();
            })
            .then(p => {
                res.json(p);
            }, error => {
                util.handleError(req, res, error);
            })
    },

    download: (req, res, next) => {
        const s3 = new aws.S3();
        const PDFMerge = require('pdf-merge');
        const tmp = require('tmp');

        let token = req.params.token,
            decoded = jwt.decode(token, config.token),
            id = decoded.iss;

        if (decoded.exp > Date.now()) {
            Package.findOne({})
                .where("_id").equals(id)
                .populate({
                    path: 'materials packages',
                    populate: {
                        path: 'materials'
                    }
                })
                .exec()
                .catch(err => {
                    res.status(500).json(err);
                })
                .then(pkg => {
                    // get all of the materials
                    let materialArray = pkg.materials;

                    pkg.packages.forEach(p => {
                        materialArray = util.unionArrays(materialArray, p.materials);
                    });

                    let filenames = [],
                        count = 0;

                    tmp.dir((err, directory, cleanup) => {

                        if (err) {
                            res.status(500).send({msg: "tmp dir creation", error: err});
                        } else {

                            materialArray.forEach(m => {
                                let name = path.join(directory, m.filename()),
                                    file = fs.createWriteStream(name);

                                let stream = s3.getObject({
                                    Bucket: config.s3_buckets.materials,
                                    Key: m.filename()
                                }).createReadStream().pipe(file);

                                filenames.push(name);

                                stream.on('finish', () => {
                                    count++;
                                    if (count >= materialArray.length) {

                                        let pdfMerge = new PDFMerge(filenames, config.pdftkPath);

                                        pdfMerge.asReadStream().merge((error, finishedStream) => {
                                            if (error) {
                                                res.status(500).json(error);
                                            } else {
                                                res.setHeader('Content-Disposition', contentDisposition(pkg.dlfilename()));
                                                
                                                finishedStream.pipe(res);

                                                finishedStream.on('finish', () => {
                                                    cleanup();
                                                });
                                            }
                                        });

                                    }
                                })
                            });

                        }

                    });
                });
        } else {
            auth.unauthorized(req,res);
        }
    },

    // update a package's packages
    packages: (req, res) => {
        if (!req.user.superAdmin) {
            return util.unauthorized(req, res);
        }

        let packageId = req.params.id,
            packages = req.body.packages;

        Package.findOne({})
            .where('_id').equals(packageId)
            .populate({
                path: 'materials packages',
                match: {visible: true}
            })
            .exec()
            .then(p => {
                p.packages = packages;
                return p.save();
            })
            .then(p => {
                res.json(p);
            })
    },

    // update a package's materials
    materials: (req, res) => {
        if (!req.user.superAdmin) {
            return util.unauthorized(req, res);
        }

        let packageId = req.params.id,
            materials = req.body.materials;

        Package.findOne({}).where('_id').equals(packageId).exec()
            .then(p => {
                p.materials = materials;
                return p.save();
            })
            .then(p => {
                res.json(p);
            })
    }


}