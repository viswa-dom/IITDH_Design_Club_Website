// /api/sync-order.js
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { transactionId, name, email, phone } = req.body;

  if (!transactionId || !name || !email || !phone) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 🔑 NORMALIZE INPUT
  transactionId = transactionId.trim();

  await dbConnect();

  const order = await Order.findOneAndUpdate(
    { transactionId },
    {
      $set: {
        customer: {
          name,
          email,
          phone,
        },
        status: "Confirmed",
      },
    },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({
      error: "Order not found for transactionId",
      transactionId,
    });
  }

  return res.json({
    success: true,
    orderId: order._id,
  });
}
