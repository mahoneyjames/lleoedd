const mongoose = require('mongoose');
const Place = mongoose.model('Place');
const blob  = require('../models/Blob-S3');
const helpers = require('../helpers.js');
const moment = require('moment');
exports.about =  (req, res)=>{
     res.render('about',{title:"About"});
};


exports.help = (req, res)=>{

    var what = req.params.what;
    

    switch(what)
    {
        case "address":
            res.render('help/locationLookups', {title: "Help: Finding addresses"});
            break;
        case "region":
            res.render('help/region', {title: "Help: Regions"});
            break;
        default:
            res.render('help/default', {title: "Help"});
            break;
    }

};

exports.management = (req, res)=>{

    res.render('manage', {title:"Pethau Management"});
}

exports.runManagementAction = async (req, res)=>
{
    res.render('manage', {title:"Pethau Management", logs:[ await exportPlaceData()]});
};

async function exportPlaceData()
{
    // Get a list of ALL stuff from Mongo
    const places = await Place.find();
    const env = process.env.NODE_ENV;

    //TODO - use the helper function to get the env once it is merged from dev
    const result = await blob.saveBlob(`ccadmin-${env}`, `${new moment()}-places.json`, JSON.stringify(places));

    if(result.success===true)
    {
        return "Place data saved to blob storage";
    }
    else
    {
        return `Failed to save place data to blob storage. ${result.err}`;
    }
    //JSONify it
    

    //push it up into S3...
    //our bucket name is our environment...
}