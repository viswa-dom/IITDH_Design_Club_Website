import { useEffect, useState } from "react";

export default function Confirmation() {

  const [done, setDone] = useState(false);

  useEffect(() => {

    async function finalize() {

      // 1️⃣ read cart from localStorage
      const raw = localStorage.getItem("cart");
      if (!raw) {
        setDone(true);
        return;
      }

      const cart = JSON.parse(raw);

      // 2️⃣ Build items list expected by API
      const items = cart.map(p => ({
        productId: p._id,
        quantity: p.quantity,
        size: p.selectedSize,
        sizeType: p.sizeType || "none",
      }));

      try {

        // 3️⃣ call API to deduct stock
        await fetch("/api/deduct-stock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items })
        });

      } catch (err) {
        console.error("Stock deduction failed:", err);
      }

      // 4️⃣ finally clear cart
      localStorage.removeItem("cart");

      setDone(true);
    }

    finalize();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-3xl mx-auto text-center">

        <h1 className="text-4xl font-light mb-4">Order Received</h1>

        {!done ? (
          <p className="text-gray-400 text-lg font-light mb-8">
            Finalizing order... please wait...
          </p>
        ) : (
          <p className="text-gray-400 text-lg font-light mb-8">
            Thank you for your purchase! Stock has been reserved and we will contact you soon.
          </p>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-white text-black rounded-sm hover:bg-gray-200 transition font-light"
        >
          Return Home
        </button>

      </div>
    </div>
  );
}
