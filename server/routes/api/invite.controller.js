const mongoose = require('mongoose');
        
const   util = require('../../util'),
        emailUtil = require('../../email'),
        auth = require('../../auth'),
        InviteModel = require('../../models/invite.model'),
        HistoryModel = require('../../models/history.model'),
        User = require('../../models/user.model');

module.exports = {

    getAll: (req, res) => {
        res.status(404); // important - don't let users look up invites
    },

    delete: (req, res) => {

        InviteModel.findOne({})
            .where('_id').equals(req.params.id)
            .populate({
                path: 'team'
            })
            .exec()
            .then(invite => {
                
                // you can delete an invite if you created it
                // if you are admin of the team it's for
                // or if it is to you (your email is the invite's email)
                // or if you're a super admin
                if ((invite.team && util.indexOfObjectId(invite.team.admins, req.user._id) > -1) ||
                    invite.user.toString() == req.user._id.toString() ||
                    req.user.email == invite.email ||
                    req.user.superAdmin) {

                    invite.dateDeleted = Date.now();
                    invite.deletedUser = req.user._id;

                    if (invite.email == req.user.email) {
                        sendInviteRejectedEmail(req.user, invite.team, req);
                    }

                    return invite.save()
                        .then(invite => {
                            return User.findOne({}).where('email').equals(invite.email).exec();
                        })
                        .then(user => {
                            if (user) {
                                user.invites = util.removeFromObjectIdArray(user.invites, invite._id);
                                return user.save();
                            } else {
                                return Promise.resolve(user);
                            }
                        })
                        .then(() => {
                            res.send('success');
                        })
                    
                } else {
                    auth.unauthorized(req, res);
                }
            })

    },

    backup: (req, res) => {
        InviteModel.find({}).exec()
            .then(i => {
                res.json(i);
            })
    }

}

function sendInviteRejectedEmail(newUser, team, req) {

        let teamName = team.name,
            toUsers = team.admins,
            teamId = team._id;

        let newUserName = newUser.fullName ? ', one ' + newUser.fullName + ', ' : '';

        let body = `
            <p>A user${newUserName} has declined your invitation to join your team, ${teamName}. We can't tell you why they didn't want to join, but we wanted to let you know that it happened.</p>

            <p>If they were slated to use one of your team's User Subscriptions, you will get that back. That's some good news, at least. To see details about your team (including how many subscriptions you have left), visit the ImprovPlus app.</p>
            `;

        toUsers.forEach(toUser => {

            let toUserName = !toUser.simpleName || toUser.simpleName == 'undefined' ? 'ImprovPlus User' : toUser.simpleName;

            let sendObject = {
                to: toUser.email,
                toName: toUserName,
                subject: 'User has declined your invitation',
                content: {
                    type: 'text',
                    baseUrl: 'https://' + req.get('host'),
                    greeting: 'Hey ' + toUserName + ',',
                    body: body,
                    action: 'https://' + req.get('host') + '/app/team/' + teamId,
                    actionText: 'View Team Details'
                }
            }

            emailUtil.send(sendObject, (error, response) => {
                if (error) {
                    console.error(error);
                }
            })

        });

    }