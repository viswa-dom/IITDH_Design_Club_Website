import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("Pending");

  const fetchOrders = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("No session found. Please log in.");
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
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Fetch orders error:", err);
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
          status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }

      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-indigo-100 text-indigo-700";
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-light">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-light mb-10">Orders Management</h1>

        {orders.length === 0 ? (
          <p className="text-gray-400 text-center py-24">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-black">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Contact</th>
                  <th className="p-4 text-left">Items</th>
                  <th className="p-4 text-center">Total</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    {/* ORDER IDS */}
                    <td className="p-4 text-sm">
                      <div className="text-xs text-gray-500">Order ID</div>
                      <div className="break-all">{order._id}</div>

                      {order.transactionId && (
                        <>
                          <div className="mt-2 text-xs text-gray-500">
                            UPI Transaction ID
                          </div>
                          <div className="break-all text-green-700">
                            {order.transactionId}
                          </div>
                        </>
                      )}
                    </td>

                    {/* CUSTOMER */}
                    <td className="p-4">
                      <div className="font-medium">
                        {order.customer?.name || "Awaiting payment confirmation"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.customer?.email || ""}
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="p-4 text-sm">
                      {order.customer?.phone || "—"}
                    </td>

                    {/* ITEMS */}
                    <td className="p-4 text-sm">
                      {order.items?.map((item, idx) => (
                        <div key={idx}>
                          {item.name} × {item.quantity}
                          {item.size && ` (${item.size})`}
                        </div>
                      ))}
                    </td>

                    {/* TOTAL */}
                    <td className="p-4 text-center">₹{order.total}</td>

                    {/* STATUS */}
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-sm rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="p-4 text-center text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTION */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setEditingOrder(order._id);
                          setNewStatus(order.status);
                        }}
                        className="px-4 py-2 border border-black hover:bg-black hover:text-white text-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STATUS MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 w-full max-w-md">
            <h2 className="text-2xl mb-6">Update Order Status</h2>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border mb-6"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => updateOrderStatus(editingOrder, newStatus)}
                className="flex-1 bg-black text-white py-2"
              >
                Update
              </button>
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 border border-black py-2"
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