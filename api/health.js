export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    message: 'Email API is running on Vercel',
  });
}
