import { useEffect, useRef, useState } from 'react';

const manifestoLines = [
  'We believe in design that questions.',
  'Design that solves.',
  'Design that delights.',
];

export const Spirit = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-black text-white px-6 py-20 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.05 }}
      >
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="space-y-8">
          {manifestoLines.map((line, index) => (
            <div
              key={index}
              className={`overflow-hidden transition-all duration-1000`}
              style={{
                transitionDelay: `${index * 200}ms`,
              }}
            >
              <p
                className={`text-4xl md:text-6xl lg:text-7xl font-light leading-tight transition-all duration-1000 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
              >
                {line}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`mt-20 h-px bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-30' : 'opacity-0'
          }`}
        />

        <div
          className={`mt-12 text-center transition-all duration-1000 delay-900 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-lg md:text-xl text-gray-400 font-light">
            This is the spirit of Abhikalpa
          </p>
        </div>
      </div>
    </section>
  );
};