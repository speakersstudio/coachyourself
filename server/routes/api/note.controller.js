const mongoose = require('mongoose');
        
const   util = require('../../util'),
        findModelUtil = require('./find-model.util');

const Note = require('../../models/note.model'),
        HistoryModel = require('../../models/history.model'),
        whitelist = [
            'game',
            'tag',
            'metadata',
            'description'
        ];

module.exports = {

    create: (req, res) => {
        let noteData = req.body,
            user = req.user,
            userId = user._id,
            makePublic = !!noteData.public,
            teams = [];

        if (!noteData.game && !noteData.tag && !noteData.metadata) {
            return res.status(400).send({
                error: 'no reference'
            })
        }

        if (makePublic && req.user.actions.indexOf('note_public_create') == -1) {
            return util.unauthorized(req, res);
        }

        if (noteData.teams && noteData.teams.length) {
            if (req.user.actions.indexOf('note_team_create') == -1) {
                return util.unauthorized(req, res);
            }

            let permission = true;
            noteData.teams.forEach(team => {
                if (util.indexOfObjectId(user.adminOfTeams, team) == -1 &&
                    util.indexOfObjectId(user.memberOfTeams, team) == -1) {
                        permission = false;
                } else {
                    teams.push(util.getObjectIdAsString(team));
                }
            });
            if (!permission) {
                return util.unauthorized(req, res);
            }
        }

        Note.create({}).then(note => {
            util.smartUpdate(note, noteData, whitelist);
            note.public = makePublic;
            note.teams = teams;

            note.addedUser = req.user._id;
            note.modifiedUser = req.user._id;

            return note.save();
        }).then(note => {
            return findModelUtil.findNotes(note._id, req.user);
        }).then(note => {
            res.json(note);
        });

    },

    update: (req, res) => {
        let noteData = req.body,
            user = req.user;

        findModelUtil.findNotes(req.params.id, user).then(note => {

            if (util.getObjectIdAsString(note.addedUser) != util.getObjectIdAsString(user._id) &&
                !util.intersectArrays(note.teams, user.adminOfTeams).length &&
                !user.superAdmin) {
                
                return util.unauthorized(req, res);
            }

            let originalNote = note.toObject();

            if ((noteData.teams && noteData.teams.length) || note.teams.length) {
                if (req.user.actions.indexOf('note_team_create') == -1) {
                    return util.unauthorized(req, res);
                }
                let teams = [],
                    permission = true;

                noteData.teams.forEach(team => {
                    if (util.indexOfObjectId(user.adminOfTeams, team) == -1 &&
                        util.indexOfObjectId(user.memberOfTeams, team) == -1) {
                            permission = false;
                    } else {
                        teams.push(util.getObjectIdAsString(team));
                    }
                });
                if (!permission) {
                    return util.unauthorized(req, res);
                }

                note.teams = teams;
            }

            util.smartUpdate(note, noteData, whitelist);
            note.modifiedUser = user._id;
            note.dateModified = Date.now();

            if (user.superAdmin) {
                note.public = noteData.public;
            }

            let changes = util.findChanges(originalNote, note);
            HistoryModel.create({
                user: user._id,
                action: 'note_edit',
                target: note._id,
                changes: changes
            });

            return note.save().then(n => {
                return findModelUtil.findNotes(n._id, user);
            }).then(n => {
                res.json(n);
            })
        });
    },

    delete: (req, res) => {
        let noteId = req.params.id,
            user = req.user;

        findModelUtil.findNotes(req.params.id, user).then(note => {

            if (!note) {
                return util.notfound(req, res);
            }

            // only a note's creator (or a superadmin) can delete it
            if (util.getObjectIdAsString(note.addedUser) != util.getObjectIdAsString(user._id) &
                !user.superAdmin) {
                
                return util.unauthorized(req, res);
            }

            note.dateDeleted = Date.now();
            note.deletedUser = req.user._id;

            return note.save().then(() => {
                res.send('success');
            });
        });
    },

    getAll: (req, res) => {

        return findModelUtil.findNotes(null, req.user) 
            .then(notes => {
                res.send(notes);
            });

    },

    backup: (req, res) => {
        Note.find({}).exec().then(n => {
            res.json(n);
        })
    }

}