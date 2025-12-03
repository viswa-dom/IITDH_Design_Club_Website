import { useState } from 'react';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';
import ForgotPassword from './ForgotPassword';

export const LoginModal = ({ isOpen, onClose, onLogin, onSwitchToSignup, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoadingLogin(true);

    try {
      await onLogin(email, password);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleGoogle = async () => {
    if (!onGoogleSignIn) return;

    setError('');
    setInfoMessage('');
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

  const openForgotPasswordModal = () => {
    setShowForgotPassword(true);
  };

  return (
    <>
      {/* LOGIN MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md bg-white text-black rounded-sm shadow-2xl animate-slideUp">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <h2 className="text-3xl font-light mb-2">Welcome Back</h2>
            <p className="text-gray-600 font-light mb-8">Login to your account</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {infoMessage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-sm flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">{infoMessage}</p>
              </div>
            )}

            <div className="space-y-4 mb-4">
              <button
                onClick={handleGoogle}
                disabled={isLoadingGoogle}
                className="w-full py-3 border border-gray-300 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 font-light transition-all"
              >
                {isLoadingGoogle ? 'Opening Google…' : 'Continue with Google'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-light mb-2 text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-black font-light"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-black font-light"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingLogin}
                className="w-full py-3 bg-black text-white hover:bg-gray-900 font-light transition-all disabled:opacity-50"
              >
                {isLoadingLogin ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600 font-light">
                Forgot your password?{' '}
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-black hover:underline"
                >
                  Reset it
                </button>
              </p>

              <p className="text-sm text-gray-600 font-light">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="text-black hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <ForgotPassword
          email={email}
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </>
  );
};
