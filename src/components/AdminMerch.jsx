import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Upload, X } from "lucide-react";

export default function AdminMerch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "tshirt",
    images: [""],
    sizeType: "clothing",
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 0, M: 0, L: 0, XL: 0 },
    quantity: 0,
    featured: false,
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategoryChange = (category) => {
    let sizeType = "clothing";
    let sizes = ["S", "M", "L", "XL"];
    let stock = { S: 0, M: 0, L: 0, XL: 0 };

    if (category === "pants" || category === "shorts") {
      sizeType = "waist";
      sizes = ["28", "30", "32", "34", "36", "38"];
      stock = { "28": 0, "30": 0, "32": 0, "34": 0, "36": 0, "38": 0 };
    } else if (category === "accessories" || category === "stationery") {
      sizeType = "none";
      sizes = [];
      stock = {};
    }

    setFormData({
      ...formData,
      category,
      sizeType,
      sizes,
      stock,
      quantity: 0,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        // Upload to imgbb (free image hosting)
        const formData = new FormData();
        formData.append('image', base64.split(',')[1]);
        
        const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            images: [data.data.url]
          }));
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed. Please use URL instead.");
    } finally {
      setUploadingImage(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        price: String(product.price),
        sizeType: product.sizeType || "clothing",
        quantity: product.quantity || 0,
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
    if (!confirm("Delete this product? It will be removed from all user carts.")) return;

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

      const data = await res.json();
      
      // Broadcast deletion to all users via localStorage event
      if (data.deletedProductId) {
        localStorage.setItem('deleted_product', data.deletedProductId);
        localStorage.removeItem('deleted_product');
      }

      fetchProducts();
      alert("Product deleted successfully!");
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

  const getTotalStock = (product) => {
    if (product.sizeType === "none") return product.quantity || 0;
    return Object.values(product.stock || {}).reduce((sum, val) => sum + val, 0);
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
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 mb-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-3">
              Merch Management
            </h1>
            <p className="text-gray-400 font-light">Add and manage products</p>
          </div>

          <button
            onClick={() => openModal()}
            className="px-8 py-3 bg-white text-black font-light tracking-wide hover:bg-gray-200 transition"
          >
            Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-24">No products yet.</p>
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
                <p className="text-sm text-gray-600 mb-2 capitalize">{p.category}</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>
                <p className="text-lg mb-2">₹{p.price}</p>
                
                {/* Stock Info */}
                <div className="mb-4 text-sm">
                  <p className="font-medium mb-1">Stock: {getTotalStock(p)} total</p>
                  {p.sizeType !== "none" && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(p.stock || {}).map(([size, qty]) => (
                        <div key={size} className="flex justify-between">
                          <span>{size}:</span>
                          <span className={qty === 0 ? "text-red-600" : ""}>{qty}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-6 overflow-y-auto">
          <div className="bg-white text-black max-w-3xl w-full p-10 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-light mb-10">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-light tracking-wide">Name</label>
                <input
                  placeholder="Product name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border px-3 py-2 font-light"
                />
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Description</label>
                <textarea
                  placeholder="Product description"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-3 py-2 font-light"
                />
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Category</label>
                <select
                  value={formData.category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full border px-3 py-2 font-light"
                >
                  <option value="tshirt">T-Shirt</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="pants">Pants</option>
                  <option value="shorts">Shorts</option>
                  <option value="accessories">Accessories</option>
                  <option value="stationery">Stationery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-light tracking-wide">Price (₹)</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border px-3 py-2 font-light"
                />
              </div>

              {/* Image Upload/URL */}
              <div>
                <label className="block mb-2 font-light tracking-wide">Product Image</label>
                
                {formData.images[0] && (
                  <div className="mb-3 relative">
                    <img src={formData.images[0]} alt="Preview" className="w-full h-48 object-cover rounded" />
                    <button
                      onClick={() => setFormData({ ...formData, images: [""] })}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full border px-3 py-2 font-light"
                  />
                  <p className="text-xs text-gray-500 text-center">OR</p>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.images[0]}
                    onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                    className="w-full border px-3 py-2 font-light"
                  />
                </div>
                {uploadingImage && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
              </div>

              {/* Stock Management */}
              {formData.sizeType === "clothing" && (
                <div>
                  <label className="block mb-3 font-light tracking-wide">Stock by Size (S, M, L, XL)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {formData.sizes.map(s => (
                      <div key={s}>
                        <label className="text-sm block mb-1">{s}</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock[s] || 0}
                          onChange={e => updateStock(s, e.target.value)}
                          className="w-full border px-2 py-1 font-light"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.sizeType === "waist" && (
                <div>
                  <label className="block mb-3 font-light tracking-wide">Stock by Waist Size (inches)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {formData.sizes.map(s => (
                      <div key={s}>
                        <label className="text-sm block mb-1">{s}"</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock[s] || 0}
                          onChange={e => updateStock(s, e.target.value)}
                          className="w-full border px-2 py-1 font-light"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.sizeType === "none" && (
                <div>
                  <label className="block mb-2 font-light tracking-wide">Quantity in Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full border px-3 py-2 font-light"
                  />
                </div>
              )}

              <label className="flex gap-2 font-light items-center">
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