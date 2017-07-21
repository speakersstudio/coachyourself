const mongoose = require('mongoose');

const MaterialItemSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    color: String,
    tags: [String],
    versions: [{
        ver: Number,
        extension: String,
        dateAdded: { type: Date, default: Date.now },
        description: String
    }],
    visible: { type: Boolean, default: true }
});

MaterialItemSchema.query.byName = function(name) {
    return this.find({ name: new RegExp(name, 'i') });
};

// returns either the version specified, or the latest version
MaterialItemSchema.methods.version = function(ver) {
    let versions = this.versions,
        version;
    if (ver) {
        versions.forEach(v => {
            if (v.ver === ver) {
                version = v;
            }
        })
    } else {
        versions.sort((a, b) => {
            return b.ver - a.ver;
        });
        version = versions[0];
    }
    return version;
};

MaterialItemSchema.methods.filename = function(ver) {
    let version = this.version(ver);
    return version._id.toString() + '.' + version.extension;
};

MaterialItemSchema.methods.dlfilename = function() {
    let version = this.version();
    return this.name + '.' + version.extension;
};

const MaterialItem = mongoose.model('MaterialItem', MaterialItemSchema);

module.exports = MaterialItem;