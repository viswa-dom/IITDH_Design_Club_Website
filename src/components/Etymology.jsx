import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';

export const Etymology = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
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

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-white text-black px-6 py-20"
    >
      <Helmet>
        <title>Home - Abhikalpa</title>
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h2
            className={`text-5xl md:text-7xl font-light mb-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            What does
            <br />
            <span className="italic">Abhikalpa</span> mean?
          </h2>
        </div>

        <div className="space-y-12">
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-8xl md:text-9xl font-light mb-6 text-gray-300">
              अभिकल्प
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 max-w-3xl">
              Derived from Sanskrit, <span className="font-medium">Abhikalpa</span> translates to{' '}
              <span className="italic">imagination</span>, <span className="italic">design</span>, or{' '}
              <span className="italic">creative concept</span> - the act of envisioning what does not yet exist.
            </p>
          </div>

          <div
            className={`transition-all duration-1000 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 max-w-3xl">
              Our club draws from that spirit - turning sparks of imagination into form and function.
            </p>
          </div>

          <div
            className={`flex gap-8 text-sm uppercase tracking-widest text-gray-400 transition-all duration-1000 delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span>Idea</span>
            <span>→</span>
            <span>Imagination</span>
            <span>→</span>
            <span>Design</span>
          </div>
        </div>
      </div>
    </section>
  );
};