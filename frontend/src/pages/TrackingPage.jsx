import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Star, MapPin, Clock, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { rideService } from '../services/ride.service';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['searching', 'assigned', 'arriving', 'arrived', 'started', 'completed'];
const STATUS_LABELS = {
  searching: 'Searching for Rider',
  assigned: 'Rider Assigned',
  arriving: 'Rider is Arriving',
  arrived: 'Rider has Arrived',
  started: 'Ride in Progress',
  completed: 'Ride Completed',
  cancelled: 'Ride Cancelled',
};
const STATUS_COLORS = {
  searching: 'text-yellow-600 bg-yellow-50',
  assigned: 'text-blue-600 bg-blue-50',
  arriving: 'text-blue-600 bg-blue-50',
  arrived: 'text-green-600 bg-green-50',
  started: 'text-purple-600 bg-purple-50',
  completed: 'text-green-700 bg-green-100',
  cancelled: 'text-red-600 bg-red-50',
};

export default function TrackingPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [riderLocation, setRiderLocation] = useState(null);

  const fetchRide = useCallback(async () => {
    try {
      const { data } = await rideService.getRide(rideId);
      setRide(data.ride);
    } catch {
      toast.error('Could not load ride');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => { fetchRide(); }, [fetchRide]);

  // Poll while searching (every 5s)
  useEffect(() => {
    if (!ride || ['completed', 'cancelled', 'assigned'].includes(ride.status)) return;
    if (ride.status === 'searching') {
      const timer = setInterval(fetchRide, 5000);
      return () => clearInterval(timer);
    }
  }, [ride, fetchRide]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onAccepted = () => { toast.success('🎉 Rider accepted your ride!'); fetchRide(); };
    const onStatusUpdate = (data) => { setRide((r) => r ? { ...r, status: data.status } : r); };
    const onLocationUpdate = (data) => { setRiderLocation({ lat: data.lat, lng: data.lng }); };
    const onCancelled = () => { toast.error('Ride was cancelled'); fetchRide(); };
    socket.on('ride-accepted', onAccepted);
    socket.on('ride-status-update', onStatusUpdate);
    socket.on('rider-location-update', onLocationUpdate);
    socket.on('ride-cancelled', onCancelled);
    return () => {
      socket.off('ride-accepted', onAccepted);
      socket.off('ride-status-update', onStatusUpdate);
      socket.off('rider-location-update', onLocationUpdate);
      socket.off('ride-cancelled', onCancelled);
    };
  }, [socket, fetchRide]);

  const handleCancel = async () => {
    if (!['searching', 'assigned', 'arriving'].includes(ride?.status)) return;
    setCancelling(true);
    try {
      await rideService.cancelRide(rideId, 'Cancelled by customer');
      toast.success('Ride cancelled');
      setRide((r) => ({ ...r, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="app-container flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading ride details...</p>
      </div>
    </div>
  );

  const stepIdx = STATUS_STEPS.indexOf(ride?.status);
  const rider = ride?.riderId;

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white px-4 pt-10 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-secondary">Track Your Ride</h1>
      </div>

      {/* Status badge */}
      <div className={`mx-4 mt-4 rounded-2xl p-4 ${STATUS_COLORS[ride?.status] || 'bg-gray-50 text-gray-600'}`}>
        <div className="flex items-center gap-2">
          {ride?.status === 'searching' && <Loader2 size={18} className="animate-spin" />}
          {ride?.status === 'completed' && <CheckCircle size={18} />}
          {ride?.status === 'cancelled' && <XCircle size={18} />}
          {!['searching', 'completed', 'cancelled'].includes(ride?.status) && <Clock size={18} />}
          <span className="font-bold text-sm">{STATUS_LABELS[ride?.status] || ride?.status}</span>
        </div>
        {ride?.status === 'searching' && (
          <p className="text-xs mt-1 opacity-70">Connecting you with nearby riders...</p>
        )}
      </div>

      {/* Progress stepper */}
      {ride?.status !== 'cancelled' && (
        <div className="card mx-4 mt-3">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.slice(0, 5).map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    i <= stepIdx ? 'border-primary bg-primary' : 'border-gray-200 bg-white'
                  }`}>
                    {i < stepIdx && <CheckCircle size={12} className="text-secondary" />}
                    {i === stepIdx && <div className="w-2 h-2 bg-secondary rounded-full"></div>}
                  </div>
                  <p className="text-[9px] text-gray-500 text-center max-w-[40px] leading-tight">{s}</p>
                </div>
                {i < 4 && <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-primary' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Rider card */}
      {rider && (
        <div className="card mx-4 mt-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {rider.profilePhoto ? (
                <img src={rider.profilePhoto} alt={rider.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🧑</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-secondary">{rider.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={12} className="text-primary" fill="#FFC928" />
                <span className="text-xs text-gray-500">{rider.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{rider.vehicleModel} • {rider.vehicleRegNumber}</p>
            </div>
            <a href={`tel:${rider.phone}`} className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Phone size={16} className="text-secondary" />
            </a>
          </div>
        </div>
      )}

      {/* Location display */}
      {riderLocation && (
        <div className="card mx-4 mt-3 flex items-center gap-3">
          <MapPin size={16} className="text-primary" />
          <div>
            <p className="text-xs font-semibold text-secondary">Rider's Location</p>
            <p className="text-xs text-gray-400">{riderLocation.lat.toFixed(4)}°N, {riderLocation.lng.toFixed(4)}°E</p>
          </div>
        </div>
      )}

      {/* Ride info */}
      <div className="card mx-4 mt-3">
        <div className="space-y-2">
          <div className="flex gap-3 items-start">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
            <div>
              <p className="text-xs text-gray-400">Pickup</p>
              <p className="text-sm font-medium text-secondary">{ride?.pickupAddress}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <MapPin size={12} className="text-red-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Destination</p>
              <p className="text-sm font-medium text-secondary">{ride?.destinationAddress}</p>
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">{ride?.distance} km • ~{ride?.duration} min</span>
            <span className="text-sm font-bold text-secondary">₹{ride?.estimatedFare}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mt-4 mb-8 space-y-2">
        {ride?.status === 'completed' && (
          <button onClick={() => navigate(`/payment/${rideId}`)} className="btn-primary w-full">
            Proceed to Payment
          </button>
        )}
        {['searching', 'assigned', 'arriving'].includes(ride?.status) && (
          <button onClick={handleCancel} disabled={cancelling} className="w-full py-3 border-2 border-red-400 text-red-500 rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
            {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            {cancelling ? 'Cancelling...' : 'Cancel Ride'}
          </button>
        )}
        {ride?.status === 'cancelled' && (
          <button onClick={() => navigate('/')} className="btn-primary w-full">Book Again</button>
        )}
      </div>
    </div>
  );
}

