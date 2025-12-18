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
    const { items } = req.body; // [{productId, size, quantity, sizeType}]
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    // Process each item
    const results = [];
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        results.push({ 
          productId: item.productId, 
          success: false, 
          error: 'Missing productId or quantity' 
        });
        continue;
      }

      try {
        if (item.sizeType === "none") {
          // Deduct from quantity for non-sized items
          const result = await products.updateOne(
            { 
              _id: new ObjectId(item.productId),
              quantity: { $gte: item.quantity } // Ensure enough stock
            },
            { $inc: { quantity: -item.quantity } }
          );

          if (result.matchedCount === 0) {
            results.push({ 
              productId: item.productId, 
              success: false, 
              error: 'Product not found or insufficient stock' 
            });
          } else {
            results.push({ 
              productId: item.productId, 
              success: true,
              deducted: item.quantity
            });
          }
        } else {
          // Deduct from specific size stock
          if (!item.size) {
            results.push({ 
              productId: item.productId, 
              success: false, 
              error: 'Size not provided' 
            });
            continue;
          }

          const result = await products.updateOne(
            { 
              _id: new ObjectId(item.productId),
              [`stock.${item.size}`]: { $gte: item.quantity } // Ensure enough stock
            },
            { $inc: { [`stock.${item.size}`]: -item.quantity } }
          );

          if (result.matchedCount === 0) {
            results.push({ 
              productId: item.productId, 
              size: item.size,
              success: false, 
              error: 'Product not found or insufficient stock for size' 
            });
          } else {
            results.push({ 
              productId: item.productId,
              size: item.size,
              success: true,
              deducted: item.quantity
            });
          }
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.productId}:`, itemError);
        results.push({ 
          productId: item.productId, 
          success: false, 
          error: itemError.message 
        });
      }
    }

    // Check if all items were successful
    const allSuccessful = results.every(r => r.success);
    const successCount = results.filter(r => r.success).length;

    return res.status(200).json({
      success: allSuccessful,
      message: `Successfully deducted stock for ${successCount}/${items.length} items`,
      results
    });

  } catch (err) {
    console.error("Stock deduction error:", err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}