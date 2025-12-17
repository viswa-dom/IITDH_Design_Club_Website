import clientPromise from "../lib/mongodb";
import { createClient } from "@supabase/supabase-js";
import { ObjectId } from "mongodb";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    // ---------- GET (PUBLIC) ----------
    if (req.method === "GET") {
      const allProducts = await products
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(allProducts);
    }

    // ---------- AUTH ----------
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || data.user?.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }

    // ---------- POST ----------
    if (req.method === "POST") {
      const product = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await products.insertOne(product);
      return res.status(201).json({
        _id: result.insertedId,
        ...product,
      });
    }

    // ---------- PUT ----------
    if (req.method === "PUT") {
      const { _id, ...updateData } = req.body;

      const result = await products.updateOne(
        { _id: new ObjectId(_id) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.json({ success: true });
    }

    // ---------- DELETE ----------
    if (req.method === "DELETE") {
      const { _id } = req.body;

      const result = await products.deleteOne({
        _id: new ObjectId(_id),
      });

      if (!result.deletedCount) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("PRODUCT API ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
}
