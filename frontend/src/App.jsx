import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import Settings from './components/Settings';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { Menu } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('gmail_token'));
  const [user, setUser] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      .then(res => {
        if (!res.ok) {
          handleLogout();
          throw new Error('Token invalid or expired');
        }
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error('Failed to fetch user', err);
        handleLogout();
      });
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
      <div className="flex min-h-screen bg-black text-white relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
          user={user}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <main className={`flex-1 transition-all duration-300 ${token ? 'lg:ml-64' : ''} p-4 md:p-8`}>
          {token && (
            <div className="lg:hidden flex items-center justify-between mb-6 p-2 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">MR</div>
                <span className="font-bold text-sm">MailRadar</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-muted-foreground hover:text-white"
              >
                <Menu size={24} />
              </button>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
