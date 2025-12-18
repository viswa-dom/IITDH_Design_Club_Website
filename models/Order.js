import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  items: [
    {
      productId: String,
      name: String,
      size: String,
      quantity: Number,
      price: Number,
    }
  ],
  total: Number,
  date: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" }
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
