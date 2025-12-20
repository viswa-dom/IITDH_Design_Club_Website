import { useNavigate } from "react-router-dom";
import { Check, ShoppingBag, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const { clearCart } = useCart();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Clear the cart since order is confirmed
    clearCart();
    
    // Trigger animation after a brief delay
    setTimeout(() => setShowContent(true), 100);
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Icon with Animation */}
        <div className="flex justify-center mb-12">
          <div 
            className={`relative transition-all duration-700 ${
              showContent 
                ? 'scale-100 opacity-100' 
                : 'scale-50 opacity-0'
            }`}
          >
            {/* Outer pulse ring */}
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
            
            {/* Main circle */}
            <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
              {/* Animated checkmark */}
              <svg 
                className="w-20 h-20 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path
                  className={`transition-all duration-1000 ${
                    showContent ? 'animate-draw-check' : 'opacity-0'
                  }`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  strokeDasharray="24"
                  strokeDashoffset={showContent ? "0" : "24"}
                  style={{
                    animation: showContent ? 'drawCheck 0.6s ease-out 0.3s forwards' : 'none'
                  }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div 
          className={`bg-white text-black rounded-lg shadow-2xl overflow-hidden transition-all duration-700 delay-300 ${
            showContent 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Header Section */}
          <div className="px-8 py-10 sm:px-12 sm:py-12 text-center border-b border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-light mb-3">
              Payment Confirmation Received
            </h1>
            
            <p className="text-lg text-gray-600 font-light max-w-xl mx-auto">
              Thank you for submitting your payment details. We've received your confirmation and will process your order shortly.
            </p>
          </div>

          {/* What Happens Next Section */}
          <div className="px-8 py-8 sm:px-12 sm:py-10 bg-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-xl font-medium text-gray-900">
                What happens next?
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700">
                    Our team will verify your payment within 24-48 hours
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700">
                    You'll receive a confirmation email once your order is verified
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700">
                    We'll process and ship your order as soon as possible
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700">
                    You'll receive tracking details via email
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="px-8 py-6 sm:px-12 bg-gray-100 border-t border-gray-200">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-700 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Important:</span> Please check your email (including spam/junk folder) for order confirmation and updates.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-8 sm:px-12 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/merch')}
                className="w-full py-4 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </button>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Contact us at{" "}
            <a 
              href="mailto:support@abhikalpa.com" 
              className="text-white hover:underline transition-colors"
            >
              support@abhikalpa.com
            </a>
          </p>
        </div>
      </div>

      {/* CSS for checkmark animation */}
      <style>{`
        @keyframes drawCheck {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}