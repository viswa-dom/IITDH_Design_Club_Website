import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-light mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 font-light">
            Manage users, merch, and orders
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* USERS */}
          <div className="bg-white text-black p-6 rounded-sm shadow-2xl">
            <h2 className="text-2xl font-light mb-4">Users</h2>
            <button
              onClick={() => navigate("/admin/users")}
              className="w-full py-2 border border-black hover:bg-black hover:text-white font-light transition"
            >
              Manage Users
            </button>
          </div>

          {/* MERCH */}
          <div className="bg-white text-black p-6 rounded-sm shadow-2xl">
            <h2 className="text-2xl font-light mb-4">Merch</h2>
            <button
            onClick={() => navigate("/admin/products")}
            className="w-full py-2 border border-black hover:bg-black hover:text-white font-light transition">
              Add / Edit Merch
            </button>
          </div>

          {/* ORDERS */}
          <div className="bg-white text-black p-6 rounded-sm shadow-2xl">
            <h2 className="text-2xl font-light mb-4">Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="w-full py-2 border border-black hover:bg-black hover:text-white font-light transition"
            >
              View Orders
            </button>

          </div>

        </div>
      </section>
    </div>
  );
}
