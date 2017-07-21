const mongoose = require('mongoose');

const Package = require('./package.model')
    MaterialItem = require('./material-item.model');

// used to track both a customer's purchase history as well as items in their cart
const PurchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    date: { type: Date, default: Date.now },
    materials: [{
        materialItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialItem' },
        price: Number
    }],
    packages: [{
        package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
        price: Number
    }],
    
    // subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    other: [
        {
            key: String,
            description: String,
            params: Object,
            price: Number
        }
    ],
    
    total: Number,
    refunded: { type: Boolean, default: false }
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);

module.exports = Purchase;