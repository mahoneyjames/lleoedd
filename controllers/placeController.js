const mongoose = require('mongoose');
const Place = mongoose.model('Place');
const User = mongoose.model('User');
const multer = require('multer');
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

    res.render('editPlace', {title: 'Add place',wizardMode: true});
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
    req.body.createdBy = req.user._id;
    const place = await( new Place(req.body).save());

    
    req.flash('success',`Successfully Created ${place.name}.`);        
    res.redirect(`/place/${place.slug}`);
};

exports.getPlaces = async (req, res)=>{

    const page = req.params.page || 1;
    const limit = 4;

    const skip = (page*limit) - limit;

     const promise = Place
     .find()
     .skip(skip)
     .limit(limit)
     .sort({created: 'desc'});
    
    const countPromise = Place.count();

    const [places,count] = await Promise.all([promise, countPromise]);
    //query the db for a list of all stores

    const pages =Math.ceil(count/limit);

    if(!places.length && skip)
    {
        req.flash('info', `Hey! You asked for page ${page}.`)
        res.redirect(`/places/page/${pages}`);
        return;
    }
    res.render('places', {title:"Places", places, count, page, pages });

};


exports.editPlace = async (req, res)=>{

     //1 find the store based on the id
     const place = await(Place.findOne({_id: req.params.id}));
     
     //2 render out the edit form so the user can update their store

    res.render('editPlace',{title:"Edit place",place});
     


};

exports.updatePlace = async (req, res)=>{
    req.body.location.type = 'Point';
     //1 find the store based on the id
     const place = await Place.findOneAndUpdate(
         {_id: req.params.id}, 
         req.body, 
        {
            new:true, //return the new store instead of the old one
            runValidators:true
        }).exec();
     
     
     //2 confirm they are the owner of the store
     //confirmStoreOwner(store, req.user);
     //3 render out the edit form so the user can update their store

     req.flash('success', `Successfully updated <strong>${place.name}</strong>.`);

    res.redirect(`/places/${place._id}/edit`);
     


};
 
exports.displayPlace = async (req, res, next) =>{


    const place = await(Place.findOne({slug: req.params.slug})); 
    if(!place)
    {
        return next();        
    }    
    res.render("displayPlace", {place, title: place.title});
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
    res.render('map',{title:'Map'});
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