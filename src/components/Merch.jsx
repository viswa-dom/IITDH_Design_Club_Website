import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Upload, Plus, Minus } from "lucide-react";
import { useCart } from "./CartContext";

export default function Merch() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, getCartCount, getCartTotal } = useCart();

  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});

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
  const isSizedProduct = (item) => item.sizeType !== "none";

  const getCartKey = (item, size) =>
    isSizedProduct(item) ? `${item._id}-${size}` : item._id;

  

  const getTotalStock = (item) => {
    if (item.sizeType === "none") return item.quantity || 0;
    return Object.values(item.stock || {}).reduce((sum, val) => sum + val, 0);
  };

  const getAvailableStock = (item, size) => {
    if (item.sizeType === "none") return item.quantity || 0;
    return item.stock?.[size] || 0;
  };

  const handleSizeSelect = (itemId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  // const handleAddToCart = (item) => {
  //   if (item.sizeType !== "none" && !selectedSizes[item._id]) {
  //     alert("Please select a size first");
  //     return;
  //   }

  //   const size = selectedSizes[item._id];
  //   const availableStock = getAvailableStock(item, size);
  //   const cartQty = cart[`${item._id}-${size}`]?.quantity || 0;

  //   if (cartQty >= availableStock) {
  //     alert("No more stock available");
  //     return;
  //   }

  //   addToCart(item, size);
  // };

  const handleAddToCart = (item) => {
  let size = null;

  if (isSizedProduct(item)) {
    size = selectedSizes[item._id];
    if (!size) {
      alert("Please select a size");
      return;
    }
  }

  const cartKey = getCartKey(item, size);
  const cartQty = cart[cartKey]?.quantity || 0;
  const availableStock = getAvailableStock(item, size);

  if (cartQty >= availableStock) {
    alert("No more stock available");
    return;
  }

  addToCart(item, size);
};

  const handleRemoveFromCart = (item) => {
    const size = isSizedProduct(item)
      ? selectedSizes[item._id] || item.sizes?.[0]
      : null;

    removeFromCart(getCartKey(item, size));
  };

  const getCartQuantity = (item) => {
    if (!isSizedProduct(item)) {
      return cart[item._id]?.quantity || 0;
    }

    const size = selectedSizes[item._id];
    if (!size) return 0;

    return cart[`${item._id}-${size}`]?.quantity || 0;
  };

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

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
            <h1 className="text-4xl md:text-5xl font-light mb-2">Club Merch</h1>
            <p className="text-gray-400 font-light">Official Abhikalpa merchandise</p>
          </div>

          {cartCount > 0 && (
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-sm hover:bg-gray-200 transition"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-light">{cartCount} items • ₹{cartTotal}</span>
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
                const totalStock = getTotalStock(item);
                const isOutOfStock = totalStock === 0;
                const selectedSize = selectedSizes[item._id];
                const quantity = getCartQuantity(item);

                return (
                  <div
                    key={item._id}
                    className={`bg-white text-black rounded-sm shadow-2xl overflow-hidden group ${
                      isOutOfStock ? "opacity-50" : "hover:scale-105"
                    } transition-transform duration-300`}
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
                          <span className="text-gray-500 text-sm font-light">No Image</span>
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xl font-light">Out of Stock</span>
                        </div>
                      )}
                      {!isOutOfStock && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="p-6">
                      <h2 className="text-xl font-light mb-1">{item.name}</h2>
                      <p className="text-sm text-gray-600 font-light mb-3">{item.description}</p>
                      <p className="text-2xl font-light mb-2">₹{item.price}</p>
                      
                      {/* Stock Info - Show size-wise for sized items */}
                      {item.sizeType === "none" ? (
                        <p className="text-sm text-gray-500 mb-4">
                          {totalStock} in stock
                        </p>
                      ) : (
                        <div className="text-sm text-gray-500 mb-4">
                          <p className="font-medium mb-1">Stock by size:</p>
                          <div className="flex gap-2 flex-wrap">
                            {item.sizes?.map(size => {
                              const sizeStock = item.stock?.[size] || 0;
                              return (
                                <span key={size} className={sizeStock === 0 ? "text-red-500" : ""}>
                                  {size}: {sizeStock}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Size Selection */}
                      {!isOutOfStock && item.sizeType !== "none" && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Select Size:</p>
                          <div className="flex gap-2 flex-wrap">
                            {item.sizes?.map(size => {
                              const sizeStock = item.stock?.[size] || 0;
                              const isSizeOutOfStock = sizeStock === 0;
                              
                              return (
                                <button
                                  key={size}
                                  onClick={() => !isSizeOutOfStock && handleSizeSelect(item._id, size)}
                                  disabled={isSizeOutOfStock}
                                  className={`px-3 py-1 border text-sm font-light transition ${
                                    selectedSize === size
                                      ? "bg-black text-white border-black"
                                      : isSizeOutOfStock
                                      ? "border-gray-300 text-gray-300 cursor-not-allowed line-through"
                                      : "border-black hover:bg-black hover:text-white"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CART */}
                      {!isOutOfStock && (
                        <>
                          {quantity > 0 ? (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleRemoveFromCart(item)}
                                  className="w-10 h-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition rounded-sm"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>

                                <span className="text-lg font-light min-w-[2rem] text-center">
                                  {quantity}
                                </span>

                                <button
                                  onClick={() => handleAddToCart(item)}
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
                              onClick={() => handleAddToCart(item)}
                              disabled={item.sizeType !== "none" && !selectedSize}
                              className="w-full py-3 bg-black text-white font-light hover:bg-gray-900 transition rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {item.sizeType !== "none" && !selectedSize ? "Select Size" : "Add to Cart"}
                            </button>
                          )}
                        </>
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
          onClick={() => navigate("/cart")}
          className="fixed bottom-6 left-6 right-6 md:hidden bg-white text-black p-4 rounded-sm shadow-2xl flex items-center justify-between hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            <div>
              <p className="font-light text-sm">{cartCount} items</p>
              <p className="font-light text-lg">₹{cartTotal}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-black text-white font-light rounded-sm">View Cart</span>
        </button>
      )}
    </div>
  );
}