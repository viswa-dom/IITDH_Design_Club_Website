import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Package, ShoppingBag, User, Mail, Phone, UserCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

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

  // Get user metadata (username and phone from sign up)
  const username = user?.user_metadata?.username || user?.user_metadata?.name || 'User';
  const phone = user?.user_metadata?.phone || 'Not provided';

  const handleAddToCart = (item) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', item);
    alert(`${item.name} added to cart!`);
  };

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

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Order History - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-white text-black rounded-sm p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6" />
                  <h2 className="text-3xl font-light">Order History</h2>
                </div>

                {mockOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-light">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border border-gray-200 rounded-sm p-6 hover:border-black transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-light text-lg">Order #{order.id}</p>
                              <span className={`px-3 py-1 text-xs rounded-sm ${
                                order.status === 'Delivered' 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3 font-light">{order.date}</p>
                            <ul className="space-y-1">
                              {order.items.map((item, index) => (
                                <li key={index} className="text-sm text-gray-700 font-light">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-light">₹{order.total}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white text-black rounded-sm p-8 shadow-2xl sticky top-24">
                <h3 className="text-2xl font-light mb-6">Recommended for You</h3>
                <div className="space-y-6">
                  {recommendations.map((item) => (
                    <div key={item.id} className="group">
                      <div className="flex gap-4 items-start">
                        <div className="w-20 h-20 bg-gray-200 rounded-sm flex-shrink-0 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-light text-base mb-1">{item.name}</p>
                          <p className="text-sm text-gray-600 font-light mb-3">₹{item.price}</p>
                          <button 
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-black text-white px-4 py-2 rounded-sm text-sm font-light hover:bg-gray-900 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      {item.id !== recommendations[recommendations.length - 1].id && (
                        <div className="border-b border-gray-200 mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;