const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const reviewSchema = new Schema({

rating: {type: Number,min:1, max:5}, 
text: {type:String, trim:true, required:'Please enter a review'},
created: {type: Date,default: Date.now},
author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: "You must supply an author"
    },
store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: "You must supply an store"
}
});

function autopopulate(next){
    this.populate('author');
    next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);