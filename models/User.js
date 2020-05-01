const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

require('dotenv').config();

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    dateAdded: {
        type: Date,
        default: Date.now
    },
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);