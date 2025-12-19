// api/sync-order.js
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { transactionId, name, email, phone } = req.body;

  if (!transactionId || !name || !email || !phone) {
    return res.status(400).json({ error: "Missing fields" });
  }

  transactionId = transactionId.trim();

  const client = await clientPromise;
  const db = client.db("abhikalpa");
  const orders = db.collection("orders");

  const result = await orders.findOneAndUpdate(
    { transactionId },
    {
      $set: {
        customer: { name, email, phone },
        status: "Confirmed",
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  if (!result.value) {
    return res.status(404).json({
      error: "Order not found",
      transactionId,
    });
  }

  return res.json({ success: true });
}
