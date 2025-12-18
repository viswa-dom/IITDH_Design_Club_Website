import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.reverse());
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-light mb-6">Orders</h1>

        <table className="w-full text-left border border-gray-700 mt-8">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="p-3">Transaction ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b border-gray-800">
                <td className="p-3">{o.transactionId}</td>
                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.email}</td>
                <td className="p-3">{o.phone}</td>
                <td className="p-3">
                  {o.items.map(i => (
                    <p key={i.productId}>
                      {i.name} × {i.quantity}
                    </p>
                  ))}
                </td>
                <td className="p-3">₹{o.total}</td>
                <td className="p-3">
                  {new Date(o.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
