const mongoose = require('mongoose');

const auth = require('../../auth');

const Subscription = require('../../models/subscription.model');
const Package = require('../../models/package.model');

getSubs = (userId, populate) => {
    let pop = '';
    if (populate === 2){
        pop = {
            path: 'package',
            model: 'Package',
            populate: {
                path: 'materials.materialItem',
                model: 'MaterialItem',
                select: 'name description versions',
                match: { visible: true }
            }
        }
    } else if (populate) {
        pop = 'package';
    }

    return Subscription
        .find({})
        .where('user').equals(userId)
        .where('expires').gt(Date.now())
        .select('package expires dateAdded')
        .populate(pop)
        .exec();
}

module.exports = {

    getAll: (req, res) => {

        if (req.user._id) {
            getSubs(req.user._id, 2)
                .catch(err => {
                    res.status(500).json(err)
                })
                .then(subs => {
                    res.json(subs);
                });
        } else {
            res.json([]);
        }

    },

    get: (req, res) => {

        let slug = req.params.id,
            subscriptions;

        getSubs(req.user.id, false)
            .then(subs => {
                subscriptions = subs;
                let subbedIds = [];
                subs.forEach(sub => {
                    subbedIds.push(sub.package);
                });

                return Package.findOne({})
                    .where('slug').equals(slug)
                    .where('_id').in(subbedIds)
                    .populate('materials.materialItem')
                    .exec();
            }, error => {
                util.handleError(req, res, error);
            }).then(package => {
                let selectedSub;
                subscriptions.forEach(sub => {
                    if (sub.package.toString().trim() == package.id.toString().trim()) {
                        selectedSub = sub;
                    }
                });
                if (selectedSub) {
                    selectedSub.package = package;
                    res.json(selectedSub);
                } else {
                    auth.unauthorized(req, res);
                }
            }, error => {
                util.handleError(req, res, error);
            });

    },

    getSubs: getSubs,

    backup: (req, res) => {
        Subscription.find({}).exec()
            .then(s => {
                res.json(s);
            })
    }

}