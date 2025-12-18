import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("No session found - Please log in");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("API returned non-array data:", data);
        setOrders([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Please log in");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          _id: orderId,
          status: status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }

      setEditingOrder(null);
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-light tracking-wide">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-light text-red-500 mb-6 tracking-wide">Error: {error}</p>
          <button 
            onClick={fetchOrders}
            className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-all duration-300 tracking-wide text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-3">
            Orders Management
          </h1>
          <p className="text-gray-400 font-light">
            View and manage customer orders
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-400 text-center py-24 tracking-wide">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-black">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="p-4 text-left font-light tracking-wide">Order ID</th>
                  <th className="p-4 text-left font-light tracking-wide">Customer</th>
                  <th className="p-4 text-left font-light tracking-wide">Contact</th>
                  <th className="p-4 text-left font-light tracking-wide">Items</th>
                  <th className="p-4 text-center font-light tracking-wide">Total</th>
                  <th className="p-4 text-center font-light tracking-wide">Status</th>
                  <th className="p-4 text-center font-light tracking-wide">Date</th>
                  <th className="p-4 text-center font-light tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-light text-sm">
                      {order.transactionId || order._id}
                    </td>
                    <td className="p-4 font-light">
                      <div>{order.name}</div>
                      <div className="text-sm text-gray-600">{order.email}</div>
                    </td>
                    <td className="p-4 font-light text-sm">
                      {order.phone}
                    </td>
                    <td className="p-4 font-light text-sm">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="mb-1">
                          {item.name} × {item.quantity}
                          {item.size && ` (${item.size})`}
                        </div>
                      ))}
                    </td>
                    <td className="p-4 text-center font-light">
                      ₹{order.total}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 text-sm tracking-wide ${
                        order.status === "Completed" 
                          ? "bg-green-100 text-green-600"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-light text-sm">
                      {new Date(order.createdAt || order.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setEditingOrder(order._id);
                          setNewStatus(order.status || "Pending");
                        }}
                        className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-white text-black p-8 max-w-md w-full">
            <h2 className="text-2xl font-light mb-6 tracking-wide">
              Update Order Status
            </h2>
            
            <div className="mb-6">
              <label className="block mb-2 font-light tracking-wide">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 font-light"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => updateOrderStatus(editingOrder, newStatus)}
                className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-all duration-300 tracking-wide font-light"
              >
                Update
              </button>
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300 tracking-wide font-light"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}