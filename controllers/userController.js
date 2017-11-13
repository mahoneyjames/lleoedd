const mongoose = require('mongoose');
//const Store = mongoose.model('Store');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const errorHandlers = require('../handlers/errorHandlers');
exports.loginForm =  (req, res)=>{
     res.render('login',{titleLabel:"login"});
};

exports.registerUserForm =  (req, res)=>{
     res.render('register',{titleLabel:"register", registration: {}});
};

/*
What                    Client   Server
name - mandatory            X       X
email - mandatory           X       X
email - valid               X       X
email - not used                    X
password - mandatory        X       X
passwords - match           X       X
secret - mandatory          X       X
secret - valid                      X

*/
exports.validateRegister = async (req, res, next)=>{
    req.sanitizeBody('name');
    req.checkBody('name', 'name.missing').notEmpty();
    req.checkBody('email', 'email.invalid').isEmail();
    
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'password.invalid').isLength({min:8});

    
    req.checkBody('passwordconfirm', 'confirm.mismatch').equals(req.body.password);

    //simple check to prevent joe public from trying to register
    req.checkBody('secret', 'secret.invalid').equals(process.env.SECRET);    

    
    let errors =errorHandlers.validationErrorsToSimpleDoc(req.validationErrors());    

    if(!errors)
    {
        //Check if the user already exists        
        const existingUser = await User.findOne({email:req.body.email});
        if(existingUser!=null)
        {
            errors = {email:[{error:'email.used'}]};
        }
    }

    if(errors)
    {
        //req.flash('error', res.label('page.register.messages.registerfailed'));
        res.render('register', {titleLabel: 'register', registration: req.body, flashes: req.flash(), errors});
        return;    
    }

    next();
    
};



exports.registerUser = async (req, res, next)=>{
     const user = new User({
         email: req.body.email, 
         name: req.body.name});

    const registerWithPromise = promisify(User.register, User);
    await registerWithPromise(user, req.body.password);
    next();

};

exports.account = (req, res)=>{
    res.render('account', {titleLabel: 'account'});
};

exports.updateAccount = async (req, res)=>{
    const updates = {
        name:req.body.name,
        email: req.body.email,
        language: req.body.language};
    
    const user = await User.findOneAndUpdate(
        {_id: req.user._id},
        {$set: updates },
        { new: true, runValidators:true, context: 'query'} );

    req.flash('success','Profile updated');
    res.redirectLocalised('/account');

};