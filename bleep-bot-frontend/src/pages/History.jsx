// File: bleep-bot-frontend/src/pages/History.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Calendar, Download, Loader2, Trash2, HardDrive, VolumeX, History as HistoryIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Helper function to format file sizes
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// The UI component for a single history card
const HistoryCard = ({ item, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
    className="bg-white p-6 rounded-2xl shadow-md border"
  >
    <div className="flex items-center gap-4">
      <div className="flex-1 flex items-start gap-4">
        <div className="flex-shrink-0 bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center">
          <Film className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-lg truncate">{item.original_filename}</p>
          <div className="text-gray-500 text-sm flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(item.processed_at), 'PP, p')}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-x-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <VolumeX className="w-4 h-4 text-red-500" />
              <span><span className="font-semibold text-red-500">{item.profanity_detected_count}</span> words muted</span>
            </div>
            {/* File size can be added back later if saved to the DB */}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button disabled className="border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button onClick={() => onRemove(item.id)} className="border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  </motion.div>
);

export default function ProcessingHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8080/api/history');
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setHistory(data.history);
        } else {
          throw new Error(data.error || 'Failed to parse history data.');
        }
      } catch (error) {
        console.error("Failed to load processing history:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleRemove = (id) => {
    // This is a placeholder for now. To make this work, we'd need a DELETE API endpoint.
    setHistory(history.filter(item => item.id !== id));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Processing History</h1>
          <p className="mt-2 text-lg text-gray-600">A log of all your previously processed videos.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : error ? (
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold">Failed to load history</h3>
            <p>{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12">
            <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No Videos Processed Yet</h3>
            <p className="mt-1 text-gray-500">Your processing history will appear here once you clean a video.</p>
            <Link to="/VideoProcessor" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-blue-700 transition">
              <PlusCircle className="w-5 h-5" />
              Process Your First Video
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {history.map(item => (
                <HistoryCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}