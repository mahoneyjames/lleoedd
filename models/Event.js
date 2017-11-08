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
           cy: {type:String, trim:true, required:false}},
    slug:  {en: {type:String, trim:true, required:true},
           cy: {type:String, trim:true, required:false}}

    


    /*
        Title
        Region e.g. south-east
        Area/Place e.g. Newport, Monmouth. This is almost town
        Address
        about
        Link
        Schedule
        organiser

        use the place model to control region, area and address? 


        When creating an event give them the option to select from existing places
        If not found, then let them search on google and select a place. This will auto create the place
        When adding new places we'll need to look and see if that google place already exists, and if it does, switch into place edit mode

        


    


    */
});

module.exports = mongoose.model('Event', eventSchema);