const mongoose = require('mongoose'),
    Promise = require('bluebird');

mongoose.Promise = Promise;

let config = require('../config')();

let util = require('../util'),
    emailUtil = require('../email'),
    findModelUtil = require('./api/find-model.util');

let userController = require('./api/user.controller'),
    teamController = require('./api/team.controller'),
    auth = require('../auth'),
    roles = require('../roles');

let User = require('../models/user.model'),
    Team = require('../models/team.model'),
    Package = require('../models/package.model'),
    Purchase = require('../models/purchase.model'),
    Subscription = require('../models/subscription.model'),
    Invite = require('../models/invite.model'),
    HistoryModel = require('../models/history.model');


module.exports = {

    signup: (req, res) => {

        let stripe = require('stripe')(config.stripe.secret),

            email = req.body.email,
            password = req.body.password,
            userName = req.body.name,
            
            tokenVal = req.body.stripeToken,

            role = roles.ROLE_USER, // the user role defaults to USER - fancy that
            userId,
            token,
            stripeCustomerId,
            error,

            mainPackage;

        // make sure stripe token is the actual string
        if (typeof tokenVal == 'object' && tokenVal.id) {
            token = tokenVal.id;
        }

        if (!email) {
            error = 'email';
        } else if (!password) {
            error = 'password';
        } else if (!token) {
            error = 'token';
        }

        if (error) {
            res.status(500).json({error: 'No ' + error});
            return;
        }

        // step 1: verify that the email address is available for a user account
        User.findOne({}).where('email').equals(email).exec()
            .then(user => {
                if (user) {
                    return Promise.reject('email already exists');
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                return Package.findOne({})
                    .where('visible').equals(true)
                    .where('slug').equals('main')
                    .exec();
            })
            .then(package => {

                mainPackage = package;
                let price = package.price;

                // TODO: charge the token here
                // return userController.createPledgeSubscription(pledge, token);

                return stripe.charges.create({
                    amount: price * 100,
                    currency: "usd",
                    source: token,
                    description: "Coach Yourself for " + email
                });

            })
            .then(stripeCustomer => {

                // figure out the user's name
                let firstName, lastName;
                if (userName) {
                    firstName = userName.substr(0, (userName+' ').indexOf(' ')).trim();
                    lastName = userName.substr((userName+' ').indexOf(' '), userName.length).trim();
                }

                // create a new user
                let userData = {
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName
                };
                return userController.createUser(userData);

            })
            .then(user => {
                // all purchases are for the one main package
                let purchase = {
                    total: mainPackage.price,
                    packages: [{package: mainPackage._id, price: mainPackage.price}],
                    user: user._id
                };

                return Purchase.create(purchase)
                    .then(purchaseModel => {
                        user.purchases.push(purchaseModel);
                        return user.save();
                    });
            })
            .then(user => {
                // save the subscription data to the user
                return user.addSubscription(role, stripeCustomerId);
            })
            .then(user => {

                // send the confirmation / welcome email!

                let body = `
                    <p>Thank you for signing up for The Speaker's Studio!</p>
                    <p>Your subscription is now active. You can log into the app and browse all of our fabulous features.</p>
                `;

                emailUtil.send({
                    to: user.email,
                    toName: user.firstName + ' ' + user.lastName,
                    subject: 'Welcome to the Speaker\'s Studio',
                    content: {
                        type: 'text',
                        baseUrl: 'https://' + req.headers.host,
                        greeting: 'Welcome to The Speaker\'s Studio!',
                        body: body,
                        action: 'https://' + req.headers.host + '/app',
                        actionText: 'Log In Now',
                        afterAction: `
                            <p>If you have any questions about how to use the app, do not hesitate to reach out to me. You can use the "Request a feature" or "Report a Bug" options in the App Menu to send your feedback, or you can respond directly to this email.</p>

                            <p>Be excellent to each other, and party on.</p>

                            <p>Sincerely,</p>

                            <p>Shauvon McGill, creator.</p>
                        `
                    }
                }, (error, response) => {

                    res.json(userController.prepUserObject(user));

                })
            })
            .catch(error => {
                console.error('signup error!', error);
                res.status(500).json({error: error});
            })
    }

}