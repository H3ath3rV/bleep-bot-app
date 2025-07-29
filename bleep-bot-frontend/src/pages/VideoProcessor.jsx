// File: bleep-bot-frontend/src/pages/VideoProcessor.jsx

import React, { useState, useRef } from 'react';
import { useProcessing } from '@/ProcessingContext.jsx';
import { Shield, Zap, Smartphone, UploadCloud, Film, AlertCircle, Download, X, Loader, Settings, List } from 'lucide-react';

const formatTimestamp = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default function VideoProcessor() {
  const { job, startProcessing, cancelProcessing } = useProcessing();
  const [localFile, setLocalFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [localError, setLocalError] = useState(null);
  const [enabledCategories, setEnabledCategories] = useState(['profanity_curse', 'blasphemy_religious']);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  function handleBrowseClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleCategoryToggle(category) {
    setEnabledCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  }

  function handleFileSelect(file) {
    setLocalError(null);
    setThumbnail('');
    
    const allowedMimeTypes = ['video/mp4', 'video/mov', 'video/webm', 'video/x-matroska', 'video/mkv'];
    const allowedExtensions = ['.mp4', '.mov', '.webm', '.mkv'];

    if (!file) return;

    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const isMimeTypeAllowed = allowedMimeTypes.includes(file.type);
    const isExtensionAllowed = allowedExtensions.includes(fileExtension);

    if (!isMimeTypeAllowed && !isExtensionAllowed) {
      setLocalError('Please select a valid video file (MP4, MOV, WEBM, MKV).');
      return;
    }
    
    setLocalFile(file);
    setVideoUrl(URL.createObjectURL(file));
  }

  function handleLoadedMetadata() {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }

  function handleSeeked() {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setThumbnail(canvas.toDataURL('image/jpeg'));
    }
  }

  function handleCleanVideo() {
    if (!localFile) return;
    startProcessing(localFile, { enabled_categories: enabledCategories });
  }

  const currentJob = job || {};
  const displayFile = job ? { name: job.fileName } : localFile;

  function handleCancelClick() {
    cancelProcessing();
    setLocalFile(null);
    if (videoUrl) { URL.revokeObjectURL(videoUrl); }
    setVideoUrl('');
    setThumbnail('');
  }

  // Add to processing history when job completes
  React.useEffect(() => {
    if (currentJob.status === 'Complete!' && currentJob.downloadUrl && !currentJob.addedToHistory) {
      // Mark as added to prevent duplicate entries
      currentJob.addedToHistory = true;
      
      // Add to processing history
      if (window.addToProcessingHistory && localFile) {
        const wordsMuted = currentJob.segments ? currentJob.segments.length : 0;
        window.addToProcessingHistory({
          filename: localFile.name,
          wordsMuted: wordsMuted,
          fileSize: localFile.size,
        });
      }
    }
  }, [currentJob.status, currentJob.downloadUrl, localFile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 sm:p-8">
      <video ref={videoRef} src={videoUrl} style={{ display: 'none' }} onLoadedMetadata={handleLoadedMetadata} onSeeked={handleSeeked} crossOrigin="anonymous" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Professional Video Cleaner</h1>
          <p className="text-lg text-gray-600">Upload a video, and our AI will detect and mute profanity automatically.</p>
        </div>
        
        {!displayFile ? (
          <div>
            <div 
              onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }} 
              onDragOver={(e) => e.preventDefault()} 
              className="relative flex flex-col items-center justify-center w-full p-16 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/30"
            >
              <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800">Drag & drop your video here</h3>
              <p className="text-gray-500 mt-2">
                or{' '}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={handleBrowseClick}>
                  click to browse
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-4">
                MP4, MOV, WEBM, MKV supported
              </p>
              <input ref={fileInputRef} type="file" accept="video/mp4,video/mov,video/webm,video/x-matroska,.mkv" onChange={(e) => handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
            </div>
            {localError && <p className="text-red-600 text-center mt-4 bg-red-50 p-3 rounded-lg">{localError}</p>}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-full md:w-1/2">
                <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {thumbnail ? (
                    <img src={thumbnail} alt="Video snapshot" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Film className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                  <Film className="w-5 h-5" />
                  <span className="font-medium truncate">{displayFile.name}</span>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5"/>
                      Filter Categories
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={enabledCategories.includes('profanity_curse')} 
                          onChange={() => handleCategoryToggle('profanity_curse')} 
                          className="form-checkbox h-4 w-4 text-blue-600 rounded"
                        />
                        <span>Profanity & Curse Words</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={enabledCategories.includes('blasphemy_religious')} 
                          onChange={() => handleCategoryToggle('blasphemy_religious')} 
                          className="form-checkbox h-4 w-4 text-blue-600 rounded"
                        />
                        <span>Blasphemy & Religious</span>
                      </label>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Process</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${currentJob.progress || 0}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Status: <span className="font-semibold">{currentJob.status || 'Ready'}</span></span>
                    <span>{currentJob.progress || 0}%</span>
                  </div>
                  
                  {currentJob.error && (
                    <div className="flex items-center gap-3 bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                      <AlertCircle className="w-5 h-5" />
                      <p>{currentJob.error}</p>
                    </div>
                  )}
                  
                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleCleanVideo} 
                      disabled={currentJob.isProcessing} 
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {currentJob.isProcessing && <Loader className="animate-spin w-5 h-5 mr-2" />}
                      Clean Video
                    </button>
                    <button 
                      onClick={handleCancelClick} 
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {currentJob.downloadUrl && (
                    <a 
                      href={currentJob.downloadUrl} 
                      download={`clean_${displayFile.name}`} 
                      className="mt-4 inline-flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Clean Video
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {currentJob.segments && currentJob.segments.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <List className="w-5 h-5"/>
                  Muted Segments
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                  {currentJob.segments.map((segment, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      <span className="font-mono text-sm text-gray-600">{formatTimestamp(segment.timestamp)}</span>
                      <span className="text-sm text-gray-800 font-medium">"{segment.word}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">100% Private & Secure</h3>
            <p className="text-gray-600 text-sm">Your files are processed securely and automatically deleted. Your privacy is our top priority.</p>
          </div>
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Smart & Fast Processing</h3>
            <p className="text-gray-600 text-sm">Advanced AI accurately detects profanity and our powerful servers deliver clean videos in minutes.</p>
          </div>
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Works Everywhere</h3>
            <p className="text-gray-600 text-sm">Access Bleep Bot from any device. Our app is fully responsive for desktop, tablet, and mobile use.</p>
          </div>
        </div>
      </div>
    </div>
  );
}