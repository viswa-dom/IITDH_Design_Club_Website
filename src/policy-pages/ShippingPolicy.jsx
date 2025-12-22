import { useEffect } from "react";

export default function ShippingPolicy() {
  useEffect(() => {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);
    
  return (
    <div className="min-h-screen bg-black pt-28 pb-20 text-white">
      <div className="max-w-4xl mx-auto space-y-6 px-6">
        <h1 className="text-4xl font-semibold">Shipping Policy</h1>

        <p className="text-gray-300 leading-relaxed">
          Abhikalpa deals primarily in digital artwork, therefore physical
          shipping is not required.
        </p>

        <h2 className="text-2xl font-medium mt-10 text-white">
          Digital Delivery
        </h2>

        <p className="text-gray-300">
          Digital artworks are delivered instantly via email or user dashboard.
        </p>

        <h2 className="text-2xl font-medium mt-10 text-white">
          Physical Orders (If Applicable)
        </h2>

        <p className="text-gray-300">
          If physical merchandise is purchased, shipping timelines will apply
          and be updated here.
        </p>

        <h2 className="text-2xl font-medium mt-10 text-white">
          Contact
        </h2>

        <p className="text-gray-300">
          For delivery questions:{" "}
          <strong className="text-white">
            your-email@example.com
          </strong>
        </p>
      </div>
    </div>
  );
}
