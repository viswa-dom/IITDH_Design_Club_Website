import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Helmet } from 'react-helmet-async';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("Pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
    setUpdatingStatus(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please log in");
        return;
      }

      // Update order status
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
      alert("Failed to update order status: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please log in");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ _id: orderId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete order");
      }

      setDeletingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Delete order error:", err);
      alert("Failed to delete order");
    }
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = orders.map((order) => ({
      "Order ID": order._id,
      "Order Reference": order.transactionRef || "N/A",
      "Transaction ID": order.transactionId || "N/A",
      "Customer Name": order.customer?.name || "Awaiting confirmation",
      "Email": order.customer?.email || "",
      "Phone": order.customer?.phone || "",
      "Items": order.items
        ?.map(
          (item) =>
            `${item.name} x${item.quantity}${item.size ? ` (${item.size})` : ""}`
        )
        .join("; "),
      "Total": `₹${order.total}`,
      "Status": order.status,
      "Created Date": new Date(order.createdAt).toLocaleString(),
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers
          .map((header) => {
            const cell = row[header] || "";
            // Escape quotes and wrap in quotes if contains comma
            return `"${String(cell).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <Helmet>
        <title>Admin Orders Management - Abhikalpa</title>
      </Helmet>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-light mb-2">Orders Management</h1>
            <p className="text-gray-400 text-sm">
              Orders are automatically confirmed when customers submit the payment form
            </p>
          </div>
          
          {orders.length > 0 && (
            <button
              onClick={exportToExcel}
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export to Excel
            </button>
          )}
        </div>

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
                      <div className="break-all text-xs">{order._id}</div>

                      {order.transactionRef && (
                        <>
                          <div className="mt-2 text-xs text-gray-500">
                            Order Reference
                          </div>
                          <div className="break-all text-blue-700 font-mono text-xs">
                            {order.transactionRef}
                          </div>
                        </>
                      )}

                      {order.transactionId && (
                        <>
                          <div className="mt-2 text-xs text-gray-500">
                            UPI Transaction ID
                          </div>
                          <div className="break-all text-green-700 text-xs">
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
                      <span
                        className={`px-3 py-1 text-sm rounded ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      {order.status === "Confirmed" && (
                        <div className="text-xs text-green-600 mt-1">
                          ✓ Stock deducted
                        </div>
                      )}
                    </td>

                    {/* DATE */}
                    <td className="p-4 text-center text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setEditingOrder(order._id);
                            setNewStatus(order.status);
                          }}
                          className="px-3 py-1 border border-black hover:bg-black hover:text-white text-sm"
                          title="Update Status"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setDeletingOrder(order)}
                          className="px-3 py-1 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm"
                          title="Delete Order"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STATUS UPDATE MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 w-full max-w-md">
            <h2 className="text-2xl mb-6">Update Order Status</h2>

            {/* Info note */}
            <div className="bg-blue-50 border border-blue-300 rounded p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Note:</strong> Orders are automatically confirmed (and stock deducted) when customers submit the payment form. Changing status here won't affect inventory.
              </p>
            </div>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border mb-6"
              disabled={updatingStatus}
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
                disabled={updatingStatus}
                className="flex-1 bg-black text-white py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? "Updating..." : "Update"}
              </button>
              <button
                onClick={() => setEditingOrder(null)}
                disabled={updatingStatus}
                className="flex-1 border border-black py-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 w-full max-w-md">
            <h2 className="text-2xl mb-4">Delete Order</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this order?
            </p>
            
            <div className="bg-gray-100 p-4 mb-6 rounded">
              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-medium">Order ID:</span>{" "}
                  <span className="text-xs">{deletingOrder._id}</span>
                </div>
                {deletingOrder.transactionRef && (
                  <div className="mb-2">
                    <span className="font-medium">Order Reference:</span>{" "}
                    <span className="text-xs font-mono text-blue-700">
                      {deletingOrder.transactionRef}
                    </span>
                  </div>
                )}
                <div className="mb-2">
                  <span className="font-medium">Customer:</span>{" "}
                  {deletingOrder.customer?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ₹{deletingOrder.total}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-6">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Warning:</strong> If this order was confirmed, deleting it will NOT restore the inventory stock. You'll need to manually adjust stock if needed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => deleteOrder(deletingOrder._id)}
                className="flex-1 bg-red-600 text-white py-2 hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeletingOrder(null)}
                className="flex-1 border border-black py-2 hover:bg-gray-100"
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