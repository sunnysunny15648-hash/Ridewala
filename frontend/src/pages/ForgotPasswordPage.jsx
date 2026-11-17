import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import Logo from '../assets/Logo';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    // Simulate recovery link delivery
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset link sent!');
    }, 1200);
  };

  return (
    <div className="app-container flex flex-col min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-primary pt-12 pb-10 px-6 text-center relative overflow-hidden">
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-[2.5rem]"></div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/login')}
            className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
          >
            <ArrowLeft size={18} className="text-secondary" />
          </button>
          <div className="flex-1"></div>
        </div>
        <Logo size="md" showTagline />
      </div>

      <div className="flex-1 px-6 pt-6 pb-6">
        {!submitted ? (
          <>
            <h2 className="text-2xl font-bold text-secondary mb-1">Reset Password</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                  />
                  <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="text-sm font-semibold text-secondary hover:underline">
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">Check Your Inbox</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              If an account exists for <span className="font-semibold text-secondary">{email}</span>, you will receive password reset instructions shortly.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
