// File: bleep-bot-frontend/src/pages/UserGuide.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, VolumeX, Download, Shield, Zap, Smartphone } from 'lucide-react';

export default function UserGuide() {
  const steps = [
    {
      icon: Upload,
      title: '1. Upload Your Video',
      description: 'Click the upload area or drag and drop your video file. We support MP4, MOV, and WEBM formats.',
    },
    {
      icon: Search,
      title: '2. AI-Powered Analysis',
      description: 'Our backend uses advanced AI to scan your video\'s audio track for profanity with high accuracy.',
    },
    {
      icon: VolumeX,
      title: '3. Precision Cleaning',
      description: 'The identified profane segments are precisely muted, leaving the rest of your video\'s audio untouched.',
    },
    {
      icon: Download,
      title: '4. Download Your Clean File',
      description: 'Once processing is complete, you get a high-quality, clean version of your video to download instantly.',
    }
  ];

  const features = [
    {
      icon: Shield,
      title: '100% Private & Secure',
      description: 'Your files are processed securely and automatically deleted. Your privacy is our top priority.',
    },
    {
      icon: Zap,
      title: 'Smart & Fast Processing',
      description: "Advanced AI accurately detects profanity and our powerful servers deliver clean videos in minutes.",
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      description: 'Access Bleep Bot from any device. Our app is fully responsive for desktop, tablet, and mobile use.',
    }
  ];

  const faqs = [
    {
      question: "What file formats and sizes are supported?",
      answer: "We support MP4, MOV, and WEBM. The maximum file size is currently 500MB."
    },
    {
      question: "How is my privacy protected?",
      answer: "Privacy is our top priority. Your video is processed locally on the server and all files are temporary."
    },
    {
      question: "How long does processing take?",
      answer: "Processing time depends on video length. On average, a 10-minute video takes about 2-3 minutes."
    },
    {
      question: "What happens if no profanity is found?",
      answer: "If no profanity is found, you'll be notified, and the clean file will be a copy of the original."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 sm:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">How Bleep Bot Works</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">A simple guide to getting clean videos in just a few clicks.</p>
        </motion.div>

        {/* How It Works Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Features Section (already updated, but including here for completeness) */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Core Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section (Rewritten to have NO dependencies) */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/80 border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800">{faq.question}</h4>
                <p className="text-gray-600 mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}