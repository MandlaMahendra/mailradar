const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getClient } = require('../utils/googleAuth');

// Fetch Inbox
router.get('/inbox', async (req, res) => {
    console.log('GET /inbox request received');
    const token = req.headers.authorization?.split(' ')[1];
    const { pageToken } = req.query;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const oauth2Client = await getClient();
        oauth2Client.setCredentials({ access_token: token });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const year = sixMonthsAgo.getFullYear();
        const month = String(sixMonthsAgo.getMonth() + 1).padStart(2, '0');
        const day = String(sixMonthsAgo.getDate()).padStart(2, '0');
        const dateQuery = `after:${year}/${month}/${day}`;
        console.log('Inbox Fetch - Date Query:', dateQuery);

        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 50,
            q: dateQuery,
            pageToken: pageToken
        });
        console.log('Inbox Fetch - Messages found:', response.data.messages?.length || 0);

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

        res.json({
            messages,
            nextPageToken: response.data.nextPageToken
        });
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

// Fetch Analytics
router.get('/analytics', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const oauth2Client = await getClient();
        oauth2Client.setCredentials({ access_token: token });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // 1. Get total count (from profile)
        const profile = await gmail.users.getProfile({ userId: 'me' });
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const year = sixMonthsAgo.getFullYear();
        const month = String(sixMonthsAgo.getMonth() + 1).padStart(2, '0');
        const day = String(sixMonthsAgo.getDate()).padStart(2, '0');
        const dateQuery = `after:${year}/${month}/${day}`;
        console.log('Analytics Fetch - Date Query:', dateQuery);

        // 2. Fetch recent messages for more detailed stats
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 500,
            q: dateQuery
        });

        const messages = await Promise.all(
            (response.data.messages || []).map(async (msg) => {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'metadata',
                    metadataHeaders: ['From', 'Subject', 'Date']
                });
                const headers = detail.data.payload.headers;
                return {
                    from: headers.find(h => h.name === 'From')?.value || 'Unknown',
                    subject: headers.find(h => h.name === 'Subject')?.value || '(No Subject)',
                    date: headers.find(h => h.name === 'Date')?.value
                };
            })
        );

        // 3. Process stats
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        const receivedToday = messages.filter(m => new Date(m.date).getTime() >= startOfDay).length;
        
        const senderCounts = {};
        messages.forEach(m => {
            const name = m.from.split('<')[0].trim().replace(/"/g, '') || m.from;
            senderCounts[name] = (senderCounts[name] || 0) + 1;
        });

        const topSenders = Object.entries(senderCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            total: profile.data.messagesTotal,
            receivedToday,
            topSenders,
            recent: messages.slice(0, 5),
            perKeyword: []
        });
    } catch (err) {
        console.error('Fetch analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
