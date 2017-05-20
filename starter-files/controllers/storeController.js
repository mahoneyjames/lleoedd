const mongoose = require('mongoose');
const Store = mongoose.model('Store');
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

exports.addStore = (req, res)=> {

    res.render('editStore', {title: 'Add store'});
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

exports.createStore = async (req, res)=> {
    req.body.author = req.user._id;
    const store = await( new Store(req.body).save());

    
    req.flash('success',`Successfully Created ${store.name}. Care to leave a review?`);        
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res)=>{

     const stores = await Store.find();
    
    //query the db for a list of all stores

    res.render('stores', {title:"Stores", stores});

};

const confirmStoreOwner = (store, user)=>{
    if(!store.author.equals(user._id))
    {
        throw Error('You must own a store in order to edit it');
    }
}
exports.editStore = async (req, res)=>{

     //1 find the store based on the id
     const store = await(Store.findOne({_id: req.params.id}));
     

     //2 confirm they are the owner of the store
     confirmStoreOwner(store, req.user);
     //3 render out the edit form so the user can update their store
//res.json(req.params);
res.render('editStore',{title:"Edit store",store});
     


};

exports.updateStore = async (req, res)=>{
    req.body.location.type = 'Point';
     //1 find the store based on the id
     const store = await Store.findOneAndUpdate(
         {_id: req.params.id}, 
         req.body, 
        {
            new:true, //return the new store instead of the old one
            runValidators:true
        }).exec();
     
     
     //2 confirm they are the owner of the store
     confirmStoreOwner(store, req.user);
     //3 render out the edit form so the user can update their store

     req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View store</a>`);

    res.redirect(`/stores/${store._id}/edit`);
     


};
 
exports.displayStore = async (req, res, next) =>{


    const store = await(Store.findOne({slug: req.params.slug})).populate('author'); 
    if(!store)
    {
        return next();        
    }    
    res.render("displayStore", {store, title: store.name});
};

exports.getStoresByTag = async (req, res) =>{
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true};
    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({tags: tagQuery });
    
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);


    res.render('tag', {tags, stores, title: 'Tags', selectedTag: tag});
};
