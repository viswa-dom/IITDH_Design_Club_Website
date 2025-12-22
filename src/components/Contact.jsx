import { useState, useEffect, useRef } from 'react';
import { Mail, Instagram, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    document.title = "Contact Us - Abhikalpa";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Call your backend API
      const response = await fetch("/api/send-email", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Message sent successfully! We\'ll get back to you soon.',
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Email error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again or email us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-20"
    >
      <div className="max-w-4xl mx-auto w-full">
        <h2
          className={`text-4xl md:text-6xl font-light mb-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Get in Touch
        </h2>

        <p
          className={`text-lg md:text-xl text-gray-400 mb-16 font-light transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Let's create something together
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Status Messages */}
            {status.message && (
              <div
                className={`p-4 rounded-sm flex items-center gap-3 ${
                  status.type === 'success'
                    ? 'bg-green-900 bg-opacity-20 border border-green-700'
                    : 'bg-red-900 bg-opacity-20 border border-red-700'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <p className="text-sm font-light">{status.message}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-light mb-2 text-gray-400">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-gray-700 focus:border-white py-3 outline-none transition-colors duration-300 font-light disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-light mb-2 text-gray-400">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-gray-700 focus:border-white py-3 outline-none transition-colors duration-300 font-light disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-light mb-2 text-gray-400">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-gray-700 focus:border-white py-3 outline-none transition-colors duration-300 resize-none font-light disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex items-center gap-3 px-8 py-3 bg-white text-black font-light hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
            >
              {isSubmitting ? (
                <>
                  Sending...
                  <Loader className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <div
            className={`space-y-8 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div>
              <h3 className="text-2xl font-light mb-6">Connect With Us</h3>
              <div className="space-y-4">
                <a
                  href="mailto:viswavijeth35@gmail.com"
                  className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors duration-300 group"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-light">viswavijeth35@gmail.com</span>
                </a>

                <a
                  href="https://instagram.com/design_iitdh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors duration-300 group"
                >
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-light">@abhikalpa.iitdh</span>
                </a>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800">
              <p className="text-gray-500 font-light leading-relaxed">
                Whether you're a designer, developer, artist, or simply someone passionate
                about creativity - we'd love to hear from you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};