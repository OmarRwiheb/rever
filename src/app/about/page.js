'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Footer from '@/components/Footer';

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-gray-200 py-6">
    <button
      onClick={onToggle}
      className="flex justify-between items-center w-full text-left"
    >
      <h3 className="text-lg font-awaken uppercase tracking-wider text-black">
        {question}
      </h3>
      {isOpen ? (
        <ChevronUp size={20} className="text-black" />
      ) : (
        <ChevronDown size={20} className="text-black" />
      )}
    </button>
    {isOpen && (
      <div className="mt-4 text-gray-800 font-montserrat-regular leading-relaxed">
        {answer}
      </div>
    )}
  </div>
);

export default function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqData = [
    {
      question: "What is Rever?",
      answer: "Rever is a contemporary Arab luxury fashion house rooted in old-money elegance and timeless sophistication. Inspired by heritage yet designed for the modern world, Rever pieces embody modest refinement, fine craftsmanship, and effortless style."
    },
    {
      question: "Where can I find Rever collections?",
      answer: "Rever is currently available exclusively online through our official website. Selected pieces will also be showcased through curated pop-ups in Cairo, and beyond."
    },
    {
      question: "What is your return policy?",
      answer: "Each Rever piece is crafted with great care and attention. Returns are accepted within 7 days of delivery, provided items are unworn, in original condition, and accompanied by all tags and packaging."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Not yet. Rever currently ships only within Egypt and soon across select GCC countries. International shipping will be available very soon, and updates will be announced through our website and social media."
    },
    {
      question: "How can I care for my Rever pieces?",
      answer: "Rever garments are made from delicate and luxurious fabrics that require special care. We recommend professional dry cleaning and proper storage to maintain the integrity of each piece."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-awaken mb-8 tracking-wider text-black">
                <span className="text-5xl lg:text-7xl">A</span>BOUT REVER
              </h1>
              <p className="text-lg text-gray-800 font-montserrat-regular leading-relaxed">
                Rever is not fashion, it is memory reawakened. A brand that reverses noise, trends, and urgency, 
                bringing back timeless silhouettes and old-money elegance for the modern Arab world. It draws from 
                emotion, not attention. From meaning, not trend.
              </p>
            </div>
            <div className="relative h-96 lg:h-[500px]">
              <Image
                src="/img/lookbook.jpg"
                alt="Rever Lookbook"
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
                <h2 className="text-3xl font-awaken mb-8 tracking-wider uppercase text-black">
                  Our Story
                </h2>
                <div className="space-y-6 text-gray-800 font-montserrat-regular leading-relaxed">
                  <p className="text-lg font-montserrat-bold text-black">
                    Rever: The Dream in Reverse (Est. 2025)
                  </p>
                  <p>
                    In a world that moves too fast, Rever was born from the desire to go back.
                    Not just to another time, but to a feeling.
                  </p>
                  <p>
                    A feeling that lived in a whispered photo from 1961.
                    A woman in lace gloves and pearls, waiting on the steps of someplace quiet.
                    Her presence needed no words. Her elegance was memory itself.
                  </p>
                  <p>
                    That moment never left us.
                  </p>
                  <p>
                    Founded in 2025, Rever, from the French "to dream", and from reverse, is a return.
                    A return to silhouettes that meant something.
                    To fabrics that held stories.
                    To a time when the way you dressed wasn't to be seen,
                    but to belong quietly to something greater.
                  </p>
                  <p>
                    Each Rever piece is a page from that world: crafted with intention, guided by memory, 
                    and made for those who don't chase attention, they attract it.
                  </p>
                  <p className="text-lg font-montserrat-bold text-black">
                    We create not for trends, but for those who long for elegance that endures.
                  </p>
                  <p className="text-lg font-montserrat-bold text-black">
                    Rever is not fashion. It is memory. Reawakened.
                    Because we don't follow time, we wear it.
                  </p>
                </div>
              </div>
              <div className="relative h-80 lg:h-96">
                <Image
                  src="/img/women.jpg"
                  alt="Rever Women's Collection"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div>
            <h2 className="text-3xl font-awaken mb-12 tracking-wider uppercase text-center text-black">
              Our Essence
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="relative h-64 mb-6">
                  <Image
                    src="/img/men.jpg"
                    alt="Reinterpretation in Fashion"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-awaken uppercase tracking-wider mb-4 text-black">
                  Reinterpretation
                </h3>
                <p className="text-gray-800 font-montserrat-regular leading-relaxed">
                  At Rever, innovation is not about the new, it is about reimagining what was always timeless. 
                  We draw from cultural memory and enduring aesthetics to create designs that feel both familiar 
                  and quietly modern.
                </p>
              </div>
              <div className="text-center">
                <div className="relative h-64 mb-6">
                  <Image
                    src="/img/product-test.jpg"
                    alt="Artistry Excellence"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-awaken uppercase tracking-wider mb-4 text-black">
                  Artistry
                </h3>
                <p className="text-gray-800 font-montserrat-regular leading-relaxed">
                  Each Rever piece is crafted with intention, using premium fabrics and refined techniques. 
                  True luxury lives in the details; the cut that flatters, the fabric that lingers, and the 
                  finish that makes a garment endure.
                </p>
              </div>
              <div className="text-center">
                <div className="relative h-64 mb-6">
                  <Image
                    src="/img/lookbook.jpg"
                    alt="Conscious Elegance"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-awaken uppercase tracking-wider mb-4 text-black">
                  Conscious Elegance
                </h3>
                <p className="text-gray-800 font-montserrat-regular leading-relaxed">
                  We believe luxury should last. By sourcing high-quality, enduring fabrics and producing in 
                  limited quantities, we create garments meant to become part of your story, cherished, not replaced. 
                  Sustainability for us is elegance that endures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-awaken mb-12 text-center tracking-wider uppercase text-black">
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
              <h2 className="text-3xl font-awaken mb-8 tracking-wider uppercase text-black">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-800 font-montserrat-regular leading-relaxed mb-8">
                We'd love to hear from you. Whether you have a question, need guidance, or simply wish to share a thought, our team is here for you.
              </p>
              <div className="flex justify-center lg:justify-start">
                <a
                  href="/contact"
                  className="inline-block px-8 py-3 border border-black text-black font-montserrat-regular uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </a>
              </div>
            </div>
            <div className="relative h-80 lg:h-96">
              <Image
                src="/img/men.jpg"
                alt="Rever Boutique"
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