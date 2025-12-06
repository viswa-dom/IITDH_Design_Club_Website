import { Resend } from "resend";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const htmlTemplate = `
      <html>
        <body>
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: "Abhikalpa <onboarding@resend.dev>",
      to: "viswavijeth35@gmail.com",
      subject: `Message from ${name}`,
      html: htmlTemplate,
      reply_to: email,
    });

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
