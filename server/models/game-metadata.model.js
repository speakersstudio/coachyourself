const mongoose = require('mongoose');

const GameMetadataSchema = new mongoose.Schema({
    name: String,
    description: String,
    type: String, // 'playercount' or 'duration'
    min: Number,
    max: Number,
    legacyID: Number,
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    addedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateAdded: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

const GameMetadata = mongoose.model('GameMetadata', GameMetadataSchema);

module.exports = GameMetadata;