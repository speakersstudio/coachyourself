const aws = require('aws-sdk');
const Busboy = require('busboy');
const jwt = require('jwt-simple');
const contentDisposition = require('content-disposition');
const util = require('../../util');

const config  = require('../../config')();

module.exports = {
    upload: (req, res, bucket, Model) => {
        const s3 = new aws.S3();

        let busboy = new Busboy({ headers: req.headers }),
            fileData,
            ver,
            description,
            destinationFileName,
            fileExtension,
            _id = req.params.id,

            fileIsUploaded,
            finalFileName,

            updatedItem,

            finishFile = () => {
                s3.copyObject({
                    Bucket: bucket,
                    CopySource: encodeURI(bucket + '/' + destinationFileName),
                    Key: finalFileName
                }, (err, data) => {
                    if (err) {
                        console.error('AWS Error on copy', err);
                    } else {
                        s3.deleteObject({
                            Bucket: bucket,
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
            destinationFileName = _id + fileExtension;

            let params = {
                Bucket: bucket,
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

            Model.findOne({}).where('_id').equals(_id).exec()
                .then(item => {

                    // if no version was specified, automatically pick the next number
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

    },

    delete: (req, res, bucket, Model) => {
        const s3 = new aws.S3();

        let _id = req.params.id,
            versionId = req.params.toId;

        Model.findOne({}).where('_id').equals(_id).exec()
            .then(item => {
                let version = item.versions[util.indexOfObjectId(item.versions, versionId)];

                let filename = version._id.toString() + '.' + version.extension;

                s3.deleteObject({
                    Bucket: bucket,
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
    },

    download: (req, res, bucket, Model) => {
        const s3 = new aws.S3();

        let token = req.params.token,
            decoded = jwt.decode(token, config.token),
            id = decoded.iss;

        console.log('expired?', decoded.exp - Date.now());

        if (decoded.exp > Date.now()) {
            Model.findOne({})
                .where("_id").equals(id)
                .exec()
                .catch(err => {
                    res.status(500).json(err);
                })
                .then(m => {
                    // the user has access to the file!

                    let filename = m.dlfilename(),
                        params = {
                            Bucket: bucket,
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
    }

}