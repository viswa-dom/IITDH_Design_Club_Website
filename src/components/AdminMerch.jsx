import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminMerch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "clothing",
    images: [""],
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 0, M: 0, L: 0, XL: 0 },
    featured: false
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      alert("Failed to load products");
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
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.images || [""],
        sizes: product.sizes || ["S", "M", "L", "XL"],
        stock: product.stock || { S: 0, M: 0, L: 0, XL: 0 },
        featured: product.featured || false
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "clothing",
        images: [""],
        sizes: ["S", "M", "L", "XL"],
        stock: { S: 0, M: 0, L: 0, XL: 0 },
        featured: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in");
        return;
      }

      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { _id: editingProduct._id, ...formData, price: Number(formData.price) }
        : { ...formData, price: Number(formData.price) };

      const res = await fetch("/api/products", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save product");

      setShowModal(false);
      await fetchProducts();
      alert(editingProduct ? "Product updated!" : "Product created!");
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product");
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Delete this product?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ _id: productId }),
      });

      if (!res.ok) throw new Error("Failed to delete product");

      await fetchProducts();
      alert("Product deleted!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  const updateStock = (size, value) => {
    setFormData(prev => ({
      ...prev,
      stock: { ...prev.stock, [size]: Number(value) }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-light tracking-wide">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16 md:px-12 lg:px-24">
      <div className="mb-16 flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">Merch Management</h1>
          <p className="text-gray-400 font-light tracking-wide">Add and manage products</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-all duration-300 tracking-wide font-light"
        >
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-400 text-center py-12 tracking-wide">No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white text-black p-6">
              <img 
                src={product.images[0] || "https://via.placeholder.com/300"}
                alt={product.name}
                className="w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-light mb-2 tracking-wide">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <p className="text-lg mb-4">₹{product.price}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 text-sm tracking-wide font-light"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4 overflow-y-auto">
          <div className="bg-white text-black p-8 max-w-2xl w-full my-8 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-light mb-6 tracking-wide">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-light tracking-wide">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 font-light"
                />
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 font-light"
                  rows="3"
                />
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-2 border border-gray-300 font-light"
                />
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 font-light"
                >
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="stationery">Stationery</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Image URL</label>
                <input
                  type="url"
                  value={formData.images[0]}
                  onChange={(e) => setFormData({...formData, images: [e.target.value]})}
                  className="w-full p-2 border border-gray-300 font-light"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Stock by Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {formData.sizes.map(size => (
                    <div key={size}>
                      <label className="text-sm">{size}</label>
                      <input
                        type="number"
                        value={formData.stock[size]}
                        onChange={(e) => updateStock(size, e.target.value)}
                        className="w-full p-2 border border-gray-300 font-light"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-light tracking-wide">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  />
                  Featured Product
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-all duration-300 tracking-wide font-light"
                >
                  {editingProduct ? "Update" : "Create"} Product
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300 tracking-wide font-light"
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