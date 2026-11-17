import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, LogOut, ChevronRight, MapPin, Star, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/ride.service';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await profileService.updateProfile(form);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    toast.success('Logged out');
  };

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-10 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-secondary text-lg">Profile</h1>
        <div className="flex-1"></div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm text-primary font-semibold">Edit</button>
        )}
      </div>

      <div className="flex-1 px-4 pb-24">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white shadow-md">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={36} className="text-secondary" />
            )}
          </div>
          <h2 className="font-bold text-secondary mt-3 text-lg">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        {/* Edit form or info */}
        <div className="card mb-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                <input className="input-field text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input className="input-field text-sm" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input className="input-field text-sm" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditing(false)} className="flex-1 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-500">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2 text-sm">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: <User size={16} className="text-gray-400" />, label: 'Name', value: user?.name },
                { icon: <Phone size={16} className="text-gray-400" />, label: 'Phone', value: user?.phone },
                { icon: <Mail size={16} className="text-gray-400" />, label: 'Email', value: user?.email },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-secondary">{item.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu items */}
        <div className="card mb-4">
          {[
            { icon: <Star size={16} className="text-primary" />, label: 'My Ratings', action: () => {} },
            { icon: <MapPin size={16} className="text-primary" />, label: 'Saved Addresses', action: () => {} },
            { icon: <HelpCircle size={16} className="text-primary" />, label: 'Help & Support', action: () => {} },
          ].map((item) => (
            <button key={item.label} onClick={item.action} className="w-full flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium text-secondary">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full py-3 border-2 border-red-400 text-red-500 rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

