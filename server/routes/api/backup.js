const mongoose = require('mongoose'),
    Promise = require('bluebird'),
    bcrypt = require('bcrypt'),
    fs = require('fs'),
    path = require('path');
    aws = require('aws-sdk');

var config = require('../../config')();

const charge = require('../charge'),
    roles = require('../../roles'),
    util = require('../../util');

let databases = {
    'MaterialItem': require('../../models/material-item.model'),
    'Preference': require('../../models/preference.model'),
    'Purchase': require('../../models/purchase.model'),
    'Subscription': require('../../models/subscription.model'),
    'User': require('../../models/user.model'),
    'History': require('../../models/history.model')
};

module.exports = {
    
    backupAll: function(req, res) {
        const s3 = new aws.S3();

        let keys = Object.keys(databases),
            timestamp = Date.now();

        return util.iterate(keys, (key) => {
            let model = databases[key];

            return model.find({}).exec()
                .then(data => {
                    s3.upload({
                        Bucket: config.s3_buckets.backups,
                        Key: key + '_' + timestamp + '.json',
                        Body: JSON.stringify(data)
                    }, function() {
                        console.log('backup of ' + key + ' complete');
                    });
                });
        }).then(() => {
            res.json({done: 'very yes', timestamp: timestamp});
        });

    }

}