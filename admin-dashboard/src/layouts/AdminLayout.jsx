import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Bike, MapPin, DollarSign, BarChart2, LogOut, Menu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Customers', path: '/customers', icon: <Users size={18} /> },
  { label: 'Riders', path: '/riders', icon: <Bike size={18} /> },
  { label: 'Rides', path: '/rides', icon: <MapPin size={18} /> },
  { label: 'Pricing', path: '/pricing', icon: <DollarSign size={18} /> },
  { label: 'Reports', path: '/reports', icon: <BarChart2 size={18} /> },
];

function SidebarView({ pathname, user, onNavigate, onLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #1F2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#FFC928', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} style={{ color: '#111111' }} />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>RIDEWALA</p>
            <p style={{ color: '#6B7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none',
                background: active ? '#FFC928' : 'transparent',
                color: active ? '#111111' : '#9CA3AF',
                fontWeight: active ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid #1F2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontSize: '0.875rem', fontWeight: 700 }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{user?.name || 'Admin'}</p>
            <p style={{ color: '#6B7280', fontSize: '0.65rem' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: 'none', background: 'transparent', color: '#EF4444', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: '240px', background: '#111827', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, zIndex: 40 }} className="hidden md:flex">
        <SidebarView pathname={pathname} user={user} onNavigate={(path) => { navigate(path); setSidebarOpen(false); }} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ width: '240px', background: '#111827', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <SidebarView pathname={pathname} user={user} onNavigate={(path) => { navigate(path); setSidebarOpen(false); }} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#374151' }} className="md:hidden">
              <Menu size={22} />
            </button>
            <h2 style={{ fontWeight: 700, color: '#111111', fontSize: '1rem' }}>
              {NAV_ITEMS.find((n) => n.path === pathname)?.label || 'Admin'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Live</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

