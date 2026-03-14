const { google } = require('googleapis');

const getClient = async () => {
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    
    const clientId = process.env.GOOGLE_CLIENT_ID || settings?.googleClientId;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || settings?.googleClientSecret;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/callback';

    if (!clientId || !clientSecret) {
        throw new Error('Google OAuth Credentials not configured');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

const getAuthUrl = async () => {
    const client = await getClient();
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });
};

const getTokens = async (code) => {
    const client = await getClient();
    const { tokens } = await client.getToken(code);
    return tokens;
};

const getUserInfo = async (accessToken) => {
    const client = await getClient();
    client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data } = await oauth2.userinfo.get();
    return data;
};

module.exports = {
    getClient,
    getAuthUrl,
    getTokens,
    getUserInfo,
};
