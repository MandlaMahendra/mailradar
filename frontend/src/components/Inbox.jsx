import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, X, Loader2, RefreshCw } from 'lucide-react';

const Inbox = ({ token }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [reply, setReply] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) fetchEmails();
  }, [token]);

  const fetchEmails = async () => {
    setLoading(true);
    setNextPageToken(null);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gmail/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(res.data.messages || []);
      setNextPageToken(res.data.nextPageToken);
    } catch (err) {
      console.error('Failed to fetch emails', err);
      setError('Connection Failed: Could not reach backend. If you are on mobile, ensure VITE_API_URL is set to your computer\'s local IP.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEmails = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gmail/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { pageToken: nextPageToken }
      });
      setEmails(prev => [...prev, ...(res.data.messages || [])]);
      setNextPageToken(res.data.nextPageToken);
    } catch (err) {
      console.error('Failed to load more emails', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const query = searchQuery.toLowerCase();
    return (
      (email.from || '').toLowerCase().includes(query) ||
      (email.subject || '').toLowerCase().includes(query) ||
      (email.snippet || '').toLowerCase().includes(query)
    );
  });

  const handleSend = async () => {
    setSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/gmail/reply`, {
        to: selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from,
        subject: `Re: ${selectedEmail.subject}`,
        body: reply.body,
        threadId: selectedEmail.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEmail(null);
      setIsReplyMode(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gmail Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">Showing {filteredEmails.length} messages</p>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="input-field w-full !pl-10 pr-10 bg-white/5 border-white/10 focus:border-accent/50 focus:bg-white/10 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={fetchEmails} 
            disabled={loading}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-white/10 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-accent' : ''} />
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden border-white/5 shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground space-y-4">
            <Loader2 className="animate-spin mx-auto text-accent" size={32} />
            <p className="animate-pulse">Scanning your inbox...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-accent bg-accent/5 rounded-xl border border-accent/20 m-6">
            <RefreshCw size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold text-lg mb-2">{error}</p>
            <button onClick={fetchEmails} className="btn-primary mt-2">Retry Connection</button>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">From</th>
                    <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Subject / Snippet</th>
                    <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider text-center">Date</th>
                    <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEmails.map((email) => (
                    <tr 
                      key={email?.id || Math.random()} 
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedEmail(email);
                        setIsReplyMode(false);
                      }}
                    >
                      <td className="px-6 py-4 text-sm font-medium max-w-[200px] truncate">{email?.from || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-semibold text-white truncate max-w-md group-hover:text-accent transition-colors">
                          {email?.subject || '(No Subject)'}
                        </p>
                        <p className="text-muted-foreground truncate max-w-md text-xs mt-1">{email?.snippet}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap text-center">
                        {email?.date ? new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmail(email);
                            setIsReplyMode(true);
                            setReply({ subject: `Re: ${email.subject}`, body: '' });
                          }}
                          className="p-2.5 rounded-xl hover:bg-accent/20 text-accent opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                          title="Reply"
                        >
                          <Send size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/10">
              {filteredEmails.map((email) => (
                <div 
                  key={email?.id || Math.random()} 
                  className="p-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors space-y-3 cursor-pointer"
                  onClick={() => {
                    setSelectedEmail(email);
                    setIsReplyMode(false);
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-accent truncate">{email?.from || 'Unknown'}</p>
                      <p className="text-sm font-bold text-white mt-1 leading-tight">{email?.subject || '(No Subject)'}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-white/5 px-2 py-1 rounded-md">
                      {email?.date ? new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '-'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{email?.snippet}</p>
                  <div className="flex justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmail(email);
                        setIsReplyMode(true);
                        setReply({ subject: `Re: ${email.subject}`, body: '' });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent text-xs font-bold active:scale-95 transition-all"
                    >
                      <Send size={14} />
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredEmails.length === 0 && !loading && (
              <div className="px-6 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-3">
                  <Search size={32} className="opacity-20" />
                  <p>{searchQuery ? `No emails matching "${searchQuery}"` : "Your inbox is empty or we couldn't fetch messages."}</p>
                </div>
              </div>
            )}

            {nextPageToken && (
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-center">
                <button 
                  onClick={loadMoreEmails}
                  disabled={loadingMore}
                  className="btn-primary w-full max-w-xs flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      <span>Load More Emails</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
      )}
    </div>

      {/* Unified Read/Reply Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="card w-full h-full md:h-auto md:max-w-3xl md:max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl border-white/10 ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                  {(selectedEmail.from || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm md:text-lg font-bold truncate max-w-[200px] md:max-w-md">{selectedEmail.subject}</h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{selectedEmail.from}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmail(null)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Content Toggle Header */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsReplyMode(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isReplyMode ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                >
                  Read Message
                </button>
                <button 
                  onClick={() => {
                    setIsReplyMode(true);
                    if (!reply.subject) setReply({ subject: `Re: ${selectedEmail.subject}`, body: '' });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isReplyMode ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-white'}`}
                >
                  Write Reply
                </button>
              </div>

              {!isReplyMode ? (
                /* Read View */
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5 text-sm leading-relaxed whitespace-pre-wrap font-sans min-h-[200px]">
                    {selectedEmail.body || selectedEmail.snippet}
                  </div>
                  <button 
                    onClick={() => setIsReplyMode(true)}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                  >
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    Reply to this message
                  </button>
                </div>
              ) : (
                /* Reply View */
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <textarea 
                    className="input-field w-full h-64 resize-none font-sans bg-white/5 p-4 border-white/10 focus:border-accent/50 transition-all text-sm leading-relaxed"
                    value={reply.body}
                    onChange={(e) => setReply({ ...reply, body: e.target.value })}
                    placeholder="Type your reply here..."
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsReplyMode(false)}
                      className="flex-1 py-4 px-6 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2"
                      onClick={handleSend}
                      disabled={sending || !reply.body}
                    >
                      {sending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Send Reply</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Footer info */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 text-[10px] text-center text-muted-foreground uppercase tracking-widest">
              MailRadar Secure Intelligence Protocol
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
