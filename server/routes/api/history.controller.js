const mongoose = require('mongoose');
        
const   util = require('../../util'),
        auth = require('../../auth'),
        HistoryModel = require('../../models/history.model');

module.exports = {

    getAll: (req, res) => {
        if (!req.user.superAdmin) {
            return util.unauthorized(req, res);
        }

        return HistoryModel.find({})
            .populate('user')
            .sort('-date')
            .exec()
            .then(h => {
                res.json(h);
            })
    }

}