import { useState } from "react";
import { X, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white text-black rounded-sm shadow-2xl animate-slideUp">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-light mb-2">Reset Password</h2>
          <p className="text-gray-600 font-light mb-6">
            Enter the email associated with your account.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 flex gap-3 rounded-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success */}
          {sent && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 flex gap-3 rounded-sm">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                A password reset link has been sent to your email. Please check your inbox (and spam folder).
              </p>
            </div>
          )}

          {/* Email Input */}
          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="text-sm text-gray-700 font-light block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-light rounded-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black text-white font-light hover:bg-gray-900 transition-all rounded-sm disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}