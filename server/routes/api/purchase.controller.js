const mongoose = require('mongoose');

const Purchase = require('../../models/purchase.model');

module.exports = {
    backup: (req, res) => {
        Purchase.find({}).exec().then(p => {
            res.json(p);
        })
    }
}