const mongoose = require('mongoose');
const Place = mongoose.model('Place');
const Region = mongoose.model('Region');
const User = mongoose.model('User');
const moment = require('moment');

const jimp = require('jimp');
const uuid = require('uuid');
const mongoHelper = require('../handlers/mongodb.js');
const errorHandlers = require('../handlers/errorHandlers');

exports.homePage = (req, res) => {

    req.flash('error', 'Something happend');
    res.render("index");
};


/*

Place creation
 1 - findNewPlace
     Render map
     Post selected address info
 2 - enterNewPlaceDetails
     Send back address info
     Render selection form 
     Post selected address info and place details
 3 - create new place


*/
exports.findNewPlace = (req, res)=>{
    res.render('placeNew-find',{titleLabel: 'placeNew-find'});
}
exports.enterNewPlaceDetails = (req, res)=>{
    
    /*
        1 - Verify the submitted place info - if invalid, send back to newPlace-find
        2 - TODO - see if any similar places already exist
        3 - render out the edit place details form...
    */
    res.render('placeNew-details',{titleLabel: 'placeNew-details', place:req.body,regions: Region.listRegions()});
}

exports.createNewPlace = async (req, res)=>{

    /*
        
        1 Verify the details. If invalid, send back to newPlace-Details
        2 Verify the submitted place info. If invalid, throw error (because they must have skipped a step)
        3 Save the new place
        4 Send them to the display place form...
    */
    

    
    insertNewPlace(req).then((place)=>{
        
        //Hooray, place created!
        console.log(place);
        req.flash('success',`Successfully Created ${place.name}.`);        
        res.redirectLocalised(`/place/${place.slug}`);

    })
    .catch((err)=>{
        mongoHelper.handleMongoError(req,res,err, 'placeNew-details',{titleLabel: 'placeNew-details',regions: Region.listRegions(), body: req.body })
    });


}

async function insertNewPlace(req)
{
    req.body.createdBy = req.user._id;
    const mongoPlace = new Place(req.body);
    mongoPlace.slug = {en:req.body.name.en, cy:req.body.name.cy};
    await Place.setupCurrentSlug(mongoPlace);
    return mongoPlace.save();
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
     .select('summary region slug name')
     .skip(skip)
     //.limit(limit)
     .sort({created: 'desc'});
    const countPromise = Place.count();

    let [places,count] = await Promise.all([promise, countPromise]);
    //query the db for a list of all stores
    
    const pages =Math.ceil(count/limit);

    if(!places.length && skip)
    {
        req.flash('info', `Hey! You asked for page ${page}.`)
        res.redirectLocalised(`/places/page/${pages}`);
        return;
    }
    res.render('places', {titleLabel:"places", places, count, page, pages, currentRegion: Region.getRegion(region), regions: Region.listRegions() });

};


exports.editPlaceDetails = async(req,res)=>{        
    let place = await(Place.findOne({_id: req.params.id}));    
    console.log(place);
    res.render('placeEdit-details',{titleLabel:"placeEdit-details",place, regions: Region.listRegions() });
}
exports.savePlaceDetails = async (req, res)=>{


    
    req.body.lastModifiedBy = req.user._id;
    req.body.modified = moment();


    const updateCommand = req.body;

    const validationErrors = Place.getDocumentErrors(updateCommand);

    if(validationErrors!=null)
    {
        console.log("errors");
        console.log(validationErrors);

        res.render('placeEdit-details',
                {
                    titleLabel:"placeEdit-details",
                    regions: Region.listRegions(), 
                    place: updateCommand, validationErrors }   ); 
        return;
    }
    
    //1 find the store based on the id
     //Cannot use findOneAndUpdate, because it's not running the pre save method for our name...
     const place = await Place.findOne({_id: req.params.id});
     
    if(place.name.en!=req.body.name.en
        || place.name.cy!=req.body.name.cy)
    {
        //One of the titles has changed
        //Update the slug
        updateCommand.slug = {en:req.body.name.en, cy:req.body.name.cy};
        updateCommand.slugs = place.slugs;             
    }


     await Place.setupCurrentSlug(updateCommand);
                    
      Place.findOneAndUpdate({_id: req.params.id},
         updateCommand, 
        {
            new:true, //return the new store instead of the old one
            runValidators:true
        }).exec()
        .then((place)=>{
            req.flash('success', `Successfully updated <strong>${place.name}</strong>.`);
            res.redirectLocalised(`/places/${place._id}/editDetails`);            
        })
        .catch((err)=>{
            mongoHelper.handleMongoError(req,res,err, 'placeEdit-details',
                {
                    titleLabel:"placeEdit-details",
                    regions: Region.listRegions(), 
                    place: updateCommand })            
        });
     
    
    //TODO - validate the document before save...


     
}

exports.editPlaceLocation = async(req,res)=>{        
    let place = await(Place.findOne({_id: req.params.id}));
    res.render('placeEdit-location',{titleLabel:"placeEdit-location",place});
}

exports.displayPlace = async (req, res, next) =>{

    let place = await(Place.findOne({$or:[{slug: req.params.slug},
                                    {slugs: req.params.slug}]})); 
    if(!place)
    {
        return next();        
    }    

    //TODO - if the user requested a slug that is no longer current, redirect them to the latest slug...
    res.render("placeDisplay", {place, title: place.name});
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
