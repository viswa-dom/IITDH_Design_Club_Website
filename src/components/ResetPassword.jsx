import { useState, useEffect } from "react";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [tokenHash, setTokenHash] = useState("");

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // First, sign out any existing session to prevent auto-login
        await supabase.auth.signOut();

        // Get hash from URL (everything after #)
        const hash = window.location.hash;
        console.log("Full hash:", hash);

        // Extract query params from hash
        const queryStart = hash.indexOf("?");
        if (queryStart === -1) {
          setError("Invalid reset link format.");
          return;
        }

        const queryString = hash.substring(queryStart + 1);
        const params = new URLSearchParams(queryString);

        const type = params.get("type");
        const hash_token = params.get("token_hash");

        console.log("Parsed params:", { type, tokenHash: hash_token?.substring(0, 20) + "..." });

        if (!hash_token || type !== "recovery") {
          setError("Invalid or expired reset link.");
          return;
        }

        // Store token for later use
        setTokenHash(hash_token);
        setCanReset(true);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(`Error: ${err.message}`);
      }
    };

    initializeSession();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Verify OTP and update password in one go
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
        return;
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Sign out immediately after password reset
      await supabase.auth.signOut();

      setSuccess(true);
      
      // Redirect to home and trigger login modal
      setTimeout(() => {
        navigate("/");
        // Small delay to ensure navigation completes
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("open-login"));
        }, 100);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Helmet>
        <title>Reset Password - Abhikalpa</title>
      </Helmet>
      <div className="bg-white text-black max-w-md w-full p-8 rounded-sm shadow-2xl">
        <h2 className="text-3xl font-light mb-4">Reset Password</h2>

        {!canReset && !success && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-sm flex gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">{error}</p>
              <p className="text-xs">Please request a new password reset link.</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-sm flex gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Password reset successfully!</p>
              <p className="text-xs">Redirecting to login...</p>
            </div>
          </div>
        )}

        {canReset && !success && (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="text-sm text-gray-700 font-light block mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-light rounded-sm"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-light block mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-light rounded-sm"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 flex gap-3 rounded-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-light hover:bg-gray-900 transition-all rounded-sm disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}