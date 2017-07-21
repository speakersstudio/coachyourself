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
    roles = require('../roles'),
    PackageConfig = require('../models/packageconfig.model');

let User = require('../models/user.model'),
    Team = require('../models/team.model'),
    Purchase = require('../models/purchase.model'),
    Subscription = require('../models/subscription.model'),
    Package = require('../models/package.model'),
    HistoryModel = require('../models/history.model');


module.exports = {

    buyTeamSubscriptions: (user, teamId, count, stripeToken) => {
        let stripe = require('stripe')(config.stripe.secret),
            token,
            packageConfig;

        if (typeof stripeToken == 'object' && stripeToken.id) {
            token = stripeToken.id;
        }

        // get the package config data
        return PackageConfig.find({}).exec()
            .then(c => {
                packageConfig = c[0];

                return findModelUtil.findTeam(teamId);
            })
            .then(team => {
                // figure out how much this will cost
                let thisTeamRole = team.subscription.role,
                    roleType = roles.getRoleType(thisTeamRole),
                    subPrice = roleType == roles.ROLE_FACILITATOR ? packageConfig.fac_sub_price : packageConfig.improv_sub_price,
                    totalPrice = subPrice * count;
                
                return stripe.charges.create({
                    amount: totalPrice,
                    currency: "usd",
                    source: token,
                    description: 'Adding ' + count + ' subscriptions to team ' + team.name,
                    metadata: {'team': team._id.toString(), 'user': user._id}
                });
            })
            .then(charge => {
                HistoryModel.create({
                    action: 'team_subscription_add',
                    user: user._id,
                    target: teamId,
                    reference: charge.id
                });

                return Subscription.findOne({}).where('team').equals(teamId).exec();
            })
            .then(subscription => {
                subscription.subscriptions += count;

                return subscription.save();
            });
    },

    signup: (req, res) => {

        let stripe = require('stripe')(config.stripe.secret),
            
            tokenVal = req.body.stripeToken,
            purchase = req.body.purchase,
            email = req.body.email,
            password = req.body.password,
            userName = req.body.userName,
            teamName = req.body.teamName,
            userId,

            /**
             * Payload: {
             *  stripeToken: Stripe token (either string or object with id property)
             *  cart: Purchase[]
             *  email: string (new user's email)
             *  password: string (new user's password)
             *  teamName: string (name of the team, optional)
             * }
             */

            token,
            stripeCustomerId,
            error,

            packageConfig;

        // make sure stripe token is the actual string
        if (typeof tokenVal == 'object' && tokenVal.id) {
            token = tokenVal.id;
        }

        if (!purchase.packages) {
            purchase.packages = [];
        }
        if (!purchase.materials) {
            purchase.materials = [];
        }
        if (!purchase.other) {
            purchase.other = [];
        }

        if (!email) {
            error = 'email';
        } else if (!password) {
            error = 'password';
        } else if (!token) {
            error = 'token';
        } else if (!purchase) {
            error = 'purchase';
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
                }
            })
            .then(() => {
                // get the package config data
                return PackageConfig.find({}).exec();
            })
            .then(c => {
                packageConfig = c[0];

                // step 2: charge the credit card
                // first create a stripe customer ID
                return stripe.customers.create({
                    email: email,
                    source: token
                });
            })
            .then(stripeCustomer => {
                // remember the customerId for later
                stripeCustomerId = stripeCustomer.id;

                let total = 0,
                    desc = "Signup - ",
                    packageIds = [],
                    packagePromise;

                purchase.packages.forEach(p => {
                    if (p.package._id !== 'sub') {
                        packageIds.push(p.package._id);
                    }
                });
                // let's face it, a signup won't have material items

                // fetch all of the selected packages, so we can get their prices and whatnot
                if (packageIds.length) {
                    packagePromise = Package.find({}).where('_id').in(packageIds).exec()
                } else {
                    packagePromise = Promise.resolve(null);
                }
                
                return packagePromise
                    .then(packages => {

                        let isSubFree = false;

                        purchase.packages = []
                        if (packages) {
                            packages.forEach(p => {
                                let price = p.price;
                                if (teamName) {
                                    // team packages are more expensive than for individuals
                                    price += packageConfig.fac_team_package_markup;
                                }
                                total += price;
                                desc += p.name;

                                purchase.packages.push({
                                    package: p,
                                    price: price
                                });
                            });

                            // if they chose a package, we will throw in a subscription
                            purchase.other.push({
                                key: 'subscription',
                                params: {
                                    role: teamName ? roles.ROLE_FACILITATOR_TEAM : roles.ROLE_FACILITATOR
                                }
                            });
                            isSubFree = true;
                        }

                        // filter out unknown or dangerous "other" items
                        let newOthers = [],
                            subscriptionOther;

                        purchase.other.forEach(other => {
                            if (other.key == 'subscription') {
                                switch(other.params.role) {
                                    case roles.ROLE_FACILITATOR:
                                        other.price = packageConfig.fac_sub_price;
                                        other.description = 'Individual Facilitator Subscription';
                                        break;
                                    case roles.ROLE_FACILITATOR_TEAM:
                                        other.price = packageConfig.fac_team_sub_price;
                                        other.description = 'Facilitator Team Subscription';
                                        other.params.subscriptions = packageConfig.fac_team_sub_count;
                                        break;
                                    case roles.ROLE_IMPROVISER:
                                        other.price = packageConfig.improv_sub_price;
                                        other.description = 'Individual Improviser Subscription';
                                        break;
                                    case roles.ROLE_IMPROVISER_TEAM:
                                        other.price = packageConfig.improv_team_sub_price;
                                        other.description = 'Improv Team Subscription';
                                        other.params.subscriptions = packageConfig.improv_team_sub_count;
                                        break;
                                    default:
                                        error = 'unknown role ID';
                                        break;
                                }

                                if (isSubFree) {
                                    other.price = 0;
                                    other.description += ' (included with purchase)';
                                }

                                // we will only accept one subscription, so we'll just take the last just in case multiple subscriptions were passed on the route somehow
                                subscriptionOther = other;
                            } else {
                                newOthers.push(other);
                            }
                        });

                        // add the subscription now, so we only add it once
                        if (subscriptionOther) {
                            newOthers.push(subscriptionOther);
                            if (!isSubFree) {
                                total += subscriptionOther.price;
                                desc += ' ' + subscriptionOther.description;
                            }
                        }

                        // store this cleaned up array to use moving forward
                        purchase.other = newOthers;

                        if (total == 0 || res.headersSent || error) {
                            return Promise.reject(error || 'nothing purchased');
                        }

                        // calculate the total here, because we don't want to trust what the client has sent us
                        purchase.total = total;

                        return stripe.charges.create({
                            amount: purchase.total * 100, // stripe expects the price in cents
                            currency: "usd",
                            description: desc,
                            customer: stripeCustomerId
                        });

                    }); // end of package fetch
            })
            .then(charge => {
                // I don't think we need to keep track of the charge object, because that will be stored on Stripe already

                // step 3: are we creating a team or just a user?
                if (teamName) {
                    // step 4: create a new team
                    return teamController.createTeam(teamName);
                } else {
                    return Promise.resolve(false);
                }
            })
            .then(team => {
                let firstName = '',
                    lastName = '';
                if (userName) {
                    firstName = userName.substr(0, (userName+' ').indexOf(' ')).trim();
                    lastName = userName.substr((userName+' ').indexOf(' '), userName.length).trim();
                }

                // step 5: create a new user
                let userData = {
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName
                };
                return userController.createUser(userData)
                    .then(user => {
                        userId = user._id;
                        if (team) {
                            user.adminOfTeams = util.addToObjectIdArray(user.adminOfTeams, team);
                            return user.save();
                        } else {
                            return Promise.resolve(user);
                        }
                    })
                    .then(user => {
                        if (team) {
                            team.addedUser = user._id;
                            team.admins = util.addToObjectIdArray(team.admins, user);
                            return team.save();
                        } else {
                            return Promise.resolve(user);
                        }
                    });
            })
            .then(owner => {
                // owner will be a team (if we created one) or a user

                // step 6: create the purchase model (and the subscription)
                return module.exports.createPurchase(owner, purchase, stripeCustomerId, userId);
            })
            .then(owner => {
                // step 7: if we created a team, give the new user a child subscription
                if (!owner.isThisAUser) {
                    let team = owner,
                        teamSubscriptionId = util.getObjectIdAsString(team.subscription),
                        userId = util.getObjectIdAsString(team.admins[0]);

                    return Subscription.findOne({}).where('_id').equals(teamSubscriptionId).exec()
                        .then(sub => {
                            return sub.createChildSubscription(userId);
                        })
                        .then(sub => {
                            return findModelUtil.findUser(userController.prepUserObject(userId));
                        });
                } else {
                    return Promise.resolve(owner);
                }
            })
            .then(user => {

                // send the confirmation / welcome email!

                let body = `
                    <p>Congratulations on making your first step to a more awesome you!</p>
                    <p>Your subscription is now active. You can log into the ImprovPlus app and browse all of our fabulous features. </p>

                    <p>Please enjoy the following summary of your purchase:</p>

                    <table cellpadding="0" cellspacing="0">
                        <tr>
                            <th align="left">Item</th><th align="right">Price</th>
                        </tr>
                `;

                let hasMaterials = false, freeSub = false;
                
                purchase.packages.forEach(p => {
                    body += `
                        <tr>
                            <td>${p.package.name}</td><td align="right">$${p.price}</td>
                        </tr>
                    `
                    hasMaterials = true;
                    freeSub = true;
                });
                
                purchase.materials.forEach(m => {
                    body += `
                        <tr>
                            <td>${m.materialItem.name}</td><td align="right">$${m.price}</td>
                        </tr>
                    `
                    hasMaterials = true;
                });
                
                purchase.other.forEach(o => {
                    if (o.key == 'subscription') {
                        body += `
                            <tr>
                                <td>${o.description}</td><td align="right">$${o.price}</td>
                            </tr>
                            `;
                    }
                });

                body += `
                        <tr>
                            <th align="right">Total: </th><th align="right">$${purchase.total}</th>
                        </tr>
                    </table>
                `
                
                if (hasMaterials && !teamName) {
                    body += `
                        <p>Visit the Materials Library to download your new Materials - they're officially yours to keep!</p>
                    `
                }

                if (teamName) {
                    body += `
                        <p>Your team, ${teamName}, is ready to go, and you can share your additional subscriptions with members of your Team through the app. See your Team details by visiting the "Your Team" link in the app menu.</p>
                    `;

                    if (hasMaterials) {
                        body += `
                            <p>Visit the Materials Library to download your new Materials - they belong to your team now (and forever)!</p>
                        `
                    }
                }

                emailUtil.send({
                    to: user.email,
                    toName: user.firstName + ' ' + user.lastName,
                    subject: 'Welcome to ImprovPlus',
                    content: {
                        type: 'text',
                        baseUrl: 'https://' + req.headers.host,
                        greeting: 'Welcome to ImprovPlus!',
                        body: body,
                        action: 'https://' + req.headers.host + '/app',
                        actionText: 'Log In Now',
                        afterAction: `
                            <p>If you have any questions about how to use the ImprovPlus app, do not hesitate to reach out to us. You can use the "Request a feature" or "Report a Bug" options in the App Menu to send your feedback directly to us, or you can respond directly to this email.</p>

                            <p>Be excellent to each other, and party on.</p>

                            <p>Sincerely,</p>

                            <p>The Proprietors of <span class="light">improv</span><strong>plus</strong>.</p>
                        `
                    }
                }, (error, response) => {

                    res.json(user);

                })
            })
            .catch(error => {
                console.error('signup error!', error);
                res.status(500).json({error: error});
            })
    },

    createPurchase: (owner, purchase, stripeCustomerId, userId) => {

        let data = {
                total: purchase.total,
                materials: purchase.materials, // these should just be the ids
                packages: purchase.packages,
                other: purchase.other
            };

        if (owner.isThisAUser) {
            data.user = owner._id;
        } else {
            data.team = owner._id;
            data.user = userId;
        }

        return Purchase.create(data)
            .then(purchaseModel => {
                owner.purchases.push(purchaseModel);

                let subRole, subCount;

                data.other.forEach(other => {
                    if (other.key == 'subscription') {
                        subRole = other.params.role;
                        subCount = other.params.subscriptions;
                    }
                });

                if (subRole && owner.isThisAUser) {
                    return owner.addSubscription(subRole, stripeCustomerId);
                } else if (subRole) {
                    return owner.addSubscription(subRole, stripeCustomerId, subCount);
                } else {
                    return owner.save();
                }
            });
        
    }

    

}