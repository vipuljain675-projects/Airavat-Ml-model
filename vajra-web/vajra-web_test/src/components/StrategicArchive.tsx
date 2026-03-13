"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, Search, FileText, ChevronRight, X, Shield, Globe, Radio, Zap, AlertTriangle, Cpu } from "lucide-react";

export default function StrategicArchive() {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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

  const filteredRecords = Array.isArray(records) ? records.filter(r => 
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.id || r.event_id)?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="font-orbitron text-2xl tracking-tighter text-white uppercase flex items-center gap-3">
            <span className="p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
               <Library className="text-amber-500 w-5 h-5 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            </span>
            Airavat Vision
          </h2>
          <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-widest uppercase opacity-60">Digital Intelligence Archive • Level 5 Authorization Required</p>
        </div>
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search classified dossiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/5 rounded pl-10 pr-4 py-2 text-sm font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10 transition-all text-gray-300 placeholder:text-gray-700"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-30 select-none">
            <span className="text-[9px] border border-white/20 rounded px-1 px-0.5">⌘</span>
            <span className="text-[9px] border border-white/20 rounded px-1 px-0.5">K</span>
          </div>
        </div>
      </div>

      {/* Dossier Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 px-2 scrollbar-hide">
        {loading ? (
          <div className="col-span-full h-[60vh] flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
             <p className="italic font-mono text-xs text-amber-500/50 animate-pulse tracking-widest">[ DECRYPTING STRATEGIC ARCHIVE... ]</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="col-span-full h-[60vh] flex flex-col items-center justify-center space-y-2 opacity-30">
            <AlertTriangle className="w-8 h-8 text-gray-500" />
            <p className="italic font-mono text-sm tracking-widest uppercase">[ NO DOSSIERS FOUND IN CURRENT SECTOR ]</p>
          </div>
        ) : (
          filteredRecords.map((record, i) => (
            <motion.div
              key={record.id || record.event_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              onClick={() => {
                setSelectedRecord(record);
                setActiveTab("overview");
              }}
              className="relative overflow-hidden group cursor-pointer"
            >
              <div className="glass-premium group-hover:bg-white/[0.05] border-white/5 group-hover:border-amber-500/40 transition-all duration-500 h-[300px] flex flex-col rounded-sm">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                   {record.image && (
                     <img 
                       src={record.image} 
                       alt={record.title} 
                       className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s]"
                     />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/80 to-transparent" />
                </div>

                <div className="relative p-6 flex flex-col h-full z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-amber-500/80 font-bold tracking-widest uppercase py-0.5 px-2 bg-amber-500/10 rounded border border-amber-500/20 shadow-[0_0_5px_rgba(245,158,11,0.2)]">
                      {record.id || record.event_id}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono tracking-tighter">{record.date}</span>
                  </div>

                  <h4 className="text-base font-orbitron font-bold text-white group-hover:text-amber-400 mb-2 leading-tight transition-colors">
                    {record.title || record.category || "CLASSIFIED DOSSIER"}
                  </h4>
                  
                  <p className="text-[11px] font-medium text-gray-400 line-clamp-3 mb-4 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {record.summary || record.scenario || "Operational details restricted. Level 5 clearance required for decompression."}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex gap-2">
                      {(record.event_types || []).slice(0, 2).map((type: string) => (
                        <span key={type} className="text-[8px] font-mono text-gray-600 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded-sm group-hover:border-amber-500/20 group-hover:text-amber-500/50 transition-colors">
                          {type}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 group/btn">
                       <span className="text-[9px] font-bold text-gray-700 group-hover:text-amber-500 transition-colors uppercase tracking-widest">Access</span>
                       <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-amber-500 transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-1 h-0 group-hover:h-full bg-amber-500/50 transition-all duration-500" />
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
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass max-w-6xl w-full h-full max-h-[90vh] overflow-hidden flex flex-col border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] relative"
            >
              {/* Header Image Area */}
              <div className="h-48 md:h-72 relative overflow-hidden shrink-0 border-b border-white/10">
                 {selectedRecord.image && (
                   <img 
                     src={selectedRecord.image} 
                     alt={selectedRecord.title} 
                     className="w-full h-full object-cover opacity-60"
                   />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />
                 
                 <div className="absolute top-6 right-6 z-20">
                    <button 
                      onClick={() => setSelectedRecord(null)}
                      className="p-3 bg-black/40 hover:bg-white/10 border border-white/5 rounded-full transition-all group backdrop-blur-md"
                    >
                      <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </button>
                 </div>

                 <div className="absolute bottom-8 left-10 z-10 w-full pr-20">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-mono text-amber-500 font-bold tracking-[0.4em] uppercase py-1 px-3 bg-amber-500/10 rounded border border-amber-500/50 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                         {selectedRecord.id}
                       </span>
                       <span className="text-[10px] text-gray-400 font-mono tracking-widest">{selectedRecord.date}</span>
                    </div>
                    <h3 className="font-orbitron font-black text-2xl md:text-4xl text-white tracking-tight leading-none drop-shadow-2xl">
                       {selectedRecord.title}
                    </h3>
                 </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/5 bg-obsidian-950/80 backdrop-blur-md px-10">
                {[
                  { id: "overview", label: "Strategic Overview", icon: FileText },
                  { id: "deep_dive", label: "Intelligence Briefing", icon: Radio },
                  { id: "context", label: "Regional Context", icon: Globe },
                  { id: "actions", label: "Countermeasures", icon: Shield }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-6 text-[10px] font-mono uppercase tracking-[0.2em] transition-all relative ${
                      activeTab === tab.id ? "text-amber-500" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-amber-500 animate-pulse" : ""}`} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-10 scrollbar-premium bg-gradient-to-b from-obsidian-950 to-black">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-8"
                    >
                      <div>
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-500/50 mb-4 flex items-center gap-2">
                           <div className="w-1 h-3 bg-amber-500" />
                           Abstract
                        </h5>
                        <p className="text-xl text-gray-100 font-medium leading-relaxed max-w-4xl drop-shadow-sm italic">
                          "{selectedRecord.summary}"
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        <div className="glass p-5 border-white/5">
                           <p className="text-[9px] font-mono text-gray-500 uppercase mb-2">Priority Level</p>
                           <p className="text-sm font-orbitron text-white">MAXIMUM-ALPHA</p>
                        </div>
                        <div className="glass p-5 border-white/5">
                           <p className="text-[9px] font-mono text-gray-500 uppercase mb-2">Classification</p>
                           <p className="text-sm font-orbitron text-red-500 font-bold animate-pulse">TOP SECRET</p>
                        </div>
                        <div className="glass p-5 border-white/5">
                           <p className="text-[9px] font-mono text-gray-500 uppercase mb-2">Sovereignty Impact</p>
                           <p className="text-sm font-orbitron text-amber-500">SIGNIFICANT</p>
                        </div>
                      </div>

                      {selectedRecord.notes && (
                         <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-sm">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-red-500/50 mb-3 flex items-center gap-2">
                               <AlertTriangle className="w-3 h-3" />
                               Analyst Remarks
                            </h5>
                            <p className="text-xs text-gray-400 font-mono leading-relaxed italic">
                               {selectedRecord.notes}
                            </p>
                         </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "deep_dive" && (
                    <motion.div
                      key="deep_dive"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-12 max-w-4xl"
                    >
                      {selectedRecord.deep_dive ? (
                        <>
                          <section>
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-4 font-mono">01. Operative Intent</h5>
                            <div className="text-base text-gray-300 leading-loose space-y-4 font-normal">
                               {selectedRecord.deep_dive.intent}
                            </div>
                          </section>

                          <section>
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-4 font-mono">02. Sovereign Reaction</h5>
                            <div className="text-base text-gray-300 leading-loose space-y-4">
                               {selectedRecord.deep_dive.india_reaction}
                            </div>
                          </section>

                          <section className="p-8 bg-amber-500/5 border-l-2 border-amber-500/30 rounded-r-lg">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4 font-mono">03. Tactical Operations</h5>
                            <div className="text-[13px] text-gray-300 leading-relaxed font-mono whitespace-pre-line">
                               {selectedRecord.deep_dive.operations}
                            </div>
                          </section>

                          {selectedRecord.deep_dive.historical_context && (
                             <section>
                               <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-mono">04. Historical Background</h5>
                               <div className="text-base text-gray-400 leading-loose italic">
                                  {selectedRecord.deep_dive.historical_context}
                               </div>
                             </section>
                          )}

                          {selectedRecord.deep_dive.global_intervention && (
                             <section>
                               <h5 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-4 font-mono">05. Global Intervention</h5>
                               <div className="text-base text-gray-300 leading-loose">
                                  {selectedRecord.deep_dive.global_intervention}
                               </div>
                             </section>
                          )}

                          <section className="pt-8 border-t border-white/5">
                             <div className="flex items-center gap-3 mb-6">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                                <h5 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Present Threat Comparison</h5>
                             </div>
                             <div className="p-10 glass border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                                <p className="text-lg text-amber-200/90 leading-relaxed font-medium">
                                   {selectedRecord.deep_dive.present_threat_comparison}
                                </p>
                             </div>
                          </section>
                        </>
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center opacity-20">
                           <Cpu className="w-12 h-12 mb-4" />
                           <p className="font-mono text-sm uppercase tracking-widest">Enhanced Data Pack Missing for this Dossier</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "context" && (
                    <motion.div
                      key="context"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-2 gap-12"
                    >
                       <div>
                         <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                           <Globe className="w-3 h-3 text-cyan-500" />
                           Operational Geography
                         </h5>
                         <div className="flex flex-wrap gap-3">
                            {(selectedRecord.regions || []).map((region: string) => (
                              <div key={region} className="px-6 py-4 glass border-white/5 flex flex-col items-center text-center w-32">
                                 <span className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Region</span>
                                 <span className="text-xs font-bold text-white uppercase">{region}</span>
                              </div>
                            ))}
                         </div>
                       </div>

                       <div>
                         <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                           <Zap className="w-3 h-3 text-amber-500" />
                           Strategic Actors
                         </h5>
                         <div className="space-y-3">
                            {(selectedRecord.actors || []).map((actor: string) => (
                              <div key={actor} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded">
                                 <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{actor}</span>
                                 <div className="flex gap-1">
                                    <div className="w-1 h-3 bg-red-500" />
                                    <div className="w-1 h-3 bg-red-500/30" />
                                    <div className="w-1 h-3 bg-red-500/10" />
                                 </div>
                              </div>
                            ))}
                         </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === "actions" && (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                       <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-8 font-mono">Standard Operating Countermeasures</h5>
                       {selectedRecord.countermeasures ? (
                         <div className="grid grid-cols-1 gap-6">
                            {selectedRecord.countermeasures.map((cm: string, idx: number) => {
                               const [prefix, content] = cm.split(": ");
                               return (
                                 <div key={idx} className="flex gap-6 group">
                                    <div className="flex flex-col items-center shrink-0">
                                       <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-500 font-mono shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.32)] transition-all">
                                          0{idx + 1}
                                       </div>
                                       <div className="w-px flex-1 bg-gradient-to-b from-amber-500/30 to-transparent mt-2 h-10" />
                                    </div>
                                    <div className="pt-1">
                                       <span className="text-[9px] font-mono text-amber-600 uppercase tracking-[0.3em] font-bold block mb-1">{prefix}</span>
                                       <p className="text-gray-300 text-base leading-relaxed max-w-2xl">{content}</p>
                                    </div>
                                 </div>
                               )
                            })}
                         </div>
                       ) : (
                         <div className="p-10 border border-white/5 rounded-lg flex flex-col items-center justify-center opacity-30 italic font-mono text-sm">
                            [ NO COUNTERMEASURES PROTOCOL ATTACHED ]
                         </div>
                       )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Bar */}
              <div className="p-4 bg-obsidian-950 border-t border-white/10 flex justify-between items-center px-10">
                 <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                       <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                       <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest text-amber-500/50">Secure Connection Established</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-700 uppercase italic">Confidential Document | Airavat Vision Platform v4.0</span>
                 </div>
                 <div className="flex gap-6">
                    <div className="flex flex-col items-end">
                       <span className="text-[8px] text-gray-500 uppercase font-mono">Authorization Level</span>
                       <span className="text-[10px] font-mono font-bold text-amber-500">ALPHA-DIRECTIVE</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
