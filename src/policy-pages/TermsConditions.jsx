import { useEffect } from "react";

export default function TermsConditions() {
  useEffect(() => {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 text-white">
      <div className="max-w-4xl mx-auto space-y-6 px-6">

        <h1 className="text-4xl font-semibold">Terms & Conditions</h1>

        <p className="text-gray-300 leading-relaxed">
          By accessing this website, you agree to the following terms.
        </p>

        <h2 className="text-2xl font-medium mt-10">Use of Website</h2>

        <p className="text-gray-300">
          Unauthorized reproduction or misuse of artwork is prohibited.
        </p>

        <h2 className="text-2xl font-medium mt-10">Payments</h2>

        <h2 className="text-2xl font-medium mt-10">
          Intellectual Property
        </h2>

        <p className="text-gray-300">
          All artworks belong to Abhikalpa or their creators.
        </p>

        <h2 className="text-2xl font-medium mt-10">
          Changes
        </h2>

        <p className="text-gray-300">
          These terms may be updated anytime.
        </p>

      </div>
    </div>
  );
}
