export const runtime = 'nodejs';
import clientPromise from "../src/lib/mongodb";
import { createClient } from "@supabase/supabase-js";
import { ObjectId } from "mongodb";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ------------------- GET (Public) -------------------
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    const all = await products.find({}).sort({ createdAt: -1 }).toArray();

    return new Response(JSON.stringify(all), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  }
}

// ------------------- POST (Admin only) -------------------
export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401 });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || data.user?.app_metadata?.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    const product = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const r = await products.insertOne(product);

    return new Response(
      JSON.stringify({ _id: r.insertedId, ...product }),
      { status: 201 }
    );

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ------------------- PUT -------------------
export async function PUT(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401 });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || data.user?.app_metadata?.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { _id, ...updateData } = body;

    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    await products.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ------------------- DELETE -------------------
export async function DELETE(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401 });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || data.user?.app_metadata?.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { _id } = body;

    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const products = db.collection("products");

    await products.deleteOne({ _id: new ObjectId(_id) });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
