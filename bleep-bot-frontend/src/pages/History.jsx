// File: bleep-bot-frontend/src/pages/History.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Calendar, Loader2, Trash2, VolumeX, History as HistoryIcon, PlusCircle, RotateCcw, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useProcessing } from '@/ProcessingContext.jsx';

// Helper function to format file sizes
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// The UI component for a single history card with buttons inside
const HistoryCard = ({ item, onRemove, onReprocess }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition-all duration-200 overflow-hidden"
  >
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center">
            <Film className="w-7 h-7 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate mb-3">
              {item.original_filename}
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(item.processed_at), 'PPp')}</span>
              </div>
              
              {item.file_size && (
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span>{formatFileSize(item.file_size)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
              
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-semibold">
                  {item.profanity_detected_count} word{item.profanity_detected_count !== 1 ? 's' : ''} muted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons inside the card */}
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <button
            onClick={() => onReprocess(item)}
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
            title="Reprocess video"
          >
            <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-300" />
          </button>
          
          <button
            onClick={() => onRemove(item.id)}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Remove from history"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function ProcessingHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startProcessing } = useProcessing();

  // Load session-only history on component mount
  useEffect(() => {
    loadSessionHistory();
  }, []);

  const loadSessionHistory = () => {
    setIsLoading(true);
    try {
      const sessionData = sessionStorage.getItem('processedVideos');
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        setHistory(parsedData);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
      setHistory([]);
      sessionStorage.removeItem('processedVideos');
    } finally {
      setIsLoading(false);
    }
  };

  // Add processed video to session history (called from VideoProcessor)
  const addToHistory = (videoData) => {
    const newItem = {
      id: Date.now(),
      original_filename: videoData.filename,
      processed_at: new Date().toISOString(),
      profanity_detected_count: videoData.wordsMuted || 0,
      file_size: videoData.fileSize || null,
      status: 'completed'
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    sessionStorage.setItem('processedVideos', JSON.stringify(updatedHistory));
    return newItem.id;
  };

  // Expose addToHistory function globally so VideoProcessor can use it
  React.useEffect(() => {
    window.addToProcessingHistory = addToHistory;
    return () => {
      delete window.addToProcessingHistory;
    };
  }, [history]);

  const handleRemove = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    sessionStorage.setItem('processedVideos', JSON.stringify(updatedHistory));
  };

  const handleReprocess = (item) => {
    // This would trigger reprocessing - you can implement this based on your needs
    console.log('Reprocessing:', item.original_filename);
    // You could navigate to VideoProcessor or trigger a reprocess function
    // Example: navigate('/VideoProcessor', { state: { reprocessFile: item } });
  };

  const clearAllHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('processedVideos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Processing History</h1>
          <p className="text-lg text-gray-600 mb-4">
            Videos processed during this session. History clears when you restart the app.
          </p>
          
          {history.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {history.length} video{history.length !== 1 ? 's' : ''} processed this session
              </p>
              <button
                onClick={clearAllHistory}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                Clear All History
              </button>
            </div>
          )}
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <HistoryIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Processed Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Videos you process during this session will appear here. Upload and process your first video to get started.
            </p>
            <Link 
              to="/VideoProcessor" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Process Your First Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {history.map(item => (
                <HistoryCard 
                  key={item.id} 
                  item={item} 
                  onRemove={handleRemove}
                  onReprocess={handleReprocess}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}