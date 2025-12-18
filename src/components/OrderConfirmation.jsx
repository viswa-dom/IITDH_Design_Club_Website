export default function Confirmation() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-light mb-4">Order Received</h1>
        <p className="text-gray-400 text-lg font-light mb-8">
          Thank you for your purchase! We’ve received your payment details and will contact you soon.
        </p>

        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-white text-black rounded-sm hover:bg-gray-200 transition font-light"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
