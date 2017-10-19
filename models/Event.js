const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const eventSchema = new mongoose.Schema({
    created: {type: Date,default: Date.now},
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: "You must supply an author"
    },
    lastModifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    modified: {type: Date},
    name: {en: {type:String, trim:true, required:true},
           cy: {type:String, trim:true, required:false}},
    about: {en: {type:String, trim:true, required:true},
           cy: {type:String, trim:true, required:false}}
});

module.exports = mongoose.model('Event', eventSchema);