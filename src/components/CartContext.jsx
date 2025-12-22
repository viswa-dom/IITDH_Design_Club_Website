import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty object
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('abhikalpa_cart');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch {
      return {};
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('abhikalpa_cart', JSON.stringify(cart));
  }, [cart]);

  // Listen for product deletions and updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'deleted_product' && e.newValue) {
        removeDeletedProducts(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Validate cart against current stock
  useEffect(() => {
    const validateCart = async () => {
      try {
        const res = await fetch("/api/products");
        const products = await res.json();
        
        setCart(prev => {
          const newCart = { ...prev };
          let hasChanges = false;

          Object.keys(newCart).forEach(key => {
            const cartItem = newCart[key];
            const product = products.find(p => p._id === cartItem._id);

            // Remove if product doesn't exist anymore
            if (!product) {
              delete newCart[key];
              hasChanges = true;
              return;
            }

            // Check stock availability
            let maxStock = 0;
            if (product.sizeType === "none") {
              maxStock = product.quantity || 0;
            } else {
              maxStock = product.stock?.[cartItem.selectedSize] || 0;
            }

            // Remove if out of stock
            if (maxStock === 0) {
              delete newCart[key];
              hasChanges = true;
            }
            // Adjust quantity if exceeds stock
            else if (cartItem.quantity > maxStock) {
              newCart[key] = {
                ...cartItem,
                quantity: maxStock
              };
              hasChanges = true;
            }
          });

          return hasChanges ? newCart : prev;
        });
      } catch (err) {
        console.error("Cart validation error:", err);
      }
    };

    // Validate on mount and periodically
    validateCart();
    const interval = setInterval(validateCart, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Remove deleted products from cart
  const removeDeletedProducts = (deletedProductId) => {
    setCart(prev => {
      const newCart = { ...prev };
      let hasChanges = false;

      Object.keys(newCart).forEach(key => {
        // Check if key contains the deleted product ID
        if (key.startsWith(deletedProductId) || key === deletedProductId) {
          delete newCart[key];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        alert("Some items were removed from your cart because they are no longer available.");
      }

      return newCart;
    });
  };

  const addToCart = (item, size = null) => {
    const key = size ? `${item._id}-${size}` : item._id;
    
    setCart(prev => ({
      ...prev,
      [key]: {
        id: key,
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.images?.[0],
        selectedSize: size,
        sizeType: item.sizeType,
        quantity: (prev[key]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromCart = (itemKey) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemKey] && newCart[itemKey].quantity > 1) {
        newCart[itemKey] = {
          ...newCart[itemKey],
          quantity: newCart[itemKey].quantity - 1
        };
      } else {
        delete newCart[itemKey];
      }
      return newCart;
    });
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      deleteItem(itemKey);
      return;
    }
    setCart(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        quantity
      }
    }));
  };

  const deleteItem = (itemKey) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[itemKey];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const getCartItems = () => {
    return Object.values(cart);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        deleteItem,
        clearCart,
        getCartItems,
        getCartCount,
        getCartTotal,
        removeDeletedProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};