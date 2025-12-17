import clientPromise from "../src/lib/mongodb";
import { createClient } from "@supabase/supabase-js";
import { ObjectId } from "mongodb";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ------------------- Main Handler -------------------
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    } else if (req.method === 'DELETE') {
      return await handleDELETE(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('API Error:', e);
    return res.status(500).json({ error: e.message });
  }
}

// ------------------- GET (Public) -------------------
async function handleGET(req, res) {
  const client = await clientPromise;
  const db = client.db("abhikalpa");
  const products = db.collection("products");

  const all = await products.find({}).sort({ createdAt: -1 }).toArray();

  return res.status(200).json(all);
}

// ------------------- POST (Admin only) -------------------
async function handlePOST(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || data.user?.app_metadata?.role !== "admin") {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const client = await clientPromise;
  const db = client.db("abhikalpa");
  const products = db.collection("products");

  const product = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await products.insertOne(product);

  return res.status(201).json({ _id: result.insertedId, ...product });
}

// ------------------- PUT (Admin only) -------------------
async function handlePUT(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || data.user?.app_metadata?.role !== "admin") {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { _id, ...updateData } = req.body;

  const client = await clientPromise;
  const db = client.db("abhikalpa");
  const products = db.collection("products");

  await products.updateOne(
    { _id: new ObjectId(_id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );

  return res.status(200).json({ success: true });
}

// ------------------- DELETE (Admin only) -------------------
async function handleDELETE(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || data.user?.app_metadata?.role !== "admin") {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { _id } = req.body;

  const client = await clientPromise;
  const db = client.db("abhikalpa");
  const products = db.collection("products");

  await products.deleteOne({ _id: new ObjectId(_id) });

  return res.status(200).json({ success: true });
}