const mongoose = require('mongoose');

// const DBInfoSchema = new mongoose.Schema({
//     created: {type: Date, default: Date.now},
//     user: {type: Date, default: 0},
//     package: {type: Date, default: 0},
//     materials: {type: Date, default: 0},
//     game: {type: Date, default: 0},
//     note: {type: Date, default: 0},
//     config: {type: Date, default: 0},
//     packageConfig: {type: Date, default: 0}
// });
const DBInfoSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    key: String,
    latest: Date
})

const DBInfo = mongoose.model('DBInfo', DBInfoSchema);

module.exports = DBInfo;