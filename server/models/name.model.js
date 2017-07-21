const mongoose = require('mongoose');

const NameVote = require('./name-vote.model');

const NameSchema = new mongoose.Schema({
    name: String,
    weight: { type: Number, default: 0 },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NameVote' }],
    addedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateAdded: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    dateDeleted: Date,
    deletedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

NameSchema.methods.addVote = function(userId) {
    const name = this;

    return NameVote.find({})
        .where('name').equals(name._id)
        .where('addedUser').equals(userId)
        .exec()
        .then((existingVotes) => {
            if (!existingVotes.length) {
                return NameVote.create({
                    name: name._id,
                    addedUser: userId
                }).then(nv => {
                    name.weight++;
                    name.votes.push(nv._id);
                    return name.save();
                });
            }
        });
}

NameSchema.methods.removeVote = function(userId) {
    const name = this;

    return NameVote.findOne({})
        .where('name').equals(name._id)
        .where('addedUser').equals(userId)
        .exec()
        .then(v => {
            name.weight--;
            name.votes.splice(name.votes.indexOf(v._id))
            return v.remove();
        })
        .then(() => {
            return name.save();
        });
}

const Name = mongoose.model('Name', NameSchema);

module.exports = Name;