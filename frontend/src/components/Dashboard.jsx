import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail, Search, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    total: 0,
    receivedToday: 0,
    topSenders: [],
    perKeyword: [],
    recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data || {});
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats.total) {
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse">
        <Mail className="mx-auto mb-4 opacity-20" size={48} />
        <p>Analyzing your intelligence data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Intelligence Dashboard</h1>
        <p className="text-muted-foreground mt-2">Real-time overview of your email collection and status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Messages', value: stats?.total || 0, icon: Mail, color: 'text-blue-500' },
          { label: 'Received Today', value: stats?.receivedToday || 0, icon: Clock, color: 'text-green-500' },
          { label: 'Active Threads', value: (stats?.recent || []).length, icon: CheckCircle, color: 'text-yellow-500' },
          { label: 'Top Senders', value: (stats?.topSenders || []).length, icon: Search, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Senders Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Top Senders</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topSenders || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Recent Inbound</h3>
          <div className="space-y-4">
            {(stats?.recent || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                    {(item?.from || 'U')[0].toUpperCase()}
                  </div>
                  <div className="max-w-[200px] truncate">
                    <p className="font-medium text-sm truncate">{item?.from || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{item?.subject || 'No Subject'}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {item?.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            ))}
            {(!stats?.recent || stats.recent.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No recent activity detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
