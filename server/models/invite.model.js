const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // the user who sent this invite
    date: { type: Date, default: Date.now }, // when the invite was sent
    accepted: { type: Boolean, default: false },
    dateAccepted: Date, // when the invite was used
    email: String, // the email address of the person invited
    role: Number, // what role the invited person will receive
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // what team the user was invited to
    
    deletedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateDeleted: Date
});

const InviteModel = mongoose.model('Invite', InviteSchema);

module.exports = InviteModel;