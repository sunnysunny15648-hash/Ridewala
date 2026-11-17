import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Loader2, Info } from 'lucide-react';
import { rideService } from '../services/ride.service';
import toast from 'react-hot-toast';

function FareCard({ fare, distance, duration, paymentMethod, onPaymentChange }) {
  return (
    <div className="bg-white rounded-t-3xl shadow-lg p-5">
      {/* Fare row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">ESTIMATED FARE</p>
          <p className="text-3xl font-extrabold text-secondary">₹{fare?.totalFare || '--'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{distance ? `${distance} km` : '-- km'}</p>
          <p className="text-xs text-gray-400">{duration ? `~${duration} min` : ''}</p>
        </div>
      </div>

      {/* Breakdown */}
      {fare && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Base Fare</span>
            <span className="font-medium">₹{fare.baseFare}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Distance ({distance}km × ₹{fare.perKmCharge || 8})</span>
            <span className="font-medium">₹{fare.distanceCharge}</span>
          </div>
          <div className="border-t pt-1.5 flex justify-between text-xs font-bold">
            <span>Total</span>
            <span>₹{fare.totalFare}</span>
          </div>
        </div>
      )}

      {/* Payment method */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">PAYMENT METHOD</p>
        <div className="flex gap-2">
          {['cash', 'online'].map((m) => (
            <button
              key={m}
              onClick={() => onPaymentChange(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                paymentMethod === m ? 'border-primary bg-primary/10 text-secondary' : 'border-gray-200 text-gray-500'
              }`}
            >
              {m === 'cash' ? '💵 Cash' : '💳 Online'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BookRidePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pickup, setPickup] = useState(location.state?.pickup || '');
  const [destination, setDestination] = useState(location.state?.destination || '');
  const [fare, setFare] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [booking, setBooking] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  // Geocode an address using Nominatim (free, no key needed)
  const geocode = async (address) => {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=in`);
    const d = await r.json();
    if (d.length === 0) throw new Error('Location not found');
    return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon), display: d[0].display_name };
  };

  // Haversine distance in km
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const calculateFare = async () => {
    if (!pickup.trim() || !destination.trim()) { toast.error('Enter both pickup and destination'); return; }
    setCalculating(true);
    try {
      const [pCoords, dCoords] = await Promise.all([geocode(pickup), geocode(destination)]);
      setPickupCoords(pCoords);
      setDestCoords(dCoords);
      const dist = parseFloat(haversine(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng).toFixed(1));
      const dur = Math.ceil((dist / 25) * 60); // ~25 km/h avg bike speed
      setDistance(dist);
      setDuration(dur);
      // Simple fare calc (matches backend defaults)
      const baseFare = 20, perKm = 8, minFare = 30;
      const distCharge = parseFloat((dist * perKm).toFixed(2));
      const total = Math.max(baseFare + distCharge, minFare);
      setFare({ baseFare, perKmCharge: perKm, distanceCharge: distCharge, totalFare: parseFloat(total.toFixed(2)) });
    } catch (err) {
      toast.error(err.message || 'Could not calculate route');
    } finally {
      setCalculating(false);
    }
  };

  const handleBook = async () => {
    if (!fare || !pickupCoords || !destCoords) { toast.error('Please calculate the route first'); return; }
    setBooking(true);
    try {
      const { data } = await rideService.bookRide({
        pickupAddress: pickup,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        destinationAddress: destination,
        destinationLat: destCoords.lat,
        destinationLng: destCoords.lng,
        distance,
        duration,
        paymentMethod,
      });
      toast.success(data.nearbyRidersFound > 0 ? `${data.nearbyRidersFound} riders notified!` : 'Searching for riders...');
      navigate(`/tracking/${data.ride.id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-100">
      {/* Map placeholder */}
      <div className="flex-1 relative">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm px-4 pt-10 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-secondary text-lg">Book Ride</h1>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-secondary flex-shrink-0"></div>
              <input
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                placeholder="Pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
              <MapPin size={12} className="text-red-500 flex-shrink-0" fill="#EF4444" />
              <input
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <button onClick={calculateFare} disabled={calculating} className="w-full py-2 bg-secondary text-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              {calculating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {calculating ? 'Calculating...' : 'Calculate Route & Fare'}
            </button>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center px-8 mt-48">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🗺️</span>
            </div>
            <div className="bg-white/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-secondary mb-1">Map Integration</p>
                  <p className="text-xs text-gray-500">Add <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to <code className="bg-gray-100 px-1 rounded">.env</code> for live maps.</p>
                  <p className="text-xs text-gray-500 mt-1">Route calculation uses free OpenStreetMap geocoding.</p>
                </div>
              </div>
            </div>
            {distance && (
              <div className="mt-3 bg-white rounded-xl p-3 shadow-sm text-left">
                <p className="text-xs font-bold text-secondary">📍 Route Calculated</p>
                <p className="text-xs text-gray-500 mt-1">{pickup?.split(',')[0]} → {destination?.split(',')[0]}</p>
                <p className="text-xs font-semibold text-primary mt-1">{distance} km • ~{duration} min</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="relative z-10">
        <FareCard fare={fare} distance={distance} duration={duration} paymentMethod={paymentMethod} onPaymentChange={setPaymentMethod} />
        <div className="bg-white px-5 pb-8">
          <button
            onClick={handleBook}
            disabled={!fare || booking}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {booking && <Loader2 size={20} className="animate-spin" />}
            {booking ? 'Booking...' : fare ? `Confirm Booking — ₹${fare.totalFare}` : 'Calculate fare first'}
          </button>
        </div>
      </div>
    </div>
  );
}

