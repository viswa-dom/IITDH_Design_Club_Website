import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);
    
  return (
    <div className="min-h-screen bg-black pt-28 pb-20 text-white">
      <div className="max-w-4xl mx-auto space-y-6 px-6">
        <h1 className="text-4xl font-semibold">Privacy Policy</h1>

        <p className="text-gray-300 leading-relaxed">
          Abhikalpa respects your privacy. This policy explains how we collect,
          use, and protect your information.
        </p>

        <h2 className="text-2xl font-medium mt-10 text-white">
          Information We Collect
        </h2>

        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Name and contact information</li>
          <li>Email address</li>
          <li>Payment details (handled securely by Razorpay)</li>
          <li>Website usage data</li>
        </ul>

        <h2 className="text-2xl font-medium mt-10 text-white">
          How We Use Your Information
        </h2>

        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>To process orders and payments</li>
          <li>To improve our services</li>
          <li>To contact you for updates</li>
        </ul>

        <h2 className="text-2xl font-medium mt-10 text-white">
          Data Protection
        </h2>

        <p className="text-gray-300 leading-relaxed">
          We do not sell your personal information to third parties. Data is
          handled only by trusted payment and hosting providers.
        </p>

        <h2 className="text-2xl font-medium mt-10 text-white">Contact</h2>

        <p className="text-gray-300">
          For privacy–related questions:{" "}
          <strong className="text-white">your-email@example.com</strong>
        </p>
      </div>
    </div>
  );
}
