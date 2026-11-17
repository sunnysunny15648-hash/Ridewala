import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { rideService } from '../services/ride.service';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const STATUS_ACTIONS = {
  assigned: { label: "I'm Arriving", next: 'arriving', color: '#3B82F6' },
  arriving: { label: "I've Arrived", next: 'arrived', color: '#8B5CF6' },
  arrived: { label: 'Start Ride', next: 'started', color: '#FFC928', textColor: '#111' },
  started: { label: 'Complete Ride ✓', next: 'completed', color: '#16A34A' },
};

export default function ActiveRidePage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const locationInterval = useRef(null);

  const fetchRide = useCallback(async () => {
    try {
      const res = await api.get(`/rides/${rideId}`);
      setRide(res.data.ride);
    } catch {
      toast.error('Could not load ride');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  // Start location sharing when ride is active
  useEffect(() => {
    const rideStatus = ride?.status;
    if (!rideStatus || !['arriving', 'arrived', 'started'].includes(rideStatus)) {
      clearInterval(locationInterval.current);
      return;
    }
    const shareLocation = () => {
      navigator.geolocation?.getCurrentPosition((pos) => {
        rideService.updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
        socket?.emit('rider-location-update', { rideId, lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    };
    shareLocation();
    locationInterval.current = setInterval(shareLocation, 5000);
    return () => clearInterval(locationInterval.current);
  }, [ride?.status, rideId, socket]);

  const handleAction = async () => {
    const action = STATUS_ACTIONS[ride?.status];
    if (!action) return;
    setUpdating(true);
    try {
      await rideService.updateStatus(rideId, action.next);
      setRide((r) => ({ ...r, status: action.next }));
      toast.success(`Status updated: ${action.next}`);
      if (action.next === 'completed') {
        clearInterval(locationInterval.current);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!['assigned', 'arriving'].includes(ride?.status)) return;
    setUpdating(true);
    try {
      await rideService.cancelRide(rideId, 'Cancelled by rider');
      toast('Ride cancelled', { icon: '❌' });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Loader2 size={40} style={{ color: '#FFC928', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const action = STATUS_ACTIONS[ride?.status];
  const customer = ride?.customerId;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ background: '#111111', paddingTop: '2.5rem', paddingBottom: '1rem', paddingLeft: '1.25rem', paddingRight: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => navigate('/')} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#333', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Active Ride</h1>
          <p style={{ color: '#FFC928', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{ride?.status || 'Loading...'}</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '5rem' }}>
        {/* Customer card */}
        {customer && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF9E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#111111' }}>{customer.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Customer</p>
            </div>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFC928', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={16} style={{ color: '#111111' }} />
              </a>
            )}
          </div>
        )}

        {/* Route info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFC928', border: '2px solid #111', marginTop: '4px', flexShrink: 0 }}></div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Pickup</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111111' }}>{ride?.pickupAddress}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <MapPin size={12} style={{ color: '#EF4444', marginTop: '4px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Destination</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111111' }}>{ride?.destinationAddress}</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{ride?.distance} km • ~{ride?.duration} min</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111111' }}>₹{ride?.estimatedFare}</span>
          </div>
        </div>

        {/* Status complete */}
        {ride?.status === 'completed' && (
          <div style={{ background: '#F0FFF4', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
            <CheckCircle size={40} style={{ color: '#16A34A', margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 700, color: '#16A34A', fontSize: '1.125rem' }}>Ride Completed!</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>You earned ₹{ride?.estimatedFare}</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.5rem' }}>Returning to dashboard...</p>
          </div>
        )}

        {ride?.status === 'cancelled' && (
          <div style={{ background: '#FFF1F2', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
            <XCircle size={40} style={{ color: '#EF4444', margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 700, color: '#EF4444' }}>Ride Cancelled</p>
          </div>
        )}
      </div>

      {/* Action button */}
      {action && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #F3F4F6', padding: '1rem' }}>
          <button
            onClick={handleAction}
            disabled={updating}
            style={{ width: '100%', padding: '1rem', borderRadius: '9999px', border: 'none', background: action.color, color: action.textColor || 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {updating && <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />}
            {updating ? 'Updating...' : action.label}
          </button>
          {['assigned', 'arriving'].includes(ride?.status) && (
            <button onClick={handleCancel} disabled={updating} style={{ width: '100%', marginTop: '0.5rem', padding: '0.625rem', borderRadius: '9999px', border: '2px solid #EF4444', background: 'transparent', color: '#EF4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              Cancel Ride
            </button>
          )}
        </div>
      )}
    </div>
  );
}
