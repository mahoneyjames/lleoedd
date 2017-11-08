const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Region = mongoose.model('Region');
const User = mongoose.model('User');
const mongoHelper = require('../handlers/mongodb.js');
exports.addEvent = (req, res)=>{
    res.render('events/add',{event:{},titleLabel:"addEvent"});
}

exports.createEvent = async (req,res)=>{
console.log(req.body);
    req.body.createdBy = req.user._id;
    
    new Event(req.body)
        .save()
        .then((event)=>{
            req.flash('success',`Successfully Created ${event.name.en}.`);            
            res.render('events/add',{event});
        })
        .catch((err)=>{        
            mongoHelper.handleMongoError(req, res,err, 'events/add',{event:req.body,titleLabel:"addEvent"} );
        });
}





exports.getEventList = async (req,res)=>

{

    const events =await Event.find().select("name about");
    res.render('events/list', {titleLabel:"events", events})
}