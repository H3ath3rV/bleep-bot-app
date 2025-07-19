// File: bleep-bot-frontend/src/pages/VideoProcessor.jsx

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Smartphone, UploadCloud, Film, AlertCircle, Download, X, Loader } from 'lucide-react';

export default function VideoProcessor() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl('');
    setError(null);
    setIsProcessing(false);
    setStatusText('Idle');
    setProgress(0);
    setDownloadUrl(null);
  }, [videoUrl]);

  // This is the function we are fixing
  const handleFileSelect = useCallback((file) => {
    handleCancel();

    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = ['video/mp4', 'video/mov', 'video/webm'];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, MOV, WEBM).');
      return;
    }

    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    setSelectedFile(file);
    setVideoUrl(URL.createObjectURL(file));
  }, [handleCancel]);

  const handleCleanVideo = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setDownloadUrl(null);
    setProgress(10);
    setStatusText('Uploading video...');

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const uploadResponse = await fetch('http://localhost:8080/api/video/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload video.');
      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) throw new Error(uploadResult.error || 'Upload failed.');
      
      setProgress(30);
      setStatusText('Analyzing audio...');
      
      const processResponse = await fetch('http://localhost:8080/api/video/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: uploadResult.file_id }),
      });

      if (!processResponse.ok) throw new Error('Failed to process video.');
      const processResult = await processResponse.json();
      if (!processResult.success) throw new Error(processResult.error || 'Processing failed.');

      setProgress(100);
      setStatusText(processResult.message || 'Processing complete!');
      setDownloadUrl(`http://localhost:8080/api/video/download/${processResult.clean_file_id}`);

    } catch (err) {
      setError(err.message);
      setStatusText('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Professional Video Cleaner</h1>
          <p className="text-lg text-gray-600">Upload a video, and our AI will detect and mute profanity automatically.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div key="upload">
              <div 
                onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
                onDragOver={(e) => e.preventDefault()}
                className="relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Drag & drop your video here</h3>
                <p className="text-gray-500 mt-1">or click to browse</p>
                <input type="file" accept="video/mp4,video/mov,video/webm" onChange={(e) => handleFileSelect(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              {error && <p className="text-red-600 text-center mt-4">{error}</p>}
            </motion.div>
          ) : (
            <motion.div key="processing" className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-full md:w-1/2">
                  <video src={videoUrl} controls className="w-full rounded-lg"></video>
                  <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                    <Film className="w-5 h-5" />
                    <span className="font-medium truncate">{selectedFile.name}</span>
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Process</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s' }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>Status: <span className="font-semibold">{statusText}</span></span>
                      <span>{progress}%</span>
                    </div>
                    {error && <div className="flex items-center gap-3 bg-red-50 text-red-700 p-3 rounded-lg mb-4"><AlertCircle className="w-5 h-5" /><p>{error}</p></div>}
                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleCleanVideo} 
                        disabled={isProcessing || downloadUrl}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing && <Loader className="animate-spin w-5 h-5 mr-2" />}
                        Clean Video
                      </button>
                      <button onClick={handleCancel} className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                        Cancel
                      </button>
                    </div>
                    {downloadUrl && (
                      <a href={downloadUrl} download={`clean_${selectedFile.name}`} className="mt-4 inline-flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        <Download className="w-5 h-5 mr-2" />
                        Download Clean Video
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Shield className="w-7 h-7 text-white" /></div>
            <h3 className="font-bold text-gray-900 mb-2">100% Private & Secure</h3>
            <p className="text-gray-600 text-sm">Your files are processed securely and automatically deleted. Your privacy is our top priority.</p>
          </div>
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Zap className="w-7 h-7 text-white" /></div>
            <h3 className="font-bold text-gray-900 mb-2">Smart & Fast Processing</h3>
            <p className="text-gray-600 text-sm">Advanced AI accurately detects profanity and our powerful servers deliver clean videos in minutes.</p>
          </div>
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Smartphone className="w-7 h-7 text-white" /></div>
            <h3 className="font-bold text-gray-900 mb-2">Works Everywhere</h3>
            <p className="text-gray-600 text-sm">Access Bleep Bot from any device. Our app is fully responsive for desktop, tablet, and mobile use.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}