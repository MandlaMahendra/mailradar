const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    scraperApiKey: { type: String },
    googleClientId: { type: String },
    googleClientSecret: { type: String },
    smtpConfig: {
        host: String,
        port: Number,
        user: String,
        pass: String
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);
