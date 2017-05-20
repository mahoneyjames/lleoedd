const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
    email: {
        type: String,
        unique:true,
        lowercase: true,
        trim: true, 
        validate: [validator.isEmail, 'Please enter a valid email address, idiot'],
        required: 'Please supply an email address'

    },
    name:{
        type:String,
        required: 'Please supply a name',
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date

});

userSchema.virtual('gravatar').get(function(){
    //return `https://pbs.twimg.com/profile_images/1990249248/image.jpg`;
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);