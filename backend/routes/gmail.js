const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getClient } = require('../utils/googleAuth');

// Fetch Inbox
router.get('/inbox', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const oauth2Client = await getClient();
        oauth2Client.setCredentials({ access_token: token });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 20,
            q: 'label:INBOX'
        });

        const messages = await Promise.all(
            (response.data.messages || []).map(async (msg) => {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id
                });
                
                const headers = detail.data.payload.headers;
                const getHeader = (name) => headers.find(h => h.name === name)?.value;

                return {
                    id: msg.id,
                    snippet: detail.data.snippet,
                    from: getHeader('From'),
                    subject: getHeader('Subject'),
                    date: getHeader('Date'),
                    body: detail.data.payload.parts ? 
                          Buffer.from(detail.data.payload.parts[0].body.data || '', 'base64').toString() : 
                          Buffer.from(detail.data.payload.body.data || '', 'base64').toString()
                };
            })
        );

        res.json(messages);
    } catch (err) {
        console.error('Fetch inbox error:', err);
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});

// Send Reply
router.post('/reply', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { to, subject, body, threadId } = req.body;
    
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const oauth2Client = await getClient();
        oauth2Client.setCredentials({ access_token: token });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        // Simple raw message format for Gmail API
        const str = [
            `To: ${to}`,
            `Subject: ${subject}`,
            "",
            body
        ].join("\n");

        const encodedMessage = Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
                threadId: threadId
            }
        });

        res.json({ message: 'Email sent successfully' });
    } catch (err) {
        console.error('Send reply error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;
