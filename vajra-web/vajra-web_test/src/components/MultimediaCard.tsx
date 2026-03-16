"use client";

import { Youtube, FileText, PlayCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface MultimediaCardProps {
  url: string;
  title: string;
}

export default function MultimediaCard({ url, title }: MultimediaCardProps) {
  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
  
  const getThumbnail = () => {
    if (isYoutube) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
      }
    }
    return null;
  };

  const thumbnail = getThumbnail();

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="block group my-4 no-underline"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1d27]/40 hover:bg-[#1a1d27]/80 transition-all duration-300 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Thumbnail / Icon area */}
          <div className="relative w-full sm:w-40 h-24 bg-[#0f1117] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/[0.05]">
            {thumbnail ? (
              <img 
                src={thumbnail} 
                alt={title} 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 shadow-2xl" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/5 to-red-500/5">
                {isYoutube ? <Youtube className="w-10 h-10 text-orange-500/40 group-hover:text-orange-500 transition-colors" /> : <FileText className="w-10 h-10 text-blue-400/40 group-hover:text-blue-400 transition-colors" />}
              </div>
            )}
            {isYoutube && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 transition-all duration-300">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Text area */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                  isYoutube ? "text-orange-500 border-orange-500/20 bg-orange-500/5" : "text-blue-400 border-blue-400/20 bg-blue-400/5"
                }`}>
                  {isYoutube ? "Visual Intel" : "Document Audit"}
                </div>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors duration-300 font-orbitron">
                {title}
              </h4>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                {(() => {
                  try {
                    return new URL(url).hostname;
                  } catch {
                    return url;
                  }
                })()}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
                <span>View Insight</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Glow & Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/[0.02] to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute h-[1px] w-full top-0 bg-orange-500/10 group-hover:animate-scanline" />
      </div>
    </motion.a>
  );
}
