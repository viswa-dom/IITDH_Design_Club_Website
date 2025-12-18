import clientPromise from "../src/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    const result = await orders.find().sort({ createdAt: -1 }).toArray();

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    const order = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "Pending",
    };

    const result = await orders.insertOne(order);

    return new Response(
      JSON.stringify({ _id: result.insertedId, ...order }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
