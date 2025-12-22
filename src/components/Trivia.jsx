import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const triviaItems = [
  {
    title: "Did you know?",
    fact: "The IIT Dharwad logo's geometry is based on the Fibonacci sequence, reflecting the mathematical harmony found in nature and design.",
  },
  {
    title: "Design History",
    fact: "The Helvetica font has been around since 1957 — still the most used typeface in design, proving that timeless simplicity never goes out of style.",
  },
  {
    title: "Logo Design",
    fact: "A good logo works even when shrunk to 16×16 pixels. The best designs maintain their clarity and impact at any scale.",
  },
  {
    title: "Color Psychology",
    fact: "Studies show that people make a subconscious judgment about a product within 90 seconds, and up to 90% of that assessment is based on color alone.",
  },
  {
    title: "Golden Ratio",
    fact: "The Golden Ratio (1.618) appears in everything from the Parthenon to Apple's logo design, creating aesthetically pleasing proportions.",
  },
];

export const Trivia = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % triviaItems.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + triviaItems.length) % triviaItems.length);
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-20"
    >
      <Helmet>
        <title>Home - Abhikalpa</title>
      </Helmet>
      <div className="max-w-5xl mx-auto w-full">
        <h2
          className={`text-4xl md:text-6xl font-light mb-16 text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Design Insights
        </h2>

        <div
          className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 p-12 md:p-16 rounded-sm min-h-[300px] flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-light text-gray-400 mb-6">
              {triviaItems[currentIndex].title}
            </h3>
            <p className="text-2xl md:text-3xl font-light leading-relaxed">
              {triviaItems[currentIndex].fact}
            </p>
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              className="p-3 hover:bg-white hover:bg-opacity-10 transition-all duration-300 rounded-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-2">
              {triviaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-white' : 'w-1 bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-3 hover:bg-white hover:bg-opacity-10 transition-all duration-300 rounded-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};