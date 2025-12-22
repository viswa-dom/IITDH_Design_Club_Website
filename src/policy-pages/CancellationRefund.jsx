import { useEffect } from "react";


export default function CancellationRefund() {

  useEffect(() => {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);
    
  return (
    <div className="min-h-screen bg-black pt-28 pb-20 text-white">
      <div className="max-w-4xl mx-auto space-y-6 px-6">
        <h1 className="text-4xl font-semibold text-white">
          Cancellation & Refund Policy
        </h1>

        <p className="text-gray-300 leading-relaxed">
          At Abhikalpa, customer satisfaction is our priority. Since the products
          offered are digital artworks, all purchases are generally final.
        </p>

        <h2 className="text-2xl font-medium mt-10 text-white">
          Refunds
        </h2>

        <p className="text-gray-300">
          Refunds may be provided only in the following cases:
        </p>

        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Duplicate payment</li>
          <li>Payment deducted but order not received</li>
          <li>Incorrect / failed transaction</li>
        </ul>

        <p className="text-gray-300">
          Refund requests can be submitted at:{" "}
          <span className="font-semibold text-white">
            designclub@iitdh.ac.in
          </span>.
          Approved refunds will be processed to the original payment method
          within 5–7 business days.
        </p>

        <h2 className="text-2xl font-medium mt-10 text-white">
          Cancellations
        </h2>

        <p className="text-gray-300">
          Orders once placed cannot be cancelled, as digital art is delivered
          instantly or created specifically for the user.
        </p>
      </div>
    </div>
  );
}
