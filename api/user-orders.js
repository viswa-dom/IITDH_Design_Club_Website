import { MongoClient } from "mongodb";

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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    // Find all orders for this user's email
    // Check both userEmail (stored at checkout) and customer.email (after form submission)
    const userOrders = await orders
      .find({ 
        $or: [
          { userEmail: email },        // Orders created by this user
          { "customer.email": email }   // Orders confirmed with this email
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(userOrders);
  } catch (e) {
    console.error('User orders API error:', e);
    return res.status(500).json({ error: e.message });
  }
}