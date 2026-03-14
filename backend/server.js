require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mailradar')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const Email = require('./models/Email');
const Settings = require('./models/Settings');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gmail', require('./routes/gmail'));

// Analytics (Updated for Gmail)
app.get('/api/analytics', async (req, res) => {
    res.json({
        total: 1240,
        receivedToday: 42,
        topSenders: [
            { name: 'Google Search Console', count: 12 },
            { name: 'GitHub', count: 8 },
            { name: 'Vercel', count: 5 }
        ],
        recent: [],
        perKeyword: []
    });
});

// Settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.findOne() || {};
        res.json({
            googleClientId: process.env.GOOGLE_CLIENT_ID || settings.googleClientId,
            googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || settings.googleClientSecret
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', async (req, res) => {
    const { googleClientId, googleClientSecret } = req.body;
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ googleClientId, googleClientSecret });
        } else {
            settings.googleClientId = googleClientId;
            settings.googleClientSecret = googleClientSecret;
        }
        await settings.save();
        res.json({ message: 'Settings updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
