const jwt = require('jwt-simple');
const contentDisposition = require('content-disposition');
const aws = require('aws-sdk');

const config  = require('../../config')();

const mongoose = require('mongoose');
const Lesson = require('../../models/lesson.model');
const HistoryModel = require('../../models/history.model');
const userController = require('./user.controller');

const auth = require('../../auth');

const util = require('../../util'),
        uploadUtil = require('./upload.util');

const whitelist = [
    'name', 'description', 'extension', 'visible', 'showOnDashboard'
];

module.exports = {

    getAll: (req, res) => {
        Lesson.find({})
            .where("visible").equals(true)
            .exec()
            .then(ls => {
                res.json(ls);
            });
    },

    get: (req, res) => {

        let userId = req.user._id,
            lessonId = req.params.id,
            superAdmin = req.user.superAdmin;

        if (lessonId == 'all') {
            // api/lesson/all will get all of the things (for super admins)

            if (!superAdmin) {
                return auth.unauthorized(req, res);
            }

            Lesson.find({}).sort('name').exec()
                .then(l => {
                    res.json(l);
                }, error => {
                    util.handleError(req, res, error);
                });
        } else if (lessonId == 'dashboard') {

            // show the dashboard lessons
            Lesson.find({}).sort('name')
                .where('visible').equals(true)
                .where('showOnDashboard').equals(true)
                .exec()
                .then(l => {
                    res.json(l);
                }, error => {
                    util.handleError(req, res, error);
                })

        } else {

            let lesson;

            Lesson.findOne({})
                .where('_id').equals(lessonId)
                .where('visible').equals(true)
                .exec()
                .then(l => {
                    lesson = l;
                    if (!lesson) {
                        util.notfound(req, res);
                        return;

                    } else {

                        var dateObj = new Date();
                        dateObj.setMinutes(dateObj.getMinutes() + 1); // you have sixty minutes (just to make sure a user can stream the file)

                        let token = jwt.encode({
                            exp: dateObj.getTime(),
                            iss: lesson._id.toString()
                        }, config.token);

                        HistoryModel.create({
                            user: req.user._id,
                            action: 'lesson_view',
                            target: lesson._id
                        });

                        res.json({
                            url: '/download/lesson/' + token
                        });

                    }

                }, error => {
                    util.handleError(req, res, error);
                })

        }

    },

    create: (req, res) => {
        Lesson.create({
            name: 'New Lesson',
            visible: false
        }).then(l => {
            util.smartUpdate(l, req.body, whitelist);
            return l.save();
        }).then(l => {
            res.json(l);
        })
    },

    delete: (req, res) => {
        let id = req.params.id;

        Lesson.find({}).where('_id').equals(id).remove()
            .then(() => {
                res.send('success');
            })
    },

    update: (req, res) => {
        let lesson = req.body;

        Lesson.findOne({})
            .where("_id").equals(req.params.id)
            .exec()
            .then(l => {
                util.smartUpdate(l, lesson, whitelist);
                return l.save();
            })
            .then(l => {
                res.json(l);
            }, error => {
                util.handleError(req, res, error);
            })
    },

    version: (req, res) => {
        if (req.method == 'POST') {

            uploadUtil.upload(req, res, config.s3_buckets.lessons, Lesson);

        } else if (req.method == 'DELETE') {

            uploadUtil.delete(req, res, config.s3_buckets.lessons, Lesson);

        }
    },

    download: (req, res, next) => {
        uploadUtil.download(req, res, config.s3_buckets.lessons, Lesson);
    }

}