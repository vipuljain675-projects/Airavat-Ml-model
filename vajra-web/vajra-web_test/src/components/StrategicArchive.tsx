"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, Search, FileText, ChevronRight, X, Shield, Globe } from "lucide-react";

export default function StrategicArchive() {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/records");
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Archive failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-orbitron text-2xl tracking-tight text-white uppercase flex items-center gap-3">
            <Library className="text-amber-500 w-6 h-6" />
            Airavat Vision
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">Classified Geopolitical Dossiers & Historical Analogs</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search dossiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>
      </div>

      {/* Dossier Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12 scrollbar-hide">
        {loading ? (
          <div className="col-span-full h-[50vh] flex flex-col items-center justify-center opacity-30 italic font-mono text-sm">
            [ DECRYPTING ARCHIVE... ]
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="col-span-full h-[50vh] flex flex-col items-center justify-center opacity-30 italic font-mono text-sm">
            [ NO DOSSIERS FOUND MATCHING QUERY ]
          </div>
        ) : (
          filteredRecords.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedRecord(record)}
              className="glass p-5 border-t-2 border-amber-500/20 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(255,170,0,0.1)] transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">{record.id}</span>
                <span className="text-[9px] text-gray-500 font-mono">{record.date}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-100 group-hover:text-amber-400 mb-2 leading-tight">
                {record.title}
              </h4>
              <p className="text-[11px] text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                {record.summary}
              </p>
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono">
                <div className="flex gap-2">
                  {record.event_types.slice(0, 2).map((type: string) => (
                    <span key={type} className="text-gray-500 uppercase">#{type.split('_')[0]}</span>
                  ))}
                </div>
                <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-amber-500 transform group-hover:translateX(2) transition-all" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border-amber-500/30"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-obsidian-900/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                      <Shield className="w-6 h-6 text-amber-400" />
                   </div>
                   <div>
                     <span className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em]">{selectedRecord.id}</span>
                     <h3 className="font-orbitron text-xl md:text-2xl text-white mt-1 leading-tight">{selectedRecord.title}</h3>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                <section>
                  <header className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500">Strategic Summary</h5>
                  </header>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {selectedRecord.summary}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <header className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-cyan-500" />
                      <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500">Operational Context</h5>
                    </header>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase mb-1">Key Actors</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecord.actors.map((actor: string) => (
                            <span key={actor} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 uppercase">{actor}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase mb-1">Impact Regions</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecord.regions.map((region: string) => (
                            <span key={region} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 uppercase">{region}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="glass bg-obsidian-950/50 p-6 border-amber-500/10">
                    <header className="flex items-center gap-2 mb-4">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500">Analysis Notes</h5>
                    </header>
                    <p className="text-gray-400 text-xs italic leading-relaxed">
                      {selectedRecord.notes || "No internal analysis notes attached to this dossier. Analysis pending further signal validation."}
                    </p>
                  </section>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border-t border-amber-500/10 flex justify-between items-center px-8">
                 <span className="text-[10px] font-mono text-amber-500/50 uppercase italic">Confidential Document | Airavat Vision Platform</span>
                 <div className="flex gap-4">
                    <span className="text-[10px] font-mono text-gray-600">VERIFIED: {selectedRecord.date}</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
