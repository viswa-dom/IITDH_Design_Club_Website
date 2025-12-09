import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package } from "lucide-react";
import { useCart } from "./CartContext";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useRef } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const { 
    getCartItems, 
    updateQuantity, 
    deleteItem, 
    clearCart,
    getCartTotal 
  } = useCart();

  const cartItems = getCartItems();
  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 50; // Free shipping over ₹999
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;
  const [showQR, setShowQR] = useState(false);
  const iframeRef = useRef(null);


  const handleCheckout = () => {
    // TODO: Implement checkout logic
    // alert("Checkout functionality coming soon!");
    if (total <= 0) return;
    setShowQR(true);
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
                {cartItems.map((item) => (
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
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors rounded-sm"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-light min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors rounded-sm"
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
                ))}
              </div>

              {/* Order Summary - Takes 1 column */}
              <aside className="lg:col-span-1">
                <div className="bg-white text-black rounded-sm shadow-2xl p-8 sticky top-24">
                  <h2 className="text-2xl font-light mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between font-light">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between font-light">
                      <span className="text-gray-600">Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600' : ''}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-light">
                      <span className="text-gray-600">Tax (GST 18%)</span>
                      <span>₹{tax}</span>
                    </div>

                    {subtotal < 999 && subtotal > 0 && (
                      <div className="text-sm text-gray-600 font-light border-t pt-4">
                        Add ₹{999 - subtotal} more for free shipping
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-light">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
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
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4">
        <div className="bg-white text-black rounded-sm p-6 shadow-2xl w-full max-w-sm">
          <h2 className="text-2xl font-light mb-4 text-center">Scan to Pay</h2>
  
          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <QRCodeSVG
              value={`upi://pay?pa=7898793304@ptsbi&pn=Abhikalpa&am=${total}&cu=INR&tn=Merch Purchase`}
              size={200}
            />
          </div>
  
          <p className="text-center text-gray-600 mb-4 font-light">
            Total Amount: ₹{total}
          </p>

          {/* Google Form Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-3 font-light">
              To confirm your order, please fill out this Google Form after payment:
            </p>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc5J91_s9f-MMi0krfTXYxCkp-T8ND75UxUg1Uwop8JPfiBSw/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-block px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-900 transition-colors font-light"
            >
              Open Google Form
            </a>
          </div>

          <button
            onClick={() => setShowQR(false)}
            className="w-full py-2 bg-black text-white rounded-sm hover:bg-gray-900 transition-colors font-light"
          >
            Close
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
