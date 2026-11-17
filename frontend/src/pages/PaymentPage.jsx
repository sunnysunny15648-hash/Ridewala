import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, Loader2 } from 'lucide-react';
import { rideService, paymentService, ratingService } from '../services/ride.service';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rated, setRated] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    rideService.getRide(rideId)
      .then(({ data }) => {
        setRide(data.ride);
        if (data.ride.paymentStatus === 'completed') setPaymentDone(true);
      })
      .catch(() => toast.error('Could not load ride'))
      .finally(() => setLoading(false));
  }, [rideId]);

  const handleRazorpay = async () => {
    if (!window.Razorpay) {
      toast.error('Razorpay not loaded. Add VITE_RAZORPAY_KEY_ID to .env');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await paymentService.createOrder({ rideId, amount: ride.actualFare || ride.estimatedFare });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: 'INR',
        name: 'RideWala',
        description: 'Ride Payment',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              rideId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaymentDone(true);
            toast.success('Payment successful! 🎉');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#FFC928' },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await ratingService.createRating({ rideId, rating, feedback });
      setRated(true);
      toast.success('Thanks for your feedback! ⭐');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="app-container flex items-center justify-center min-h-screen">
      <Loader2 size={40} className="animate-spin text-primary" />
    </div>
  );

  const fare = ride?.actualFare || ride?.estimatedFare || 0;

  return (
    <div className="app-container flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-10 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-secondary text-lg">Payment & Receipt</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Receipt */}
        <div className="card">
          <div className="text-center pb-4 border-b border-dashed border-gray-200">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-400 font-medium">TOTAL FARE</p>
            <p className="text-4xl font-extrabold text-secondary mt-1">₹{fare}</p>
          </div>
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ride ID</span>
              <span className="font-mono text-xs text-gray-700">{ride?._id?.slice(-8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Distance</span>
              <span className="font-medium">{ride?.distance} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment</span>
              <span className={`font-semibold ${paymentDone ? 'text-green-600' : 'text-orange-500'}`}>
                {paymentDone ? '✓ Paid' : ride?.paymentMethod === 'cash' ? 'Cash (Pay Rider)' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment button */}
        {!paymentDone && ride?.paymentMethod === 'online' && (
          <div className="card">
            <p className="text-sm font-semibold text-secondary mb-3">Complete Online Payment</p>
            <button onClick={handleRazorpay} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              Pay ₹{fare} via Razorpay
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Secured by Razorpay</p>
          </div>
        )}

        {ride?.paymentMethod === 'cash' && !paymentDone && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
            <p className="text-sm font-bold text-secondary">💵 Cash Payment</p>
            <p className="text-xs text-gray-600 mt-1">Please pay ₹{fare} to your rider directly.</p>
          </div>
        )}

        {/* Rating */}
        {!rated ? (
          <div className="card">
            <p className="font-bold text-secondary mb-1">Rate Your Ride</p>
            <p className="text-xs text-gray-400 mb-4">How was your experience?</p>
            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
                  <Star size={32} fill={(hover || rating) >= s ? '#FFC928' : 'none'} className={(hover || rating) >= s ? 'text-primary' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea
              className="input-field text-sm resize-none"
              rows={3}
              placeholder="Share your feedback (optional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button onClick={handleRate} disabled={submitting || rating === 0} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              Submit Rating
            </button>
          </div>
        ) : (
          <div className="card text-center">
            <div className="flex justify-center mb-2">{[1,2,3,4,5].map((s) => <Star key={s} size={24} fill={s <= rating ? '#FFC928' : 'none'} className={s <= rating ? 'text-primary' : 'text-gray-200'} />)}</div>
            <p className="font-semibold text-green-600">Thanks for your feedback! ⭐</p>
          </div>
        )}

        <button onClick={() => navigate('/')} className="btn-secondary w-full">Back to Home</button>
      </div>
    </div>
  );
}

