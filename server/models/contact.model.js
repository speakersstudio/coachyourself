const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String,
    message: String
});

const ContactModel = mongoose.model('Contact', ContactSchema);

module.exports = ContactModel;