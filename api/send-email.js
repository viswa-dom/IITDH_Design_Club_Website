import { Resend } from "resend";

// Remove or comment out this - it's causing the error
// export const config = {
//   runtime: "edge",
// };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "POST only" });
  }

  try {
    const { name, email, message } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Abhikalpa <onboarding@resend.dev>",
      to: "viswavijeth35@gmail.com",
      subject: `Message from ${name}`,
      html: `<p>${message}</p>`,
      reply_to: email,
    });
    
    console.log("Email sent successfully");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}