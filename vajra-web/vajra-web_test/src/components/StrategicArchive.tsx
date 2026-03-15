"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  FileText,
  Search,
  X,
  ShieldCheck,
  Lock,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

// --- TYPES ---
type ArchiveRecord = {
  id?: string;
  event_id?: string;
  title?: string;
  summary?: string;
  scenario?: string;
  date?: string;
  actors?: string[];
  targets?: string[];
  regions?: string[];
  event_types?: string[];
  image?: string | null;
  deep_dive?: Record<string, any> | null;
  notes?: string;
  keywords?: string;
  countermeasures?: string[];
  source_reliability?: number;
};

type Dossier = {
  id: string;
  title: string;
  summary: string;
  date: string;
  actors: string[];
  eventTypes: string[];
  whyItMatters: string;
  fileCode: string; // e.g., HIST-VAJRA-001
};

// --- HELPERS ---
function cleanText(v: any): string {
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim();
}

function processRecord(r: ArchiveRecord): Dossier {
  const deepDive = r.deep_dive || {};
  const why = cleanText(deepDive.present_threat_comparison) || cleanText(r.notes) || cleanText(r.summary);
  
  return {
    id: cleanText(r.id || r.event_id) || "UNNAMED",
    title: cleanText(r.title) || "CLASSIFIED DOSSIER",
    summary: cleanText(r.summary),
    date: cleanText(r.date) || "19XX-20XX",
    actors: r.actors || [],
    eventTypes: r.event_types || [],
    whyItMatters: why.length > 180 ? why.slice(0, 177) + "..." : why,
    fileCode: `HIST-VAJRA-${(r.id || r.event_id || "000").slice(-3).toUpperCase()}`
  };
}

