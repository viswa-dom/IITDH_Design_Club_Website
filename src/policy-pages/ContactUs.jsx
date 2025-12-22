import { useEffect } from "react";

export default function ContactUs() {
  useEffect(() => {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 text-white">
      <div className="max-w-4xl mx-auto space-y-6 px-6">
        <h1 className="text-4xl font-semibold">Contact Us</h1>

        <p className="text-gray-300 leading-relaxed">
          If you have any questions, support requests, or complaints,
          you can reach us at:
        </p>

        <p className="text-gray-300">
          <strong className="text-white">Email:</strong>{" "}
          your-email@example.com
        </p>

        <p className="text-gray-300">
          <strong className="text-white">Phone:</strong>{" "}
          (optional)
        </p>

        <p className="text-gray-300">
          We typically respond within 1–2 business days.
        </p>
      </div>
    </div>
  );
}
