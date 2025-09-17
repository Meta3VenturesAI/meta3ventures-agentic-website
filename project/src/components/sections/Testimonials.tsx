import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  position: string;
  company: string;
  testimonial: string;
  image: string;
  rating: number;
}

export const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: "James Wilson",
      position: "CTO",
      company: "TechInnovate",
      testimonial: "Meta3Ventures transformed our approach to blockchain integration. Their expertise helped us launch our DeFi platform months ahead of schedule with exceptional security measures in place.",
      image: "/images/testimonials/james-wilson.jpg",
      rating: 5
    },
    {
      name: "Emily Chang",
      position: "Director of Innovation",
      company: "FutureFinance",
      testimonial: "Working with Meta3Ventures gave us the competitive edge we needed in the rapidly evolving fintech space. Their strategic guidance was invaluable to our success.",
      image: "/images/testimonials/emily-chang.jpg",
      rating: 5
    },
    {
      name: "Robert Johnson",
      position: "CEO",
      company: "Blockchain Ventures",
      testimonial: "The team at Meta3Ventures delivered beyond our expectations. Their deep understanding of both the technical and business aspects of Web3 made them the perfect partner for our expansion.",
      image: "/images/testimonials/robert-johnson.jpg",
      rating: 5
    },
    {
      name: "Sophia Martinez",
      position: "Head of Digital",
      company: "Global Enterprises",
      testimonial: "From initial consultation to implementation, Meta3Ventures provided exceptional service and expertise. They helped us navigate the complexities of blockchain implementation with confidence.",
      image: "/images/testimonials/sophia-martinez.jpg",
      rating: 4
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const selectTestimonial = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = window.setInterval(() => {
        nextTestimonial();
      }, 8000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it. Hear from organizations that have 
            partnered with us to achieve their technology goals.
          </p>
        </div>

        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative h-[400px] md:h-[300px] overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`absolute w-full transition-all duration-500 ease-in-out ${
                  index === activeIndex 
                    ? 'opacity-100 translate-x-0' 
                    : index < activeIndex 
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 md:p-10 shadow-lg">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900"
                      />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <div className="flex justify-center md:justify-start mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-5 h-5 ${
                              i < testimonial.rating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <blockquote className="text-gray-700 dark:text-gray-200 text-lg italic mb-4">
                        "{testimonial.testimonial}"
                      </blockquote>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                        <p className="text-indigo-600 dark:text-indigo-400">
                          {testimonial.position}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={prevTestimonial}
            className="absolute top-1/2 -left-4 md:-left-8 transform -translate-y-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button 
            onClick={nextTestimonial}
            className="absolute top-1/2 -right-4 md:-right-8 transform -translate-y-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => selectTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeIndex 
                    ? 'bg-indigo-600 dark:bg-indigo-400 w-6' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};