// --- MAIN COMPONENT ---
export default function StrategicArchive() {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"landing" | "grid" | "dossier">("landing");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Stage 1: Define the two authorized dossiers
    const authorizedRecords: ArchiveRecord[] = [
      {
        id: "FUTURE-V47-002",
        event_id: "FUTURE-V47-002",
        title: "Project Vajra: The 2047 Blueprint",
        summary: "The definitive 18-page strategic blueprint for India's 2047 centennial. A detailed plan for Global Pole status, Blue-Water supremacy, and the Silicon Sovereignty era.",
        date: "VISION 2047",
        actors: ["Vajra Command", "Sovereign Republic", "Shiva Directive"],
        regions: ["Global", "Lunar", "Polar"],
        event_types: ["Strategic Dominance", "Centennial Plan"],
        image: null,
        deep_dive: null
      },
      {
        id: "HIST-1971-001",
        event_id: "HIST-1971-001",
        title: "1971 War Geopolitical Dossier",
        summary: "Comprehensive intelligence on the 1971 Indo-Pak conflict through a geopolitical lens, focusing on Cold War dynamics, the US Seventh Fleet deployment, and the Indo-Soviet Treaty.",
        date: "DECEMBER 1971",
        actors: ["Indira Gandhi", "Henry Kissinger", "Mukti Bahini"],
        regions: ["South Asia", "Bay of Bengal"],
        event_types: ["Geopolitics", "Kinetic War"],
        image: null,
        deep_dive: null
      }
    ];

    // Simulate fetch but restrict to authorized records only
    setLoading(true);
    setTimeout(() => {
      setRecords(authorizedRecords);
      setLoading(false);
    }, 800);
  }, []);

  const dossiers = useMemo(() => records.map(processRecord), [records]);
  const filtered = useMemo(() => {
    if (!search) return dossiers;
    const s = search.toLowerCase();
    return dossiers.filter(d => 
      d.title.toLowerCase().includes(s) || 
      d.summary.toLowerCase().includes(s) || 
      d.actors.some(a => a.toLowerCase().includes(s))
    );
  }, [dossiers, search]);

  const selectedDossier = useMemo(() => 
    filtered.find(d => d.id === selectedId) || filtered[0], 
    [filtered, selectedId]
  );

  return (
    <div className="w-full min-h-[85vh] bg-[#050608] font-sans text-slate-300 overflow-hidden selection:bg-amber-500/30">
      
      <AnimatePresence mode="wait">
        {viewState === "landing" ? (
          /* --- STAGE 1: LANDING (CLOSED FOLDER) --- */
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            className="relative flex flex-col items-center justify-center min-h-[90vh] overflow-hidden"
            style={{
              background: `radial-gradient(circle at 50% 40%, rgba(20, 30, 48, 0.8) 0%, rgba(10, 15, 28, 1) 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="absolute top-12 left-12 flex flex-col items-start gap-3 select-none"
            >
              <div className="flex flex-col w-32 h-20 rounded-sm overflow-hidden shadow-2xl border border-white/5 opacity-80">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white flex items-center justify-center">
                   <div className="w-4 h-4 rounded-full border-[1.5px] border-[#000080] relative">
                      {[...Array(24)].map((_, i) => (
                        <div key={i} className="absolute inset-0 m-auto w-[0.5px] h-full bg-[#000080]" style={{ transform: `rotate(${i * 15}deg)` }} />
                      ))}
                   </div>
                </div>
                <div className="flex-1 bg-[#138808]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Sovereign Authority</span>
                <span className="text-[9px] font-mono text-amber-500/60 uppercase">Unit: Vajra Command</span>
              </div>
            </motion.div>

            <div className="absolute bottom-16 right-20 flex flex-col items-end gap-6 opacity-40 select-none">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Ref: PRX-092-DELTA</span>
                  <div className="w-32 h-[1px] bg-slate-800 mt-1" />
               </div>
               <div className="text-[8px] font-mono text-slate-700 max-w-[140px] text-right leading-relaxed italic">
                  "Sovereignty is not given, it is defended."
               </div>
            </div>

            <div className="relative z-10 group cursor-pointer perspective-2000" onClick={() => setViewState("grid")}>
               <div className="absolute -inset-20 bg-amber-500/[0.07] blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="absolute inset-x-0 -bottom-10 h-20 bg-black/60 blur-3xl rounded-[100%] scale-110 -z-10 opacity-70" />
               
               <motion.div 
                 whileHover={{ rotateY: -12, rotateX: 8, scale: 1.05 }}
                 transition={{ type: "spring", stiffness: 80, damping: 15 }}
                 className="relative w-[380px] md:w-[540px] aspect-square rounded-2xl overflow-hidden shadow-[40px_20px_100px_rgba(0,0,0,0.95)] border border-white/10"
               >
                  <img src="/assets/vajra_folder.png" alt="VAJRA" className="w-full h-full object-cover grayscale-[0.1] contrast-[1.1]" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <motion.div 
                    animate={{ left: ["-150%", "250%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                    className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[35deg] blur-3xl pointer-events-none"
                  />
               </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-20 flex flex-col items-center gap-10 z-10"
            >
               <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-[1px] bg-amber-500/20" />
                     <span className="text-[12px] font-mono text-amber-500/80 uppercase tracking-[0.8em] animate-pulse">Alpha Security Clearance</span>
                     <div className="w-12 h-[1px] bg-amber-500/20" />
                  </div>
               </div>

               <button 
                 onClick={() => setViewState("grid")}
                 className="relative group px-16 py-5 overflow-hidden rounded-md transition-all active:scale-95"
               >
                  <div className="absolute inset-0 border border-amber-500/30 group-hover:border-amber-500/60 transition-colors" />
                  <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
                  <span className="relative text-[13px] font-orbitron text-amber-500 font-bold uppercase tracking-[0.5em] group-hover:tracking-[0.6em] transition-all">
                    Initiate Decryption
                  </span>
               </button>
            </motion.div>
          </motion.div>
        ) : viewState === "grid" ? (
          /* --- STAGE 2: ARCHIVE GRID (MINI FOLDERS) --- */
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative flex flex-col min-h-[90vh] w-full max-w-[1600px] mx-auto p-12 overflow-y-auto custom-scrollbar"
            style={{
               background: `radial-gradient(circle at 50% 10%, rgba(20, 35, 60, 0.4) 0%, rgba(5, 8, 15, 1) 100%)`,
            }}
          >
            <div className="flex items-center justify-between mb-16 px-4">
               <div className="flex items-center gap-8">
                  <button onClick={() => setViewState("landing")} className="flex items-center gap-2 group text-slate-500 hover:text-amber-500 transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Lock Archive</span>
                  </button>
                  <div className="flex flex-col">
                     <h2 className="text-[20px] font-orbitron text-white uppercase tracking-[0.6em] font-black">Intelligence Cache</h2>
                     <span className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest">Mission Vajra // Strategic Grid</span>
                  </div>
               </div>
               
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="SCAN CODES..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-3 text-[12px] font-mono text-amber-500/80 w-80 focus:outline-none focus:border-amber-500/40 transition-all"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-16 pb-20">
               {filtered.map((d, i) => (
                  <motion.div 
                    key={d.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    onClick={() => {
                        setSelectedId(d.id);
                        setViewState("dossier");
                    }}
                    className="flex flex-col items-center gap-6 cursor-pointer group"
                  >
                     <div className="relative w-full aspect-square perspective-1000">
                        <motion.div 
                          whileHover={{ rotateY: -15, rotateX: 10 }}
                          className="w-full h-full relative rounded-xl overflow-hidden shadow-[20px_10px_40px_rgba(0,0,0,0.8)] border border-white/5 transition-shadow group-hover:shadow-amber-500/10"
                        >
                           <img src="/assets/vajra_folder.png" alt="" className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                           
                           {/* Mini-Label on Folder */}
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 flex flex-col items-center text-center gap-2 pointer-events-none">
                              <span className="px-2 py-0.5 bg-black/60 text-[8px] font-mono text-white/40 tracking-widest rounded-sm border border-white/10 uppercase">
                                 {d.fileCode}
                              </span>
                              <h3 className="text-[14px] font-orbitron font-black text-white px-4 leading-tight drop-shadow-lg uppercase tracking-wider">
                                 {d.title}
                              </h3>
                              <div className="w-8 h-[1px] bg-amber-500/40 mt-2" />
                           </div>

                           <div className="absolute bottom-4 right-4 p-2 opacity-30 group-hover:opacity-100 transition-opacity">
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                           </div>
                        </motion.div>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-amber-500/60 transition-colors">Record ID: {d.id}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tighter mt-1 group-hover:text-slate-200">{d.date}</span>
                     </div>
                  </motion.div>
               ))}
            </div>
            
            {loading && (
               <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                  <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Scanning Cipher-Core...</span>
               </div>
            )}
          </motion.div>
        ) : (
          /* --- STAGE 3: DOSSIER DETAIL (TURNABLE MULTI-PAGE FILE) --- */
          <motion.div 
            key="dossier"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative flex flex-col h-[90vh] w-full max-w-[1600px] mx-auto overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f1c] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-[#121b2d]/50 z-20 backdrop-blur-md">
               <div className="flex items-center gap-6">
                  <button onClick={() => setViewState("grid")} className="flex items-center gap-2 group text-slate-500 hover:text-amber-500 transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Return to Cache</span>
                  </button>
                  <div className="w-[1px] h-4 bg-white/10" />
                  <div className="flex flex-col">
                     <h2 className="text-[12px] font-orbitron text-amber-500 uppercase tracking-[0.4em]">Strategic Archive // Global Deck</h2>
                     <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Authorized Persona: Command Office</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded border border-white/5">
                     <span className="text-[10px] font-mono text-slate-500 uppercase">Page</span>
                     <span className="text-[14px] font-mono font-black text-amber-500">{currentPage}</span>
                     <span className="text-[10px] font-mono text-slate-700 uppercase">/ 15</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-md">
                     Active Asset: <span className="text-amber-500 font-bold">{selectedDossier?.fileCode}</span>
                  </div>
               </div>
            </div>

            <div className="relative flex-1 p-8 md:p-12 overflow-hidden flex items-center justify-center bg-[#050810]">
               
               {/* --- THE PHYSICAL FILE CONTAINER --- */}
               <div className="relative w-full max-w-[1200px] h-full flex perspective-2000">
                  
                  {/* Underneath Stack Effect (Visual Depth) */}
                  <div className="absolute inset-0 bg-[#d8d4c5] -rotate-1 translate-x-1 translate-y-1 rounded shadow-sm opacity-40" />
                  <div className="absolute inset-0 bg-[#e4e1d5] rotate-1 -translate-x-1 translate-y-1 rounded shadow-sm opacity-60" />

                  {/* Main File Content */}
                  <div className="relative w-full h-full bg-[#eeebdf] rounded shadow-[20px_20px_80px_rgba(0,0,0,0.8)] border border-black/10 overflow-hidden flex origin-center">
                     
                     {/* Left Spine / Binding */}
                     <div className="w-16 bg-[#dfdbcc] border-r border-black/10 flex flex-col items-center py-10 gap-20 text-[8px] font-mono text-black/40 uppercase opacity-80 select-none">
                        <span className="rotate-90 tracking-widest whitespace-nowrap font-black">CLASSIFIED</span>
                        <div className="flex flex-col gap-2">
                           <div className="w-1.5 h-1.5 rounded-full border border-black/20" />
                           <div className="w-1.5 h-1.5 rounded-full border border-black/20" />
                           <div className="w-1.5 h-1.5 rounded-full border border-black/20" />
                        </div>
                        <span className="rotate-90 tracking-widest whitespace-nowrap">{selectedDossier?.fileCode}</span>
                     </div>

                     {/* Content Area with Animation */}
                     <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                           <motion.div
                             key={currentPage}
                             initial={{ opacity: 0, x: 20, rotateY: 10 }}
                             animate={{ opacity: 1, x: 0, rotateY: 0 }}
                             exit={{ opacity: 0, x: -20, rotateY: -10 }}
                             transition={{ duration: 0.4, ease: "easeInOut" }}
                             className="w-full h-full p-12 md:p-16 overflow-y-auto custom-scrollbar text-[#1a1c1e] bg-white/40"
                           >
                              {/* PAGE CONTENT POPULATION */}
                              {selectedId === "HIST-1971-001" ? (
                                 <DossierPages1971 page={currentPage} />
                              ) : selectedId === "FUTURE-V47-002" ? (
                                 <DossierPages2047 page={currentPage} />
                              ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-black/20 font-mono tracking-widest">
                                    [GENERIC PAGE {currentPage} PLACEHOLDER]
                                 </div>
                              )}

                              {/* Footer Stamps (Appear on every page but change slightly) */}
                              <div className="mt-20 pt-10 border-t border-black/5 flex justify-between items-end opacity-40 select-none">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-mono text-black uppercase font-bold tracking-widest">Vajra Intel Archive</span>
                                    <span className="text-[10px] font-serif text-black italic">Page {currentPage} of {selectedId === "FUTURE-V47-002" ? 18 : 15}</span>
                                 </div>
                                 <div className="w-24 h-10 border border-black/10 flex items-center justify-center font-mono text-[8px] text-black/20">STAMP__{currentPage}</div>
                              </div>
                           </motion.div>
                        </AnimatePresence>

                        {/* Page Turn Triggers (Visual only, controls currentPage) */}
                        <div className="absolute inset-y-0 left-0 w-24 hover:bg-black/[0.02] cursor-pointer group transition-colors" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
                           <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity">
                              <ChevronLeft className="w-10 h-10 text-black/20" />
                           </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 w-24 hover:bg-black/[0.02] cursor-pointer group transition-colors" onClick={() => { const maxP = selectedId === "FUTURE-V47-002" ? 18 : 15; setCurrentPage(prev => Math.min(maxP, prev + 1)); }}>
                           <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity">
                              <ChevronRight className="w-10 h-10 text-black/20" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="px-10 py-5 bg-black/40 border-t border-white/5 backdrop-blur-md flex items-center justify-between z-20">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                     <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Node Secured</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(selectedId === "FUTURE-V47-002" ? 18 : 15)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-4 h-1 rounded-full transition-all duration-300 ${i + 1 <= currentPage ? 'bg-amber-500' : 'bg-white/10'}`} 
                      />
                    ))}
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-2 rounded hover:bg-white/5 disabled:opacity-20 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button 
                    disabled={currentPage === (selectedId === "FUTURE-V47-002" ? 18 : 15)}
                    onClick={() => { const maxP = selectedId === "FUTURE-V47-002" ? 18 : 15; setCurrentPage(p => Math.min(maxP, p + 1)); }}
                    className="p-2 rounded hover:bg-white/5 disabled:opacity-20 transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        .perspective-2000 { perspective: 2000px; }
        .perspective-1000 { perspective: 1000px; }

        @keyframes scan {
           from { transform: translateY(-100%); }
           to { transform: translateY(100%); }
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// --- 15-PAGE CONTENT RENDERER ---
function DossierPages1971({ page }: { page: number }) {
  switch (page) {
    case 1:
      return (
        <div className="flex flex-col gap-12">
          <div className="border-b-4 border-double border-black/20 pb-8">
            <h3 className="text-[48px] font-orbitron font-black text-black leading-tight tracking-tighter uppercase">
              HIST-1971-VOL-ALPHA
            </h3>
            <p className="text-[12px] font-mono text-black/40 uppercase tracking-[0.5em] mt-2">Bipolarity & Strategic Autonomy // Archive Index</p>
          </div>
          <div className="grid grid-cols-2 gap-10 mt-10">
            <div className="space-y-6">
              <h4 className="text-[14px] font-mono font-black text-black border-b border-black/10 pb-2 uppercase">I. Intelligence Segments</h4>
              <ul className="space-y-3 text-[13px] font-mono text-black/70">
                <li>01. Master Index & Access Meta</li>
                <li>02. Executive Summary: 13-Day Liquidation</li>
                <li>03. Macro Threat: US-China-Pak Axis</li>
                <li>04. Strategic Appraisal: Seventh Fleet Gambit</li>
                <li>05. Encirclement 1.0 vs 2.0 Mapping</li>
                <li>06. The 0.5 Front: Internal Subversion</li>
                <li>07. Rejecting the Status Quo Doctrine</li>
              </ul>
            </div>
            <div className="p-8 bg-black/5 rounded-lg border-2 border-dashed border-black/10 flex flex-col justify-center items-center text-center">
               <ShieldCheck className="w-12 h-12 text-black/20 mb-4" />
               <span className="text-[10px] font-mono text-black uppercase font-bold">Secure Archive // Alpha Red</span>
               <p className="text-[9px] font-mono text-black/40 mt-2 uppercase">No digital unauthorized copies permitted</p>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 02 // Executive Summary</h4>
          <div className="flex gap-10">
             <div className="flex-1">
                <p className="text-[18px] leading-relaxed font-serif text-black/90 text-justify first-letter:text-6xl first-letter:float-left first-letter:mr-4 first-letter:font-black">
                   The 1971 war remains the gold standard for <span className="font-bold">Vajra Strategic Doctrine</span>. It wasn't just a kinetic victory; it was a masterclass in breaking a superpower-backed proxy state. Within 13 days, Indian forces achieved the largest surrender of personnel since World War II. 
                </p>
                <div className="mt-10 p-6 bg-amber-500/10 border-l-4 border-amber-600 italic font-mono text-[14px] text-amber-900">
                   "Operational Objective: To neutralize the genocidal crackdown in the East while maintaining a holding pattern in the West."
                </div>
             </div>
             <div className="w-1/3 space-y-6">
                <div className="bg-black/80 p-6 text-white rounded shadow-xl">
                   <h5 className="text-[11px] font-mono font-black mb-4 uppercase text-amber-500">Key Statistics</h5>
                   <div className="space-y-4">
                      <div className="flex flex-col">
                         <span className="text-[9px] uppercase text-white/40">Surrendered Personnel</span>
                         <span className="text-[20px] font-orbitron font-bold">93,000</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[9px] uppercase text-white/40">Operational Duration</span>
                         <span className="text-[20px] font-orbitron font-bold">13 DAYS</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 03 // Macro Threat Matrix</h4>
          <div className="grid grid-cols-12 gap-8">
             <div className="col-span-8 space-y-8">
                <p className="text-[16px] leading-relaxed font-serif text-black/80">
                   In 1971, India was effectively <span className="font-black text-black">surrounded</span>. This was not a regional conflict but the first major test of India's sovereignty against a coordinated tripartite threat: the US-China-Pak axis.
                </p>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-5 bg-white border border-black/10 shadow-sm rounded">
                      <h6 className="text-[11px] font-mono font-black uppercase mb-3">US Involvement</h6>
                      <p className="text-[12px] text-black/60 font-serif">Provided diplomatic cover and advanced hardware to Pakistan. Secretly funneled weapons via third-parties.</p>
                   </div>
                   <div className="p-5 bg-white border border-black/10 shadow-sm rounded">
                      <h6 className="text-[11px] font-mono font-black uppercase mb-3">China Factor</h6>
                      <p className="text-[12px] text-black/60 font-serif">Strategic intimidation on the Himalayan border. Mobilized forces to pin down Indian divisions.</p>
                   </div>
                </div>
             </div>
             <div className="col-span-4 bg-red-600/5 p-6 border border-red-600/20 rounded">
                <h5 className="text-[12px] font-mono font-black text-red-900 mb-6 uppercase border-b border-red-900/10 pb-2">Vajra Analysis</h5>
                <p className="text-[11px] font-mono text-red-800 leading-relaxed italic">
                   India was the "0.5 Front" in the Cold War, caught between superpower maneuvers to open China.
                </p>
             </div>
          </div>
        </div>
      );
    case 4:
       return (
          <div className="flex flex-col gap-8">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 04 // Task Force 74: The Gamble</h4>
             <div className="relative aspect-video bg-black rounded shadow-2xl overflow-hidden mb-8">
                <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/47/USS_Enterprise_%28CVN-65%29_underway_in_the_Indian_Ocean_in_July_1971.jpg')] bg-cover bg-center grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 flex flex-col">
                   <span className="text-amber-500 font-mono text-[10px] font-black uppercase tracking-widest">RECON // DECLASSIFIED IMAGE</span>
                   <span className="text-white font-orbitron text-[18px] font-bold">USS ENTERPRISE (CVN-65)</span>
                </div>
                <div className="absolute top-0 right-0 p-4 animate-scan opacity-30">
                   <div className="w-16 h-1 border-t-2 border-white/50" />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-10">
                <p className="text-[14px] font-serif leading-relaxed text-black/80">
                   The deployment of Task Force 74 into the Bay of Bengal was a blunt instrument of "Gunboat Diplomacy." A nuclear-powered superpower asset sent to intimidate a non-nuclear regional power.
                </p>
                <div className="p-6 bg-black text-white font-mono text-[12px] rounded border border-white/10 uppercase italic">
                   "Modern Echo: The 'Freedom of Navigation' operations today are the direct descendants of this 1971 posture."
                </div>
             </div>
          </div>
       );
    case 5:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 05 // Encirclement Mapping</h4>
             <table className="w-full border-collapse border border-black/20 text-[12px] font-mono">
                <thead>
                   <tr className="bg-black text-white">
                      <th className="border border-black p-4 text-left uppercase">Threat Vector</th>
                      <th className="border border-black p-4 text-left uppercase">1971 (Bipolar)</th>
                      <th className="border border-black p-4 text-left uppercase">2026 (Multipolar)</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="bg-white/50">
                      <td className="border border-black/20 p-4 font-black">Western Front</td>
                      <td className="border border-black/20 p-4 uppercase">Kinetic Proxy (Pak)</td>
                      <td className="border border-black/20 p-4 uppercase">Hybrid Proxy (Pak+Terror)</td>
                   </tr>
                   <tr className="bg-white/80">
                      <td className="border border-black/20 p-4 font-black">Northern Front</td>
                      <td className="border border-black/20 p-4 uppercase">Ideological Rival (China)</td>
                      <td className="border border-black/20 p-4 uppercase">Global Superpower (China)</td>
                   </tr>
                   <tr className="bg-white/50">
                      <td className="border border-black/20 p-4 font-black">Maritime Front</td>
                      <td className="border border-black/20 p-4 uppercase">USS Enterprise</td>
                      <td className="border border-black/20 p-4 uppercase">String of Pearls Bases</td>
                   </tr>
                </tbody>
             </table>
             <div className="mt-10 p-8 border-4 border-double border-red-600/30 text-center">
                <span className="text-[12px] font-mono font-black text-red-900 uppercase">Vajra Directive: The threat hasn't changed; the complexity has.</span>
             </div>
          </div>
       );
    case 6:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 06 // The 0.5 Front: Information War</h4>
             <div className="grid grid-cols-12 gap-10">
                <div className="col-span-7 space-y-6">
                   <p className="text-[15px] leading-relaxed font-serif text-black/80 first-letter:text-4xl first-letter:font-black">
                      While the military fought on two fronts, India faced a quiet <span className="font-bold underline">0.5 Front</span>. External media narratives were weaponized against India until the "Blood Telegram" exposed the internal dissent within the US State Department.
                   </p>
                   <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                         <div className="w-2 h-2 rounded-full bg-black mt-2" />
                         <span className="text-[13px] font-mono font-bold text-black uppercase">Modern Learning: Information warfare is now the primary front.</span>
                      </div>
                   </div>
                </div>
                <div className="col-span-5 aspect-square bg-slate-900 rounded-lg p-8 relative grayscale">
                   <div className="absolute inset-x-0 top-0 h-[1px] bg-amber-500/30 animate-scan" />
                   <div className="flex flex-col items-center justify-center h-full text-center">
                      <span className="text-[10px] font-mono text-amber-500 font-black uppercase mb-4 tracking-widest">SIGINT RECOVERY</span>
                      <p className="text-[11px] font-mono text-white/40 leading-tight">"US DISSENT TELEGRAM: DEP. ARCHIVE 1971..."</p>
                   </div>
                </div>
             </div>
          </div>
       );
    case 7:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 07 // Rejecting the Status Quo</h4>
             <div className="flex flex-col gap-8">
                <p className="text-[16px] font-serif leading-relaxed text-black/90">
                   India’s decisive action in 1971 was a rejection of the "Status Quo" enforced by the UN and Superpowers. By redrawing national boundaries despite Global North "red lines," India established its first major claim to <span className="font-black italic underline">Strategic Autonomy</span>.
                </p>
                <div className="p-10 border-4 border-double border-black/10 flex flex-col items-center text-center gap-4">
                   <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em]">Sovereign Reflex Doctrine</span>
                   <p className="text-[14px] font-mono italic max-w-lg">
                      "When international law fails to protect your border, hard power must prevail."
                   </p>
                </div>
             </div>
          </div>
       );
    case 8:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 08 // Actor Profile: Henry Kissinger</h4>
             <div className="grid grid-cols-12 gap-10">
                <div className="col-span-4 aspect-[3/4] bg-stone-300 rounded shadow-inner flex items-center justify-center grayscale opacity-60">
                   <Search className="w-8 h-8 text-black/10" />
                </div>
                <div className="col-span-8 space-y-6">
                   <div className="p-4 bg-black text-white font-mono text-[11px] uppercase tracking-widest">Designation: The Architect of the Tilt</div>
                   <p className="text-[14px] font-serif leading-relaxed text-black/80">
                      Kissinger viewed India through the lens of Cold War bipolarity—as a "Soviet satellite." His strategy of total disregard for local humanitarian issues in favor of a "Balance of Power" with China remains a cautionary tale for modern diplomats.
                   </p>
                   <div className="p-6 bg-amber-500/5 border border-amber-600/20 rounded">
                      <span className="text-[10px] font-mono font-bold text-amber-900 uppercase">Vajra Critique</span>
                      <p className="text-[12px] font-mono text-amber-900/60 mt-2">"A lesson in why 'Universal Values' are often just covers for hegemonial interests."</p>
                   </div>
                </div>
             </div>
          </div>
       );
    case 9:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 09 // The Collapse of Non-Alignment</h4>
             <div className="space-y-8">
                <p className="text-[16px] font-serif leading-relaxed text-black/90 first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3">
                   1971 proved that "Non-Alignment" was a luxury India could not afford in a kinetic crisis. The move towards hard power realism defined the subsequent decades of Indian defense policy.
                </p>
                <div className="grid grid-cols-2 gap-8 mt-12">
                   <div className="bg-[#e4e1d5] p-6 rounded border border-black/5">
                      <h6 className="text-[11px] font-mono font-black uppercase mb-3">1971 Era</h6>
                      <p className="text-[13px] font-mono text-black/50">Bipolar dependency for defense hardware (USSR).</p>
                   </div>
                   <div className="bg-black text-white p-6 rounded shadow-lg">
                      <h6 className="text-[11px] font-mono font-black uppercase mb-3 text-amber-500">2026 Era (Vajra)</h6>
                      <p className="text-[13px] font-mono">Multi-aligned self-sufficiency via the Grid.</p>
                   </div>
                </div>
             </div>
          </div>
       );
    case 10:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 10 // Maritime Domain Awareness</h4>
             <div className="relative h-64 bg-slate-100 rounded border-2 border-dashed border-black/10 overflow-hidden flex items-center justify-center grayscale">
                <div className="absolute inset-0 bg-blue-500/5" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                   <div className="w-40 h-40 rounded-full border border-black/10 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-[3px] border-black/5 flex items-center justify-center animate-pulse">
                         <div className="w-1 h-32 bg-black/10 rotate-45" />
                      </div>
                   </div>
                   <span className="text-[8px] font-mono text-black/30 uppercase tracking-[0.5em]">Sonar Sweep: Bay of Bengal</span>
                </div>
             </div>
             <p className="text-[14px] font-serif leading-relaxed text-black/80">
                In 1971, defending the coastline from a single Task Force was the goal. Today, with underwater drones and hypersonic proxies, maritime domain awareness is the only insurance against another "Seventh Fleet" surprise.
             </p>
          </div>
       );
    case 11:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 11 // Actor Profile: Indira Gandhi</h4>
             <div className="flex gap-10">
                <div className="flex-1 space-y-6">
                   <p className="text-[15px] font-serif leading-relaxed text-black/90">
                      The "Iron Lady" managed the "Soviet Bear" without becoming its client. This established the precedent for modern strategic autonomy.
                   </p>
                   <div className="p-6 bg-black text-white font-mono text-[11px] rounded flex flex-col gap-2">
                      <span className="text-amber-500 font-black">TACTICAL MILESTONE:</span>
                      <span>The 1971 victory allowed India to conduct the 1974 "Smiling Buddha" nuclear test—the ultimate declaration of independence.</span>
                   </div>
                </div>
                <div className="w-1/3 aspect-[2/3] bg-stone-200 rounded-sm shadow-inner grayscale opacity-40 border border-black/10" />
             </div>
          </div>
       );
    case 12:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 12 // Proxy Trap: Ukraine vs 1971</h4>
             <div className="p-8 bg-black/5 rounded border border-black/10">
                <h6 className="text-[12px] font-mono font-black uppercase mb-6 text-center underline">Strategic Comparison</h6>
                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <span className="text-[10px] font-mono font-bold uppercase text-black/40">1971 Model</span>
                      <p className="text-[13px] font-serif italic text-black/70">Mukti Bahini: Indigenous force supported by a regional neighbor to restore stability.</p>
                   </div>
                   <div className="space-y-4">
                      <span className="text-[10px] font-mono font-bold uppercase text-black/40">Modern Model</span>
                      <p className="text-[13px] font-serif italic text-black/70">External proxies often used to bleed a rival without local stabilizing intent.</p>
                   </div>
                </div>
             </div>
             <p className="text-[14px] font-serif leading-relaxed text-red-900 border-l-4 border-red-600 pl-6">
                LEARNING: India must ensure its neighbors do not become the "Proxies" for a 2.0 US-China Great Game.
             </p>
          </div>
       );
    case 13:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 13 // Psychology of Victory</h4>
             <div className="flex gap-12">
                <div className="flex-1 space-y-8">
                   <p className="text-[16px] font-serif leading-relaxed text-black/90 text-justify">
                      Kinetic destruction is less important than <span className="font-bold underline">psychological capitulation</span>. The 1971 surrender was unique because of its scale and the treatment of the 93,000 PoWs.
                   </p>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[11px] font-mono border-b border-black/5 pb-2">
                         <span className="text-black/40">Morale Depletion Rate</span>
                         <span className="text-black font-black">CRITICAL</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono border-b border-black/5 pb-2">
                         <span className="text-black/40">Stabilization Period</span>
                         <span className="text-black font-black">50 YEARS</span>
                      </div>
                   </div>
                </div>
                <div className="w-1/3 bg-black/90 p-6 rounded shadow-2xl flex flex-col justify-between">
                   <div className="space-y-2">
                      <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">The Learning</span>
                      <p className="text-[12px] font-mono text-white/70 leading-relaxed italic">"Secure the psychological win to avoid a century-long insurgency."</p>
                   </div>
                   <ArrowRight className="w-8 h-8 text-amber-500/20" />
                </div>
             </div>
          </div>
       );
    case 14:
       return (
          <div className="flex flex-col gap-10">
             <div className="p-4 bg-red-600 text-white font-mono text-[11px] font-black uppercase text-center tracking-[0.5em] animate-pulse">
                PRIORITY ALERT: Eastern Grid Security
             </div>
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-6 uppercase tracking-widest">Page 14 // The 2024 Bangladesh Reset</h4>
             <p className="text-[16px] font-serif leading-relaxed text-black/95">
                Following the 2024 leadership change in Dhaka, the "American Shadow" has returned to the Bay of Bengal. The pattern of destabilization and "friendly" regime installation echoes 1971 maneuvers.
             </p>
             <div className="grid grid-cols-2 gap-8 mt-6">
                <div className="space-y-4">
                   <h6 className="text-[11px] font-mono font-black uppercase">Historical Echo</h6>
                   <p className="text-[12px] font-mono text-black/50">US interest in Saint Martin’s Island vs Task Force 74 desired base.</p>
                </div>
                <div className="space-y-4">
                   <h6 className="text-[11px] font-mono font-black uppercase">Vajra Action</h6>
                   <p className="text-[12px] font-mono text-red-600 font-bold underline">Secure the Eastern Grid before it becomes a unipolar beachhead.</p>
                </div>
             </div>
          </div>
       );
    case 15:
       return (
          <div className="flex flex-col gap-10">
             <div className="border-b-4 border-black pb-6 flex justify-between items-end">
                <h4 className="text-[28px] font-orbitron font-black text-black uppercase tracking-tighter">Vajra Directive 2.0</h4>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-mono text-red-600 font-black">TOP PRIORITY</span>
                   <span className="text-[10px] font-mono text-black/40">GEO-P-RESET-09</span>
                </div>
             </div>
             <div className="space-y-12">
                <section className="p-8 bg-black text-white rounded-md shadow-2xl">
                   <h5 className="text-[14px] font-mono font-black text-amber-500 mb-6 uppercase border-b border-white/10 pb-2">Final Geopolitical Synthesis</h5>
                   <div className="grid grid-cols-1 gap-6 text-[15px] font-serif leading-relaxed italic text-white/90">
                      <p>1. <span className="text-amber-500 font-black">No Permanent Friends</span>: Use superpower friction for our gain, but trust only the Vajra Grid.</p>
                      <p>2. <span className="text-amber-500 font-black">Kinetic Readiness</span>: Like '71, be ready to end a war in 13 days before the UN can convene.</p>
                      <p>3. <span className="text-amber-500 font-black">Strategic Autonomy is Supreme</span>: Decisive action on our terms overrides international "red lines."</p>
                   </div>
                </section>
                <div className="flex flex-col items-center gap-10 opacity-60">
                   <div className="text-center">
                      <div className="font-serif text-[32px] text-black italic leading-none">Vipul Jain</div>
                      <span className="text-[9px] font-mono text-black uppercase font-black tracking-widest">Director of Intelligence // Vajra Strategic Command</span>
                   </div>
                   <div className="w-32 h-32 border-4 border-black/20 flex items-center justify-center font-mono text-[10px] text-black/30 font-black rotate-12">
                      COMMAND SEAL
                   </div>
                </div>
             </div>
          </div>
       );
    default:
      return (
        <div className="flex flex-col gap-10 py-20 items-center justify-center">
          <div className="w-16 h-1 bg-black/10" />
          <p className="text-[14px] font-mono text-black/20 uppercase tracking-[0.5em] text-center max-w-sm">
            Segment {page}: Strategic data synchronization in progress...
          </p>
          <div className="w-16 h-1 bg-black/10" />
          <div className="mt-10 group cursor-pointer" onClick={() => {}}>
             <span className="text-[10px] font-mono text-black/40 uppercase font-black border border-black/10 px-4 py-2 hover:bg-black hover:text-white transition-all">Request Declassification</span>
          </div>
        </div>
      );
  }
}

