import { useEffect, useState } from 'react';
import { Package, ShoppingBag, User, Mail, Phone, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.email) {
        console.log('No user email found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching orders for email:', user.email);
        const res = await fetch(`/api/user-orders?email=${encodeURIComponent(user.email)}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API error:', res.status, errorText);
          throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        console.log('Fetched orders:', data);
        console.log('Number of orders:', data.length);
        
        // Log order details for debugging
        if (data.length > 0) {
          console.log('First order customer data:', data[0].customer);
          console.log('First order status:', data[0].status);
        }
        
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email]);

  // Get user metadata
  const username = user?.user_metadata?.username || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const phone = user?.user_metadata?.phone || 'Not provided';

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-white rounded-sm flex items-center justify-center">
              <User className="w-10 h-10 text-black" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-light mb-3">My Profile</h1>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserCircle className="w-4 h-4" />
                  <p className="font-light">{username}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <p className="font-light">{user?.email}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <p className="font-light">{phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order History */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white text-black rounded-sm p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6" />
              <h2 className="text-3xl font-light">Order History</h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-500 font-light">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p className="font-light">Failed to load orders: {error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-light mb-4">No orders yet</p>
                <p className="text-sm text-gray-400 mb-6 font-light">
                  Orders will appear here after you complete a purchase
                </p>
                <a
                  href="/merch"
                  className="inline-block px-6 py-3 bg-black text-white font-light hover:bg-gray-900 transition-colors rounded-sm"
                >
                  Start Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order._id} 
                    className="border border-gray-200 rounded-sm p-6 hover:border-black transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <p className="font-light text-lg">
                            Order #{order.transactionRef || order.transactionId || order._id?.slice(-8)}
                          </p>
                          <span className={`px-3 py-1 text-xs rounded-sm ${
                            order.status === 'Completed' || order.status === 'Delivered'
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : order.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.status === 'Confirmed'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : order.status === 'Processing'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3 font-light">
                          {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Items:</p>
                          <ul className="space-y-1">
                            {order.items?.map((item, index) => (
                              <li key={index} className="text-sm text-gray-700 font-light">
                                • {item.name} 
                                {item.size && ` (${item.size})`}
                                {item.quantity > 1 && ` × ${item.quantity}`}
                                <span className="text-gray-500"> - ₹{item.price * item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {order.customer?.name && (
                          <p className="text-sm text-gray-600 mt-3 font-light">
                            Delivered to: {order.customer.name}
                          </p>
                        )}
                        {order.customer?.phone && order.customer.phone !== "N/A" && (
                          <p className="text-sm text-gray-600 font-light">
                            Contact: {order.customer.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right md:text-right">
                        <p className="text-sm text-gray-500 font-light mb-1">Total</p>
                        <p className="text-2xl font-light">₹{order.total}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;