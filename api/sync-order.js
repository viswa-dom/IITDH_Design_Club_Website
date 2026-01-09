// api/sync-order.js - Email comes from order, not form
import { MongoClient, ObjectId } from "mongodb";

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
    // Email is no longer required from form - we get it from the order
    let { transactionId, name, phone, orderRef } = req.body;

    // Validate required fields
    if (!transactionId || !name || !orderRef) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["transactionId", "name", "orderRef"],
        received: { 
          transactionId: !!transactionId, 
          name: !!name, 
          phone: !!phone,
          orderRef: !!orderRef
        }
      });
    }

    transactionId = transactionId.trim();
    orderRef = orderRef.trim();
    
    console.log('Sync request received:', { orderRef, transactionId, name, phone });

    const client = await connectToDatabase();
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");
    const products = db.collection("products");

    // Check if this transaction ID was already used
    const existingTxn = await orders.findOne({ transactionId });
    
    if (existingTxn) {
      console.log('Transaction ID already used:', transactionId);
      return res.status(409).json({
        error: "Transaction ID already used",
        message: "This UPI transaction ID has already been linked to another order.",
        transactionId
      });
    }

    // Find order by reference number
    const matchedOrder = await orders.findOne({
      transactionRef: orderRef,
      customer: null,
      status: "Pending"
    });

    if (!matchedOrder) {
      console.log('Order not found with reference:', orderRef);
      return res.status(404).json({
        error: "Order not found",
        message: "Could not find a pending order with this reference number.",
        orderRef
      });
    }

    // GET EMAIL FROM THE EXISTING ORDER (stored during checkout)
    const userEmail = matchedOrder.userEmail;
    
    if (!userEmail) {
      console.log('Order missing userEmail:', matchedOrder._id);
      return res.status(400).json({
        error: "Order data incomplete",
        message: "This order is missing user email information. Please contact support.",
      });
    }

    console.log('Found order with email:', userEmail);

    // DEDUCT STOCK BEFORE CONFIRMING ORDER
    console.log('Deducting stock for order:', matchedOrder._id);
    
    const stockDeductionResults = [];
    for (const item of matchedOrder.items) {
      try {
        const sizeType = item.sizeType || "none";
        
        if (sizeType === "none") {
          const result = await products.updateOne(
            { 
              _id: new ObjectId(item.productId),
              quantity: { $gte: item.quantity }
            },
            { $inc: { quantity: -item.quantity } }
          );

          stockDeductionResults.push({ 
            productId: item.productId,
            name: item.name,
            success: result.matchedCount > 0,
            error: result.matchedCount === 0 ? 'Insufficient stock' : null
          });
        } else {
          if (!item.size) {
            stockDeductionResults.push({ 
              productId: item.productId,
              name: item.name,
              success: false, 
              error: 'Size not provided' 
            });
            continue;
          }

          const result = await products.updateOne(
            { 
              _id: new ObjectId(item.productId),
              [`stock.${item.size}`]: { $gte: item.quantity }
            },
            { $inc: { [`stock.${item.size}`]: -item.quantity } }
          );

          stockDeductionResults.push({ 
            productId: item.productId,
            name: item.name,
            size: item.size,
            success: result.matchedCount > 0,
            error: result.matchedCount === 0 ? 'Insufficient stock' : null
          });
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.productId}:`, itemError);
        stockDeductionResults.push({ 
          productId: item.productId,
          name: item.name,
          success: false, 
          error: itemError.message 
        });
      }
    }

    // Check if all items were successfully deducted
    const allStockDeducted = stockDeductionResults.every(r => r.success);
    
    if (!allStockDeducted) {
      console.error('Stock deduction failed:', stockDeductionResults);
      
      // Rollback successful deductions
      for (const result of stockDeductionResults) {
        if (result.success) {
          const item = matchedOrder.items.find(i => i.productId === result.productId);
          if (item) {
            const sizeType = item.sizeType || "none";
            if (sizeType === "none") {
              await products.updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { quantity: item.quantity } }
              );
            } else if (item.size) {
              await products.updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { [`stock.${item.size}`]: item.quantity } }
              );
            }
          }
        }
      }
      
      return res.status(400).json({
        error: "Insufficient stock",
        message: "Some items are out of stock.",
        stockDeductionResults
      });
    }

    // UPDATE ORDER WITH CUSTOMER INFO (using email from order, not form)
    const result = await orders.findOneAndUpdate(
      { _id: matchedOrder._id },
      {
        $set: {
          transactionId,
          customer: { 
            name, 
            email: userEmail,  // Use email from order
            phone: phone || "N/A" 
          },
          status: "Confirmed",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    console.log('Order confirmed:', result.value._id, 'for user:', userEmail);

    return res.status(200).json({ 
      success: true,
      message: "Payment confirmed! Your order has been updated.",
      order: {
        id: result.value._id.toString(),
        status: result.value.status,
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