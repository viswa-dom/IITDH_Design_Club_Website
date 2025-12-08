import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-gray-900 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-light mb-4">ABHIKALPA</h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Design Club, IIT Dharwad
            </p>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gray-500 mb-4">
              Quick Links
            </h4>
            <div className="space-y-2 text-sm font-light">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300">
                About Us
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300">
                Gallery
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300">
                Events
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300">
                Join Us
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gray-500 mb-4">
              Connect
            </h4>
            <div className="space-y-2 text-sm font-light">
              <a
                href="mailto:designclub@iitdh.ac.in"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                designclub@iitdh.ac.in
              </a>
              <a
                href="https://instagram.com/abhikalpa.iitdh"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Instagram
              </a>
              <a
                href="https://behance.net"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Behance
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gray-500 mb-4">
              Policies
            </h4>

            <div className="space-y-2 text-sm font-light">
              <Link
                to="/cancellation-refund"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Cancellation & Refund
              </Link>

              <Link
                to="/contact-us"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Contact Us
              </Link>

              <Link
                to="/privacy-policy"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms-and-conditions"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/shipping-policy"
                className="block text-gray-400 hover:text-white transition-colors duration-300"
              >
                Shipping Policy
              </Link>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p className="font-light">
            © {new Date().getFullYear()} Abhikalpa, IIT Dharwad. All rights reserved.
          </p>
          <p className="flex items-center gap-2 font-light">
            Made with <Heart className="w-3 h-3 fill-current" /> by the design team
          </p>
        </div>
      </div>
    </footer>
  );
};