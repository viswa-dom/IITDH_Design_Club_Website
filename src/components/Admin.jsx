import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simple auth check (replace with AuthContext later)
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (!isLoggedIn || role !== "admin") {
      navigate("/"); // or "/login"
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 font-light">
            Manage merch, orders, and site content
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Merch Management */}
          <div className="bg-white text-black rounded-sm shadow-2xl p-6">
            <h2 className="text-2xl font-light mb-4">
              Merch Management
            </h2>

            <div className="space-y-3">
              <button className="w-full py-2 border border-black hover:bg-black hover:text-white transition font-light">
                Add New Merch
              </button>

              <button className="w-full py-2 border border-black hover:bg-black hover:text-white transition font-light">
                Edit / Remove Merch
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white text-black rounded-sm shadow-2xl p-6">
            <h2 className="text-2xl font-light mb-4">
              Orders
            </h2>

            <div className="space-y-3">
              <button className="w-full py-2 border border-black hover:bg-black hover:text-white transition font-light">
                View All Orders
              </button>

              <button className="w-full py-2 border border-black hover:bg-black hover:text-white transition font-light">
                Pending Orders
              </button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
