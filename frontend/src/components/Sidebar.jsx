import React from 'react';
import { LayoutDashboard, Search, Mail, BarChart3, Settings as SettingsIcon, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const adminEmail = 'mandlamahendravalmiki@gmail.com';
  const isAdmin = user?.email === adminEmail;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'emails', icon: Mail, label: 'Inbox' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    ...(isAdmin ? [{ id: 'settings', icon: SettingsIcon, label: 'Settings' }] : []),
  ];

  return (
    <div className="w-64 h-screen border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-4 py-8 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
          MR
        </div>
        <span className="font-bold text-xl tracking-tight">MailRadar</span>
      </div>

      <div className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-item group ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon size={20} className={`${activeTab === item.id ? 'text-white' : 'text-muted-foreground group-hover:text-white'} transition-colors`} />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 space-y-4 border-t border-white/10">
        {user && (
          <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-white/20" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        <div 
          onClick={onLogout}
          className="sidebar-item text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
