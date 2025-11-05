import React, { useState } from 'react';

const Merch = () => {
  // Mock data for merch items
  const merchItems = [
    {
      id: 1,
      name: 'Design Club T-Shirt',
      price: 799,
      description: 'Premium cotton t-shirt with Design Club logo',
      image: 'https://placeholder.com/300',
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 2,
      name: 'Design Club Hoodie',
      price: 1499,
      description: 'Comfortable hoodie perfect for winter',
      image: 'https://placeholder.com/300',
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 3,
      name: 'Sticker Pack',
      price: 199,
      description: 'Set of 5 designer stickers',
      image: 'https://placeholder.com/300',
      sizes: []
    },
    {
      id: 4,
      name: 'Design Club Cap',
      price: 399,
      description: 'Adjustable cap with embroidered logo',
      image: 'https://placeholder.com/300',
      sizes: ['One Size']
    }
  ];

  const [selectedSize, setSelectedSize] = useState({});

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Design Club Merch</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                <p className="text-gray-600 mt-2">{item.description}</p>
                <p className="text-2xl font-bold text-gray-900 mt-4">₹{item.price}</p>
                
                {item.sizes.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Size</label>
                    <select
                      value={selectedSize[item.id] || ''}
                      onChange={(e) => setSelectedSize({
                        ...selectedSize,
                        [item.id]: e.target.value
                      })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select Size</option>
                      {item.sizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <button className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Merch;