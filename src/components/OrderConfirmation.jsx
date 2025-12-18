import { useEffect, useState } from "react";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOrder = async () => {
      try {
        // Get pending order data from sessionStorage
        const orderId = sessionStorage.getItem('pendingOrderId');
        const cartItemsStr = sessionStorage.getItem('pendingCartItems');

        if (!orderId || !cartItemsStr) {
          setError("No pending order found");
          setProcessing(false);
          return;
        }

        const cartItems = JSON.parse(cartItemsStr);

        // Prepare items for stock deduction
        const items = cartItems.map(item => ({
          productId: item._id,
          size: item.selectedSize,
          quantity: item.quantity,
          sizeType: item.sizeType
        }));

        // Deduct stock
        const res = await fetch("/api/deduct-stock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ items })
        });

        if (!res.ok) {
          throw new Error("Failed to deduct stock");
        }

        // Update order status
        await fetch("/api/orders", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            _id: orderId,
            status: "Confirmed"
          })
        });

        // Clear cart from localStorage
        localStorage.removeItem('cart');
        
        // Clear sessionStorage
        sessionStorage.removeItem('pendingOrderId');
        sessionStorage.removeItem('pendingCartItems');

        setProcessing(false);
      } catch (err) {
        console.error("Order processing error:", err);
        setError(err.message);
        setProcessing(false);
      }
    };

    processOrder();
  }, []);

  if (processing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-light tracking-wide">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="bg-white text-black rounded-sm shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-light mb-2">Order Processing Failed</h1>
          <p className="text-gray-600 font-light mb-6">{error}</p>
          <a
            href="/merch"
            className="inline-block px-6 py-3 bg-black text-white font-light hover:bg-gray-900 transition-colors rounded-sm"
          >
            Return to Shop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="bg-white text-black rounded-sm shadow-2xl p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-light mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 font-light mb-6">
          Thank you for your purchase. Your order has been successfully placed and confirmed.
        </p>

        <div className="bg-gray-50 rounded-sm p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Package className="w-5 h-5" />
            <span className="font-light">We'll process your order shortly</span>
          </div>
        </div>

        <a
          href="/merch"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-light hover:bg-gray-900 transition-colors rounded-sm"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}