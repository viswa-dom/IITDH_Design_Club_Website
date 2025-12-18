import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader } from "lucide-react";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function finalizeOrder() {
      try {
        // 1️⃣ Read cart from localStorage
        const raw = localStorage.getItem("cart");
        if (!raw) {
          setStatus("error");
          setErrorMessage("No cart data found. Please try placing your order again.");
          return;
        }

        const cart = JSON.parse(raw);

        if (cart.length === 0) {
          setStatus("error");
          setErrorMessage("Cart is empty. Please add items before checking out.");
          return;
        }

        // 2️⃣ Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 3️⃣ Create order in database
        const orderPayload = {
          transactionId: crypto.randomUUID(), // temporary ID until google form sync
          items: cart.map(item => ({
            productId: item._id,
            name: item.name,
            size: item.selectedSize,
            quantity: item.quantity,
            price: item.price
          })),
          total,
          status: "Pending"
        };

        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!orderRes.ok) {
          throw new Error("Failed to create order");
        }

        const orderData = await orderRes.json();
        console.log("Order created:", orderData);

        // 4️⃣ Build items list for stock deduction
        const items = cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          size: item.selectedSize,
          sizeType: item.sizeType || "none",
        }));

        // 5️⃣ Call API to deduct stock
        const stockRes = await fetch("/api/deduct-stock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items })
        });

        if (!stockRes.ok) {
          throw new Error("Failed to deduct stock");
        }

        const stockData = await stockRes.json();
        console.log("Stock deducted:", stockData);

        // 6️⃣ Clear cart after successful order
        localStorage.removeItem("cart");

        // Trigger cart update event for CartContext
        window.dispatchEvent(new Event("storage"));

        setStatus("success");

      } catch (err) {
        console.error("Order finalization failed:", err);
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred. Please contact support.");
      }
    }

    finalizeOrder();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-3xl mx-auto text-center">

        {status === "processing" && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-6 animate-spin text-gray-400" />
            <h1 className="text-4xl font-light mb-4">Processing Your Order</h1>
            <p className="text-gray-400 text-lg font-light mb-8">
              Please wait while we finalize your order and reserve your items...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
            <h1 className="text-4xl font-light mb-4">Order Confirmed!</h1>
            <p className="text-gray-400 text-lg font-light mb-8">
              Thank you for your purchase! Your order has been confirmed and stock has been reserved. We will contact you soon with further details.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-white text-black rounded-sm hover:bg-gray-200 transition font-light"
            >
              Return Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-4xl font-light mb-4 text-red-500">Order Error</h1>
            <p className="text-gray-400 text-lg font-light mb-8">
              {errorMessage}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/cart")}
                className="px-6 py-3 bg-white text-black rounded-sm hover:bg-gray-200 transition font-light"
              >
                Back to Cart
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-white text-white rounded-sm hover:bg-white hover:text-black transition font-light"
              >
                Return Home
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}