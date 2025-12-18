import { MongoClient, ObjectId } from "mongodb";

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    // Process each item and deduct stock
    for (const item of items) {
      const { productId, size, quantity, sizeType } = item;

      if (!productId || !quantity) {
        console.error('Invalid item:', item);
        continue;
      }

      // Get current product
      const product = await products.findOne({ _id: new ObjectId(productId) });

      if (!product) {
        console.error('Product not found:', productId);
        continue;
      }

      // Deduct stock based on sizeType
      if (sizeType === "none") {
        // No size - deduct from general quantity
        const newQuantity = Math.max(0, (product.quantity || 0) - quantity);
        await products.updateOne(
          { _id: new ObjectId(productId) },
          { $set: { quantity: newQuantity, updatedAt: new Date() } }
        );
      } else if (size && product.stock && product.stock[size] !== undefined) {
        // Has size - deduct from specific size stock
        const currentStock = product.stock[size] || 0;
        const newStock = Math.max(0, currentStock - quantity);
        
        await products.updateOne(
          { _id: new ObjectId(productId) },
          { 
            $set: { 
              [`stock.${size}`]: newStock,
              updatedAt: new Date()
            } 
          }
        );
      } else {
        console.error('Invalid size or stock configuration:', { productId, size, stock: product.stock });
      }
    }

    return res.status(200).json({ success: true, message: 'Stock deducted successfully' });
  } catch (e) {
    console.error('Deduct stock error:', e);
    return res.status(500).json({ error: e.message });
  }
}