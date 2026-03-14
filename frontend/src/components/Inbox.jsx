import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, X, Loader2, RefreshCw } from 'lucide-react';

const Inbox = ({ token }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [reply, setReply] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (token) fetchEmails();
  }, [token]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://mailradar.onrender.com/api/gmail/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(res.data || []);
    } catch (err) {
      console.error('Failed to fetch emails', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await axios.post('https://mailradar.onrender.com/api/gmail/reply', {
        to: selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from,
        subject: `Re: ${selectedEmail.subject}`,
        body: reply.body,
        threadId: selectedEmail.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEmail(null);
      setReply({ subject: '', body: '' });
      alert('Reply sent!');
    } catch (err) {
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gmail Inbox</h1>
        <button 
          onClick={fetchEmails} 
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin text-accent' : ''} />
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground space-y-4">
            <Loader2 className="animate-spin mx-auto" size={32} />
            <p>Scanning your inbox...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 font-semibold text-sm">From</th>
                <th className="px-6 py-4 font-semibold text-sm">Subject / Snippet</th>
                <th className="px-6 py-4 font-semibold text-sm">Date</th>
                <th className="px-6 py-4 font-semibold text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(emails || []).map((email) => (
                <tr key={email?.id || Math.random()} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium max-w-[200px] truncate">{email?.from || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-semibold text-white truncate max-w-md">{email?.subject || '(No Subject)'}</p>
                    <p className="text-muted-foreground truncate max-w-md text-xs mt-1">{email?.snippet}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {email?.date ? new Date(email.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedEmail(email);
                        setReply({ subject: `Re: ${email.subject}`, body: '' });
                      }}
                      className="p-2 rounded-lg hover:bg-accent/10 text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Send size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!emails || emails.length === 0) && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                    Your inbox is empty or we couldn't fetch messages.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reply Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card w-full max-w-2xl space-y-6 relative border-accent/20">
            <button onClick={() => setSelectedEmail(null)} className="absolute right-4 top-4 p-2 hover:bg-white/5 rounded-full">
              <X size={20} />
            </button>
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold pr-12">Reply to {selectedEmail.from}</h2>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-sm max-h-48 overflow-y-auto">
                <p className="font-bold border-b border-white/10 pb-2 mb-2">{selectedEmail.subject}</p>
                <p className="whitespace-pre-wrap text-muted-foreground">{selectedEmail.body}</p>
              </div>
              
              <div className="space-y-4">
                <textarea 
                  className="input-field w-full h-40 resize-none font-sans"
                  value={reply.body}
                  onChange={(e) => setReply({ ...reply, body: e.target.value })}
                  placeholder="Type your reply here..."
                />
                <button 
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                  onClick={handleSend}
                  disabled={sending || !reply.body}
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Send Reply</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
