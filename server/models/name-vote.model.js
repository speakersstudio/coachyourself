const mongoose = require('mongoose');

const NameVoteSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.ObjectId, ref: 'Name' },
    addedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateAdded: { type: Date, default: Date.now }
});

const NameVote = mongoose.model('NameVote', NameVoteSchema);

module.exports = NameVote;