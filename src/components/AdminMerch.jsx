import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminMerch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "clothing",
    images: [""],
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 0, M: 0, L: 0, XL: 0 },
    featured: false,
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("No session found");
        setLoading(false);
        return;
      }
      
      const res = await fetch("/api/products");
      
      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("API returned non-array data:", data);
        setProducts([]);
        alert("Failed to load products: Invalid data format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
      alert("Failed to load products: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        price: String(product.price),
      });
    } else {
      setEditingProduct(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("Login required");

      const res = await fetch("/api/products", {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...(editingProduct && { _id: editingProduct._id }),
          ...formData,
          price: Number(formData.price),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Save failed");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + err.message);
    }
  };

  const updateStock = (size, value) => {
    setFormData(prev => ({
      ...prev,
      stock: { ...prev.stock, [size]: Number(value) },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="font-light tracking-wide">Loading products…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 mb-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-3">
              Merch Management
            </h1>
            <p className="text-gray-400 font-light">
              Add and manage products
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="px-8 py-3 bg-white text-black font-light tracking-wide hover:bg-gray-200 transition"
          >
            Add Product
          </button>
        </div>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-24">
            No products yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map(p => (
              <div key={p._id} className="bg-white text-black p-6 hover:shadow-2xl transition">
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/400"}
                  alt={p.name}
                  className="w-full h-56 object-cover mb-6"
                />

                <h3 className="text-xl font-light mb-2">{p.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {p.description}
                </p>
                <p className="text-lg mb-6">₹{p.price}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => openModal(p)}
                    className="flex-1 py-2 border border-black hover:bg-black hover:text-white transition font-light"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="flex-1 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition font-light"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-6">
          <div className="bg-white text-black max-w-3xl w-full p-10 max-h-[90vh] overflow-y-auto">

            <h2 className="text-3xl font-light mb-10">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <div className="space-y-6">
              <input
                placeholder="Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border px-3 py-2 font-light"
              />

              <textarea
                placeholder="Description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border px-3 py-2 font-light"
              />

              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full border px-3 py-2 font-light"
              />

              <input
                placeholder="Image URL"
                value={formData.images[0]}
                onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                className="w-full border px-3 py-2 font-light"
              />

              <div className="grid grid-cols-4 gap-3">
                {formData.sizes.map(s => (
                  <div key={s}>
                    <label className="text-sm">{s}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock[s]}
                      onChange={e => updateStock(s, e.target.value)}
                      className="w-full border px-2 py-1 font-light"
                    />
                  </div>
                ))}
              </div>

              <label className="flex gap-2 font-light">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                />
                Featured Product
              </label>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-black text-white py-3 hover:bg-gray-800 transition font-light"
                >
                  {editingProduct ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-black py-3 hover:bg-black hover:text-white transition font-light"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}