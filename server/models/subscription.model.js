const mongoose = require('mongoose'),
    Promise = require('bluebird'),

    util = require('../util'),

    Team = require('./team.model');
    User = require('./user.model');
    Invite = require('./invite.model');

// track a user's account status in the app
const SubscriptionSchema = new mongoose.Schema({
    start: { type: Date, default: Date.now },
    expiration: Date,
    role: Number,
    stripeCustomerId: String,

    type: String, // either 'facilitator' or 'improviser'

    // for team subscriptions
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    subscriptions: Number, // the number of users purchased
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }], // users that have inherited from this

    // invites to users with their own subscriptions
    invites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Invite' }],
    // invites to new users, this + children should be <= subscriptions
    subscriptionInvites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Invite'}],

    // for user subscriptions
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // for users when they inherit from a team subscription
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }
});

SubscriptionSchema.methods.createChildSubscription = function(user) {
    if (this.children.length >= this.subscriptions) {
        // they aren't allowed to sign up another person!
        return Promise.resolve(false);
    }
    return Subscription.create({
        user: user,
        parent: this,
        role: this.role,
        expiration: this.expiration
    }).then(sub => {
        this.children.push(sub);

        // add sub to user
        if (user._id && user.save) {
            user.subscription = sub;
            return user.save();
        } else {
            let userId = util.getObjectIdAsString(user);
            return User.findOne({}).where('_id').equals(userId).exec()
                .then(u => {
                    u.subscription = sub;
                    return u.save();
                });
        }
    }).then(() => {
        return this.save();
    })
}

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;