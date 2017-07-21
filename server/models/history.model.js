const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String, // a key referencing what happened (sticking to the actions in the roles list if possible?)
    target: String, // the _id of the item affected
    reference: String, // any other important _id to note
    changes: [{
        property: String,
        old: Object,
        new: Object
    }],
    date: { type: Date, default: Date.now } // when it happened
});

const HistoryModel = mongoose.model('History', HistorySchema);

module.exports = HistoryModel;