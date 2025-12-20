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

    // Generate unique order reference
    const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = {
      items: req.body.items,
      total: req.body.total,
      transactionRef: transactionRef,  // ✅ Order reference for customer
      userEmail: req.body.userEmail,    // ✅ FIXED: Store user's email for later sync
      transactionId: null,              // UPI transaction ID (filled later)
      customer: null,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await orders.insertOne(order);
    
    // Return the transaction reference to show to customer
    return res.status(201).json({ 
      _id: result.insertedId,
      transactionRef: transactionRef  // ✅ Customer needs this!
    });
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

  // DELETE - Delete order
  if (req.method === "DELETE") {
    const { _id, adminDelete } = req.body;
    
    if (!_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      const client = await connectToDatabase();
      const ordersCollection = client.db("abhikalpa").collection("orders");

      // If adminDelete flag is true, require authentication
      if (adminDelete) {
        const token = req.headers.authorization?.replace("Bearer ", "");
        const { data } = await supabase.auth.getUser(token);
        if (data.user?.app_metadata?.role !== "admin") {
          return res.status(403).json({ error: "Forbidden" });
        }
      } else {
        // For user-initiated deletes (closing checkout modal):
        // Only allow deletion of Pending orders with no customer info
        const order = await ordersCollection.findOne({ _id: new ObjectId(_id) });
        
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Security check: only allow deleting placeholder orders
        if (order.status !== "Pending" || order.customer !== null) {
          return res.status(403).json({ 
            error: "Cannot delete confirmed orders" 
          });
        }
      }

      const result = await ordersCollection.deleteOne({ _id: new ObjectId(_id) });

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