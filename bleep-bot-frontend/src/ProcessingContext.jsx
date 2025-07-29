// File: bleep-bot-frontend/src/ProcessingContext.jsx

import React, { createContext, useState, useRef, useEffect, useContext } from 'react';

const ProcessingContext = createContext();

export const useProcessing = () => {
  return useContext(ProcessingContext);
};

export const ProcessingProvider = ({ children }) => {
  const [job, setJob] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // --- THIS IS THE CORRECTED LINE ---
    workerRef.current = new Worker(new URL('./processingWorker.js', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (event) => {
      const { type, status, progress, segments, downloadUrl, error } = event.data;
      setJob(prevJob => {
        if (!prevJob) return null;
        if (type === 'progress') return { ...prevJob, status, progress };
        if (type === 'complete') return { ...prevJob, status, progress: 100, segments, downloadUrl, isProcessing: false };
        if (type === 'error') return { ...prevJob, status, error, isProcessing: false };
        return prevJob;
      });
    };
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const startProcessing = (file, filterSettings) => {
    if (!file || !workerRef.current) return;
    setJob({
      fileName: file.name,
      status: 'Uploading video...',
      progress: 10,
      segments: [],
      downloadUrl: null,
      error: null,
      isProcessing: true,
    });
    workerRef.current.postMessage({ file, filterSettings });
  };
  
  const cancelProcessing = () => {
    setJob(null);
  };

  const value = {
    job,
    startProcessing,
    cancelProcessing,
  };

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  );
};