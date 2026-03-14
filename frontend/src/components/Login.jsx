import React from 'react';
import { Mail, Settings } from 'lucide-react';

const Login = ({ onOpenSetup }) => {
  const [isConfigured, setIsConfigured] = React.useState(true);

  React.useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`);
        const data = await res.json();
        if (!data.googleClientId || !data.googleClientSecret) {
          setIsConfigured(false);
        }
      } catch (err) {
        console.error('Failed to check config', err);
      }
    };
    checkConfig();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/url`);
      const data = await response.json();
      if (data.error) {
        alert(data.error + '. Please configure them in the Settings (use the Sidebar after bypass or check .env).');
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('Failed to get auth URL', err);
      alert('Failed to connect to backend server. Please ensure the backend is running on port 5000.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="card w-full max-w-md text-center space-y-8 py-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Mail size={40} className="text-white" />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold tracking-tight">MailRadar</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Real-time Gmail Intelligence Dashboard
          </p>
        </div>

        {!isConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-500 text-sm flex gap-3 items-center">
            <Settings className="shrink-0" size={18} />
            <p className="text-left font-medium">
              Google OAuth keys are not configured. You must set them up before you can sign in.
            </p>
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={!isConfigured}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all active:scale-[0.98] shadow-xl ${
            isConfigured 
            ? 'bg-white text-black hover:bg-gray-100' 
            : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
          }`}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className={`w-6 h-6 ${!isConfigured ? 'grayscale opacity-30' : ''}`} />
          Sign in with Google
        </button>

        <div className="pt-4 space-y-4">
          {!isConfigured ? (
            <button 
              onClick={onOpenSetup}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2"
            >
              <Settings size={20} />
              Initial Setup Required
            </button>
          ) : (
            <button 
              onClick={() => {
                const code = prompt("Enter Admin Access Code to reconfigure:");
                if (code === "admin123") { // Simple safeguard as requested
                  onOpenSetup();
                } else {
                  alert("Access Denied");
                }
              }}
              className="text-sm text-white/20 hover:text-accent flex items-center gap-2 mx-auto transition-colors"
            >
              <Settings size={14} />
              System Configuration
            </button>
          )}
          
          <p className="text-xs text-muted-foreground px-8 leading-relaxed">
            By signing in, you agree to connect your Gmail account via OAuth 2.0. We do not store your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
