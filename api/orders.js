import { MongoClient, ObjectId } from "mongodb";
import { createClient } from "@supabase/supabase-js";

// Initialize MongoDB client
const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

// Initialize Supabase (for admin authentication)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ------------------- Main Handler -------------------
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await handleGET(req, res);
    } else if (req.method === 'POST') {
      return await handlePOST(req, res);
    } else if (req.method === 'PUT') {
      return await handlePUT(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('API Error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}

// ------------------- GET (Admin only) -------------------
async function handleGET(req, res) {
  try {
    // Check admin authentication
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || data.user?.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    const result = await orders.find({}).sort({ createdAt: -1 }).toArray();

    return res.status(200).json(result);
  } catch (e) {
    console.error('GET Error:', e);
    return res.status(500).json({ error: e.message });
  }
}

// ------------------- POST (Public - for creating orders) -------------------
async function handlePOST(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    const order = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "Pending",
    };

    const result = await orders.insertOne(order);

    return res.status(201).json({ _id: result.insertedId, ...order });
  } catch (e) {
    console.error('POST Error:', e);
    return res.status(500).json({ error: e.message });
  }
}

// ------------------- PUT (Admin only - for updating order status) -------------------
async function handlePUT(req, res) {
  try {
    // Check admin authentication
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || data.user?.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const { _id, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    await orders.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('PUT Error:', e);
    return res.status(500).json({ error: e.message });
  }
}