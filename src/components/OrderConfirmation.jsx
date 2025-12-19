import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader } from "lucide-react";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function finalizeOrder() {
      try {
        const raw = localStorage.getItem("abhikalpa_cart");
        if (!raw) {
          setStatus("error");
          setErrorMessage("No cart data found.");
          return;
        }

        const cartObject = JSON.parse(raw);
        const cart = Object.values(cartObject);

        if (cart.length === 0) {
          setStatus("error");
          setErrorMessage("Cart is empty.");
          return;
        }

        const total = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // ✅ DO NOT CREATE transactionId HERE
        const orderPayload = {
          items: cart.map(item => ({
            productId: item._id,
            name: item.name,
            size: item.selectedSize,
            quantity: item.quantity,
            price: item.price
          })),
          total,
          status: "Pending",
          customer: null,          // ✅ explicitly empty
          transactionId: null      // ✅ explicitly empty
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

        // Deduct stock
        const items = cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          size: item.selectedSize,
          sizeType: item.sizeType || "none",
        }));

        const stockRes = await fetch("/api/deduct-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items })
        });

        if (!stockRes.ok) {
          throw new Error("Failed to deduct stock");
        }

        localStorage.removeItem("abhikalpa_cart");
        window.dispatchEvent(new Event("storage"));

        setStatus("success");

      } catch (err) {
        console.error("Order finalization failed:", err);
        setStatus("error");
        setErrorMessage(err.message || "Unexpected error");
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
              Please wait while we finalize your order...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
            <h1 className="text-4xl font-light mb-4">Order Placed</h1>
            <p className="text-gray-400 text-lg font-light mb-8">
              Please complete payment and submit the confirmation form.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition"
            >
              Return Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-4xl font-light mb-4 text-red-500">
              Order Error
            </h1>
            <p className="text-gray-400 text-lg font-light mb-8">
              {errorMessage}
            </p>
          </>
        )}

      </div>
    </div>
  );
}
