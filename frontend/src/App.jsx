import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import Settings from './components/Settings';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('gmail_token'));
  const [user, setUser] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem('gmail_token', accessToken);
      window.history.replaceState({}, document.title, "/");
    }

    if (token) {
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error('Failed to fetch user', err));
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('gmail_token');
    setShowSetup(false);
  };

  if (!token && !showSetup) {
    return <Login onOpenSetup={() => setShowSetup(true)} />;
  }

  if (showSetup && !token) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => setShowSetup(false)}
              className="mb-8 text-accent flex items-center gap-2 hover:underline"
            >
              ← Back to Login
            </button>
            <Settings />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard token={token} />;
      case 'emails': return <Inbox token={token} />;
      case 'analytics': return <Dashboard token={token} />;
      case 'settings': return <Settings />;
      default: return <Dashboard token={token} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
          user={user}
        />
        
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
