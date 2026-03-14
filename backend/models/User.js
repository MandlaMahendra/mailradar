const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    picture: { type: String },
    lastLogin: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'email_scrape' });

module.exports = mongoose.model('User', UserSchema);
