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

    // Check if this transaction ID was already used
    const existingOrder = await orders.findOne({ transactionId });
    
    if (existingOrder && existingOrder.customer) {
      console.log('Transaction ID already used:', transactionId);
      return res.status(409).json({
        error: "Transaction ID already used",
        message: "This transaction ID has already been linked to an order. If you believe this is an error, please contact support.",
        transactionId,
        orderId: existingOrder._id.toString()
      });
    }

    // Find the most recent pending order without customer data
    const matchedOrder = await orders.findOne(
      {
        customer: null,     // No customer data yet
        status: "Pending"   // Only match pending orders
      },
      { sort: { createdAt: -1 } }  // Get the most recent one
    );

    if (!matchedOrder) {
      console.log('No pending order found');
      return res.status(404).json({
        error: "No pending order found",
        message: "Could not find any pending order. Please create an order first before submitting payment confirmation.",
        transactionId
      });
    }

    // Update the order with transaction ID and customer info
    const result = await orders.findOneAndUpdate(
      { _id: matchedOrder._id },
      {
        $set: {
          transactionId,
          customer: { name, email, phone: phone || "N/A" },
          status: "Confirmed",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    console.log('Order updated successfully:', result.value._id, 'with transaction ID:', transactionId);

    return res.status(200).json({ 
      success: true,
      orderId: result.value._id.toString(),
      transactionId: result.value.transactionId,
      message: "Payment confirmed! Your order has been updated.",
      order: {
        id: result.value._id.toString(),
        items: result.value.items,
        total: result.value.total,
        status: result.value.status,
        transactionId: result.value.transactionId
      }
    });

  } catch (err) {
    console.error('Sync order error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}