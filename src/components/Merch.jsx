import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Upload, Plus, Minus } from "lucide-react";
import { useCart } from "./CartContext";

export default function Merch() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, getCartCount, getCartTotal } = useCart();

  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setMerchItems(data);
    } catch (err) {
      console.error("Failed to fetch merch:", err);
    } finally {
      setLoading(false);
    }
  };

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  const goToCart = () => navigate("/cart");

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="font-light tracking-wide">Loading merch…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light mb-2">
              Club Merch
            </h1>
            <p className="text-gray-400 font-light">
              Official Abhikalpa merchandise
            </p>
          </div>

          {cartCount > 0 && (
            <button
              onClick={goToCart}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-sm hover:bg-gray-200 transition"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-light">
                {cartCount} items • ₹{cartTotal}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* GRID */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">

          {merchItems.length === 0 ? (
            <p className="text-center text-gray-400 py-24 font-light">
              No merch available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {merchItems.map(item => {
                const quantity = cart[item._id]?.quantity || 0;

                return (
                  <div
                    key={item._id}
                    className="bg-white text-black rounded-sm shadow-2xl overflow-hidden group hover:scale-105 transition-transform duration-300"
                  >
                    {/* IMAGE */}
                    <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <span className="text-gray-500 text-sm font-light">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                    </div>

                    {/* DETAILS */}
                    <div className="p-6">
                      <h2 className="text-xl font-light mb-1">
                        {item.name}
                      </h2>
                      <p className="text-sm text-gray-600 font-light mb-3">
                        {item.description}
                      </p>
                      <p className="text-2xl font-light mb-4">
                        ₹{item.price}
                      </p>

                      {/* CART */}
                      {quantity > 0 ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="w-10 h-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition rounded-sm"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="text-lg font-light min-w-[2rem] text-center">
                              {quantity}
                            </span>

                            <button
                              onClick={() => addToCart(item)}
                              className="w-10 h-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition rounded-sm"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <span className="text-sm text-gray-600 font-light">
                            ₹{item.price * quantity}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full py-3 bg-black text-white font-light hover:bg-gray-900 transition rounded-sm"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MOBILE CART BAR */}
      {cartCount > 0 && (
        <button
          onClick={goToCart}
          className="fixed bottom-6 left-6 right-6 md:hidden bg-white text-black p-4 rounded-sm shadow-2xl flex items-center justify-between hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            <div>
              <p className="font-light text-sm">{cartCount} items</p>
              <p className="font-light text-lg">₹{cartTotal}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-black text-white font-light rounded-sm">
            View Cart
          </span>
        </button>
      )}
    </div>
  );
}
