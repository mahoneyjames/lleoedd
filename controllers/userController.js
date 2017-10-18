const mongoose = require('mongoose');
//const Store = mongoose.model('Store');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm =  (req, res)=>{
     res.render('login',{title:"Login"});
};

exports.registerUserForm =  (req, res)=>{
     res.render('register',{title:"Register"});
};

exports.validateRegister = async (req, res, next)=>{
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name').notEmpty();
    req.checkBody('email', 'That email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Confirm password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Your passwords do not match').equals(req.body.password);

    //simple check to prevent joe public from trying to register
    req.checkBody('secret', 'Invalid secret').equals(process.env.SECRET);
    const errors = req.validationErrors();

    if(errors)
    {
        req.flash('error', errors.map(err=>err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash()});
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
    res.render('account', {title: 'Edit your account'});
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
    res.redirect('/account');

};