import { Resend } from "resend";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "POST only" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { name, email, message } = body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Abhikalpa <onboarding@resend.dev>",
      to: "viswavijeth35@gmail.com",
      subject: `Message from ${name}`,
      html: `<p>${message}</p>`,
      reply_to: email,
    });
    console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
