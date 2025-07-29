// File: bleep-bot-frontend/src/pages/Layout.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils/index.js"; 
import { Bot, PlaySquare, History, HelpCircle, User } from "lucide-react";

// --- UPDATED: Icons changed to match the screenshot ---
const navigationItems = [
  {
    title: "Video Processor",
    url: createPageUrl("VideoProcessor"),
    icon: PlaySquare,
  },
  {
    title: "Processing History",
    url: createPageUrl("History"),
    icon: History,
  },
  {
    title: "User Guide",
    url: createPageUrl("UserGuide"),
    icon: HelpCircle,
  },
];

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
            TOOLS
          </p>
          <ul>
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url || (location.pathname === '/' && item.url === '/VideoProcessor');
              return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    // --- UPDATED: Styling for active/inactive links ---
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
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

        {/* --- NEW: "Welcome Back" card at the bottom of the sidebar --- */}
        <footer className="border-t border-gray-200 p-4">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Welcome Back</p>
              <p className="text-xs text-gray-500">Ready to clean videos?</p>
            </div>
          </div>
           <p className="text-center text-xs text-gray-400 mt-4">© 2025 Bleep Bot</p>
        </footer>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}