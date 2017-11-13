const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
const errorHandlers = require('../handlers/errorHandlers');

const placeSchema = new mongoose.Schema({
    //name: {type:String, trim:true, required:'Please enter a name'}, 
    name: {en:{type:String, trim:true, required: false}, cy:{type:String,trim:true,required: false}},
    slug: {en:{type:String}, cy:{type:String}},
    slugs: [String],
    summary:{en:{type:String, trim:true}, cy:{type:String,trim:true}},    
    description:{en:{type:String, trim:true}, cy:{type:String,trim:true}},
    tags: [String],
    region: String,
    created: {type: Date,default: Date.now},
    location:
    {
        type: {type: String, default: 'Point'}, 
        coordinates:[
            {   
                type: Number, 
                required: "You must supply coordinates"
            }],
        address: {
            type: String, 
            required: "You must supply an address"
        },
        postcode: {type: String}
    },
    google:{
        url: String,
        placeId: String
    },
    link: String,
    photo:String,
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    modified: {type: Date}
});

placeSchema.index({
    name: 'text',
    description: 'text'
});

placeSchema.index({
    location: '2dsphere'
});

    // placeSchema.path('name_new.en').validate(function (value) {
    //   console.log("validate");return true;
    // }, 'Invalid color');

placeSchema.pre('save', async function(next){

    this.schemaVersion = 2;

    console.log("pre save");    
    next();    
});

placeSchema.statics.getTagsList = function(){
    return this.aggregate([
        {$unwind: '$tags'},
        { $group: {_id: '$tags', 
                    count: {$sum: 1}
                  }
        },
        { $sort: {count: -1}}
    ]);  
};

placeSchema.statics.getSlugs = (requiredSlugs)=>
{
    //Call this to add to the slugs property of the place based on its name (en and cy)
    //The assumption is that the name *has* changed

    // const newSlugs = [];
    // newSlugs[0] = slug(place.name_new.en);

    // if(place.name_new.en!=place.name_new.cy)
    // {
    //     newSlugs[1] = slug(place.name_new.cy);
    // }

    //TODO - check they have not been used yet
    //TODO - don't we need the current slugs?

    const slugs = [];
    requiredSlugs.forEach(s=>slugs[slugs.length] = slug(s));
    return slugs;
}

placeSchema.statics.setupCurrentSlug = async (place, slugLookupFunction) =>
{
    console.log("setup current slug");
    console.log(place);
    place.slug.en = slug(place.slug.en);
    place.slug.cy = slug(place.slug.cy);
    const singleSlug = place.slug.en===place.slug.cy;

    //TODO - if the name of a place is changed to something else, and then changed back again
    // *and* the original slug for the place had a number on the end, the new slug won't go back to 
    //that old slug .e.g. 
    // "old library"   --> "cool place" --> "old library"
    //   old-library-2 -->  cool-place  --> old-library-3
    //Don't really care about this at the moment though...
    
    if(!place.slugs.find((s)=>s===place.slug.en))
    {
        //English slug not already used by this place
        place.slug.en = await placeSchema.statics.makeSlugUnique(place.slug.en,slugLookupFunction);
        console.log(place.slug.en);
        place.slugs[place.slugs.length] = place.slug.en;        
    }

    if(singleSlug)
    {
        place.slug.cy = place.slug.en;
    }
    else if(!place.slugs.find((s)=>s===place.slug.cy))
    {
        //Welsh slug not already used by this place
        place.slug_new.cy = await placeSchema.statics.makeSlugUnique(place.slug.cy,slugLookupFunction);
        console.log(place.slug.cy);
        place.slugs[place.slugs.length] = place.slug.cy;
    }
}


placeSchema.statics.makeSlugUnique = async (slug)=>
{    
    
    //const slugRegex = new RegExp(`^(${slug}((-[0-9*$])?)$)`, 'i');
    const slugRegex = new RegExp(`${slug}\w*`, 'i');
    console.log(slugRegex);
    const storesWithSlug = await module.exports.find({slugs: slugRegex});
    console.log("places found=" + storesWithSlug.length);
    if(storesWithSlug.length)
    {
        slug = `${slug}-${storesWithSlug.length+1}`;
    } 
    return slug;
}

//Non mongoose document validation, but it lives here for now...
//Returns the same type of error doc that we generate from express-validator...
//Returns null if there are no errors
placeSchema.statics.getDocumentErrors = (document)=>
{


/* 
Rules

Must have either an English or Welsh name
  (Don't copy either name over - absense of a value in a language means that we pick up from another language)

    Slug is set based on the name
Must have either an English or Welsh summary

Must have a region, must be in our list of supported regions

Validate the url

Location
    Lat and lng should be numbers (not too worried about this for the moment. It's not user entered data, so if they bugger round with it, give them the mongo error)     
    (Any sanity checking needed?)

    Is postcode mandatory?

    Address is mandatory (not gonna get into localisation of address info!)



    What about town/village/city? We can localise those

    Maybe we have a lookup of list of places to use for sanity checking...
    But don't bother storing a pointer to a  place - store the english and welsh names in the doc, and let the user set for now.
    In the future we can do some kind of spell checking...



*/
    //let errors =errorHandlers.validationErrorsToSimpleDoc(req.validationErrors());
    //Now do more complex validation  

    const errors = {count:0};

    if(localisedValuesToArray(document.name).length==0)
    {
        errors["name"] = [{error:'atLeastOneLanguageRequired'}];
        errors.count++;
    }
    
    if(localisedValuesToArray(document.summary).length==0)
    {
        errors["summary"] = [{error:'atLeastOneLanguageRequired'}];
        errors.count++;
    }

    if(errors.count>0)
        return errors;
    else
        return errors;

}

function localisedValuesToArray(what)
{
    const values = [];
    if(what!=undefined && what!=null)
    {        
        for(var language in ['en', 'cy'])
        {
            const value = what[language];
            if(value!=null && value.trim()!='')
            {
                values.push(value);
            }
        }
    }

    return values;
}

module.exports = mongoose.model('Place', placeSchema);
