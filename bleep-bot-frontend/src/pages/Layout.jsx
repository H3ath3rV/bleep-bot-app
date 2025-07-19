// File: bleep-bot-frontend/src/pages/Layout.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
// Use a relative path to be 100% certain it's found
import { createPageUrl } from "../utils/index.js"; 
import { Bot, Home, FileVideo, Info } from "lucide-react";

// This is the list of pages for the navigation
const navigationItems = [
  {
    title: "Video Processor",
    url: createPageUrl("VideoProcessor"),
    icon: FileVideo,
  },
  {
    title: "Processing History",
    url: createPageUrl("History"),
    icon: Home,
  },
  {
    title: "User Guide",
    url: createPageUrl("UserGuide"),
    icon: Info,
  },
];

// This is the new, simplified Layout component
export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* --- Sidebar --- */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Bleep Bot</h2>
              <p className="text-xs text-gray-500">Video Profanity Filter</p>
            </div>
          </div>
        </header>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Tools
          </p>
          <ul>
            {navigationItems.map((item) => {
              // Check if the current page URL matches the item's URL
              const isActive = location.pathname === item.url || (location.pathname === '/' && item.url === '/VideoProcessor');
              return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    // Apply different styles if the link is active
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <footer className="border-t border-gray-200 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">© 2025 Bleep Bot</p>
          </div>
        </footer>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}