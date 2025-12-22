import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const works = [
  {
    title: 'Visual Identity',
    category: 'Branding',
    color: 'from-blue-500 to-purple-600',
  },
  {
    title: 'UI/UX Projects',
    category: 'Digital Design',
    color: 'from-green-500 to-teal-600',
  },
  {
    title: 'Motion Graphics',
    category: 'Animation',
    color: 'from-orange-500 to-red-600',
  },
  {
    title: 'Print Design',
    category: 'Typography',
    color: 'from-pink-500 to-rose-600',
  },
];

export const FeaturedWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // document.title = "Featured Works - Abhikalpa";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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
      <div className="max-w-7xl mx-auto w-full">
        <h2
          className={`text-4xl md:text-6xl font-light mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Featured Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {works.map((work, index) => (
            <div
              key={index}
              className={`group relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${work.color} transition-all duration-1000 delay-${
                index * 100
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <p className="text-sm uppercase tracking-widest mb-2 text-gray-300">
                  {work.category}
                </p>
                <h3 className="text-3xl font-light">{work.title}</h3>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-all duration-500">
                <p className="text-sm uppercase tracking-widest text-white">
                  {work.category}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`flex justify-center transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <button className="group flex items-center gap-3 text-lg font-light hover:gap-5 transition-all duration-300">
            See what we've been making
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};