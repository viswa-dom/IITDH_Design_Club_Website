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
  if (req.method === "POST") {
    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    const order = {
      items: req.body.items,
      total: req.body.total,
      transactionId: null,      // ✅ IMPORTANT
      customer: null,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await orders.insertOne(order);
    return res.status(201).json({ _id: result.insertedId });
  }

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

  res.status(405).end();
}
