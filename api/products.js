// api/products.js
import clientPromise from "../lib/mongodb.js";
import { createClient } from "@supabase/supabase-js";
import { ObjectId } from "mongodb";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    /* =====================
      GET (PUBLIC)
    ====================== */
    if (req.method === "GET") {
      const allProducts = await products
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(allProducts);
    }

    /* =====================
      ADMIN AUTH REQUIRED
    ====================== */
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const { data: adminUser, error } = await supabase.auth.getUser(token);

    if (error || adminUser.user.app_metadata?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }

    /* =====================
      POST
    ====================== */
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

    /* =====================
      PUT
    ====================== */
    if (req.method === "PUT") {
      const { _id, ...updateData } = req.body;

      if (!_id) {
        return res.status(400).json({ error: "Missing product id" });
      }

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

      return res.status(200).json({ success: true });
    }

    /* =====================
      DELETE
    ====================== */
    if (req.method === "DELETE") {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({ error: "Missing product id" });
      }

      const result = await products.deleteOne({
        _id: new ObjectId(_id),
      });

      if (!result.deletedCount) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Products API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
