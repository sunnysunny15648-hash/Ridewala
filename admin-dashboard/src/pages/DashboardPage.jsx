import React, { useState, useEffect } from 'react';
import { Users, Bike, MapPin, TrendingUp, AlertCircle, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'white', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {React.cloneElement(icon, { size: 22, style: { color } })}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111111', lineHeight: 1.2, marginTop: '0.125rem' }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => { setStats(data.stats); setDailyRevenue(data.dailyRevenue || []); })
      .catch(() => toast.error('Could not load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const pieData = [
    { name: 'Completed', value: stats?.completedRides || 0, color: '#10B981' },
    { name: 'Cancelled', value: stats?.cancelledRides || 0, color: '#EF4444' },
    { name: 'Active', value: stats?.activeRides || 0, color: '#FFC928' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid #FFC928', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111111' }}>Dashboard Overview</h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Welcome back! Here's what's happening with RideWala.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard icon={<Users />} label="Total Customers" value={stats?.totalCustomers?.toLocaleString()} color="#3B82F6" />
        <StatCard icon={<Bike />} label="Total Riders" value={stats?.totalRiders?.toLocaleString()} color="#8B5CF6" sub={`${stats?.approvedRiders} approved, ${stats?.pendingRiders} pending`} />
        <StatCard icon={<MapPin />} label="Active Rides" value={stats?.activeRides} color="#F59E0B" />
        <StatCard icon={<CheckCircle />} label="Completed Rides" value={stats?.completedRides?.toLocaleString()} color="#10B981" />
        <StatCard icon={<XCircle />} label="Cancelled Rides" value={stats?.cancelledRides} color="#EF4444" />
        <StatCard icon={<DollarSign />} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} color="#059669" sub={`₹${(stats?.totalCommission || 0).toLocaleString('en-IN')} commission`} />
        <StatCard icon={<AlertCircle />} label="Pending Approvals" value={stats?.pendingRiders} color="#F97316" sub="Riders awaiting review" />
        <StatCard icon={<TrendingUp />} label="Platform Commission" value={`₹${(stats?.totalCommission || 0).toLocaleString('en-IN')}`} color="#6366F1" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        {/* Revenue line chart */}
        <div style={{ background: 'white', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111111', marginBottom: '1rem' }}>Revenue — Last 7 Days</h3>
          {dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyRevenue}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#FFC928" strokeWidth={2.5} dot={{ fill: '#FFC928' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>No revenue data yet</div>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ background: 'white', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111111', marginBottom: '1rem' }}>Ride Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.75rem' }}>
            {pieData.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></div>
                <span style={{ color: '#6B7280' }}>{d.name}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#111111' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