// --- 15-PAGE CONTENT RENDERER FOR MISSION VAJRA 2047 ---
function DossierPages2047({ page }: { page: number }) {
  switch (page) {
    case 1:
      return (
        <div className="flex flex-col gap-12">
          <div className="border-b-4 border-double border-black/20 pb-8">
             <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-mono font-black uppercase tracking-widest">SHIVA DIRECTIVE</span>
                <span className="text-[10px] font-mono text-black/40">SERIAL: VAJRA-2047-DOCTRINE</span>
             </div>
            <h3 className="text-[42px] font-orbitron font-black text-black leading-tight tracking-tighter uppercase">
              The Centennial Doctrine
            </h3>
            <p className="text-[12px] font-mono text-black/60 uppercase tracking-[0.3em] mt-2">Regional Balancer → Global Pole</p>
          </div>
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-8 space-y-8">
              <p className="text-[18px] font-serif leading-relaxed text-black/90 first-letter:text-5xl first-letter:font-black">
                The shift from being a "Regional Balancer" to a "Global Pole." The mission is to ensure that by 2047, no major global decision is made without Indian consent. It replaces "Strategic Autonomy" with <span className="font-black underline italic decoration-amber-600">Strategic Dominance</span>.
              </p>
              <div className="p-6 bg-slate-900 text-white rounded shadow-xl border-l-4 border-amber-500 font-mono">
                <div className="text-[10px] text-amber-500 mb-2 font-black uppercase tracking-widest">Decision Authority Index (DAI)</div>
                <div className="text-[28px] font-black tracking-tighter">98.4% <span className="text-[14px] text-amber-500/50 font-normal ml-2">PROJECTION</span></div>
                <p className="text-[11px] text-white/40 mt-4 leading-tight italic">AUTHORIZED BY MISSION VAJRA COMMAND: 1.6 Billion Consensus Pole.</p>
              </div>
            </div>
            <div className="col-span-4 space-y-4">
               <div className="p-4 bg-black/5 border border-black/10 rounded">
                  <h6 className="text-[10px] font-mono font-black uppercase mb-1">Legacy Posture</h6>
                  <span className="text-[12px] font-serif text-black/60">Non-Alignment / Strategic Autonomy</span>
               </div>
               <div className="p-4 bg-amber-500/10 border border-amber-600/30 rounded">
                  <h6 className="text-[10px] font-mono font-black uppercase mb-1">Vajra Posture</h6>
                  <span className="text-[14px] font-serif font-black text-amber-900 italic">Strategic Dominance</span>
               </div>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 02 // Blue-Water Supremacy</h4>
          <p className="text-[16px] font-serif leading-relaxed text-black/95">
             A naval strategy to convert the Indian Ocean into an <span className="font-bold underline italic">"Indian Lake."</span> This involves controlling the three vital gateways (Malacca, Hormuz, and Bab-el-Mandeb) with five Nuclear Carrier Battle Groups to ensure total maritime denial to adversaries.
          </p>
          <div className="grid grid-cols-2 gap-8 mt-4">
             <div className="bg-slate-50 p-6 rounded border-2 border-dashed border-black/10">
                <span className="text-[10px] font-mono font-black uppercase text-black/40">Garrison Nodes</span>
                <ul className="mt-4 space-y-2 text-[12px] font-mono">
                   <li className="flex justify-between border-b border-black/5 pb-1">
                      <span>Gateway Malacca</span>
                      <span className="text-emerald-600 font-bold">SECURED</span>
                   </li>
                   <li className="flex justify-between border-b border-black/5 pb-1">
                      <span>Strait of Hormuz</span>
                      <span className="text-emerald-600 font-bold">SECURED</span>
                   </li>
                   <li className="flex justify-between">
                      <span>Bab-el-Mandeb</span>
                      <span className="text-emerald-600 font-bold">SECURED</span>
                   </li>
                </ul>
             </div>
             <div className="bg-black p-6 rounded shadow-2xl flex flex-col justify-between">
                <div>
                   <span className="text-amber-500 font-mono text-[10px] font-black uppercase tracking-widest">Projected Tonnage</span>
                   <p className="text-white font-orbitron text-[24px] font-black leading-none mt-2">1,200,000</p>
                </div>
                <div className="h-[2px] w-full bg-white/10" />
                <span className="text-white/40 font-mono text-[9px] uppercase italic">5x Vikas-Class Nuclear Carriers Active</span>
             </div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 03 // Hypersonic Overmatch</h4>
          <p className="text-[16px] font-serif leading-relaxed text-black/95 italic">
             "The retirement of 'Minimum Deterrence.' India adopts a <span className="font-black text-red-600 underline">First-Strike Certainty</span> posture."
          </p>
          <div className="p-8 border-4 border-black/5 flex flex-col gap-8">
             <div className="flex justify-between items-end">
                <div className="flex flex-col">
                   <span className="text-[11px] font-mono font-black uppercase">Agni-VI-H Glider</span>
                   <span className="text-[24px] font-mono font-black text-black">MACH 12+</span>
                </div>
                <div className="w-1/2 h-[1px] bg-black/10 mb-2" />
                <span className="text-[11px] font-mono font-black text-red-600 uppercase tracking-widest">UNSTOPPABLE</span>
             </div>
             <p className="text-[14px] font-serif leading-relaxed text-black/70">
                These weapons travel at Mach 12, rendering all current global missile defenses obsolete. Maneuverable Re-entry Vehicles ensure 99.99% target acquisition in non-linear flight paths.
             </p>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 04 // The Celestial Shield</h4>
          <div className="flex gap-10">
             <div className="flex-1 space-y-6">
                <p className="text-[15px] font-serif leading-relaxed text-black/95">
                   Militarization of space through **Lunar Base Vikram**. This high-ground station monitors all global satellite activity and controls the "K-Astra" grid.
                </p>
                <div className="p-4 bg-slate-100 rounded border border-black/5 font-mono text-[12px]">
                   <span className="font-black uppercase text-amber-600">K-Astra Performance</span>
                   <div className="mt-4 flex flex-col gap-2">
                      <div className="flex justify-between">
                         <span>Boost-Phase ICBM Kill Rate</span>
                         <span className="font-black">98.2%</span>
                      </div>
                      <div className="w-full h-1 bg-black/5">
                         <div className="w-[98.2%] h-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                      </div>
                   </div>
                </div>
             </div>
             <div className="w-1/3 aspect-[3/4] bg-slate-900 rounded p-4 relative overflow-hidden grayscale opacity-40 border border-white/5">
                <div className="absolute inset-x-0 h-[1px] bg-amber-500/20 top-[45%] pointer-events-none" />
                <div className="absolute inset-y-0 w-[1px] bg-amber-500/20 left-[50%] pointer-events-none" />
                <span className="absolute bottom-2 left-2 text-[8px] font-mono text-amber-500 uppercase tracking-widest">FEED: LUNAR_NORTH</span>
             </div>
          </div>
        </div>
      );
    case 10:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 10 // Neighborhood First 2.0</h4>
             <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 font-serif text-[16px] leading-relaxed text-black/90">
                   The creation of the **South Asian Defense Pact**. India acts as the sole security guarantor for the region, pushing its "defensive perimeter" 2,000 km beyond its actual borders.
                </div>
                <div className="col-span-7 aspect-video bg-black/5 border-2 border-dashed border-black/20 rounded flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <ShieldCheck className="w-32 h-32" />
                   </div>
                   <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest font-black">Regional Command Map</span>
                </div>
                <div className="col-span-5 flex flex-col gap-4">
                   <div className="p-4 bg-emerald-50 border border-emerald-200 rounded">
                      <h6 className="text-[9px] font-mono font-black text-emerald-800 uppercase">Perimeter Ext.</h6>
                      <span className="text-[20px] font-mono font-black">+2,000 KM</span>
                   </div>
                   <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                      <h6 className="text-[9px] font-mono font-black text-slate-800 uppercase">Pact Status</h6>
                      <span className="text-[14px] font-serif italic">Unified Sovereign Command</span>
                   </div>
                </div>
             </div>
          </div>
       );
    case 11:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 11 // Polar Strategy</h4>
             <div className="space-y-6">
                <p className="text-[16px] font-serif leading-relaxed text-black/95">
                   Securing rights to the "Post-Ice" world. India maintains a permanent nuclear ice-breaker fleet and militarized research stations in the Antarctic to claim deep-ice mineral and energy resources.
                </p>
                <div className="grid grid-cols-2 gap-8">
                   <div className="p-6 bg-slate-900 text-white rounded shadow-xl flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-amber-500 uppercase font-black">Fleet Strength</span>
                      <p className="text-[18px] font-mono font-bold mt-2">4 Nuclear Ice-Breakers</p>
                   </div>
                   <div className="p-6 border-4 border-double border-black/10 flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-black/30 uppercase font-black">Strategic Claim</span>
                      <p className="text-[14px] font-serif italic mt-2">Deep-Ice Mineral Priority</p>
                   </div>
                </div>
             </div>
          </div>
       );
    case 12:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 12 // The Viral Shield</h4>
             <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 font-serif text-[16px] leading-relaxed text-black/90">
                   A sophisticated biodefense grid. Using AI-driven genomic sequencing, India can identify a bio-weapon and synthesize a national vaccine response within 72 hours.
                </div>
                <div className="col-span-12 p-8 bg-red-50 border-y-2 border-red-900/10 flex items-center justify-between">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-black uppercase text-red-900">Response Speed</span>
                      <span className="text-[42px] font-orbitron font-black text-red-900 leading-none">72 HRS</span>
                   </div>
                   <div className="w-1/2 flex flex-col gap-4">
                      <div className="flex justify-between text-[11px] font-mono text-red-900/40 uppercase font-black">
                         <span>Genetic Sequencing</span>
                         <span>DONE (&lt; 2H)</span>
                      </div>
                      <div className="w-full h-1 bg-red-900/5">
                         <div className="w-full h-full bg-red-900" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       );
    case 13:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 13 // The P6 Era</h4>
             <div className="space-y-10 px-6">
                <div className="flex justify-between items-center bg-black p-10 rounded shadow-2xl">
                   <div className="flex flex-col gap-2">
                      <span className="text-amber-500 font-mono text-[10px] font-black tracking-widest uppercase">New World Order</span>
                      <h5 className="text-white font-orbitron text-[36px] font-black leading-none">THE P6 ERA</h5>
                   </div>
                   <div className="p-4 border border-white/20 rounded font-mono text-[12px] text-white/40">UNSC RESTACKED</div>
                </div>
                <p className="text-[16px] font-serif leading-relaxed text-black/95 text-justify">
                   The formal restructuring of the UN Security Council. India holds a permanent seat with Veto power, marking the end of the post-WWII order and the start of the <span className="font-black italic underline decoration-amber-500">"Indian Century."</span>
                </p>
             </div>
          </div>
       );
    case 14:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 14 // The Dharma of Power</h4>
             <div className="bg-[#fcf8e8] p-12 rounded border-l-[16px] border-amber-600 shadow-xl flex flex-col gap-10">
                <h5 className="text-[20px] font-serif font-black italic text-amber-900 border-b border-amber-900/10 pb-4">"Force for Order, Protection of Dharma"</h5>
                <p className="text-[18px] font-serif leading-relaxed text-black/90 italic">
                   "Power is not for expansion, but for the protection of Dharma (Order). Any threat to the Republic is met with 'Vajra-level' finality."
                </p>
                <div className="pt-10 flex justify-end">
                   <div className="flex flex-col items-center opacity-40">
                      <div className="w-24 h-[2px] bg-black mb-1" />
                      <span className="text-[9px] font-mono text-black uppercase font-black">Council Signature</span>
                   </div>
                </div>
             </div>
          </div>
       );
    case 15:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 15 // The Legacy Protocol</h4>
             <div className="grid grid-cols-12 gap-10">
                <div className="col-span-8 flex flex-col gap-8">
                   <p className="text-[16px] font-serif leading-relaxed text-black/95">
                      The formal authorization of all 2047 protocols, transferring command from current military structures to the **Integrated VAJRA Command**.
                   </p>
                   <div className="p-6 bg-slate-100 rounded border border-black/5 font-mono text-[11px] leading-relaxed">
                      <span className="font-black uppercase text-red-600">AUTH TRANSFER:</span>
                      <p className="mt-2">Transition initiated. Human Oversight: 15%. AI Core Execution: 85%.</p>
                   </div>
                </div>
                <div className="col-span-4 p-8 bg-black text-white rounded shadow-2xl flex flex-col items-center justify-center text-center gap-4">
                   <Lock className="w-12 h-12 text-amber-500" />
                   <span className="text-[10px] font-mono text-amber-500 uppercase font-black">SYSTEM SEALED</span>
                   <div className="mt-2 w-full h-[1px] bg-white/10" />
                   <span className="text-[8px] font-mono text-white/40 uppercase">Vajra Command 1.0</span>
                </div>
             </div>
          </div>
       );
    case 16:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 16 // What We Have Achieved</h4>
             <div className="grid grid-cols-2 gap-8">
                {[
                  { title: "Nuclear Triad", desc: "Arihant-class nuclear subs with K-4 SLBMs." },
                  { title: "India Stack", desc: "Total digital and financial sovereignty." },
                  { title: "Agni-V MIRV", desc: "Precision global reach with multiple warheads." },
                  { title: "Global South Lead", desc: "Diplomatic hegemony through G20 and beyond." }
                ].map((item, i) => (
                   <div key={i} className="p-6 bg-white border border-black/5 rounded shadow-sm hover:border-black/20 transition-all">
                      <h6 className="text-[11px] font-mono font-black uppercase text-black mb-1">{item.title}</h6>
                      <p className="text-[11px] font-serif text-black/60 italic">{item.desc}</p>
                   </div>
                ))}
             </div>
          </div>
       );
    case 17:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 17 // Unfinished Business</h4>
             <div className="p-10 border-4 border-dashed border-red-900/20 bg-red-50/10 flex flex-col gap-8">
                <h5 className="text-[16px] font-mono font-black text-red-900 uppercase">Critical Gaps [THE UNFINISHED]</h5>
                <ul className="space-y-6">
                   <li className="flex gap-4">
                      <div className="w-1 h-12 bg-red-900" />
                      <div className="flex flex-col">
                         <span className="text-[12px] font-mono font-black uppercase">High-Thrust Engines</span>
                         <p className="text-[12px] font-serif text-black/60">Finalizing 110kN and 130kN thrust Kaveri variants for total air self-reliance.</p>
                      </div>
                   </li>
                   <li className="flex gap-4">
                      <div className="w-1 h-12 bg-red-900" />
                      <div className="flex flex-col">
                         <span className="text-[12px] font-mono font-black uppercase">Mass Chip Fab</span>
                         <p className="text-[12px] font-serif text-black/60">Scaling the existing 2nm Shakti lab success into gigafactories.</p>
                      </div>
                   </li>
                   <li className="flex gap-4">
                      <div className="w-1 h-12 bg-red-900" />
                      <div className="flex flex-col">
                         <span className="text-[12px] font-mono font-black uppercase">Border Settlement</span>
                         <p className="text-[12px] font-serif text-black/60">Ending all territorial disputes through overwhelming deterrent force.</p>
                      </div>
                   </li>
                </ul>
             </div>
          </div>
       );
    case 18:
       return (
          <div className="flex flex-col gap-12">
             <div className="border-b-4 border-black pb-6 flex justify-between items-end">
                <h4 className="text-[24px] font-orbitron font-black text-black uppercase tracking-tighter">Who Will Stop Us?</h4>
                <span className="text-[10px] font-mono text-black/40">RISK ASSESSMENT</span>
             </div>
             <div className="space-y-6">
                {[
                  { actor: "The Old Guard", risk: "HIGH", detail: "Western powers fearing the loss of financial hegemony (end of USD)." },
                  { actor: "Regional Rival", risk: "CRITICAL", detail: "China's 'String of Pearls' strategy to contain India." },
                  { actor: "Internal Fractures", risk: "ONGOING", detail: "Information warfare aimed at breaking national unity." }
                ].map((r, i) => (
                   <div key={i} className="flex gap-6 items-start group">
                      <div className={`p-4 font-mono text-[10px] font-black border-2 border-black group-hover:bg-black group-hover:text-white transition-all`}>
                         {r.risk}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[12px] font-mono font-black uppercase">{r.actor}</span>
                         <p className="text-[13px] font-serif text-black/60 mt-1">{r.detail}</p>
                      </div>
                   </div>
                ))}
                <div className="mt-20 pt-10 border-t-2 border-double border-black/10 flex flex-col items-center opacity-30">
                   <span className="text-[9px] font-mono font-black uppercase tracking-[0.5em]">End of Dossier // Project Vajra 2047</span>
                   <div className="mt-4 flex gap-2">
                      <div className="w-8 h-[2px] bg-black" />
                      <div className="w-2 h-[2px] bg-black" />
                      <div className="w-8 h-[2px] bg-black" />
                   </div>
                </div>
             </div>
          </div>
       );
    default:
      return (
        <div className="flex flex-col gap-10 py-32 items-center justify-center">
          <AlertTriangle className="w-16 h-16 text-black/10 mb-4" />
          <p className="text-[14px] font-mono text-black/30 uppercase tracking-[0.5em] text-center max-w-sm">
            Segment {page}: Connecting to future temporal data grid...
          </p>
          <div className="mt-12 flex gap-4">
             <div className="w-12 h-[2px] bg-black/5" />
             <div className="w-12 h-[2px] bg-black/5" />
             <div className="w-12 h-[2px] bg-black/5" />
          </div>
        </div>
      );
  }
}
