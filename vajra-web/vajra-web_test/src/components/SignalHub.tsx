"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ExternalLink, ShieldAlert, Cpu } from "lucide-react";

export default function SignalHub() {
  const [news, setNews] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      // Use the existing bridge endpoint to fetch live news context
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "India Geopolitics", include_news: true }),
      });
      const data = await response.json();
      if (data.live_news) {
        setNews(data.live_news);
      }
    } catch (error) {
      console.error("Signal Hub failed to fetch:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-orbitron text-2xl tracking-tight text-white uppercase flex items-center gap-3">
            <Activity className="text-cyan-400 w-6 h-6 animate-pulse" />
            Signal Analyzer
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">Real-time Intelligence Harvesting & Risk Synthesis</p>
        </div>
        <button 
          onClick={() => { setIsScanning(true); setTimeout(() => setIsScanning(false), 3000); }}
          className="glass px-4 py-2 border-cyan-500/20 hover:border-cyan-400 transition-all flex items-center gap-2 group"
        >
          <Cpu className={`w-4 h-4 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Deep Risk Scan</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        <AnimatePresence>
          {news.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center opacity-30 italic font-mono text-sm">
              [ HARVESTING SIGNALS... ]
            </div>
          ) : (
            news.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-4 border-l-2 border-cyan-500/40 relative group overflow-hidden"
              >
                {isScanning && (
                   <motion.div 
                     initial={{ top: '-100%' }}
                     animate={{ top: '200%' }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                     className="absolute inset-x-0 h-1 bg-cyan-400/50 shadow-[0_0_15px_#00f2ff] z-10"
                   />
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-bold text-cyan-500/70 uppercase tracking-widest bg-cyan-500/5 px-2 py-0.5 rounded">
                    {item.source}
                  </span>
                  <Activity className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="text-sm font-semibold text-gray-200 leading-tight mb-3">
                  {item.title}
                </h4>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-gray-500 uppercase">Status: Captured</span>
                  <div className="flex gap-4">
                    <a href={item.url} target="_blank" className="flex items-center gap-1 text-cyan-500 hover:text-cyan-300 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      VIEW INTEL
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="glass p-4 bg-obsidian-900/80 border-cyan-500/10">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">Global Risk Exposure</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
           <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '42%' }}
            className="h-full bg-gradient-to-r from-cyan-500 to-amber-500" 
           />
        </div>
        <div className="flex justify-between text-[8px] font-mono text-gray-400 mt-2 uppercase">
           <span>Signal Cluster: Alpha-7</span>
           <span>Confidence: 89%</span>
        </div>
      </div>
    </div>
  );
}
