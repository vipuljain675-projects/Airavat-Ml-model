"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Library, Search, FileText, ChevronRight, X, Shield, Globe, 
  Radio, Zap, AlertTriangle, Cpu, History, Landmark, Target,
  TrendingUp, Scale, HardHat, Eye, Fingerprint, Lock
} from "lucide-react";

export default function StrategicArchive() {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedRecord(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("http://localhost:8005/records");
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Archive failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  const sectors = ["ALL", "MILITARY", "TECHNOLOGY", "PROXY", "DIPLOMATIC", "MARITIME"];

  const filteredRecords = Array.isArray(records) ? records.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (r.id || r.event_id)?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSector = activeSector === "ALL" || (r.event_types || []).includes(activeSector);
    
    return matchesSearch && matchesSector;
  }) : [];

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 overflow-hidden">
      
      {/* SECTOR TERMINAL (Sidebar) */}
      <div className="w-full md:w-64 glass-premium border-amber-500/10 flex flex-col p-4 shrink-0 bg-obsidian-950/40">
        <div className="mb-6">
           <div className="flex items-center gap-2 mb-1 px-2">
              <Fingerprint className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest">Sector Filters</span>
           </div>
           <h2 className="font-orbitron text-lg text-white font-bold px-2 tracking-tighter uppercase underline decoration-amber-500/20 underline-offset-8">
              Airavat Vision
           </h2>
        </div>

        <div className="space-y-1.5 overflow-y-auto pr-2 scrollbar-hide">
           {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={`w-full group flex items-center justify-between px-4 py-3 rounded text-[10px] font-mono uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                   activeSector === sector ? "bg-amber-500/10 text-amber-500 border border-amber-500/30" : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="relative z-10">{sector}</span>
                {activeSector === sector && (
                   <motion.div layoutId="activeSector" className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                )}
                <ChevronRight className={`w-3 h-3 transition-transform ${activeSector === sector ? "opacity-100 rotate-90" : "opacity-20 group-hover:opacity-100"}`} />
              </button>
           ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 px-2">
           <p className="text-[8px] font-mono text-gray-600 leading-relaxed uppercase">
              Current Auth: Level 5<br/>
              Status: Active Duty<br/>
              Session: Encrypted
           </p>
           <div className="mt-4 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
           </div>
        </div>
      </div>

      {/* MAIN ARCHIVE INTERFACE */}
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden min-w-0">
        
        {/* Top Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-obsidian-900/40 p-3 border border-white/5 rounded-sm">
           <div className="relative w-full max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                 type="text" 
                 placeholder="SCAN CLASSIFIED DOSSIERS..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-black/60 border border-white/10 rounded-sm pl-12 pr-4 py-3 text-xs font-mono tracking-widest focus:outline-none focus:border-cyan-400/50 transition-all text-gray-300 placeholder:text-gray-700 uppercase"
              />
           </div>
           <div className="flex gap-4 px-4 text-[10px] font-mono text-gray-600">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> E2E SECURE</span>
              <span className="text-cyan-500/30">|</span>
              <span className="flex items-center gap-1 font-bold text-gray-400">{filteredRecords.length} ENTRIES FOUND</span>
           </div>
        </div>

        {/* Dossier Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 scrollbar-hide">
          {loading ? (
            <div className="col-span-full h-full flex flex-col items-center justify-center space-y-4">
               <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
               <p className="font-mono text-xs text-cyan-500/50 animate-pulse tracking-[0.3em] uppercase">[ RECONSTRUCTING DATABASE... ]</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 mt-20">
              <AlertTriangle className="w-12 h-12 text-gray-600 mb-4" />
              <p className="font-mono text-sm tracking-[0.5em] uppercase text-center">[ NO RESULTS IN CURRENT SECTOR ]</p>
            </div>
          ) : (
            filteredRecords.map((record, i) => (
              <motion.div
                key={record.id || record.event_id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i % 12) * 0.03 }}
                onClick={() => {
                  setSelectedRecord(record);
                  setActiveTab("overview");
                }}
                className="group relative cursor-pointer"
              >
                {/* Dossier Folder Visual */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-amber-500/30 rounded-sm blur opacity-0 group-hover:opacity-60 transition duration-500" />
                
                <div className="relative glass-premium border-white/10 group-hover:border-white/20 transition-all h-[340px] flex flex-col bg-obsidian-950">
                  {/* Status Bar */}
                  <div className="h-1 w-full bg-obsidian-900 overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (i + 5) * 10)}%` }}
                        className="h-full bg-cyan-500/40"
                     />
                  </div>

                  {/* Thumbnail / SAT-SCAN View */}
                  <div className="h-40 relative overflow-hidden bg-black">
                     {record.image ? (
                        <img 
                           src={record.image} 
                           alt="" 
                           className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100 scale-110 group-hover:scale-100"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-obsidian-900/50">
                           <History className="w-12 h-12 text-gray-800" />
                        </div>
                     )}
                     
                     <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 to-transparent" />
                     
                     {/* Overlay HUD Bits */}
                     <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <span className="text-[8px] font-mono text-cyan-400/80 bg-cyan-400/10 px-1 border border-cyan-400/20">SAT-SCAN: ACTIVE</span>
                        <div className="w-12 h-[2px] bg-cyan-500/30 animate-pulse" />
                     </div>

                     {/* TOP SECRET STAMP (Reference Screenshot) */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="border-4 border-red-600/60 px-4 py-1 text-red-600/80 font-black text-xl uppercase tracking-tighter">
                           Top Secret
                        </div>
                     </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 font-mono text-[9px] text-gray-500 uppercase">
                       <span className="text-amber-500/60">{record.id}</span>
                       <span className="tracking-tighter">{record.date}</span>
                    </div>

                    <h4 className="font-orbitron font-bold text-white group-hover:text-cyan-400 leading-tight mb-3 transition-colors uppercase tracking-tight text-sm">
                       {record.title}
                    </h4>
                    
                    {/* REDACTED TEXT BARS (Animation on hover) */}
                    <div className="space-y-1.5 flex-1">
                       <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-mono italic">
                          "{record.summary}"
                       </p>
                       {!record.summary && (
                          <div className="space-y-1 px-1">
                             <div className="h-2 w-full bg-gray-800/50" />
                             <div className="h-2 w-3/4 bg-gray-800/50" />
                             <div className="h-2 w-1/2 bg-gray-800/50" />
                          </div>
                       )}
                    </div>

                    <div className="mt-4 flex justify-between items-center pt-3 border-t border-white/5">
                       <div className="flex gap-1.5">
                          {(record.event_types || []).slice(0, 2).map((type: string) => (
                             <span key={type} className="text-[7px] font-mono text-gray-600 uppercase border border-white/5 px-1.5 py-0.5 group-hover:border-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                                {type}
                             </span>
                          ))}
                       </div>
                       <ChevronRight className="w-4 h-4 text-gray-800 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* COMPREHENSIVE CASE FILE BOOK (Detail View) */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              className="glass-premium max-w-7xl w-full h-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)]"
            >
              
              {/* CASE FILE SIDEBAR */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 flex flex-col p-8 flex-shrink-0">
                 <div className="mb-10 text-center relative group">
                    <div className="w-full aspect-square bg-obsidian-900 border border-white/5 relative overflow-hidden group-hover:border-amber-500/50 transition-colors">
                       {selectedRecord.image ? (
                          <img src={selectedRecord.image} className="w-full h-full object-cover opacity-80" />
                       ) : (
                          <Cpu className="w-20 h-20 text-gray-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    </div>
                    <div className="mt-4 flex flex-col gap-1">
                       <span className="text-amber-500 font-mono text-[9px] font-bold tracking-[.3em] uppercase">Security Classification: Alpha</span>
                       <span className="text-[8px] text-gray-500 font-mono uppercase">Reference: {selectedRecord.id}</span>
                    </div>
                 </div>

                 <div className="space-y-8 flex-1">
                    <div>
                       <h5 className="text-[9px] font-bold text-gray-600 uppercase mb-4 tracking-widest border-l-2 border-amber-500 pl-2">Parameters</h5>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] text-gray-500 uppercase">Actors</span>
                             <div className="flex gap-1">
                                {selectedRecord.actors?.map((a: string) => (
                                   <span key={a} className="text-[8px] font-mono text-white bg-white/5 border border-white/10 px-1">{a}</span>
                                ))}
                             </div>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] text-gray-500 uppercase">Sector</span>
                             <span className="text-[10px] text-amber-500 font-bold uppercase">{selectedRecord.event_types?.[0]}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] text-gray-500 uppercase">Date</span>
                             <span className="text-[9px] font-mono text-gray-300">{selectedRecord.date}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       {["WHY IT HAPPENED", "INDIA'S STATUS", "DEEP DIVE", "STRATEGIC LEARNINGS"].map((t, idx) => (
                          <button
                             key={t}
                             onClick={() => setActiveTab(t.toLowerCase().replace("'","").replace(" ","_"))}
                             className={`w-full flex items-center gap-3 px-4 py-3 rounded text-[9px] font-mono text-left transition-all relative ${
                                activeTab === t.toLowerCase().replace("'","").replace(" ","_") 
                                   ? "bg-amber-500/10 text-amber-500 border border-amber-500/40" 
                                   : "text-gray-500 hover:text-white"
                             }`}
                          >
                             <span className="opacity-40">0{idx+1}</span>
                             <span className="tracking-widest">{t}</span>
                             {activeTab === t.toLowerCase().replace("'","").replace(" ","_") && (
                                <motion.div layoutId="modalTab" className="absolute right-0 top-0 bottom-0 w-0.5 bg-amber-500" />
                             )}
                          </button>
                       ))}
                    </div>
                 </div>

                 <button 
                  onClick={() => setSelectedRecord(null)}
                  className="mt-8 flex items-center justify-center gap-2 p-4 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500 hover:text-red-500 transition-all font-bold"
                 >
                    <X className="w-4 h-4" /> RE-ENCRYPT DOSSIER
                 </button>
              </div>

              {/* CASE FILE CONTENT AREA */}
              <div className="flex-1 bg-gradient-to-br from-obsidian-950 to-black p-10 md:p-16 overflow-y-auto scrollbar-premium relative">
                 
                 {/* NAVIGATION HEADER (New) */}
                 <div className="absolute top-8 left-10 md:left-16 right-10 flex justify-between items-center pointer-events-none">
                    <button 
                       onClick={() => setSelectedRecord(null)}
                       className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-mono text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                    >
                       <ChevronRight className="w-3 h-3 rotate-180" /> BACK TO ARCHIVE
                    </button>
                    <button 
                       onClick={() => setSelectedRecord(null)}
                       className="pointer-events-auto w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 text-gray-400 hover:text-red-500 transition-all"
                    >
                       <X className="w-4 h-4" />
                    </button>
                 </div>

                 <AnimatePresence mode="wait">
                    <motion.div
                       key={activeTab}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="max-w-4xl pt-12 md:pt-16"
                    >
                       <div className="mb-12">
                          <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white tracking-tighter mb-4 leading-none">
                             {selectedRecord.title}
                          </h1>
                          <div className="h-1 w-32 bg-amber-500 shadow-[0_0_15px_#f59e0b]" />
                       </div>

                       {activeTab === "overview" || activeTab === "why_it_happened" ? (
                          <div className="space-y-12">
                             <section className="relative">
                                <div className="absolute -left-10 top-0 text-[100px] font-black text-white/5 pointer-events-none select-none">INTENT</div>
                                <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-6 font-mono">01. GEOPOLITICAL ROOT CAUSES</h5>
                                <p className="text-xl md:text-2xl text-gray-100 font-medium leading-relaxed italic border-l-4 border-amber-500/30 pl-8">
                                   "{selectedRecord.deep_dive?.intent}"
                                </p>
                             </section>

                             {selectedRecord.summary && (
                                <section>
                                   <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 font-mono">02. EXECUTIVE SUMMARY</h5>
                                   <div className="text-lg text-gray-400 leading-loose prose prose-invert font-normal">
                                      {selectedRecord.summary}
                                   </div>
                                </section>
                             )}
                          </div>
                       ) : activeTab === "indias_status" ? (
                          <div className="space-y-12">
                             <section className="p-10 glass-premium border-amber-500/20 bg-amber-500/5">
                                <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-8 flex items-center gap-2 font-mono">
                                   <History className="w-4 h-4" /> SOVEREIGN STATE AT MOMENT OF INCIDENT
                                </h5>
                                <p className="text-xl text-amber-50/90 leading-loose font-medium font-serif italic">
                                   {selectedRecord.deep_dive?.india_status_at_moment || "Restricted contextual data. Model building pending for this specific historical window."}
                                </p>
                             </section>

                             <div className="grid grid-cols-2 gap-8">
                                <div className="p-6 border border-white/5 bg-white/[0.02]">
                                   <p className="text-[9px] text-gray-600 uppercase mb-3">Military Health</p>
                                   <div className="h-2 w-full bg-obsidian-900 rounded-full overflow-hidden">
                                      <div className="h-full bg-cyan-700 w-2/3" />
                                   </div>
                                </div>
                                <div className="p-6 border border-white/5 bg-white/[0.02]">
                                   <p className="text-[9px] text-gray-600 uppercase mb-3">Economic Leverage</p>
                                   <div className="h-2 w-full bg-obsidian-900 rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-700 w-1/3" />
                                   </div>
                                </div>
                             </div>
                          </div>
                       ) : activeTab === "deep_dive" ? (
                          <div className="space-y-12">
                             <section className="space-y-12">
                                <div>
                                   <h5 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-6 font-mono">01. OPERATIONAL FLOW</h5>
                                   <div className="text-lg text-gray-300 leading-relaxed font-mono whitespace-pre-wrap border-l border-white/10 pl-8">
                                      {selectedRecord.deep_dive?.operations}
                                   </div>
                                </div>
                                <div className="bg-obsidian-900/50 p-8 border border-white/5">
                                   <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 font-mono">02. INDIA'S REACTION</h5>
                                   <div className="text-base text-gray-400 leading-loose">
                                      {selectedRecord.deep_dive?.india_reaction}
                                   </div>
                                </div>
                             </section>
                          </div>
                       ) : activeTab === "strategic_learnings" ? (
                          <div className="space-y-10">
                             <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-8 flex items-center gap-2 font-mono">
                                <Target className="w-4 h-4" /> DOCTRINAL LESSONS FOR COMMAND
                             </h5>
                             
                             <div className="space-y-6">
                                {selectedRecord.deep_dive?.strategic_learnings?.map((l: string, idx: number) => (
                                   <motion.div 
                                      key={idx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="flex gap-8 group"
                                   >
                                      <div className="shrink-0 w-12 h-12 rounded border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold bg-amber-500/5 font-mono shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                         0{idx+1}
                                      </div>
                                      <div className="flex-1 pt-1">
                                         <p className="text-xl text-gray-200 font-medium leading-relaxed group-hover:text-amber-100 transition-colors">
                                            {l}
                                         </p>
                                      </div>
                                   </motion.div>
                                ))}
                             </div>

                             <div className="mt-16 p-8 border border-red-500/10 bg-red-500/5">
                                <p className="text-xs text-red-400 font-mono tracking-tighter uppercase leading-relaxed text-center">
                                   Critical Warning: Lessons from this dossier must be applied to the current {selectedRecord.regions?.[0]} theater with high priority. Failure to observe doctrinal shifts may lead to sovereignty degradation.
                                </p>
                             </div>
                          </div>
                       ) : null}
                    </motion.div>
                 </AnimatePresence>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
