import { useState } from 'react';
import { X, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const SignupModal = ({ isOpen, onClose, onSignup, onSwitchToLogin, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoadingSignup(true);

    try {
      await onSignup(email, password, username, phone);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onSwitchToLogin();
      }, 1500);

      setEmail('');
      setUsername('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
        if (err.message.includes("Password should contain")) {
          setError("Password must include: at least 1 uppercase letter, 1 lowercase letter, and 1 number.");
        } else {
          setError(err.message || "Failed to create account. Please try again.");
        }
    } finally {
      setIsLoadingSignup(false);
    }
  };

  const handleGoogle = async () => {
    if (!onGoogleSignIn) return;
    setError('');
    setIsLoadingGoogle(true);

    try {
      await onGoogleSignIn();
      onClose();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
      <Helmet>
        <title>Sign Up - Abhikalpa</title>
      </Helmet>
      <div className="relative w-full max-w-md bg-white text-black rounded-sm shadow-2xl">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">

          <h2 className="text-3xl font-light mb-2">Create Account</h2>
          <p className="text-gray-600 font-light mb-8">Join the Abhikalpa community</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">Account created! Redirecting…</p>
            </div>
          )}

          <div className="space-y-4 mb-4">
            <button
              onClick={handleGoogle}
              disabled={isLoadingGoogle}
              className="w-full py-3 border border-gray-300 flex justify-center gap-3 bg-white"
            >
              {isLoadingGoogle ? 'Opening Google…' : 'Continue with Google'}
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Username */}
            <div>
              <label className="text-sm text-gray-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Your username"
                  className="w-full pl-11 py-3 border border-gray-300"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm text-gray-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="xxxxxxxxxx"
                  className="w-full pl-11 py-3 border border-gray-300"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your-email@iitdh.ac.in(preferably)"
                  className="w-full pl-11 py-3 border border-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 10 characters long"
                  className="w-full pl-11 py-3 border border-gray-300"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className="w-full pl-11 py-3 border border-gray-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingSignup}
              className="w-full py-3 bg-black text-white hover:bg-gray-900 disabled:opacity-50"
            >
              {isLoadingSignup ? 'Creating account…' : 'Sign Up'}
            </button>

          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-black underline">
              Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};