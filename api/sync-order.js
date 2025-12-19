import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error('MONGODB_URI is not defined');
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let { transactionId, name, email, phone } = req.body;

    // Validate required fields
    if (!transactionId || !name || !email) {
      return res.status(400).json({ 
        error: "Missing required fields",
        received: { transactionId: !!transactionId, name: !!name, email: !!email, phone: !!phone }
      });
    }

    // Clean up transaction ID
    transactionId = transactionId.trim();
    
    console.log('Sync request received:', { transactionId, name, email, phone });

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    // Strategy 1: Find the most recent order with no customer data
    // Orders are created within seconds/minutes of form submission
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const matchedOrder = await orders.findOne(
      {
        customer: null,              // No customer data yet
        createdAt: { $gte: tenMinutesAgo }  // Created in last 10 minutes
      },
      { sort: { createdAt: -1 } }    // Get the most recent one
    );

    if (!matchedOrder) {
      console.log('No recent order found without customer data');
      return res.status(404).json({
        error: "No pending order found",
        message: "Could not find a recent order to match with this form submission. The order may have been created more than 10 minutes ago.",
        transactionId
      });
    }

    // Update the order with customer info and transaction ID
    const result = await orders.findOneAndUpdate(
      { _id: matchedOrder._id },
      {
        $set: {
          transactionId,
          customer: { name, email, phone: phone || "N/A" },
          status: "Confirmed",  // Changed from "Processing" to "Confirmed"
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    console.log('Order updated successfully:', result.value._id);

    return res.status(200).json({ 
      success: true,
      orderId: result.value._id.toString(),
      message: "Order updated successfully"
    });

  } catch (err) {
    console.error('Sync order error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}