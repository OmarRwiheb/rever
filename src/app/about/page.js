'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Footer from '@/components/UI/Footer';

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-gray-200 py-6">
    <button
      onClick={onToggle}
      className="flex justify-between items-center w-full text-left"
    >
      <h3 className="text-lg font-light uppercase tracking-wider text-black">
        {question}
      </h3>
      {isOpen ? (
        <ChevronUp size={20} className="text-black" />
      ) : (
        <ChevronDown size={20} className="text-black" />
      )}
    </button>
    {isOpen && (
      <div className="mt-4 text-gray-600 font-light leading-relaxed">
        {answer}
      </div>
    )}
  </div>
);

export default function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqData = [
    {
      question: "What is Saint Laurent?",
      answer: "Saint Laurent is a French luxury fashion house founded in 1961 by Yves Saint Laurent and Pierre Bergé. The brand is known for its modern elegance, innovative designs, and timeless sophistication that has influenced fashion for over six decades."
    },
    {
      question: "Where can I find Saint Laurent stores?",
      answer: "Saint Laurent has boutiques worldwide in major cities including Paris, New York, London, Tokyo, and many others. You can find our complete store directory on our website or contact our client services for assistance."
    },
    {
      question: "How can I book a personal appointment?",
      answer: "You can book a personal appointment through our website's client services section, by calling our dedicated client service line, or by visiting any of our boutiques. Our personal stylists are available to provide expert guidance."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of purchase for items in their original condition with all tags attached. Please visit any Saint Laurent boutique or contact our client services for assistance with returns."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we offer international shipping to most countries. Shipping times and costs vary by location. You can check shipping options and costs during the checkout process on our website."
    },
    {
      question: "How can I care for my Saint Laurent pieces?",
      answer: "Each Saint Laurent piece comes with specific care instructions. We recommend professional cleaning for leather goods and delicate fabrics. Store items in a cool, dry place away from direct sunlight to maintain their quality."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-serif mb-8 tracking-wider">
                <span className="text-5xl lg:text-7xl">A</span>BOUT SAINT LAURENT
              </h1>
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                Since 1961, Saint Laurent has been synonymous with modern elegance and timeless sophistication. 
                Our commitment to innovation and excellence continues to define luxury fashion for the contemporary world.
              </p>
            </div>
            <div className="relative h-96 lg:h-[500px]">
              <Image
                src="/img/lookbook.jpg"
                alt="Saint Laurent Lookbook"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Our Story */}
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-serif mb-8 tracking-wider uppercase">
                  Our Story
                </h2>
                <div className="space-y-6 text-gray-600 font-light leading-relaxed">
                  <p>
                    Founded by Yves Saint Laurent and Pierre Bergé in 1961, the house of Saint Laurent 
                    revolutionized fashion with its modern approach to luxury. Yves Saint Laurent's vision 
                    of empowering women through fashion continues to inspire our collections today.
                  </p>
                  <p>
                    From the iconic Le Smoking tuxedo to the groundbreaking ready-to-wear collections, 
                    Saint Laurent has consistently pushed boundaries while maintaining the highest standards 
                    of craftsmanship and quality.
                  </p>
                  <p>
                    Today, under the creative direction of Anthony Vaccarello, the house continues to 
                    evolve while staying true to its heritage of innovation and elegance.
                  </p>
                </div>
              </div>
              <div className="relative h-80 lg:h-96">
                <Image
                  src="/img/women.jpg"
                  alt="Saint Laurent Women's Collection"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div>
            <h2 className="text-3xl font-serif mb-12 tracking-wider uppercase text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="relative h-64 mb-6">
                  <Image
                    src="/img/men.jpg"
                    alt="Innovation in Fashion"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-light uppercase tracking-wider mb-4 text-black">
                  Innovation
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We continuously push the boundaries of fashion, creating pieces that are both 
                  timeless and contemporary.
                </p>
              </div>
              <div className="text-center">
                <div className="relative h-64 mb-6">
                  <Image
                    src="/img/product-test.jpg"
                    alt="Craftsmanship Excellence"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-light uppercase tracking-wider mb-4 text-black">
                  Craftsmanship
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Every Saint Laurent piece is crafted with the highest attention to detail, 
                  using the finest materials and techniques.
                </p>
              </div>
              <div className="text-center">
                <div className="relative h-64 mb-6">
                  <Image
                    src="/img/lookbook.jpg"
                    alt="Sustainable Luxury"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-light uppercase tracking-wider mb-4 text-black">
                  Sustainability
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We are committed to responsible luxury, implementing sustainable practices 
                  throughout our production process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif mb-12 text-center tracking-wider uppercase">
            Frequently Asked Questions
          </h2>
          <div className="space-y-0">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-serif mb-8 tracking-wider uppercase">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
                Have questions that aren't answered here? Our client services team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <a
                  href="/contact"
                  className="inline-block px-8 py-3 border border-black text-black font-light uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </a>
                <a
                  href="/stores"
                  className="inline-block px-8 py-3 border border-black text-black font-light uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Find Stores
                </a>
              </div>
            </div>
            <div className="relative h-80 lg:h-96">
              <Image
                src="/img/men.jpg"
                alt="Saint Laurent Boutique"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 