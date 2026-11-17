import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    toast.success('Logged out');
  };

  const infoRows = [
    { label: 'Name', value: user?.name },
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phone },
    { label: 'Vehicle', value: user?.vehicleModel },
    { label: 'Reg Number', value: user?.vehicleRegNumber },
    { label: 'Status', value: user?.isApproved ? '✅ Approved' : '⏳ Pending Approval' },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ background: '#111111', paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '1.25rem', paddingRight: '1.25rem', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FFC928', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 0.75rem' }}>
          {user?.profilePhoto ? <img src={user.profilePhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🧑'}
        </div>
        <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>{user?.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>
          <Star size={14} style={{ color: '#FFC928' }} fill="#FFC928" />
          <span style={{ color: '#D1D5DB', fontSize: '0.875rem' }}>{user?.rating?.toFixed(1) || '5.0'} • {user?.totalRides || 0} rides</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1rem', paddingBottom: '5rem' }}>
        {/* Info card */}
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          {infoRows.map((r, i) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: i > 0 ? '0.75rem' : 0, paddingBottom: i < infoRows.length - 1 ? '0.75rem' : 0, borderBottom: i < infoRows.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{r.label}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111111' }}>{r.value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          {[{ label: '🏍️ My Earnings', path: '/earnings' }, { label: '❓ Help & Support', path: null }].map((item) => (
            <button key={item.label} onClick={() => item.path && navigate(item.path)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111111' }}>{item.label}</span>
              <ChevronRight size={16} style={{ color: '#D1D5DB' }} />
            </button>
          ))}
        </div>

        <button onClick={handleLogout} style={{ width: '100%', padding: '0.875rem', border: '2px solid #EF4444', borderRadius: '9999px', background: 'transparent', color: '#EF4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #F3F4F6', display: 'flex' }}>
        {[{ label: 'Dashboard', path: '/', icon: '🏠' }, { label: 'Earnings', path: '/earnings', icon: '💰' }, { label: 'Profile', path: '/profile', icon: '👤', active: true }].map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', border: 'none', background: tab.active ? '#FFF9E6' : 'transparent', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: tab.active ? '#FFC928' : '#9CA3AF' }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

