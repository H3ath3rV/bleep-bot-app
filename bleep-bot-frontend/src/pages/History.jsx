// File: bleep-bot-frontend/src/pages/History.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { ServerCrash } from 'lucide-react';

export default function History() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing History</h1>
          <p className="text-gray-600">View and manage your processed videos</p>
        </motion.div>

        {/* "Not Available" Message Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center bg-white/70 backdrop-blur-sm p-16 rounded-2xl shadow-lg border"
        >
          <ServerCrash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">History is Not Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            This feature requires a database, which is not configured for this local version of the app. All processed videos must be downloaded immediately after processing.
          </p>
        </motion.div>
      </div>
    </div>
  );
}