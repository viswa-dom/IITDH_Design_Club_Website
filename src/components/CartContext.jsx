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

  // Listen for product deletions
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'deleted_product' && e.newValue) {
        removeDeletedProducts(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Remove deleted products from cart
  const removeDeletedProducts = (deletedProductId) => {
    setCart(prev => {
      const newCart = { ...prev };
      Object.keys(newCart).forEach(key => {
        if (key.startsWith(deletedProductId)) {
          delete newCart[key];
        }
      });
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