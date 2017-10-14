const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const placeSchema = new mongoose.Schema({
    name: {type:String, trim:true, required:'Please enter a name'},
    slug: String,
    summary: String,
    description: {type:String, trim:true},
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
    }
});

placeSchema.index({
    name: 'text',
    description: 'text'
});

placeSchema.index({
    location: '2dsphere'
});

placeSchema.pre('save', async function(next){
    if(this.isModified('name'))
    {
        this.slug = slug(this.name);

        const slugRegex = new RegExp(`^(${this.slug}((-[0-9*$])?)$)`, 'i');
        const storesWithSlug = await this.constructor.find({slug: slugRegex});
        if(storesWithSlug.length)
        {
            this.slug = `${this.slug}-${storesWithSlug.length+1}`;
        }

    }
    next();
    //TODO -make more resilient so slugs are unique
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

module.exports = mongoose.model('Place', placeSchema);