import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { rideService } from '../services/ride.service';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  searching: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  started: 'bg-purple-100 text-purple-700',
};

export default function RideHistoryPage() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchRides = async (p = 1) => {
    try {
      const { data } = await rideService.getRideHistory({ page: p, limit: 10 });
      if (p === 1) setRides(data.rides || []);
      else setRides((prev) => [...prev, ...(data.rides || [])]);
      setHasMore(p < data.pages);
    } catch {
      toast.error('Could not load rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchRides(next);
  };

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-10 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-secondary text-lg">My Rides</h1>
      </div>

      <div className="flex-1 px-4 py-4 pb-24 space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))
        ) : rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16">
            <span className="text-5xl mb-4">🏍️</span>
            <p className="font-semibold text-gray-600">No rides yet</p>
            <p className="text-sm text-gray-400 mt-1">Book your first ride!</p>
            <button onClick={() => navigate('/')} className="btn-primary mt-4 px-8">Book a Ride</button>
          </div>
        ) : (
          rides.map((ride) => (
            <div
              key={ride._id}
              className="card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/tracking/${ride._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{ride.pickupAddress?.split(',')[0]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={10} className="text-red-400" />
                    <p className="text-sm font-semibold text-secondary truncate max-w-[200px]">{ride.destinationAddress?.split(',')[0]}</p>
                  </div>
                </div>
                <span className={`status-badge ${STATUS_COLORS[ride.status] || 'bg-gray-100 text-gray-700'} flex-shrink-0`}>
                  {ride.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={11} /> {new Date(ride.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span>{ride.distance} km</span>
                  <span>₹{ride.actualFare || ride.estimatedFare}</span>
                </div>
                {ride.status === 'completed' && !ride.rating && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/payment/${ride._id}?tab=rate`); }}
                    className="text-xs text-primary font-semibold flex items-center gap-1"
                  >
                    <Star size={12} fill="#FFC928" /> Rate
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <button onClick={loadMore} className="w-full py-3 text-sm text-primary font-semibold text-center">
            Load more rides
          </button>
        )}
      </div>

      <BottomNav active="rides" />
    </div>
  );
}

