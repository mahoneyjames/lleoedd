const mongoose = require('mongoose');
const Place = mongoose.model('Place');
const Region = mongoose.model('Region');
const User = mongoose.model('User');
const multer = require('multer');
const moment = require('moment');
const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next){
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto)
            next(null, true);
        else
            next({message:"File type is not allowed"}, false);

    }

};

const jimp = require('jimp');
const uuid = require('uuid');



exports.homePage = (req, res) => {

    req.flash('error', 'Something happend');
    res.render("index");
};

exports.addPlace = (req, res)=> {

    res.render('editPlace', {titleLabel: 'addPlace',wizardMode: true, regions: Region.listRegions() });
};

exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next)=>{

    if(!req.file)
    {
        next();
        return;
    }
    else
    {
        
        const extension = req.file.mimetype.split('/')[1];
        req.body.photo = `${uuid.v4()}.${extension}`;

        const photo = await jimp.read(req.file.buffer);
        await photo.resize(800, jimp.AUTO);
        await photo.write(`./public/uploads/${req.body.photo}`);

        
        next();
        return;
    }
};

exports.createPlace = async (req, res)=> {
    console.log("create called");
    req.body.createdBy = req.user._id;

    req.body.summary_new=req.body.summary;
    req.body.summary=req.body.summary_new.en;

    req.body.description_new = req.body.description;
    req.body.description = req.body.description_new.en;

    req.body.name_new = req.body.name;
    req.body.name = req.body.name.en;
    req.body.slug_new = {};

    if(req.body.name_new.cy===null || req.body.name_new.cy.trim()==='')
    {
        req.body.name_new.cy = req.body.name_new.en;
    }

    console.log(req.body);

    const place = await( new Place(req.body).save());

    
    req.flash('success',`Successfully Created ${place.name}.`);        
    res.redirect(`/place/${place.slug}`);
};


function handleSummaryLocalisation(place)
{
    place = place.toObject();

     if(place.summary_new!=undefined && place.summary_new.en!=undefined)
    {
        place.summary = undefined;
        place.summary = place.summary_new;
    }
    else
    {         
         const summary_new = {en:place.summary};         
         place.summary = summary_new;  
    }

     if(place.description_new!=undefined && place.description_new.en!=undefined)
    {
        place.description=undefined;
        place.description = place.description_new;
    }
    else
    {         
         const _new = {en:place.description};
         place.description = _new;  
    }

     if(place.name_new!=undefined && place.name_new.en!=undefined)
    {
        place.name=undefined;
        place.name = place.name_new;
    }
    else
    {         
         const _new = {en:place.name};
         place.name = _new;  
    }

    if(place.slug_new!=undefined && place.slug_new.en!=undefined)
    {
        place.slug=undefined;
        place.slug = place.slug_new;
    }
    else
    {         
         const _new = {en:place.slug};
         place.slug = _new;  
    }
    return place;
}
exports.getPlaces = async (req, res)=>{

    const page = req.params.page || 1;
    const limit = 15;
    const region = req.params.region;
    const regionQuery = region ? {region:{$eq:req.params.region}} : null;

    console.log(req.params.region);
    const skip = (page*limit) - limit;
    
     const promise = Place
     .find(regionQuery)     
     .select('slug name summary summary_new region slug_new name_new')
     .skip(skip)
     //.limit(limit)
     .sort({created: 'desc'});
    const countPromise = Place.count();

    let [places,count] = await Promise.all([promise, countPromise]);
    //query the db for a list of all stores


    places = places.map((place)=>handleSummaryLocalisation(place));
    
    const pages =Math.ceil(count/limit);

    if(!places.length && skip)
    {
        req.flash('info', `Hey! You asked for page ${page}.`)
        res.redirect(`/places/page/${pages}`);
        return;
    }
    res.render('places', {titleLabel:"places", places, count, page, pages, currentRegion: Region.getRegion(region), regions: Region.listRegions() });

};


