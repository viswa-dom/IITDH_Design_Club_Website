import clientPromise from "../src/lib/mongodb";

export default async function handler(req, res) {

  try {
    const client = await clientPromise;
    const db = client.db("abhikalpa");
    const orders = db.collection("orders");

    if (req.method === "GET") {

      const result = await orders.find({})
                                 .sort({ createdAt: -1 })
                                 .toArray();

      return res.status(200).json(result);
    }

    if (req.method === "POST") {

      const order = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "Pending"
      };

      const result = await orders.insertOne(order);

      return res.status(201).json({
        _id: result.insertedId,
        ...order
      });
    }

    res.status(405).json({ message: "Method Not Allowed" });

  } catch (e) {
    console.error("ORDER API ERROR:", e);
    res.status(500).json({ error: e.message });
  }
}
