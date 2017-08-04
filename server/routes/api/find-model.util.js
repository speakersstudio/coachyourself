const   mongoose = require('mongoose'),
        bcrypt = require('bcrypt'),
        Promise = require('bluebird'),

        User = require('../../models/user.model');

module.exports = {

    USER_WHITELIST: [
        'email',
        'firstName',
        'lastName',
        'title',
        'company',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'improvExp',
        'facilitationExp',
        'trainingInterest',
        'url',
        'description',
        'birthday'
    ],

    findUser: (key, select, populate) => {
        if (!key) {
            return Promise.reject('no id or email');
        }

        let query = User.findOne({})
            .select(module.exports.USER_WHITELIST.join(' ') + 
            ' subscription preferences role dateAdded dateModified superAdmin locked dateLoggedIn ' + select);

        // catch a mongoose ObjectID, which looks like a string but isn't really
        if (typeof(key) == 'object' && key.toString) {
            key = key.toString();
        }

        if (key.indexOf && key.indexOf('@') > -1) {
            query.where('email').equals(key);
        } else {
            query.where('_id').equals(key);
        }

        query.populate('preferences')
            .populate({
                path: 'subscription',
                select: '-stripeCustomerId'
            })

        if (populate) {
            query.populate(populate);
        }

        return query.exec()
            .catch(error => {
                return Promise.resolve(null);
            })
            // .then(user => {
            //     if (user && !raw) {
            //         user = module.exports.prepUserObject(user);
            //     }

            //     return Promise.resolve(user);
            // });
    }
        
}