exports.editPlace = async (req, res)=>{

     //1 find the store based on the id
     let place = await(Place.findOne({_id: req.params.id}));

    console.log("dit" + place.summary_new);
    place = handleSummaryLocalisation(place);
     
     //2 render out the edit form so the user can update their store

    res.render('editPlace',{titleLabel:"editPlace",place, regions: Region.listRegions() });
     


};

exports.updatePlace = async (req, res)=>{
    
    req.body.location.type = 'Point';
    req.body.lastModifiedBy = req.user._id;
    req.body.modified = moment();
    req.body.summary_new=req.body.summary;
    req.body.summary=req.body.summary_new.en;

    req.body.description_new = req.body.description;
    req.body.description = req.body.description_new.en;

    req.body.name_new = req.body.name;
    req.body.name = req.body.name.en;

    //console.log(req.body);
     //1 find the store based on the id
     //Cannot use findOneAndUpdate, because it's not running the pre save method for our name...
     const place = await Place.findOne({_id: req.params.id});

    console.log("database");
     console.log(place);
     console.log("req.body");
     console.log(req.body);
     const updateCommand = req.body;
     

     if(place.name_new)
     {
         //we are dealing with a place that has already moved to a localised title...
         if(place.name_new.en!=req.body.name_new.en
            ||place.name_new.cy!=req.body.name_new.cy)
         {
             //One of the titles has changed
             //Update the slug
             updateCommand.slug_new = {en:req.body.name_new.en, cy:req.body.name_new.cy};
             updateCommand.slugs = place.slugs;             
         }
     }
     else 
     {
         //Moving from the non-localised title to localised, so always update the slugs
        updateCommand.slug_new = {en:req.body.name_new.en, cy:req.body.name_new.cy};        
        updateCommand.slugs = place.slugs;             
     }

     await Place.setupCurrentSlug(updateCommand);
          
     await Place.findOneAndUpdate({_id: req.params.id},
         updateCommand, 
        {
            new:true, //return the new store instead of the old one
            runValidators:false
        }).exec();
     
    

     req.flash('success', `Successfully updated <strong>${place.name}</strong>.`);

    res.redirect(`/places/${place._id}/edit`);
     


};
 
exports.displayPlace = async (req, res, next) =>{

    let place = await(Place.findOne({$or:[{slug: req.params.slug},
                                    {slugs: req.params.slug}]})); 
    if(!place)
    {
        return next();        
    }    
    place = handleSummaryLocalisation(place);

    //TODO - if the user requested a slug that is no longer current, redirect them to the latest slug...
    res.render("displayPlace", {place, title: place.name});
};


exports.mapPlaces = async(req, res)=>{
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
        location:{
            $near: {
                $geometry:{
                    type: 'Point',
                    coordinates},
                $maxDistance: 100000 //10km
            }
        }

    };

    const places = await Place.find(q).select('slug name summary location photo').limit(10);
    res.json(places);
};

exports.mapPage = (req, res)=>{
    res.render('map',{titleLabel:'map'});
};

/*
exports.getStoresByTag = async (req, res) =>{
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true};
    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({tags: tagQuery });
    
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);


    res.render('tag', {tags, stores, title: 'Tags', selectedTag: tag});
};

exports.searchStores = async (req, res)=>{

    const stores = await Store
        .find({$text: {$search: req.query.q}}, {score: {$meta: 'textScore'}})
        .sort({score: { $meta: 'textScore'}})
        .limit(5);
        res.json(stores);
};


exports.heartStore = async (req, res)=>{
    console.log(req.user._id);
    const hearts = req.user.hearts.map(obj=>obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';

    const user = await User
    .findByIdAndUpdate(req.user._id,
        { [operator]: {hearts: req.params.id}},
        {new:true}
        );
    res.json(user);
};

exports.hearts = async(req, res)=>{

    const stores = await Store.find({_id: {$in: req.user.hearts}});
    res.render('hearts', {title: 'Hearted places', stores});
};

exports.getTopStores = async(req, res)=>{
    const stores = await Store.getTopStores();
    res.render('top',{title: 'Top places', stores});
    
};*/