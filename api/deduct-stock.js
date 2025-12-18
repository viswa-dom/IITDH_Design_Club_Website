// api/deduct-stock.js
export const runtime = "nodejs";

import clientPromise from "../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    // Process each item
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        continue; // Skip invalid items
      }

      if (item.sizeType === "none") {
        // Deduct from quantity for non-sized items
        const result = await products.updateOne(
          { _id: new ObjectId(item.productId) },
          { $inc: { quantity: -item.quantity } }
        );

        if (result.matchedCount === 0) {
          console.error(`Product ${item.productId} not found`);
        }
      } else {
        // Deduct from specific size stock
        if (!item.size) {
          console.error(`Size not provided for product ${item.productId}`);
          continue;
        }

        const result = await products.updateOne(
          { _id: new ObjectId(item.productId) },
          { $inc: { [`stock.${item.size}`]: -item.quantity } }
        );

        if (result.matchedCount === 0) {
          console.error(`Product ${item.productId} not found`);
        }
      }
    }

    return res.status(200).json({ 
      success: true,
      message: `Successfully deducted stock for ${items.length} items`
    });

  } catch (err) {
    console.error("Stock deduction error:", err);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
}