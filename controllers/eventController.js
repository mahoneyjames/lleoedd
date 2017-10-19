const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Region = mongoose.model('Region');
const User = mongoose.model('User');

exports.addEvent = (req, res)=>{
    res.render('events/add',{event:{},titleLabel:"addEvent"});
}

exports.createEvent = async (req,res)=>{

    req.body.createdBy = req.user._id;
    const event = await( new Event(req.body).save());

    
    req.flash('success',`Successfully Created ${event.name.en}.`);            
    res.render('events/add',{event});
}