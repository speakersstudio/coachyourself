const mongoose = require('mongoose');

const PackageConfigSchema = new mongoose.Schema({
    improv_sub_price: Number,
    fac_sub_price: Number,
    improv_team_sub_price: Number,
    fac_team_sub_price: Number,
    improv_team_sub_count: Number,
    fac_team_sub_count: Number,
    fac_team_package_markup: Number
});

const PackageConfigModel = mongoose.model('PackageConfig', PackageConfigSchema);

module.exports = PackageConfigModel;