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
    let { transactionId, name, email, phone, orderRef } = req.body;

    // Validate required fields
    if (!transactionId || !name || !email || !orderRef) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["transactionId", "name", "email", "orderRef"],
        received: { 
          transactionId: !!transactionId, 
          name: !!name, 
          email: !!email, 
          phone: !!phone,
          orderRef: !!orderRef
        }
      });
    }

    // Clean up inputs
    transactionId = transactionId.trim();
    orderRef = orderRef.trim();
    
    console.log('Sync request received:', { orderRef, transactionId, name, email, phone });

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    // Check if this transaction ID was already used
    const existingTxn = await orders.findOne({ transactionId });
    
    if (existingTxn) {
      console.log('Transaction ID already used:', transactionId);
      return res.status(409).json({
        error: "Transaction ID already used",
        message: "This UPI transaction ID has already been linked to another order. Each transaction ID can only be used once.",
        transactionId,
        orderId: existingTxn._id.toString()
      });
    }

    // Find order by reference number (the exact order customer created)
    const matchedOrder = await orders.findOne({
      transactionRef: orderRef,
      customer: null,
      status: "Pending"
    });

    if (!matchedOrder) {
      console.log('Order not found with reference:', orderRef);
      return res.status(404).json({
        error: "Order not found",
        message: "Could not find a pending order with this reference number. Please check your order reference and try again.",
        orderRef
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

    console.log('Order confirmed successfully:', result.value._id, 'with transaction ID:', transactionId);

    return res.status(200).json({ 
      success: true,
      orderId: result.value._id.toString(),
      orderRef: result.value.transactionRef,
      transactionId: result.value.transactionId,
      message: "Payment confirmed! Your order has been updated.",
      order: {
        id: result.value._id.toString(),
        items: result.value.items,
        total: result.value.total,
        status: result.value.status,
        transactionRef: result.value.transactionRef,
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