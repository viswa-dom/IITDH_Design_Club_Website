import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package, Copy, Check } from "lucide-react";
import { useCart } from "./CartContext";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const {
    getCartItems,
    updateQuantity,
    deleteItem,
    clearCart,
    getCartTotal
  } = useCart();

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  const cartItems = getCartItems();
  const total = getCartTotal();
  const [showQR, setShowQR] = useState(false);
  const [orderReference, setOrderReference] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [products, setProducts] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch current product data to validate stock
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Get max available quantity for a cart item
  const getMaxQuantity = (item) => {
    const product = products.find(p => p._id === item._id);
    if (!product) return 0;

    if (product.sizeType === "none") {
      return product.quantity || 0;
    }

    return product.stock?.[item.selectedSize] || 0;
  };

  const handleQuantityIncrease = (item) => {
    const maxQty = getMaxQuantity(item);
    if (item.quantity >= maxQty) {
      alert("No more stock available for this item");
      return;
    }
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleQuantityDecrease = (item) => {
    if (item.quantity <= 1) {
      deleteItem(item.id);
      return;
    }
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleCheckout = async () => {
    if (total <= 0) return;
    setIsProcessing(true);

    try {
      // Create order in database (NO stock deduction yet - only when confirmed)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.selectedSize || null,
            sizeType: item.sizeType || "none"
          })),
          total: total,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();
      
      // Store order reference and show QR
      setOrderReference(data.transactionRef);
      setOrderId(data._id);
      setShowQR(true);
      
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePayment = async () => {
    // Delete the placeholder order before closing
    if (orderId) {
      try {
        await fetch("/api/orders", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: orderId }),
        });
      } catch (err) {
        console.error("Failed to delete placeholder order:", err);
      }
    }

    // Reset state but DON'T clear cart
    setShowQR(false);
    setOrderReference(null);
    setOrderId(null);
    
    // Cart remains intact so user can try again
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/merch')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-light"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-8 h-8" />
                <h1 className="text-4xl md:text-5xl font-light">Shopping Cart</h1>
              </div>
              <p className="text-gray-400 font-light">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors font-light hidden md:block"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {cartItems.length === 0 ? (
            // Empty Cart
            <div className="bg-white text-black rounded-sm shadow-2xl p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-light mb-2">Your cart is empty</h2>
              <p className="text-gray-600 font-light mb-6">
                Add some items to get started
              </p>
              <button
                onClick={() => navigate('/merch')}
                className="px-8 py-3 bg-black text-white font-light hover:bg-gray-900 transition-colors rounded-sm"
              >
                Browse Merch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cart Items - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const maxQty = getMaxQuantity(item);
                  const isOverStock = item.quantity > maxQty;

                  return (
                    <div
                      key={item.id}
                      className="bg-white text-black rounded-sm shadow-2xl p-6"
                    >
                      <div className="flex gap-6 items-start">
                        {/* Image */}
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-sm flex-shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-sm"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-light mb-1">{item.name}</h3>
                              <p className="text-sm text-gray-600 font-light">
                                {item.description}
                              </p>
                              {item.selectedSize && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Size: <span className="font-medium">{item.selectedSize}</span>
                                </p>
                              )}
                              {isOverStock && (
                                <p className="text-xs text-red-600 mt-1">
                                  Only {maxQty} available in stock
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleQuantityDecrease(item)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors rounded-sm"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-lg font-light min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityIncrease(item)}
                                disabled={item.quantity >= maxQty || maxQty === 0}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-sm text-gray-500 font-light">
                                ₹{item.price} × {item.quantity}
                              </p>
                              <p className="text-xl font-light">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary - Takes 1 column */}
              <aside className="lg:col-span-1">
                <div className="bg-white text-black rounded-sm shadow-2xl p-8 sticky top-24">
                  <h2 className="text-2xl font-light mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-xl font-light border-t pt-4">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-3 bg-black text-white font-light hover:bg-gray-900 transition-colors rounded-sm mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Processing..." : "Proceed to Checkout"}
                  </button>

                  <button
                    onClick={() => navigate('/merch')}
                    className="w-full py-3 border border-black text-black font-light hover:bg-gray-100 transition-colors rounded-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              </aside>

            </div>
          )}
        </div>
      </section>
      
      {/* Payment Modal with Order Reference */}
      {showQR && orderReference && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center px-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900 to-black text-white px-8 py-6 border-b border-gray-800">
              <h2 className="text-2xl font-light text-center">Payment Instructions</h2>
            </div>

            <div className="p-8">
              {/* Order Reference - MOST IMPORTANT */}
              <div className="bg-gray-50 border-2 border-gray-800 rounded-lg p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Your Order Reference</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-3 rounded-md border-2 border-gray-300 shadow-inner">
                  <code className="flex-1 text-base font-mono text-gray-900 break-all select-all font-semibold">{orderReference}</code>
                  <button
                    onClick={() => copyToClipboard(orderReference)}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-gray-800" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
                
                <div className="flex items-start gap-2 mt-3 bg-gray-900 text-white p-3 rounded-md">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs font-medium text-gray-200">
                    IMPORTANT: Save this reference number! You'll need it to confirm your payment.
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
                <p className="text-center text-sm text-gray-600 mb-4 font-medium">
                  Scan QR code to pay
                </p>
                <div className="flex justify-center bg-white p-4 rounded-lg shadow-inner border border-gray-200">
                  <QRCodeSVG
                    value={`upi://pay?pa=7898793304@ptsbi&pn=Abhikalpa&am=${total}&cu=INR&tn=Order ${orderReference}`}
                    size={200}
                  />
                </div>
                <div className="text-center mt-4">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <p className="text-3xl font-light text-gray-900">₹{total}</p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Next Steps</h3>
                </div>
                
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                    <span className="pt-0.5">Complete the UPI payment using the QR code above</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                    <span className="pt-0.5">Note your UPI Transaction ID from the payment app</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                    <span className="pt-0.5">Click the button below to open the confirmation form</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                    <span className="pt-0.5">Enter your details, <strong>Order Reference</strong>, and UPI Transaction ID</span>
                  </li>
                </ol>
              </div>

              {/* Form Link Button */}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSc71mc6dGYWo-OBjdE2yV_Z7IfAjFMYRZZmPWUi7HMNweMeaQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Set session token for confirmation page access
                  sessionStorage.setItem('order_confirmed', 'true');
                }}
                className="block w-full py-4 bg-black text-white text-center rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium mb-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Open Payment Confirmation Form →
              </a>

              <button
                onClick={handleClosePayment}
                className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}