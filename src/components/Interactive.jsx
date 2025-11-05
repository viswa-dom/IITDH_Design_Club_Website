import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

const prompts = [
  'Design a poster using only triangles',
  'Make a logo without using text',
  'Create a layout with circles only',
  'Design using just two colors',
  'Build a composition with typography alone',
  'Create harmony using asymmetry',
  'Design with negative space',
  'Make something beautiful with a single line',
];

export const Interactive = () => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generatePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setCurrentPrompt(randomPrompt);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-white text-black px-6 py-20"
    >
      <div className="max-w-4xl mx-auto w-full text-center">
        <h2
          className={`text-4xl md:text-6xl font-light mb-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Design Challenge
        </h2>

        <p
          className={`text-lg md:text-xl text-gray-600 mb-16 font-light transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Need inspiration? Generate a random design prompt
        </p>

        <div
          className={`transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="min-h-[200px] flex items-center justify-center mb-12 bg-gray-50 rounded-sm p-8 border border-gray-200">
            {currentPrompt ? (
              <p
                className={`text-2xl md:text-4xl font-light transition-all duration-500 ${
                  isGenerating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                "{currentPrompt}"
              </p>
            ) : (
              <p className="text-xl md:text-2xl text-gray-400 font-light">
                Click below to get started
              </p>
            )}
          </div>

          <button
            onClick={generatePrompt}
            disabled={isGenerating}
            className="group relative px-12 py-4 bg-black text-white font-light text-lg hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              {isGenerating ? 'Generating...' : 'Generate Prompt'}
            </span>
            <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-10" />
          </button>
        </div>

        <div
          className={`mt-20 text-sm text-gray-500 font-light transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p>
            These prompts are designed to push creative boundaries
            <br />
            and explore unconventional design thinking
          </p>
        </div>
      </div>
    </section>
  );
};