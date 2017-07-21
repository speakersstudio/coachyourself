const mongoose = require('mongoose');

const Note = require('./note.model');

const TagSchema = new mongoose.Schema({
    legacyID: Number,
    name: String,
    description: String,
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    addedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateAdded: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

TagSchema.methods.addNote = function(note) {
    const tag = this;

    note.tag = tag._id;
    return Note.create(note).then(n => {
        tag.notes.push(n._id);
        return tag.save();
    });
};

const Tag = mongoose.model('Tag', TagSchema);

module.exports = Tag;