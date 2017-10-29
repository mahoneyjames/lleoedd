const mongoose = require('mongoose');
const Place = mongoose.model('Place');
const Region = mongoose.model('Region');
const User = mongoose.model('User');
const moment = require('moment');

const jimp = require('jimp');
const uuid = require('uuid');



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
        res.redirect(`/place/${place.slug}`);

    })
    .catch((err)=>{

        //failed to create place - for the moment this is because we failed mongo document validation
            console.log(err);
            
            

            const validationErrors = [];
            for(var field in err.errors)
            {
                validationErrors.push({param:field, msg: err.errors[field].message });
            }

            req.flash('error', validationErrors.map(err=>err.msg));        
            
            res.render('placeNew-details',{titleLabel: 'placeNew-details', place:req.body,regions: Region.listRegions(),flashes: req.flash(), validationErrors});
    });


}


function convertPostedPlaceIntoMongoDocumentPlace(req)
{
    
    req.body.summary_new=req.body.summary;
    req.body.summary=req.body.summary_new.en;

    req.body.description_new = req.body.description;
    req.body.description = req.body.description_new.en;

    req.body.name_new = req.body.name;
    req.body.name = req.body.name.en;
    req.body.slug_new = null;
}

async function insertNewPlace(req)
{
    req.body.createdBy = req.user._id;

    convertPostedPlaceIntoMongoDocumentPlace(req);

    if(req.body.name_new.cy===null || req.body.name_new.cy.trim()==='')
    {
        req.body.name_new.cy = req.body.name_new.en;
    }

    const mongoPlace = new Place(req.body);

    return mongoPlace.save();
}
exports.createPlace = async (req, res)=> {
    //old create place logic here...
        
    insertNewPlace(req).then((place)=>{
        
        console.log(place);
        req.flash('success',`Successfully Created ${place.name}.`);        
        res.redirect(`/place/${place.slug}`);

    })
    .catch((err)=>{
            console.log(err);
            req.flash('error', "Failed to create place");
            

            const validationErrors = [];
            for(var field in err.errors)
            {
                validationErrors.push({param:field, msg: err.errors[field].message });
            }

            req.flash('error', validationErrors.map(err=>err.msg));        
            res.render('editPlace', {titleLabel: 'addPlace',wizardMode: true, regions: Region.listRegions(), body: req.body, flashes: req.flash(), validationErrors });

    });

    console.log("here");

    
    
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


exports.editPlaceDetails = async(req,res)=>{        
    let place = await(Place.findOne({_id: req.params.id}));
    place = handleSummaryLocalisation(place);
    res.render('placeEdit-details',{titleLabel:"placeEdit-details",place, regions: Region.listRegions() });
}
exports.savePlaceDetails = async (req, res)=>{

    console.log("sav");
    convertPostedPlaceIntoMongoDocumentPlace(req);
    req.body.lastModifiedBy = req.user._id;
    req.body.modified = moment();
    
    //1 find the store based on the id
     //Cannot use findOneAndUpdate, because it's not running the pre save method for our name...
     const place = await Place.findOne({_id: req.params.id});

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
          
          console.log("yma");
     await Place.findOneAndUpdate({_id: req.params.id},
         updateCommand, 
        {
            new:true, //return the new store instead of the old one
            runValidators:false
        }).exec();
     
    
    //TODO - validate the document before save...

     req.flash('success', `Successfully updated <strong>${place.name}</strong>.`);

    res.redirect(`/places/${place._id}/editDetails`);
     
}

exports.editPlaceLocation = async(req,res)=>{        
    let place = await(Place.findOne({_id: req.params.id}));
    place = handleSummaryLocalisation(place);
    res.render('placeEdit-location',{titleLabel:"placeEdit-location",place});
}



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
