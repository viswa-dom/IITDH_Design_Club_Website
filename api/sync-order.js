// api/sync-order.js (note: singular "order" to match your Google Script)
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
    const products = db.collection("products");

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

    // ✅ DEDUCT STOCK BEFORE CONFIRMING ORDER
    console.log('Deducting stock for order:', matchedOrder._id);
    
    const stockDeductionResults = [];
    for (const item of matchedOrder.items) {
      try {
        const sizeType = item.sizeType || "none";
        
        if (sizeType === "none") {
          // Deduct from quantity for non-sized items
          const result = await products.updateOne(
            { 
              _id: new ObjectId(item.productId),
              quantity: { $gte: item.quantity } // Ensure enough stock
            },
            { $inc: { quantity: -item.quantity } }
          );

          if (result.matchedCount === 0) {
            stockDeductionResults.push({ 
              productId: item.productId,
              name: item.name,
              success: false, 
              error: 'Insufficient stock' 
            });
          } else {
            stockDeductionResults.push({ 
              productId: item.productId,
              name: item.name,
              success: true,
              deducted: item.quantity
            });
          }
        } else {
          // Deduct from specific size stock
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
              [`stock.${item.size}`]: { $gte: item.quantity } // Ensure enough stock
            },
            { $inc: { [`stock.${item.size}`]: -item.quantity } }
          );

          if (result.matchedCount === 0) {
            stockDeductionResults.push({ 
              productId: item.productId,
              name: item.name,
              size: item.size,
              success: false, 
              error: 'Insufficient stock for size' 
            });
          } else {
            stockDeductionResults.push({ 
              productId: item.productId,
              name: item.name,
              size: item.size,
              success: true,
              deducted: item.quantity
            });
          }
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
      console.error('Stock deduction failed for some items:', stockDeductionResults);
      
      // Rollback: restore stock for successfully deducted items
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
        message: "Some items are out of stock or insufficient quantity available.",
        stockDeductionResults
      });
    }

    // ✅ NOW UPDATE THE ORDER WITH CUSTOMER INFO AND CONFIRM STATUS
    const result = await orders.findOneAndUpdate(
      { _id: matchedOrder._id },
      {
        $set: {
          transactionId,
          customer: { name, email, phone: phone || "N/A" },
          status: "Confirmed", // ✅ Automatically confirmed when form is submitted
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    console.log('Order confirmed successfully:', result.value._id, 'with transaction ID:', transactionId);
    console.log('Stock deducted:', stockDeductionResults);

    return res.status(200).json({ 
      success: true,
      orderId: result.value._id.toString(),
      orderRef: result.value.transactionRef,
      transactionId: result.value.transactionId,
      message: "Payment confirmed! Your order has been updated and stock has been reserved.",
      order: {
        id: result.value._id.toString(),
        items: result.value.items,
        total: result.value.total,
        status: result.value.status,
        transactionRef: result.value.transactionRef,
        transactionId: result.value.transactionId
      },
      stockDeducted: stockDeductionResults
    });

  } catch (err) {
    console.error('Sync order error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}