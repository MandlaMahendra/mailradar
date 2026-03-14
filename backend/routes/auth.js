const express = require('express');
const router = express.Router();
const { getAuthUrl, getTokens, getUserInfo } = require('../utils/googleAuth');
const User = require('../models/User');


// Get Auth URL
router.get('/url', async (req, res) => {
    try {
        console.log('Generating Auth URL...');
        const url = await getAuthUrl();
        console.log('Auth URL generated:', url);
        res.json({ url });
    } catch (err) {
        console.error('Error in /url route:', err);
        res.status(400).json({ error: err.message });
    }
});

// Handle Callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        console.log('Callback received with code:', code ? 'provided' : 'missing');
        const tokens = await getTokens(code);
        console.log('Tokens received');
        const userInfo = await getUserInfo(tokens.access_token);
        console.log('User info retrieved:', userInfo.email);

        // Save or update user in database
        await User.findOneAndUpdate(
            { email: userInfo.email },
            { 
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                lastLogin: new Date()
            },
            { upsert: true, returnDocument: 'after' }
        );
        
        // Redirect to frontend with tokens in URL
        const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?auth_success=true&access_token=${tokens.access_token}`;
        res.redirect(frontendUrl);

        
    } catch (err) {
        console.error('Callback error:', err);
        res.status(500).send('Authentication failed');
    }
});

module.exports = router;
