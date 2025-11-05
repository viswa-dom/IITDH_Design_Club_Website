import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const navigate = useNavigate();

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const code = generateVerificationCode();
      const { data: existingCodes, error: fetchError } = await supabase
        .from('password_reset_codes')
        .select()
        .eq('email', email)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString());

      // Delete any existing valid codes for this email
      if (existingCodes?.length > 0) {
        await supabase
          .from('password_reset_codes')
          .delete()
          .eq('email', email);
      }

      // Insert new code
      const { error } = await supabase
        .from('password_reset_codes')
        .insert([
          {
            email,
            code,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
            used: false
          },
        ]);

      if (error) throw error;

  // NOTE: Sending email should be done server-side. For now we log the code
  // and surface a friendly message. Replace this with a server endpoint
  // or Supabase function to actually send the email in production.
  // eslint-disable-next-line no-console
  console.log('Password reset code for', email, ':', code);

  setMessage('Verification code generated — check your email (or the console in dev)');
      setStep(2);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('password_reset_codes')
        .select('*')
        .eq('email', email)
        .eq('code', verificationCode)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        throw new Error('Invalid or expired verification code');
      }

      setStep(3);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Delete the used verification code
      await supabase
        .from('password_reset_codes')
        .delete()
        .eq('email', email);

      setMessage('Password has been reset successfully');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleCodeVerification} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength="6"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        );
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white text-black px-6 py-20">
      <div className="max-w-3xl w-full">
        <div className="mx-auto max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl md:text-4xl font-light text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {step === 1 && "We'll send you a verification code"}
              {step === 2 && "Enter the verification code sent to your email"}
              {step === 3 && "Create a new password"}
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-md ${
                message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
            {renderStep()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;