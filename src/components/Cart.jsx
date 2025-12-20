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

    try {
      // Create order in database
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.selectedSize || null
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
    }
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
                    className="w-full py-3 bg-black text-white font-light hover:bg-gray-900 transition-colors rounded-sm mb-4"
                  >
                    Proceed to Checkout
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50 overflow-y-auto">
          <div className="bg-white text-black rounded-sm p-8 shadow-2xl w-full max-w-md my-8">
            <h2 className="text-3xl font-light mb-6 text-center">Payment Instructions</h2>
    
            {/* Order Reference - MOST IMPORTANT */}
            <div className="bg-green-50 border-2 border-green-500 rounded-sm p-4 mb-6">
              <p className="text-sm text-green-800 font-medium mb-2">📋 Your Order Reference:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded border border-green-300">
                <code className="text-lg font-mono text-green-700 break-all">{orderReference}</code>
                <button
                  onClick={() => copyToClipboard(orderReference)}
                  className="ml-2 p-2 hover:bg-green-100 rounded transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-green-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-red-600 mt-2 font-medium">
                ⚠️ SAVE THIS! You'll need it to confirm your payment.
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 rounded-sm p-6 mb-6">
              <p className="text-center text-sm text-gray-600 mb-4 font-light">
                Scan QR code to pay ₹{total}
              </p>
              <div className="flex justify-center">
                <QRCodeSVG
                  value={`upi://pay?pa=7898793304@ptsbi&pn=Abhikalpa&am=${total}&cu=INR&tn=Order ${orderReference}`}
                  size={200}
                />
              </div>
              <p className="text-center text-2xl font-light mt-4">
                ₹{total}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-3">📝 Next Steps:</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Complete the UPI payment using the QR code above</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Note your UPI Transaction ID from the payment app</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Click the button below to open the confirmation form</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Enter your details, <strong>Order Reference</strong>, and UPI Transaction ID</span>
                </li>
              </ol>
            </div>

            {/* Form Link Button */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc71mc6dGYWo-OBjdE2yV_Z7IfAjFMYRZZmPWUi7HMNweMeaQ/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-black text-white text-center rounded-sm hover:bg-gray-900 transition-colors font-medium mb-4"
            >
              Open Payment Confirmation Form →
            </a>

            <button
              onClick={() => {
                setShowQR(false);
                setOrderReference(null);
                clearCart();
                navigate('/merch');
              }}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-100 transition-colors font-light"
            >
              Close & Continue Shopping
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center font-light">
              Your order will be confirmed once we receive your payment details via the form
            </p>
          </div>
        </div>
      )}
    </div>
  );
}