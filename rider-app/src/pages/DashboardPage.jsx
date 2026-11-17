import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { rideService } from '../services/ride.service';
import toast from 'react-hot-toast';

function RideRequestModal({ request, onAccept, onReject, accepting }) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft <= 0) {
      onReject();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, onReject]);

  const pct = (timeLeft / 30) * 100;
  const r = 28, circ = 2 * Math.PI * r;

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
      <div style={{background:'white', borderRadius:'1.5rem 1.5rem 0 0', width:'100%', maxWidth:'480px', padding:'1.5rem', paddingBottom:'2rem'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem'}}>
          <h3 style={{fontSize:'1.125rem', fontWeight:700, color:'#111111'}}>🏍️ New Ride Request!</h3>
          {/* Countdown circle */}
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} fill="none" stroke="#F3F4F6" strokeWidth="4"/>
            <circle cx="32" cy="32" r={r} fill="none" stroke="#FFC928" strokeWidth="4"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)}
              strokeLinecap="round" transform="rotate(-90 32 32)" style={{transition:'stroke-dashoffset 0.9s linear'}}/>
            <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill="#111111">{timeLeft}s</text>
          </svg>
        </div>

        <div style={{background:'#F9FAFB', borderRadius:'0.75rem', padding:'0.75rem', marginBottom:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
            <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#FFC928', border:'2px solid #111', marginTop:'4px', flexShrink:0}}></div>
            <div>
              <p style={{fontSize:'0.7rem', color:'#9CA3AF'}}>Pickup</p>
              <p style={{fontSize:'0.875rem', fontWeight:600, color:'#111111'}}>{request.pickup?.address}</p>
            </div>
          </div>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
            <MapPin size={12} style={{color:'#EF4444', marginTop:'4px', flexShrink:0}} />
            <div>
              <p style={{fontSize:'0.7rem', color:'#9CA3AF'}}>Destination</p>
              <p style={{fontSize:'0.875rem', fontWeight:600, color:'#111111'}}>{request.destination?.address}</p>
            </div>
          </div>
        </div>

        <div style={{display:'flex', gap:'0.75rem', marginBottom:'1rem'}}>
          <div style={{flex:1, background:'#FFF9E6', borderRadius:'0.75rem', padding:'0.75rem', textAlign:'center'}}>
            <p style={{fontSize:'0.7rem', color:'#9CA3AF'}}>Distance</p>
            <p style={{fontSize:'1rem', fontWeight:700}}>{request.distance} km</p>
          </div>
          <div style={{flex:1, background:'#FFF9E6', borderRadius:'0.75rem', padding:'0.75rem', textAlign:'center'}}>
            <p style={{fontSize:'0.7rem', color:'#9CA3AF'}}>Fare</p>
            <p style={{fontSize:'1rem', fontWeight:700, color:'#16A34A'}}>₹{request.estimatedFare}</p>
          </div>
        </div>

        <div style={{display:'flex', gap:'0.75rem'}}>
          <button onClick={onReject} style={{flex:1, padding:'0.875rem', border:'2px solid #EF4444', borderRadius:'9999px', color:'#EF4444', fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'}}>
            <X size={18} /> Reject
          </button>
          <button onClick={onAccept} disabled={accepting} className="btn-primary" style={{flex:2, fontSize:'0.875rem'}}>
            {accepting ? <Loader2 size={18} style={{marginRight:'0.5rem'}} /> : <CheckCircle size={18} style={{marginRight:'0.5rem'}} />}
            {accepting ? 'Accepting...' : 'Accept Ride'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [recentRides, setRecentRides] = useState([]);
  const [earnings, setEarnings] = useState({ today: 0, total: 0 });
  const locationInterval = useRef(null);

  useEffect(() => {
    rideService.getRideHistory({ limit: 5 }).then((r) => setRecentRides(r.data.rides || [])).catch(() => {});
    rideService.getEarnings('daily').then((r) => setEarnings(r.data)).catch(() => {});
  }, []);

  // Listen for new ride requests
  useEffect(() => {
    if (!socket) return;
    const onRequest = (data) => setRideRequest(data);
    const onNoLongerAvailable = (data) => {
      if (rideRequest && rideRequest.rideId?.toString() === data.rideId?.toString()) {
        setRideRequest(null);
        toast('Ride no longer available', { icon: '❌' });
      }
    };
    socket.on('new-ride-request', onRequest);
    socket.on('ride-no-longer-available', onNoLongerAvailable);
    return () => { socket.off('new-ride-request', onRequest); socket.off('ride-no-longer-available', onNoLongerAvailable); };
  }, [socket, rideRequest]);

  const sendLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      rideService.updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
    });
  };

  const handleToggle = async () => {
    if (!isOnline) {
      // Request location permission first
      if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
      navigator.geolocation.getCurrentPosition(
        async () => {
          setToggling(true);
          try {
            await rideService.toggleAvailability(true);
            setIsOnline(true);
            locationInterval.current = setInterval(sendLocation, 10000);
            sendLocation();
            toast.success('You are now ONLINE! 🟢');
          } catch { toast.error('Could not go online'); }
          finally { setToggling(false); }
        },
        () => toast.error('Location permission required to go online')
      );
    } else {
      setToggling(true);
      try {
        await rideService.toggleAvailability(false);
        setIsOnline(false);
        clearInterval(locationInterval.current);
        toast('You are now OFFLINE', { icon: '🔴' });
      } catch { toast.error('Could not go offline'); }
      finally { setToggling(false); }
    }
  };

  useEffect(() => () => clearInterval(locationInterval.current), []);

  const handleAccept = async () => {
    if (!rideRequest) return;
    setAccepting(true);
    try {
      await rideService.acceptRide(rideRequest.rideId);
      toast.success('Ride accepted!');
      setRideRequest(null);
      navigate(`/active/${rideRequest.rideId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept ride');
      setRideRequest(null);
    } finally { setAccepting(false); }
  };

  return (
    <div className="app-container flex flex-col min-h-screen" style={{background:'#F9FAFB'}}>
      {rideRequest && (
        <RideRequestModal
          request={rideRequest}
          accepting={accepting}
          onAccept={handleAccept}
          onReject={() => { setRideRequest(null); toast('Ride rejected', { icon: '👋' }); }}
        />
      )}

      {/* Header */}
      <div style={{background:'#111111', paddingTop:'2.5rem', paddingBottom:'1rem', paddingLeft:'1.25rem', paddingRight:'1.25rem'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem'}}>
          <div>
            <p style={{color:'#9CA3AF', fontSize:'0.75rem'}}>Welcome back,</p>
            <h2 style={{color:'white', fontWeight:700, fontSize:'1.125rem'}}>{user?.name?.split(' ')[0]} 👋</h2>
          </div>
          <div style={{background: isOnline ? '#16A34A' : '#374151', borderRadius:'9999px', padding:'0.25rem 0.75rem', display:'flex', alignItems:'center', gap:'0.375rem'}}>
            <div style={{width:'8px', height:'8px', borderRadius:'50%', background: isOnline ? '#86EFAC' : '#9CA3AF'}}></div>
            <span style={{color:'white', fontSize:'0.75rem', fontWeight:600}}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Online toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          style={{
            width:'100%', padding:'1rem', borderRadius:'1rem', border:'none', cursor:'pointer',
            background: isOnline ? '#16A34A' : '#FFC928',
            color: isOnline ? 'white' : '#111111',
            fontWeight:700, fontSize:'1rem',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem',
            transition:'all 0.3s',
          }}
        >
          {toggling ? <Loader2 size={20} style={{animation:'spin 1s linear infinite'}} /> : null}
          {toggling ? 'Please wait...' : isOnline ? '🟢 TAP TO GO OFFLINE' : '🔴 TAP TO GO ONLINE'}
        </button>
      </div>

      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', padding:'1rem', paddingBottom:'0'}}>
        {[
          { label: "Today's Earnings", value: `₹${earnings.todayEarnings || 0}`, icon: '💰', bg: '#FFF9E6' },
          { label: 'Total Rides', value: user?.totalRides || 0, icon: '🏍️', bg: '#EFF6FF' },
          { label: 'Rating', value: user?.rating?.toFixed(1) || '5.0', icon: '⭐', bg: '#F0FFF4' },
        ].map((s) => (
          <div key={s.label} style={{background:s.bg, borderRadius:'0.75rem', padding:'0.75rem', textAlign:'center'}}>
            <span style={{fontSize:'1.25rem'}}>{s.icon}</span>
            <p style={{fontWeight:700, fontSize:'1.125rem', color:'#111111', marginTop:'0.25rem'}}>{s.value}</p>
            <p style={{fontSize:'0.65rem', color:'#9CA3AF', marginTop:'0.125rem'}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Rides */}
      <div style={{padding:'1rem', flex:1}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem'}}>
          <h3 style={{fontWeight:700, fontSize:'0.875rem', color:'#111111'}}>Recent Rides</h3>
          <button onClick={() => navigate('/earnings')} style={{fontSize:'0.75rem', color:'#FFC928', fontWeight:600}}>Earnings →</button>
        </div>
        {recentRides.length === 0 ? (
          <div style={{textAlign:'center', padding:'2rem', color:'#9CA3AF'}}>
            <span style={{fontSize:'2.5rem', display:'block', marginBottom:'0.75rem'}}>🏍️</span>
            <p style={{fontSize:'0.875rem'}}>No rides yet</p>
            <p style={{fontSize:'0.75rem'}}>Go online to start receiving ride requests!</p>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
            {recentRides.map((r) => (
              <div key={r._id} className="card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <p style={{fontWeight:600, fontSize:'0.875rem', color:'#111'}}>{r.destinationAddress?.split(',')[0]}</p>
                    <p style={{fontSize:'0.75rem', color:'#9CA3AF'}}>{r.distance}km • {new Date(r.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{fontWeight:700, color:'#16A34A'}}>₹{r.actualFare || r.estimatedFare}</p>
                    <p style={{fontSize:'0.65rem', color:'#9CA3AF'}}>{r.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'480px', background:'white', borderTop:'1px solid #F3F4F6', display:'flex'}}>
        {[
          { label: 'Dashboard', path: '/', icon: '🏠' },
          { label: 'Earnings', path: '/earnings', icon: '💰' },
          { label: 'Profile', path: '/profile', icon: '👤' },
        ].map((tab) => (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{flex:1, padding:'0.75rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.25rem', border:'none', background:'transparent', cursor:'pointer'}}>
            <span style={{fontSize:'1.25rem'}}>{tab.icon}</span>
            <span style={{fontSize:'0.65rem', fontWeight:600, color:'#9CA3AF'}}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

