import React from 'react'; // <-- ADD THIS LINE
import Layout from "./Layout.jsx";
import VideoProcessor from "./VideoProcessor";
import History from "./History";
import UserGuide from "./UserGuide";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    VideoProcessor: VideoProcessor,
    History: History,
    UserGuide: UserGuide,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<VideoProcessor />} />
                <Route path="/VideoProcessor" element={<VideoProcessor />} />
                <Route path="/History" element={<History />} />
                <Route path="/UserGuide" element={<UserGuide />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}