const mongoose = require('mongoose');
const MaterialItem = require('./material-item.model.js');
const Subscription = require('./subscription.model');

const PackageSchema = new mongoose.Schema({
    slug: String,
    name: String,
    description: [String],
    color: String,
    price: Number, // decimal
    dateAdded: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now },

    materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MaterialItem' }],
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],

    type: String, // either 'facilitator' or 'improviser'

    visible: { type: Boolean, default: true }
});

PackageSchema.query.byName = function(name) {
    return this.find({ name: new RegExp(name, 'i') });
};

PackageSchema.methods.addMaterial = function(items) {
    const package = this,
        materialItems = [];
    var readyCount = 0;

    items = [].concat(items);

    let addItem = (itemIndex) => {
        let item = items[itemIndex],
            query = MaterialItem.findOne({});
        
        if (item.name) {
            query.where('name').equals(item.name);
        } else if (item._id) {
            query.where('_id').equals(item._id);
        }

        return query.exec()
            .then(i => {
                package.materials.push(i);
                itemIndex++;
                if (items.length > itemIndex) {
                    return addItem(itemIndex);
                } else {
                    return package.save();
                }
            })
    }
    return addItem(0);
};

PackageSchema.methods.dlfilename = function() {
    let version = this.materials[0].version();
    return this.name + '.' + version.extension;
};

const Package = mongoose.model('Package', PackageSchema);

module.exports = Package;