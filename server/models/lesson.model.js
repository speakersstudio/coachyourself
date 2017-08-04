const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    name: String,
    description: String,
    versions: [{
        ver: Number,
        extension: String,
        dateAdded: { type: Date, default: Date.now },
        description: String
    }],
    visible: { type: Boolean, default: true },
    showOnDashboard: Boolean
});

// returns either the version specified, or the latest version
LessonSchema.methods.version = function(ver) {
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

LessonSchema.methods.filename = function(ver) {
    let version = this.version(ver);
    return version._id.toString() + '.' + version.extension;
};

LessonSchema.methods.dlfilename = function() {
    let version = this.version();
    return this.name + '.' + version.extension;
};

const Lesson = mongoose.model('Lesson', LessonSchema);

module.exports = Lesson;