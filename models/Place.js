const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const placeSchema = new mongoose.Schema({
    name: {type:String, trim:true, required:'Please enter a name'},
    //Always set a name in CY and EN - let the middleware/front end worry about displaying them as one if they are the same 
    name_new: {en:{type:String, trim:true, required: true}, cy:{type:String,trim:true,required: true}},
    slug: String,
    slug_new: {en:{type:String}, cy:{type:String}},
    slugs: [String],
    summary: String,
    summary_new:{en:{type:String, trim:true}, cy:{type:String,trim:true}},
    description: {type:String, trim:true},
    description_new:{en:{type:String, trim:true}, cy:{type:String,trim:true}},
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
        ref: 'User',
        required: "You must supply an author"
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

    console.log("pre save");
    /*
        Slugs array will contain ALL slugs for this place
        If name.cy or name.en has changed we need to 
         - work out a new slug
         - look for it in the slugs collection for all places
         - if it's present we need append a number to make it unique
         - Then we add the slug we've come up with to our slugs collection
         - We set place.slug to one of the new slugs that we've come up with 
    */

          /*  const slugRegex = new RegExp(`^(${this.slug}((-[0-9*$])?)$)`, 'i');
        const storesWithSlug = await this.constructor.find({slug: slugRegex});
        if(storesWithSlug.length)
        {
            this.slug = `${this.slug}-${storesWithSlug.length+1}`;
        }*/

    // if(this.isModified('namex'))
    // {
    //     this.slug = slug(this.name);




    // }
console.log(this);



    //TODO - double check that this is only called when we are new...
    this.slug_new = {en: this.name_new.en, cy: this.name_new.cy};
    this.slug = this.slug_new.en;
    console.log("bobb");
    console.log(this);
    await placeSchema.statics.setupCurrentSlug(this);
    
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
    if(!place.slug_new)
    {        
        return;
    }
    console.log("setup current slug");
    console.log(place);
    place.slug_new.en = slug(place.slug_new.en);
    place.slug_new.cy = slug(place.slug_new.cy);
    const singleSlug = place.slug_new.en===place.slug_new.cy;

    //TODO - if the name of a place is changed to something else, and then changed back again
    // *and* the original slug for the place had a number on the end, the new slug won't go back to 
    //that old slug .e.g. 
    // "old library"   --> "cool place" --> "old library"
    //   old-library-2 -->  cool-place  --> old-library-3
    //Don't really care about this at the moment though...
    
    if(!place.slugs.find((s)=>s===place.slug_new.en))
    {
        //English slug not already used by this place
        place.slug_new.en = await placeSchema.statics.makeSlugUnique(place.slug_new.en,slugLookupFunction);
        console.log(place.slug_new.en);
        place.slugs[place.slugs.length] = place.slug_new.en;
        place.slug = place.slug_new.en;
    }

    if(singleSlug)
    {
        place.slug_new.cy = place.slug_new.en;
    }
    else if(!place.slugs.find((s)=>s===place.slug_new.cy))
    {
        //Welsh slug not already used by this place
        place.slug_new.cy = await placeSchema.statics.makeSlugUnique(place.slug_new.cy,slugLookupFunction);
        console.log(place.slug_new.cy);
        place.slugs[place.slugs.length] = place.slug_new.cy;
    }
}

module.exports = mongoose.model('Place', placeSchema);

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

