import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, Bell, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/ride.service';
import Logo from '../assets/Logo';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatusBadge({ status }) {
  const colors = {
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    searching: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-blue-100 text-blue-700',
    started: 'bg-purple-100 text-purple-700',
  };
  return <span className={`status-badge ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentRides, setRecentRides] = useState([]);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    rideService.getRideHistory({ limit: 3 })
      .then((res) => setRecentRides(res.data.rides || []))
      .catch(() => {});
  }, []);

  const detectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); setDetectingLocation(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Simple reverse geocode using nominatim (no key needed)
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const d = await r.json();
          setPickup(d.display_name?.split(',').slice(0, 3).join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setDetectingLocation(false);
      },
      () => { toast.error('Could not detect location'); setDetectingLocation(false); }
    );
  };

  const handleBook = () => {
    if (!destination.trim()) { toast.error('Please enter a destination'); return; }
    navigate('/book', { state: { pickup, destination } });
  };

  const firstName = user?.name?.split(' ')[0] || 'Rider';

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={18} className="text-gray-600" />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-gray-500 text-sm">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-secondary">{firstName}! 👋</h1>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-secondary to-gray-800 rounded-2xl p-4 flex items-center justify-between overflow-hidden relative">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full"></div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={16} className="text-primary" fill="#FFC928" />
            <span className="text-primary font-bold text-xs uppercase tracking-wide">First Ride Offer</span>
          </div>
          <p className="text-white font-bold text-lg">FLAT ₹20 OFF</p>
          <p className="text-gray-400 text-xs mt-0.5">Use code: RIDEFIRST</p>
        </div>
        <div className="bg-primary rounded-xl px-3 py-2 text-center z-10">
          <span className="text-secondary font-bold text-sm">CLAIM</span>
        </div>
      </div>

      {/* Quick Book Card */}
      <div className="card mx-4 mt-4 shadow-sm">
        <h2 className="font-bold text-secondary mb-4 text-base">Book a Ride</h2>

        <div className="space-y-3">
          {/* Pickup */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-secondary flex-shrink-0"></div>
            <input
              className="flex-1 bg-transparent text-sm font-medium text-gray-700 placeholder-gray-400 outline-none"
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
            <button onClick={detectLocation} disabled={detectingLocation} className="text-xs text-primary font-semibold flex-shrink-0">
              {detectingLocation ? '...' : 'GPS'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 pl-1.5">
            <div className="flex flex-col gap-0.5 ml-0.5">
              <div className="w-0.5 h-1.5 bg-gray-300 rounded mx-auto"></div>
              <div className="w-0.5 h-1.5 bg-gray-300 rounded mx-auto"></div>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
            <MapPin size={14} className="text-red-500 flex-shrink-0" fill="#EF4444" />
            <input
              className="flex-1 bg-transparent text-sm font-medium text-gray-700 placeholder-gray-400 outline-none"
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleBook} className="btn-primary w-full mt-4 text-sm font-bold">
          🏍️ Book Bike →
        </button>
      </div>

      {/* Recent Rides */}
      {recentRides.length > 0 && (
        <div className="px-4 mt-5 mb-24">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-secondary text-sm">Recent Rides</h3>
            <button onClick={() => navigate('/history')} className="text-xs text-primary font-semibold flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentRides.map((ride) => (
              <div key={ride._id} className="card flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/tracking/${ride._id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Clock size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-secondary truncate max-w-[180px]">{ride.destinationAddress}</p>
                    <p className="text-xs text-gray-400 mt-0.5">₹{ride.estimatedFare} • {ride.distance}km</p>
                  </div>
                </div>
                <StatusBadge status={ride.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {recentRides.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center pb-24 mt-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🏍️</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">No rides yet</p>
          <p className="text-gray-400 text-xs mt-1">Book your first ride above!</p>
        </div>
      )}

      <BottomNav active="home" />
    </div>
  );
}

