// File: bleep-bot-frontend/src/pages/index.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from "./Layout.jsx";
import VideoProcessor from "./VideoProcessor";
import History from "./History";
import UserGuide from "./UserGuide";
import { ProcessingProvider } from '../ProcessingContext.jsx';

const PageWrapper = ({ children }) => (
  <Layout>
    {children}
  </Layout>
);

export default function Pages() {
  return (
    <ProcessingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PageWrapper><VideoProcessor /></PageWrapper>} />
          <Route path="/VideoProcessor" element={<PageWrapper><VideoProcessor /></PageWrapper>} />
          <Route path="/History" element={<PageWrapper><History /></PageWrapper>} />
          <Route path="/UserGuide" element={<PageWrapper><UserGuide /></PageWrapper>} />
        </Routes>
      </Router>
    </ProcessingProvider>
  );
}