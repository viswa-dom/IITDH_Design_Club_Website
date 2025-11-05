import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white"
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      />

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-white opacity-5"
            style={{
              left: `${(i + 1) * 5}%`,
              height: '100%',
              animation: `fadeInOut ${3 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="overflow-hidden mb-6">
          <h1
            className="text-7xl md:text-9xl font-light tracking-tight animate-slideUp"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            ABHIKALPA
          </h1>
        </div>

        <div className="overflow-hidden mb-4">
          <p
            className="text-xl md:text-2xl font-light text-gray-400 animate-slideUp"
            style={{ animationDelay: '0.2s' }}
          >
            Where Ideas Take Form
          </p>
        </div>

        <div className="overflow-hidden">
          <p
            className="text-sm md:text-base font-light text-gray-500 max-w-2xl mx-auto leading-relaxed animate-slideUp"
            style={{ animationDelay: '0.4s' }}
          >
            The design club of IIT Dharwad. A space where art meets technology,
            <br className="hidden md:block" />
            and creators build experiences.
          </p>
        </div>

        <div
          className="mt-16 animate-slideUp"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="inline-flex flex-col items-center gap-2">
            <span className="text-xs text-gray-600 uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 text-gray-600 animate-bounce" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 text-xs text-gray-700 tracking-wider animate-slideUp">
        IIT DHARWAD
      </div>

      <div className="absolute bottom-8 right-8 text-xs text-gray-700 tracking-wider animate-slideUp">
        DESIGN CLUB
      </div>
    </section>
  );
};