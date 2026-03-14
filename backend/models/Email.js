const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    sourceWebsite: { type: String },
    company: { type: String },
    domain: { type: String },
    scrapedDate: { type: Date, default: Date.now },
    keyword: { type: String },
    status: { type: String, enum: ['contacted', 'not contacted'], default: 'not contacted' },
    replies: [{
        subject: String,
        body: String,
        sentAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Email', EmailSchema);
