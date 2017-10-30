const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login  =         passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'Failed login!',
        successFlash: 'You are now logged in'
    });

exports.logout = (req, res)=>{
    req.logout();
    req.flash('success', 'You have been logged out successfully');
    res.redirectLocalised('/');
};

exports.loginIsOptional = (req, res, next) => {

    //need this method for pages where login is not required
    //It looks as though we have to call req.isAuthenticated to get any
    //flash messages to appear on a public page...
    if(req.isAuthenticated())
    {
        
        
    }

    next();    
};

exports.isLoggedIn = (req, res, next) => {

    if(req.isAuthenticated())
    {
        next();
        return;
    }
    else
    {
        req.flash('error', 'You must be logged in!');
        res.redirectLocalised('login');
    }

};

exports.forgot = async (req, res)=>{
    //1 - see if the user exists
    
    const user = await User.findOne({email: req.body.email});
    if(!user)
    {
        req.flash('success','A password reset has been mailed to you if an account exists');
        return res.redirectLocalised('/login');
    }

    //2 - set reset tokens and expiry on their account

    user.resetPasswordToken = crypto.randomBytes(200).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; //1 hour from now

    await user.save();

    //3 - send email with tokens
    const resetURL = `https://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    await mail.send({
        user,
        subject: 'Password reset link',
        resetURL,
        filename: 'password-reset'
    });

    req.flash('success',`You have been emailed a password reset link.`);
    //4 - redirect to login page
    res.redirect('/login')

};

exports.reset = async(req, res)=>{

    const user = await User.findOne(
        {resetPasswordToken: req.params.token, 
        resetPasswordExpires: {$gt: Date.now()} });

    if(!user)
    {
        req.flash('error',"Invalid reset token");
        return res.redirect('/login');
    }
    else
    {
        res.render('reset', {title: 'Reset your password'});
        return;
    }
};

exports.confirmedPasswords = (req,res,next)=>{
    if(req.body.password===req.body['password-confirm'])
    {
        return next();
    }
    else
    {
        req.flash('error', 'Passwords do not match!');
        res.redirect('back');
    }
};
exports.updatePassword = async(req, res)=>
{
     const user = await User.findOne(
        {resetPasswordToken: req.params.token, 
        resetPasswordExpires: {$gt: Date.now()} });
    
    if(!user)
    {
        req.flash('error',"Invalid reset token");
        return res.redirect('/login');
    }
    else
    {
        const setPassword = promisify(user.setPassword, user);
        await setPassword(req.body.password)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        const updatedUser = await user.save();
        await req.login(updatedUser);
        req.flash('success','Your password has been reset!');
        return res.redirect('/');
        
    }
};