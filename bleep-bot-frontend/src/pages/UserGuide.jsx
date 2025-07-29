// File: bleep-bot-frontend/src/pages/UserGuide.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, VolumeX, Download, Shield, Zap, Smartphone } from 'lucide-react';

// Component for a single step in the timeline.
const HowItWorksStep = ({ icon: Icon, title, description, isLast, isFirst, customVariants }) => (
  <motion.div variants={customVariants} className="flex gap-6">
    <div className="flex flex-col items-center">
      <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
        <Icon className="w-8 h-8 text-white" />
      </div>
      {/* Logic for the animated line. It only appears if it's NOT the last item. */}
      {!isLast && (
        <div className={`w-px bg-gray-300 mt-4 ${isFirst ? 'h-16' : ''}`}>
          {/* The line for steps after the first one is a motion.div to animate its height */}
          {!isFirst && (
            <motion.div
              className="w-full bg-gray-300 h-16"
              initial={{ height: 0 }}
              whileInView={{ height: '4rem' }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
            />
          )}
        </div>
      )}
    </div>
    <div className="flex-1 pb-16">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default function UserGuide() {
  const steps = [
    {
      icon: Upload,
      title: "1. Upload Your Video",
      description: "Click the upload area or drag and drop your video file. We support MP4, MOV, AVI, and MKV formats up to 500MB."
    },
    {
      icon: Search,
      title: "2. AI-Powered Analysis", 
      description: "Our backend server uses advanced AI to scan your video's audio track for profanity with high accuracy."
    },
    {
      icon: VolumeX,
      title: "3. Precision Cleaning",
      description: "The identified profane segments are precisely muted, leaving the rest of your video's audio untouched."
    },
    {
      icon: Download,
      title: "4. Download Your Clean File",
      description: "Once processing is complete, you get a high-quality, clean version of your video to download instantly."
    }
  ];

  const features = [
    {
      icon: Shield,
      title: '100% Private & Secure',
      description: 'Your files are processed securely and automatically deleted. Your privacy is our top priority.'
    },
    {
      icon: Zap,
      title: 'Smart & Fast Processing',
      description: 'Advanced AI accurately detects profanity and our powerful servers deliver clean videos in minutes.'
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      description: 'Access Bleep Bot from any device. Our app is fully responsive for desktop, tablet, and mobile use.'
    }
  ];

  const faqs = [
    {
      question: 'What file formats and sizes are supported?',
      answer: 'We support MP4, MOV, and WEBM. The maximum file size is currently 500MB.'
    },
    {
      question: 'How is my privacy protected?',
      answer: 'Privacy is our top priority. Your video is processed locally on the server and all files are temporary.'
    },
    {
      question: 'How long does processing take?',
      answer: 'Processing time depends on video length. On average, a 10-minute video takes about 2-3 minutes.'
    },
    {
      question: 'What happens if no profanity is found?',
      answer: 'If no profanity is found, you\'ll be notified, and the clean file will be a copy of the original.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
          duration: 0.5,
          ease: 'easeInOut'
      }
    },
  };

  return (
    <section className="max-w-3xl mx-auto py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">How Bleep Bot Works</h1>
        <p className="mt-2 text-lg text-gray-600">A simple, streamlined guide to getting clean, professional videos in just a few clicks.</p>
      </header>
      <motion.div
        className="space-y-0"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {steps.map((step, index) => (
          <HowItWorksStep 
            key={step.title}
            icon={step.icon}
            title={step.title}
            description={step.description}
            isLast={index === steps.length - 1}
            isFirst={index === 0}
            customVariants={itemVariants}
          />
        ))}
      </motion.div>

      {/* Core Features Section */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-10">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, idx) => (
            <div key={feature.title} className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={faq.question} className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-gray-800 mb-1">{faq.question}</h4>
              <p className="text-gray-600 text-base">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}