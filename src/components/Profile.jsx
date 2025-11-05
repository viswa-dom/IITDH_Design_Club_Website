import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  // Mock data for orders (replace with actual data from backend later)
  const mockOrders = [
    {
      id: 1,
      date: '2025-11-01',
      items: ['Design Club T-Shirt', 'Sticker Pack'],
      status: 'Delivered',
      total: 799,
    },
    {
      id: 2,
      date: '2025-10-15',
      items: ['Design Club Hoodie'],
      status: 'Processing',
      total: 1499,
    },
  ];

  // Mock recommendations (replace with actual recommendation logic later)
  const recommendations = [
    {
      id: 1,
      name: 'Design Club Cap',
      price: 399,
      image: 'https://placeholder.com/150',
    },
    {
      id: 2,
      name: 'Design Club Notebook',
      price: 299,
      image: 'https://placeholder.com/150',
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-white text-black px-6 py-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Profile Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-light">My Profile</h1>
          <p className="mt-2 text-gray-600">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order History */}
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-light text-gray-900 mb-4">Order History</h2>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                        <ul className="mt-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{order.total}</p>
                        <p className="text-sm text-gray-600">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations / Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
              <h3 className="text-xl font-light mb-4">Recommended for You</h3>
              <div className="space-y-4">
                {recommendations.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.price}</p>
                      <button className="mt-2 inline-block bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Profile;