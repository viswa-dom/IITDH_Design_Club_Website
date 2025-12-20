import { useNavigate } from "react-router-dom";
import { Check, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function OrderConfirmation() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
            <Check className="w-16 h-16 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white text-black rounded-sm shadow-2xl p-12 text-center">
          <h1 className="text-4xl font-light mb-4">Payment Confirmation Received!</h1>
          
          <p className="text-xl text-gray-600 font-light mb-8">
            Thank you for submitting your payment details. We've received your confirmation.
          </p>

          <div className="bg-green-50 border-2 border-green-500 rounded-sm p-6 mb-8">
            <h2 className="text-lg font-medium text-green-900 mb-4">✅ What happens next?</h2>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">1.</span>
                <span>Our team will verify your payment within 24-48 hours</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">2.</span>
                <span>You'll receive a confirmation email once your order is verified</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">3.</span>
                <span>We'll process and ship your order as soon as possible</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">4.</span>
                <span>You'll receive tracking details via email</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-sm p-6 mb-8">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> Please check your email (including spam/junk folder) for order confirmation and updates.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/merch')}
              className="flex-1 py-4 bg-black text-white rounded-sm hover:bg-gray-900 transition-colors font-light flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 border-2 border-black text-black rounded-sm hover:bg-gray-100 transition-colors font-light flex items-center justify-center gap-2"
            >
              Go to Homepage
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Contact us at{" "}
            <a 
              href="mailto:support@abhikalpa.com" 
              className="text-white hover:underline"
            >
              support@abhikalpa.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}