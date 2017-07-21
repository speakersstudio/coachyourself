const   mongoose = require('mongoose'),
        bcrypt = require('bcrypt'),
        Promise = require('bluebird'),

        auth = require('../../auth'),
        
        config = require('../../config')(),
        roles = require('../../roles'),
        util = require('../../util'),
        emailUtil = require('../../email'),
        findModelUtil = require('./find-model.util'),

        userController = require('./user.controller'),
        chargeController = require('../charge'),

        Subscription = require('../../models/subscription.model'),
        Team = require('../../models/team.model'),
        Invite = require('../../models/invite.model'),
        Purchase = require('../../models/purchase.model'),
        HistoryModel = require('../../models/history.model');

module.exports = {

    get: (req, res) => {
        let id = req.params.id;
        return findModelUtil.findTeam(id)
            .then(t => {
                res.json(t);
            });
    },

    update: (req, res) => {
        let id = req.params.id;

        if (util.indexOfObjectId(req.user.adminOfTeams, id) == -1) {
            auth.unauthorized(req, res);
            return;
        } else {

            let oldTeam;
            return Team.findOne({}).where('_id').equals(id).exec()
                .then(team => {
                    oldTeam = team.toObject();
                    team = util.smartUpdate(team, req.body, findModelUtil.TEAM_WHITELIST);
                    return team.save();
                })
                .then(team => {
                    let changes = util.findChanges(oldTeam, team);
                    HistoryModel.create({
                        user: req.user._id,
                        action: 'team_edit',
                        changes: changes
                    });

                    res.json(team);
                });

        }
    },

    createTeam: (name) => {
        return Team.create({
            name: name
        });
    },

    backup: (req, res) => {
        Team.find({}).exec().then(t => {
            res.json(t);
        });
    },

    validate: (req, res) => {
        let name = req.body.name,
            teamId = req.body.teamId;

        let promise = Team.findOne({}).where('name').equals(name);

        if (teamId) {
            promise.where('_id').ne(teamId);
        }
        
        return promise.exec()
            .then(t => {
                if (t) {
                    res.json({
                        conflict: 'name'
                    });
                } else {
                    res.json({});
                }
            });
    },

    materials: (req, res) => {
        // first, make sure the user is a member of this team
        if (!req.user.superAdmin) {
            if (util.indexOfObjectId(req.user.memberOfTeams, req.params.id) == -1 &&
                util.indexOfObjectId(req.user.adminOfTeams, req.params.id) == -1) {
                    auth.unauthorized(req, res);
                    return;
                }
        }

        let query = Team.findOne({}).where('_id').equals(req.params.id);

        return userController.collectMaterials(query, req, res);
    },

    purchases: (req, res) => {
        // only team admins can do this
        if (util.indexOfObjectId(req.user.adminOfTeams, req.params.id) == -1) {
            return auth.unauthorized(req, res);
        }

        return Purchase.find({})
            .where('team').equals(req.params.id)
            .populate('packages.package materials.material user')
            .exec()
            .then(p => {
                res.json(p);
            })
    },

    removeUser: (req, res) => {
        if (req.method != 'PUT') {
            return res.status(404);
        }

        let teamId = req.params.id,
            userId = req.params.toId;

        // user has to be an admin
        if (util.indexOfObjectId(req.user.adminOfTeams, teamId) == -1) {
            return util.unauthorized(req, res);
        }

        userController.removeUserFromTeam(userId, teamId, true).then(team => {
            // store a history of this having happened
            HistoryModel.create({
                user: req.user._id,
                action: 'team_user_remove',
                reference: userId
            });

            res.json(team);
        }, error => {
            if (error == 404) {
                util.notfound(req, res);
            } else {
                util.handleError(error);
            }
        });

    },

    promote: (req, res) => {
        if (req.method != 'PUT') {
            return res.status(404);
        }

        let teamId = req.params.id,
            userId = req.params.toId;

        // user has to be an admin
        if (util.indexOfObjectId(req.user.adminOfTeams, teamId) == -1) {
            return util.unauthorized(req, res);
        }

        return module.exports.switchTeamUserStatus(userId, teamId, true)
            .then(team => {
                HistoryModel.create({
                    user: req.user._id,
                    action: 'team_user_promote',
                    target: userId,
                    reference: teamId
                });
                res.json(team);
            });
    },

    demote: (req, res) => {
        if (req.method != 'PUT') {
            return res.status(404);
        }

        let teamId = req.params.id,
            userId = req.params.toId;

        // user has to be an admin
        if (util.indexOfObjectId(req.user.adminOfTeams, teamId) == -1) {
            return util.unauthorized(req, res);
        }

        return module.exports.switchTeamUserStatus(userId, teamId, false)
            .then(team => {
                HistoryModel.create({
                    user: req.user._id,
                    action: 'team_user_demote',
                    target: userId,
                    reference: teamId
                });
                res.json(team);
            });
    },

    switchTeamUserStatus: (userId, teamId, promote) => {
        return findModelUtil.findUser(userId)
            .then(user => {
                if (user) {
                    let addTo, removeFrom;
                    if (promote) {
                        addTo = 'adminOfTeams';
                        removeFrom = 'memberOfTeams';
                    } else {
                        addTo = 'memberOfTeams';
                        removeFrom = 'adminOfTeams';
                    }

                    user[removeFrom] = util.removeFromObjectIdArray(user[removeFrom], teamId);
                    user[addTo] = util.addToObjectIdArray(user[addTo], teamId);

                    return user.save();
                }
            })
            .then(() => {
                return findModelUtil.findTeam(teamId)
            })
            .then(team => {
                if (team) {
                    let addTo, removeFrom;
                    if (promote) {
                        addTo = 'admins';
                        removeFrom = 'members';
                    } else {
                        addTo = 'members';
                        removeFrom = 'admins';
                    }

                    team[removeFrom] = util.removeFromObjectIdArray(team[removeFrom], userId);
                    team[addTo] = util.addToObjectIdArray(team[addTo], userId);

                    return team.save();
                }
            })
            .then(team => {
                // make sure everything is populated properly
                return findModelUtil.findTeam(team._id.toString());
            })
    },

    invite: (req, res) => {

        let user = req.user,
            teamId = req.params.id,
            email = req.body.email;

        // first, see that the user requesting this is an admin of the team
        if (util.indexOfObjectId(user.adminOfTeams, teamId) > -1) {
            return Subscription.findOne({})
                .where('team').equals(teamId)
                .populate('team')
                .exec()
                .then(subscription => {

                    //  check to see if the user has already been invited
                    Invite.count()
                        .where('email').equals(email)
                        .where('team').equals(subscription.team._id)
                        .where('accepted').equals(false)
                        .where('dateDeleted').equals(null)
                        .exec()
                        .then(existingCount => {
                            if (existingCount && existingCount > 0) {
                                res.status(409).json({error: 'invite already exists'});
                                return;
                            }

                            // check if the email address entered is already a user
                            findModelUtil.findUser(email)
                                .then(addUser => {
                                    let needsSubscription = true;

                                    if (addUser) {
                                        // make sure they aren't already in this team
                                        if (util.indexOfObjectId(addUser.memberOfTeams, teamId) > -1 ||
                                                util.indexOfObjectId(addUser.adminOfTeams, teamId) > -1) {
                                            
                                            res.status(409).json({error: 'user already in team'});
                                            return;
                                        }

                                        // make sure they are the correct type of user
                                        if (addUser.subscription &&
                                                !addUser.superAdmin &&
                                                roles.getRoleType(subscription.role) != roles.ROLE_NOBODY &&
                                                roles.getRoleType(addUser.subscription.role) !== roles.getRoleType(subscription.role)) {

                                                res.status(500).json({error: 'user type mismatch'});
                                                return;
                                        }

                                        if (!util.isExpired(addUser.subscription)) {
                                            needsSubscription = false;
                                        }
                                    }

                                    // see if the team has available subscriptions left
                                    if (subscription.subscriptionInvites.length + subscription.children.length >= subscription.subscriptions &&
                                            needsSubscription) {
                                        res.status(409).json({error: 'out of subscriptions'})
                                        return;
                                    }

                                    // create a new invite object
                                    return Invite.create({
                                            user: req.user._id,
                                            email: email,
                                            role: subscription.role,
                                            team: subscription.team._id
                                        })
                                        .then(invite => {
                                            // send an email to the user using the new invite's _id
                                            let inviteId = invite._id.toString(),
                                                name = user.firstName + ' ' + user.lastName,
                                                nameText = name.trim() ? 'Your colleague, ' + name + ', ' : 'Your colleague',
                                                link, subject, greeting, body, actionText;

                                            if (addUser) {
                                                subject = 'You have been invited to a Team on ImprovPlus';
                                                let name = 'Hello ' + addUser.firstName;
                                                greeting = name.trim() + ','
                                                actionText = 'Accept Invitation';
                                                link = 'https://' + req.get('host') + '/app/dashboard';
                                            } else {
                                                subject = 'You have been invited to join ImprovPlus',
                                                greeting = 'ImprovPlus Awaits!';
                                                actionText = 'Join Now';
                                                link = 'https://' + req.get('host') + '/invite/' + inviteId;
                                            }

                                            body = `
                                                <p>${nameText} has invited you to join ${subscription.team.name} on ImprovPlus.</p>
                                            `;

                                            if (!addUser) {
                                                body += `<p>ImprovPlus is an online community for the world of Improv, helping Facilitators and Improvisers connect, share, and develop themselves and their techniques. By joining ImprovPlus, you will be on your way to making your world more Awesome.</p>`;
                                            }

                                            if (!addUser || !addUser.subscription || addUser.subscription.expires < Date.now()) {
                                                body += `
                                                    <p>You will be able to use the subscription already set up for ${subscription.team.name}, which means you will gain full access to the app and all of your team's resources right away.</p>
                                                `;
                                            } else {
                                                body += `
                                                    <p>You already have a subscription to ImprovPlus, but now you will be able to connect and collaborate with your teammates.</p>
                                                `;
                                            }

                                            emailUtil.send({
                                                to: email,
                                                subject: subject,
                                                content: {
                                                    type: 'text',
                                                    baseUrl: 'https://' + req.get('host'),
                                                    greeting: greeting,
                                                    body: body,
                                                    action: link,
                                                    actionText: actionText,
                                                    afterAction: `
                                                        <p>If that button doesn't work for you (or your email account messed up the contents of this message and you don't see any button), you can accept this invite by visiting <a href="${link}">${link}</a> in your browser.</p>

                                                        <p>Be excellent to each other, and party on.</p>

                                                        <p>Sincerely,</p>

                                                        <p>The Proprietors of <span class="light">improv</span><strong>plus</strong>.</p>
                                                    `
                                                }
                                            }, (error, response) => {

                                                if (needsSubscription) {
                                                    subscription.subscriptionInvites.push(invite);
                                                } else {
                                                    subscription.invites.push(invite);
                                                }

                                                if (addUser) {
                                                    addUser.invites.push(invite);
                                                    addUser.save();
                                                }

                                                subscription.save().then(subscription => {
                                                    if (addUser) {
                                                        invite = invite.toObject();
                                                        invite.inviteUser = {
                                                            firstName: addUser.firstName,
                                                            lastName: addUser.lastName,
                                                            email: addUser.email,
                                                            _id: addUser._id,
                                                            subscription: addUser.subscription
                                                        };
                                                    }
                                                    res.json(invite);
                                                });

                                            })
                                        });

                                    // }
                                })
                        })

                })

        } else {
            auth.unauthorized(req, res);
        }

    },

    subscription: (req, res) => {
        if (util.indexOfObjectId(req.user.memberOfTeams, req.params.id) == -1 &&
            util.indexOfObjectId(req.user.adminOfTeams, req.params.id) == -1) {
                util.unauthorized(req, res);
                return;
            }

        if (req.method == 'GET') {
            return Team.findOne({}).where('_id').equals(req.params.id)
                .select('subscription')
                .populate({
                    path: 'subscription',
                    select: '-stripeCustomerId',
                    populate: {
                        path: 'parent invites subscriptionInvites',
                        select: '-stripeCustomerId',
                        match: {
                            accepted: false,
                            dateDeleted: undefined
                        },
                        populate: {
                            path: 'team',
                            select: 'name'
                        }
                    }
                })
                .then(t => {
                    team = t.toObject();

                    if (team.subscription) {
                        team.subscription.type = roles.findRoleById(roles.getRoleType(team.subscription.role)).name;
                        team.subscription.roleName = roles.findRoleById(team.subscription.role).name;
                    }

                    if (team.subscription.invites || team.subscription.subscriptionInvites) {
                        return util.iterate([].concat(team.subscription.subscriptionInvites, team.subscription.invites), (invite) => {
                            if (invite && invite.email) {
                                return findModelUtil.findUser(invite.email)
                                    .then(user => {
                                        if (user) {
                                            invite.inviteUser = {
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                email: user.email,
                                                _id: user._id,
                                                subscription: user.subscription
                                            };
                                        }
                                    });
                            } else {
                                return Promise.resolve();
                            }
                        }).then(() => {
                            return Promise.resolve(team);
                        })
                    } else {
                        return Promise.resolve(team);
                    }
                })
                .then(team => {
                    res.json(team);
                })
        } else if (req.method == 'POST') {
            // purchase new subscriptions!

            // this requires a team admin
            if (util.indexOfObjectId(req.user.adminOfTeams, req.params.id) == -1) {
                util.unauthorized(req, res);
                return;
            }

            let teamId = req.params.id,
                subCount = req.body.count,
                stripeToken = req.body.stripeToken;

            return chargeController.buyTeamSubscriptions(req.user, teamId, subCount, stripeToken)
                .then(subscription => {
                    res.json(subscription);
                });
        }
    },

}