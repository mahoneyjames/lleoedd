const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const regionSchema = new mongoose.Schema({
    id: String,
    name: {en: String, cy: String},
    shortName: {en: String, cy: String},
    }
);

regionSchema.statics.listRegions = function()
{

    const regions = [
        {id:"mid",       shortName:{en: "Mid"}, name:{en: "Mid Wales"}},
        {id:"south-east",shortName:{en: "South-East"}, name:{en: "South-East Wales"}},
        {id:"south-west",shortName:{en: "South-West"}, name:{en: "South-West Wales"}},
        {id:"north-west",shortName:{en: "North-West"}, name:{en: "North-West Wales"}},
        {id:"north-east",shortName:{en: "North-East"}, name:{en: "North-East Wales"}},
        {id:"cardiff",   shortName:{en: "Cardiff"}, name:{en: "Cardiff"}},
        {id:"uk",        shortName:{en: "UK"}, name:{en: "Rest of the UK"}},
        {id:"byd",       shortName:{en: "Everywhere else"}, name:{en: "Rest of the world"}}
        ];
        
    return regions;
}

regionSchema.statics.getRegion = (id) =>
{
    return regionSchema.statics.listRegions().find((region)=>region.id===id);
}
module.exports = mongoose.model('Region', regionSchema);