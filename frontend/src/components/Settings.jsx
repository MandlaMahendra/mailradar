import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Shield, Key, Mail } from 'lucide-react';

const Settings = () => {
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`);
        if (res.data) {
          setGoogleClientId(res.data.googleClientId || '');
          setGoogleClientSecret(res.data.googleClientSecret || '');
          // If keys already exist, lock them by default
          if (res.data.googleClientId && res.data.googleClientSecret) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/settings`, { googleClientId, googleClientSecret });
      setSaved(true);
      setIsLocked(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your API keys and service configurations.</p>
      </div>

      <div className="card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Google OAuth Configuration</h3>
              <p className="text-sm text-muted-foreground">Required for Gmail API authentication.</p>
            </div>
          </div>
          {isLocked && (
            <button 
              onClick={() => setIsLocked(false)}
              className="text-xs font-bold text-accent hover:underline uppercase tracking-wider"
            >
              Unlock to Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Google Client ID</label>
            <input 
              type={isLocked ? "password" : "text"} 
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com" 
              className={`input-field w-full ${isLocked ? 'opacity-50 cursor-not-allowed bg-white/5' : ''}`}
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              disabled={isLocked}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Google Client Secret</label>
            <input 
              type="password" 
              placeholder="••••••••••••••••" 
              className={`input-field w-full ${isLocked ? 'opacity-50 cursor-not-allowed bg-white/5' : ''}`}
              value={googleClientSecret}
              onChange={(e) => setGoogleClientSecret(e.target.value)}
              disabled={isLocked}
            />
          </div>
        </div>

        {!isLocked && (
          <>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Shield size={16} className="text-accent" />
                Quick Setup Guide
              </p>
              <ol className="text-xs text-muted-foreground list-decimal ml-4 space-y-1">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-accent hover:underline">Google Cloud Console</a>.</li>
                <li>Create a project and enable the <strong>Gmail API</strong>.</li>
                <li>In "Credentials", create an <strong>OAuth Client ID</strong> (Web App).</li>
                <li>Add <code>https://mailradar.onrender.com/api/auth/callback</code> to "Authorized redirect URIs".</li>
                <li>Copy and paste the ID and Secret below.</li>
              </ol>
            </div>

            <button 
              className="btn-primary flex items-center gap-2"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              {!loading && !saved && <Save size={18} />}
            </button>
          </>
        )}
      </div>

      <div className="card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-semibold">SMTP Settings</h3>
            <p className="text-sm text-muted-foreground">Configure your email provider for sending replies.</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground italic text-center py-4 bg-white/5 rounded-lg border border-dashed border-white/10">
          SMTP configuration is currently managed via background environment variables for security.
        </p>
      </div>
    </div>
  );
};

export default Settings;
