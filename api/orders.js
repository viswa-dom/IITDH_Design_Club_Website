// api/orders.js
import { MongoClient, ObjectId } from "mongodb";
import { createClient } from "@supabase/supabase-js";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // POST - Create new order
  if (req.method === "POST") {
    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    const order = {
      items: req.body.items,
      total: req.body.total,
      transactionId: null,
      customer: null,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await orders.insertOne(order);
    return res.status(201).json({ _id: result.insertedId });
  }

  // GET - Fetch all orders (admin only)
  if (req.method === "GET") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    if (data.user?.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json(orders);
  }

  // PUT - Update order status (admin only)
  if (req.method === "PUT") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    if (data.user?.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { _id, status } = req.body;
    const client = await connectToDatabase();
    await client
      .db("abhikalpa")
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { status, updatedAt: new Date() } }
      );

    return res.json({ success: true });
  }

  // DELETE - Delete order (admin only)
  if (req.method === "DELETE") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    if (data.user?.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { _id } = req.body;
    
    if (!_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      const client = await connectToDatabase();
      const result = await client
        .db("abhikalpa")
        .collection("orders")
        .deleteOne({ _id: new ObjectId(_id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      return res.json({ success: true, message: "Order deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Failed to delete order" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}