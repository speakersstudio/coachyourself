const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
    key: String,
    value: String,
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Preference = mongoose.model('Preference', PreferenceSchema);

module.exports = Preference;