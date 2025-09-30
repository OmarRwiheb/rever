'use client';

import { Briefcase } from 'lucide-react';
import Footer from '@/components/Footer';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-awaken text-gray-900 mb-6">
            Careers
          </h1>
          <p className="text-lg font-montserrat-regular text-gray-700 max-w-2xl mx-auto">
            Join us in creating timeless fashion that tells a story.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg p-12 text-center">
            {/* <Briefcase className="w-16 h-16 text-gray-900 mx-auto mb-6" /> */}
            {/* <h2 className="text-3xl font-awaken text-gray-900 mb-6">
              No Open Positions
            </h2> */}
            <p className="text-lg text-gray-700 font-montserrat-regular max-w-2xl mx-auto">
              We're currently not hiring, but we're always interested in connecting with talented individuals 
              who are passionate about fashion and craftsmanship.
            </p>
            <br />
            <p className="text-gray-700 font-montserrat-regular mb-8">
            Questions? Reach out to us at{' '}
            <a href="mailto:careers@rever.com" className="text-gray-900 hover:underline font-montserrat-bold">
              careers@rever.com
            </a>
          </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
