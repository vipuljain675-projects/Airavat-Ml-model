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
               {filtered.map((d, i) => {
                 const isVajra = d.id === "FUTURE-V47-002";
                 return (
                   <motion.div 
                     key={d.id}
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.05 }}
                     whileHover={{ scale: 1.04, y: -12 }}
                     onClick={() => {
                         setSelectedId(d.id);
                         setViewState("dossier");
                     }}
                     className="flex flex-col items-center gap-6 cursor-pointer group"
                   >
                      <div className={`relative w-full ${isVajra ? "aspect-[2/3]" : "aspect-square"} perspective-1000`}>
                         <motion.div 
                           whileHover={{ rotateY: -10, rotateX: 8 }}
                           className="w-full h-full relative rounded-xl overflow-hidden shadow-[20px_10px_40px_rgba(0,0,0,0.8)] border border-white/5 transition-shadow group-hover:shadow-amber-500/20"
                         >
                            {isVajra ? (
                              <>
                                {/* VAJRA 2047 — cinematic cover image */}
                                <img 
                                  src="/assets/vajra_2047_cover.png" 
                                  alt="Mission VAJRA 2047" 
                                  className="w-full h-full object-cover transition-all group-hover:scale-105 duration-700" 
                                />
                                {/* Gradient overlay so text is readable */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                {/* File code top-left */}
                                <div className="absolute top-4 left-4">
                                  <span className="px-2 py-0.5 bg-black/70 text-[8px] font-mono text-amber-400/80 tracking-widest rounded-sm border border-amber-500/20 uppercase backdrop-blur-sm">
                                    {d.fileCode}
                                  </span>
                                </div>
                                {/* Title pinned to bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1">
                                  <div className="w-8 h-[1px] bg-amber-500/60 mb-2" />
                                  <h3 className="text-[13px] font-orbitron font-black text-white leading-tight drop-shadow-lg uppercase tracking-wider">
                                    {d.title}
                                  </h3>
                                  <span className="text-[9px] font-mono text-amber-400/60 uppercase tracking-widest">{d.date}</span>
                                </div>
                                {/* Verified badge */}
                                <div className="absolute top-4 right-4 p-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                </div>
                              </>
                            ) : (
                              <>
                                <img src="/assets/vajra_folder.png" alt="" className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
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
                              </>
                            )}
                         </motion.div>
                      </div>
                      <div className="flex flex-col items-center">
                         <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-amber-500/60 transition-colors">Record ID: {d.id}</span>
                         {!isVajra && <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tighter mt-1 group-hover:text-slate-200">{d.date}</span>}
                      </div>
                   </motion.div>
                 );
               })}
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
                     <span className="text-[10px] font-mono text-slate-700 uppercase">/ {selectedId === "FUTURE-V47-002" ? 18 : 15}</span>
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
              <p className="text-[17px] font-serif leading-relaxed text-black/90 first-letter:text-5xl first-letter:font-black">
                India in 2026 stands at <span className="font-black underline">$4.5 Trillion USD</span>—the 4th largest economy on Earth, projected to cross $10T by 2035. Yet our GDP per capita languishes at a mere <span className="font-black text-red-700">$3,000/year</span>: comparable to sub-Saharan Africa. This asymmetry—immense aggregate power, diffuse individual wealth—is the central contradiction of the Indian century. Mission VAJRA 2047 resolves this by replacing "Strategic Autonomy" with <span className="font-black underline italic decoration-amber-600">Strategic Dominance</span> so that by 2047, no major global decision is made without Indian consent.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-black text-white rounded shadow-xl flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-amber-500 uppercase font-black">GDP (2026)</span>
                  <span className="text-[24px] font-orbitron font-black leading-none">$4.5T</span>
                  <span className="text-[9px] text-white/30 uppercase">USD Nominal · Rank #4</span>
                </div>
                <div className="p-4 bg-red-900 text-white rounded shadow-xl flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-red-300 uppercase font-black">GDP/Capita</span>
                  <span className="text-[24px] font-orbitron font-black leading-none">$3k</span>
                  <span className="text-[9px] text-red-300/50 uppercase">Per Annum — Critical Gap</span>
                </div>
                <div className="p-4 bg-emerald-900 text-white rounded shadow-xl flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-emerald-300 uppercase font-black">Population</span>
                  <span className="text-[24px] font-orbitron font-black leading-none">1.44B</span>
                  <span className="text-[9px] text-emerald-300/50 uppercase">Largest on Earth</span>
                </div>
              </div>
              <div className="p-6 bg-slate-900 text-white rounded shadow-xl border-l-4 border-amber-500 font-mono">
                <div className="text-[10px] text-amber-500 mb-2 font-black uppercase tracking-widest">Decision Authority Index (DAI)</div>
                <div className="text-[28px] font-black tracking-tighter">98.4% <span className="text-[14px] text-amber-500/50 font-normal ml-2">PROJECTION 2047</span></div>
                <p className="text-[11px] text-white/40 mt-4 leading-tight italic">AUTHORIZED BY MISSION VAJRA COMMAND: 1.6 Billion Consensus Pole. The paradox — $3k/head today funds $30k/head tomorrow.</p>
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
               <div className="p-4 bg-black/80 text-white rounded mt-4">
                  <h6 className="text-[9px] font-mono font-black uppercase text-amber-500 mb-3">GDP Growth Path</h6>
                  {([["2026","$4.5T",45],["2030","$6.1T",61],["2035","$10T",85],["2047","$30T+",100]] as [string,string,number][]).map(([yr,val,w])=>(
                    <div key={yr} className="flex items-center gap-2 mb-2">
                      <span className="text-[8px] font-mono text-white/40 w-8">{yr}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{width:`${w}%`}}/></div>
                      <span className="text-[8px] font-mono text-amber-500 font-black w-10 text-right">{val}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 02 // Blue-Water Supremacy: The Indian Lake Doctrine</h4>
          <p className="text-[15px] font-serif leading-relaxed text-black/95">
            As of 2026, the Indian Navy operates <span className="font-black">over 150 warships</span>—the crown jewel of India's armed forces. INS Vikrant (IAC-1, 45,000t) is operational; INS Vikramaditya serves as the second carrier. Mission: convert the Indian Ocean into an <span className="font-bold underline italic">"Indian Lake"</span> by controlling Malacca, Hormuz, and Bab-el-Mandeb.
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["INS Vikrant (IAC-1)","Carrier · STOBAR","45,000t","ACTIVE"],
                  ["INS Vikramaditya","Carrier · STOBAR","44,500t","ACTIVE"],
                  ["INS Arihant / Arighat","SSBN Nuke Sub","6,000t","OPERATIONAL"],
                  ["P-75I Scorpene+","Attack Submarine","1,800t","6-IN-CLASS"],
                ] as [string,string,string,string][]).map(([n,t,w,s],i)=>(
                  <div key={i} className="p-4 bg-white border border-black/10 rounded shadow-sm">
                    <div className="text-[9px] font-mono text-amber-600 font-black uppercase mb-1">{t}</div>
                    <div className="text-[11px] font-mono font-black text-black">{n}</div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] font-mono text-black/40">{w}</span>
                      <span className="text-[8px] font-mono text-emerald-600 font-black">{s}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-slate-900 text-white rounded">
                <div className="text-[10px] font-mono text-amber-500 font-black uppercase mb-4">Strategic Chokepoint Control (2047 Target)</div>
                {([["Strait of Malacca","EN ROUTE",70],["Strait of Hormuz","MONITORED",55],["Bab-el-Mandeb","CONTESTED",40],["Cape of Good Hope","PROJECTED",30]] as [string,string,number][]).map(([g,s,w])=>(
                  <div key={g} className="mb-3">
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-white/70">{g}</span>
                      <span className="text-amber-500 font-black">{s}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full">
                      <div className="h-full bg-amber-500 rounded-full" style={{width:`${w}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-black text-white rounded shadow-2xl">
                <span className="text-amber-500 font-mono text-[9px] font-black uppercase">Fleet (2026)</span>
                <p className="text-[36px] font-orbitron font-black leading-none mt-2">150+</p>
                <span className="text-[9px] text-white/30 uppercase">Total Warships</span>
              </div>
              <div className="p-5 bg-emerald-900 text-white rounded">
                <span className="text-emerald-300 font-mono text-[9px] font-black uppercase">Carriers Active</span>
                <p className="text-[36px] font-orbitron font-black leading-none mt-2">2</p>
                <span className="text-[9px] text-emerald-300/50 uppercase">Target: 5 by 2047</span>
              </div>
              <div className="p-5 bg-red-900 text-white rounded">
                <span className="text-red-300 font-mono text-[9px] font-black uppercase">SSBN Nuclear Subs</span>
                <p className="text-[36px] font-orbitron font-black leading-none mt-2">2+</p>
                <span className="text-[9px] text-red-300/50 uppercase">Arihant + Arighat</span>
              </div>
            </div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 03 // Air Dominance: The 30-Squadron Crisis</h4>
          <div className="p-4 bg-red-700 text-white font-mono text-[11px] font-black uppercase tracking-[0.3em] text-center">
            ⚠ CRITICAL GAP: IAF operates only ~30 squadrons vs. sanctioned 42
          </div>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-7 space-y-5">
              <p className="text-[15px] font-serif leading-relaxed text-black/90">
                India's authorised IAF strength is <span className="font-black">42 squadrons</span>. In 2026 we operate a mere <span className="font-black text-red-700 underline">~30</span>—a 28% deficit representing the single largest vulnerability in India's conventional deterrence posture.
              </p>
              <div className="space-y-3">
                <div className="text-[10px] font-mono font-black uppercase text-black/40 mb-1">Current IAF Combat Fleet (2026)</div>
                {([
                  ["Su-30MKI",15,"Air Superiority","Russia","bg-blue-700"],
                  ["Dassault Rafale",2,"Multi-Role","France","bg-red-700"],
                  ["Tejas Mk1/Mk1A",2,"Light Combat (🇮🇳)","HAL Bangalore","bg-amber-600"],
                  ["MiG-29 Upgrade",5,"Air Defence","Russia (Aging)","bg-slate-600"],
                  ["Jaguar DARIN-III",6,"Deep Strike (Legacy)","UK/France","bg-stone-600"],
                ] as [string,number,string,string,string][]).map(([ac,sq,role,org,col])=>(
                  <div key={ac} className="flex items-center gap-3 p-3 bg-black/5 rounded border border-black/5">
                    <div className={`${col} text-white text-[10px] font-mono font-black px-2 py-1 rounded min-w-[28px] text-center`}>{sq}SQ</div>
                    <div className="flex-1">
                      <div className="text-[11px] font-mono font-black">{ac}</div>
                      <div className="text-[9px] font-mono text-black/40">{role} · {org}</div>
                    </div>
                    <div className="w-20 h-1.5 bg-black/5 rounded-full">
                      <div className={`${col} h-full rounded-full`} style={{width:`${(sq/15)*100}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-5 space-y-4">
              <div className="p-5 bg-black text-white rounded shadow-2xl">
                <div className="text-[9px] font-mono text-amber-500 uppercase font-black mb-3">Squadron Gap Analysis</div>
                <div className="flex justify-between mb-1 text-[10px] font-mono">
                  <span className="text-white/40">Current ~30</span>
                  <span className="text-red-400 font-black">71%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full mb-4">
                  <div className="h-full bg-red-500 rounded-full" style={{width:"71%"}}/>
                </div>
                <div className="text-[9px] font-mono text-amber-500 font-black uppercase mb-2">VAJRA Fix:</div>
                <ul className="text-[10px] font-mono text-white/60 space-y-1">
                  <li>• Tejas Mk2 (110kN) — +4 SQ by 2030</li>
                  <li>• AMCA 6th Gen — IOC 2035</li>
                  <li>• 114 MRFA tender — +7 SQ</li>
                </ul>
              </div>
              <div className="p-5 bg-amber-500/10 border border-amber-600/30 rounded">
                <div className="text-[9px] font-mono font-black text-amber-900 uppercase mb-2">Next Gen Indigenous</div>
                <ul className="space-y-1.5 text-[10px] font-mono text-amber-900/70">
                  <li>• AMCA — Twin-Engine 6th Gen Stealth</li>
                  <li>• HLFT-42 — Advanced Lead-In Trainer</li>
                  <li>• CATS Warrior — Loyal Wingman UAV</li>
                  <li>• Tejas Mk3 Concept — 2040+ Vision</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 04 // Hypersonic Overmatch: First-Strike Certainty</h4>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-6">
              <p className="text-[16px] font-serif leading-relaxed text-black/90">
                The VAJRA doctrine retires "Minimum Deterrence" and adopts <span className="font-black text-red-700 underline">First-Strike Certainty</span>—any retaliatory strike carries guaranteed 100% penetration. Agni-VI-H at <span className="font-black">Mach 12+</span> makes every existing missile shield—Patriot, S-400, THAAD, SM-3—entirely obsolete.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["Agni-V MIRV","5,500+ km","Up to 10 MIRVs","DEPLOYED","bg-red-900"],
                  ["Agni-VI-H Hypersonic","11,000+ km","8 MIRVs + Glider","IN DEV","bg-amber-700"],
                  ["K-4 SLBM (Arihant)","3,500 km","MIRV Capable","OPERATIONAL","bg-slate-700"],
                  ["BrahMos-NG / Shaurya","500–1,500 km","Hypersonic Cruise","ACTIVE","bg-blue-900"],
                ] as [string,string,string,string,string][]).map(([nm,rng,pay,st,col])=>(
                  <div key={nm} className={`${col} text-white p-5 rounded shadow-xl`}>
                    <div className="text-[9px] font-mono text-white/50 uppercase font-black mb-1">{st}</div>
                    <div className="text-[13px] font-orbitron font-black leading-tight">{nm}</div>
                    <div className="mt-3 border-t border-white/10 pt-3 space-y-1">
                      <div className="text-[9px] font-mono text-white/40">Range: <span className="text-white font-black">{rng}</span></div>
                      <div className="text-[9px] font-mono text-white/40">Payload: <span className="text-white font-black">{pay}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-4 border-double border-black/10 flex flex-col gap-3">
                <div className="text-[10px] font-mono font-black uppercase text-black/40">Nuclear Triad Status (2026)</div>
                {([["Land (Agni Series)","OPERATIONAL","100%"],["Sea (K-Series / Arihant)","OPERATIONAL","85%"],["Air (Rafale / Mirage 2000H)","OPERATIONAL","90%"]] as [string,string,string][]).map(([d,s,p])=>(
                  <div key={d} className="flex items-center gap-3">
                    <div className="w-44 text-[10px] font-mono font-black">{d}</div>
                    <div className="flex-1 h-2 bg-black/5 rounded-full">
                      <div className="h-full bg-black rounded-full" style={{width:p}}/>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-700 font-black w-20 text-right">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="p-6 bg-red-900 text-white rounded shadow-2xl flex flex-col gap-3">
                <span className="text-[9px] font-mono text-red-300 uppercase font-black">Hypersonic Speed</span>
                <span className="text-[42px] font-orbitron font-black leading-none">MACH<br/>12+</span>
                <span className="text-[9px] text-red-300/50 uppercase">Agni-VI-H Glider Vehicle</span>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-mono text-red-200/60 italic leading-relaxed">"No current defence — Patriot, S-400, THAAD, SM-3 — can intercept a manoeuvring warhead at sustained Mach 12."</p>
                </div>
              </div>
              <div className="p-5 bg-black text-white rounded">
                <div className="text-[9px] font-mono text-amber-500 uppercase font-black mb-2">Warhead Count (Est.)</div>
                <div className="text-[32px] font-orbitron font-black">160-170</div>
                <div className="text-[9px] text-white/30 uppercase mt-1">Operational Nuclear</div>
              </div>
            </div>
          </div>
        </div>
      );
    case 5:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 05 // Indigenous Drones & UCAV Programme</h4>
          <p className="text-[15px] font-serif leading-relaxed text-black/90">
            India's indigenous Unmanned Combat Aerial Vehicle (UCAV) ecosystem is the fastest-growing segment of the defence industrial base. From high-altitude surveillance to stealthy strike missions, these platforms reduce dependence on foreign ISR assets and give the IAF persistent reach without pilot risk.
          </p>
          <div className="grid grid-cols-2 gap-5">
            {([
              {name:"Ghatak UCAV",agency:"DRDO / ADA",role:"Stealthy flying-wing Strike UCAV",payload:"~1,000 kg internal weapons bay",status:"Technology Demonstrator (TD-1 flew 2022)",color:"bg-slate-900"},
              {name:"Sheshnag-1",agency:"DRDO",role:"High-Altitude Long-Endurance (HALE) ISR",payload:"Synthetic Aperture Radar + EO/IR",status:"In Development — Himalayan surveillance role",color:"bg-blue-900"},
              {name:"Rustom-2 (TAPAS-BH)",agency:"DRDO / HAL",role:"MALE ISR · Predator class",payload:"350 kg · Sat-comms · Multi-sensor",status:"Flight testing phase — Navy & Army interest",color:"bg-amber-800"},
              {name:"TAPAS BH-201",agency:"ADE / DRDO",role:"Tactical Reconnaissance UAV",payload:"175 kg endurance payload",status:"Army trials completed 2023",color:"bg-emerald-900"},
              {name:"CATS Warrior",agency:"HAL + Boeing India",role:"Loyal Wingman / Tejas escort UCAV",payload:"Smart munitions + AI wingman logic",status:"Concept phase — MoD sanctioned 2024",color:"bg-red-900"},
              {name:"Archer-NG",agency:"ideaForge / DRDO",role:"Mini / VTOL tactical ISR swarm",payload:"Micro EO sensor + jamming pod",status:"Army field-deployed in Ladakh",color:"bg-purple-900"},
            ] as {name:string,agency:string,role:string,payload:string,status:string,color:string}[]).map((d,i)=>(
              <div key={i} className={`${d.color} text-white p-5 rounded shadow-xl`}>
                <div className="text-[9px] font-mono text-white/40 uppercase mb-1">{d.agency}</div>
                <div className="text-[14px] font-orbitron font-black">{d.name}</div>
                <div className="text-[10px] font-mono text-white/60 mt-1 italic">{d.role}</div>
                <div className="mt-3 border-t border-white/10 pt-3 space-y-1">
                  <div className="text-[9px] text-white/50">Payload: <span className="text-white font-black">{d.payload}</span></div>
                  <div className="text-[9px] text-white/50">Status: <span className="text-amber-400 font-black">{d.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 6:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 06 // The Big Lie: India Is NOT Digitally Sovereign</h4>
          <div className="p-4 bg-red-700 text-white font-mono text-[11px] font-black uppercase tracking-[0.2em] text-center">
            ⚠ ASSESSMENT — India's Digital Infrastructure Is 100% US-Controlled
          </div>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-5">
              <p className="text-[15px] font-serif leading-relaxed text-black/90">
                India celebrates UPI, Aadhaar, CoWIN as "digital sovereignty." <span className="font-black text-red-700 underline">It is a comfortable fiction.</span> The entire backbone of India's digital economy — cloud, AI, chips, OS, subsea cables — is <span className="font-black">100% owned and controlled by American corporations.</span> AWS, Azure, and Google Cloud host every major Indian government workload. A single US Executive Order can shut India down.
              </p>
              <div className="p-5 bg-black text-white rounded shadow-xl">
                <div className="text-[10px] font-mono text-red-400 font-black uppercase mb-4">Who Actually Runs India's Digital State (2026)</div>
                <div className="space-y-3">
                  {([
                    ["Cloud Infra","Amazon AWS · Microsoft Azure · Google Cloud","95% of enterprise + govt cloud workloads","USA"],
                    ["AI / LLM Layer","GPT-4o (Microsoft) · Gemini (Google) · Claude (Anthropic)","100% of major AI used in India is US-built","USA"],
                    ["Chips / Fabs","TSMC · Samsung Foundry · Intel (5nm–28nm)","95%+ of chips inside every Indian device","Taiwan/USA"],
                    ["Operating Systems","Windows · Android (Google) · iOS (Apple)","99%+ OS market share","USA"],
                    ["Subsea Cables","Google (Dunant) · Meta · Microsoft (PEACE, IOX)","Controls 60%+ of India's global bandwidth","USA"],
                    ["Enterprise Software","Microsoft 365 · SAP · Oracle · Salesforce","80%+ of India Inc. runs on US software","USA/Germany"],
                  ] as [string,string,string,string][]).map(([cat,vendor,share,origin])=>(
                    <div key={cat} className="flex items-start gap-3 border-b border-white/10 pb-3">
                      <div className="bg-red-800 text-white text-[8px] font-mono font-black px-2 py-1 rounded min-w-[36px] text-center mt-0.5">{origin}</div>
                      <div className="flex-1">
                        <div className="text-[11px] font-mono font-black text-white">{cat}</div>
                        <div className="text-[9px] text-white/40 font-mono mt-0.5">{vendor}</div>
                        <div className="text-[9px] text-red-400 font-mono font-black mt-0.5">▶ {share}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 bg-amber-50 border border-amber-600/30 rounded">
                <div className="text-[10px] font-mono font-black text-amber-900 uppercase mb-2">The Doomsday Scenario</div>
                <p className="text-[12px] font-serif italic text-amber-900/80 leading-relaxed">"If the US imposes tech sanctions — as it did on Russia (2022) and Huawei (2019) — AWS pulls servers, Microsoft kills licences, Google disables Android. India's banking, logistics, government, and military systems go dark within 72 hours. This is a documented, executable attack vector."</p>
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="p-5 bg-red-900 text-white rounded shadow-2xl">
                <div className="text-[9px] font-mono text-red-300 uppercase font-black mb-1">True Cloud Sovereignty</div>
                <div className="text-[52px] font-orbitron font-black leading-none">3%</div>
                <div className="text-[9px] text-red-300/50 uppercase mt-1">India-controlled cloud (2026)</div>
                <p className="text-[9px] font-mono text-red-200/30 mt-2 italic">NIC + Meghraj Gov Cloud = 3% of total workloads. 97% on US servers.</p>
              </div>
              <div className="p-4 bg-slate-100 rounded border border-black/10">
                <div className="text-[9px] font-mono font-black uppercase text-black/40 mb-3">Sovereignty Score by Domain (2026)</div>
                {([["Cloud Infra","3%",3],["AI / LLM","1%",1],["Chip Fabs","5%",5],["OS / Software","8%",8],["Connectivity","12%",12],["Kaveri Engine","28%",28]] as [string,string,number][]).map(([it,v,w])=>(
                  <div key={it} className="mb-2">
                    <div className="flex justify-between text-[8px] font-mono mb-0.5">
                      <span className="font-black">{it}</span>
                      <span className="text-red-700 font-black">{v}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/10 rounded-full">
                      <div className="h-full bg-red-600 rounded-full" style={{width:`${w}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-black text-white rounded">
                <div className="text-[9px] font-mono text-amber-500 uppercase font-black mb-2">VAJRA 2047 Digital Targets</div>
                <ul className="space-y-1.5 text-[9px] font-mono text-white/60">
                  <li><span className="text-amber-400 font-black">▶ BharatCloud</span> — 70% govt workloads on sovereign infra</li>
                  <li><span className="text-amber-400 font-black">▶ BharatGPT-Military</span> — classified air-gapped AI stack</li>
                  <li><span className="text-amber-400 font-black">▶ Shakti CPU (2nm)</span> — India-designed military chip</li>
                  <li><span className="text-amber-400 font-black">▶ BOSS OS</span> — Bharat OS on all govt terminals</li>
                  <li><span className="text-amber-400 font-black">▶ Kaveri 110kN</span> — full indigenous engine for Tejas Mk2</li>
                  <li><span className="text-amber-400 font-black">▶ NavIC+</span> — GPS-free timing + positioning layer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    case 7:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 07 // The Alpine Wall: High-Altitude Border Dominance</h4>
          <p className="text-[16px] font-serif leading-relaxed text-black/90">
            The 3,488-km Line of Actual Control with China is India's most demanding operational theatre. Post-Galwan 2020, India has executed the most aggressive Himalayan military buildup since 1962—constructing geothermal-powered subterranean military cities, advanced air-strips, and <span className="font-black">72 new border roads</span> under Project BRO-BOLD.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {([
                {area:"Ladakh (NW Sector)",infra:"Daulat Beg Oldie ALG + Nyoma Airbase expansion",troops:"50,000+ permanent (post-2020)",threat:"PLA Western Theatre Command"},
                {area:"Arunachal (NE Sector)",infra:"Tawang tunnel + Itanagar rail + 12 advanced ALGs",troops:"XXXIII Corps + III Corps reinforced",threat:"PLA Eastern Theatre Command"},
                {area:"Sikkim (Central)",infra:"Nathula-Dokam road network fortified",troops:"XVII Mountain Strike Corps",threat:"PLA Tibet Military District"},
              ] as {area:string,infra:string,troops:string,threat:string}[]).map((s,i)=>(
                <div key={i} className="p-5 bg-black text-white rounded shadow-xl">
                  <div className="text-[9px] font-mono text-amber-500 font-black uppercase mb-2">{s.area}</div>
                  <div className="text-[11px] font-mono text-white/60 mb-2">{s.infra}</div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-[9px] font-mono text-white/30">{s.troops}</span>
                    <span className="text-[9px] font-mono text-red-400 font-black">{s.threat}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-slate-100 rounded border border-black/10">
                <div className="text-[10px] font-mono font-black uppercase text-black/40 mb-4">Himalayan Infrastructure Sprint (post-2020)</div>
                {([["New Border Roads","72 highways","100%"],["Advanced Landing Grounds","22 new ALGs","80%"],["ITBP Posts Upgraded","180+ posts","100%"],["Tunnel Projects","15 strategic tunnels","65%"]] as [string,string,string][]).map(([it,v,p])=>(
                  <div key={it} className="mb-3">
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="font-black">{it}</span>
                      <span className="text-amber-700 font-black">{v}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/10 rounded-full">
                      <div className="h-full bg-black rounded-full" style={{width:p}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-amber-600 text-white rounded shadow-xl">
                <div className="text-[10px] font-mono font-black uppercase mb-2">Vajra Doctrine — Alpine</div>
                <p className="text-[13px] font-serif italic leading-relaxed">"Galwan taught India that the border is permanent. Vajra ensures every inch is enforced 365 days a year, at every altitude."</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 8:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 08 // The International Rupee (ISR): End of Dollar Diplomacy</h4>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-6">
              <p className="text-[15px] font-serif leading-relaxed text-black/90">
                The USD has served as the world's reserve currency since Bretton Woods (1944). India's $4.5T economy, combined with its diplomatic leadership of the Global South (164 nations), positions the <span className="font-black">International Rupee (ISR)</span> as the first credible challenger since the Euro. The VAJRA financial strategy: settle all Global South trade in ISR by 2035, backed by India's industrial output, 800+ tonnes of gold reserves, and UPI-powered digital financial infrastructure.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 bg-black text-white rounded shadow-xl">
                  <span className="text-[9px] font-mono text-amber-500 uppercase font-black">Gold Reserves</span>
                  <div className="text-[28px] font-orbitron font-black leading-none mt-2">800+T</div>
                  <span className="text-[9px] text-white/30 uppercase">Metric Tonnes</span>
                </div>
                <div className="p-5 bg-emerald-900 text-white rounded">
                  <span className="text-[9px] font-mono text-emerald-300 uppercase font-black">UPI Transactions</span>
                  <div className="text-[28px] font-orbitron font-black leading-none mt-2">18B+</div>
                  <span className="text-[9px] text-emerald-300/50 uppercase">Monthly (2026)</span>
                </div>
                <div className="p-5 bg-blue-900 text-white rounded">
                  <span className="text-[9px] font-mono text-blue-300 uppercase font-black">ISR Trade Partners</span>
                  <div className="text-[28px] font-orbitron font-black leading-none mt-2">22</div>
                  <span className="text-[9px] text-blue-300/50 uppercase">Nations (2026)</span>
                </div>
              </div>
              <div className="p-6 bg-slate-100 rounded border border-black/10">
                <div className="text-[10px] font-mono font-black uppercase text-black/40 mb-4">ISR Adoption Path (% Global South Trade Settled in INR)</div>
                {([["2024","3.2%",3],["2026","8.5%",9],["2030","22%",22],["2035","45%",45],["2047","80%",80]] as [string,string,number][]).map(([yr,pct,w])=>(
                  <div key={yr} className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] font-mono text-black/40 w-8">{yr}</span>
                    <div className="flex-1 h-2 bg-black/10 rounded-full">
                      <div className="h-full bg-amber-600 rounded-full" style={{width:`${w}%`}}/>
                    </div>
                    <span className="text-[10px] font-mono font-black text-amber-700 w-10">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="p-6 bg-amber-600 text-white rounded shadow-xl">
                <div className="text-[10px] font-mono font-black uppercase mb-2">Financial Weapons</div>
                <ul className="space-y-2 text-[11px] font-mono">
                  <li className="flex gap-2"><span className="text-amber-200">▶</span>UPI global integration (85+ countries)</li>
                  <li className="flex gap-2"><span className="text-amber-200">▶</span>e-Rupee CBDC for G-South settlement</li>
                  <li className="flex gap-2"><span className="text-amber-200">▶</span>India Stack — World's most advanced DPI</li>
                  <li className="flex gap-2"><span className="text-amber-200">▶</span>SWIFT alternative: RuPay + CIPS bypass</li>
                </ul>
              </div>
              <div className="p-5 border-4 border-double border-black/10 rounded">
                <div className="text-[9px] font-mono font-black uppercase text-black/30 mb-2">India GDP vs. $ Hegemony Threshold</div>
                <p className="text-[13px] font-serif italic text-black/70 leading-relaxed">"When a single nation's GDP crosses 15% of global output, its currency becomes a natural reserve. India crosses that threshold by 2047."</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 9:
      return (
        <div className="flex flex-col gap-10">
          <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 09 // Quantum Communications: The Unbreakable Grid</h4>
          <p className="text-[15px] font-serif leading-relaxed text-black/90">
            India's military communications network is the most critical and most vulnerable node in VAJRA. The solution: <span className="font-black">Quantum Key Distribution (QKD)</span> via dedicated satellite. QKD exploits quantum entanglement to create encryption keys that are <span className="font-black italic underline">mathematically impossible</span> to intercept without detection—immune even to future quantum computers that could break all current RSA / AES encryption.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-6 bg-black text-white rounded shadow-xl">
                <div className="text-[10px] font-mono text-amber-500 font-black uppercase mb-4">QKD Implementation Roadmap</div>
                {([
                  ["QKD Backbone (Army)","Delhi-Agra-Pune link","ACTIVE"],
                  ["NavIC Integration","GPS-independent PNT layer","OPERATIONAL"],
                  ["QSAT-1 (ISRO)","Dedicated QKD satellite","2027 Launch"],
                  ["VAJRA Net-Centric","All service nodes encrypted","2030 Target"],
                ] as [string,string,string][]).map(([it,desc,st])=>(
                  <div key={it} className="flex justify-between items-start border-b border-white/10 pb-3 mb-3">
                    <div>
                      <div className="text-[11px] font-mono font-black">{it}</div>
                      <div className="text-[9px] text-white/30 font-mono">{desc}</div>
                    </div>
                    <span className={`text-[8px] font-mono font-black ${st==="ACTIVE"||st==="OPERATIONAL"?"text-emerald-400":"text-amber-400"}`}>{st}</span>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-emerald-900 text-white rounded">
                <div className="text-[9px] font-mono text-emerald-300 uppercase font-black mb-2">NavIC Constellation</div>
                <div className="text-[28px] font-orbitron font-black mt-1">7 + 9</div>
                <div className="text-[9px] text-emerald-300/50 uppercase">Satellites Operational + Planned</div>
                <p className="text-[10px] font-mono text-emerald-200/50 mt-3 italic">India's own GPS — fully operational domestic PNT system. Cannot be switched off by foreign powers.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-slate-100 rounded border border-black/10">
                <div className="text-[10px] font-mono font-black uppercase text-black/40 mb-4">India Space Assets (2026)</div>
                {([["Operational Satellites","54+"],["Spy / ISR Satellites","8 (RISAT, Cartosat)"],["Communication Sat.","GSAT series (15+)"],["ASAT Capability","Tested 2019 (Mission Shakti)"],["Space Docking","Demonstrated 2025 (SpaDeX)"]] as [string,string][]).map(([k,v])=>(
                  <div key={k} className="flex justify-between border-b border-black/5 pb-2 mb-2">
                    <span className="text-[10px] font-mono text-black/60">{k}</span>
                    <span className="text-[10px] font-mono font-black text-black">{v}</span>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-blue-900 text-white rounded shadow-xl">
                <div className="text-[9px] font-mono text-blue-300 uppercase font-black mb-2">Quantum Security Advantage</div>
                <p className="text-[12px] font-mono text-white/70 italic leading-relaxed">"A quantum-encrypted communication channel cannot be hacked—even by the most powerful future quantum computer. By 2040, VAJRA Command will operate on a QKD-secured satellite mesh that no adversary can penetrate."</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 10:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 10 // Neighborhood First 2.0: South Asian Defense Pact</h4>
             <p className="text-[15px] font-serif leading-relaxed text-black/90">
               India acts as the <span className="font-black">sole security guarantor</span> for South Asia — pushing its defensive perimeter 2,000 km beyond its actual borders. The South Asian Defense Pact (SADP) prevents any extra-regional power from establishing a military foothold in India's backyard.
             </p>
             <div className="grid grid-cols-2 gap-4">
               {([
                 ["Nepal","Security Treaty 1950 (updated)","China BRI penetration — 3+ projects","ALLY"],
                 ["Bhutan","India bears sole security guarantee","Doklam plateau — PLA pressure","PARTNER"],
                 ["Sri Lanka","Hambantota watch — debt trap","China lease of Hambantota Port","MONITORED"],
                 ["Maldives","India First policy reinstated 2024","PLAN atoll logistics interest","ALLY"],
                 ["Bangladesh","Post-2024 gov recalibrating","US Saint Martin Island interest","VOLATILE"],
                 ["Myanmar","Junta arms diversification","China-Myanmar Econ. Corridor","WATCH"],
               ] as [string,string,string,string][]).map(([nm,rel,risk,st],i)=>(
                 <div key={i} className="p-4 bg-white border border-black/10 rounded shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                     <div className="text-[13px] font-mono font-black">{nm}</div>
                     <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded text-white ${st==="ALLY"?"bg-emerald-700":st==="PARTNER"?"bg-blue-700":st==="VOLATILE"?"bg-red-700":"bg-amber-600"}`}>{st}</span>
                   </div>
                   <div className="text-[9px] font-mono text-black/50 mb-1">{rel}</div>
                   <div className="text-[9px] font-mono text-red-700 italic font-black">⚠ {risk}</div>
                 </div>
               ))}
             </div>
             <div className="p-5 bg-black text-white rounded shadow-xl flex justify-between items-center">
               <div>
                 <div className="text-[9px] font-mono text-amber-500 uppercase font-black">SADP Perimeter Extension</div>
                 <div className="text-[36px] font-orbitron font-black leading-none mt-1">+2,000 KM</div>
               </div>
               <p className="text-[11px] font-mono text-white/50 italic max-w-xs leading-relaxed">"India's border doesn't end at the Wagah crossing. It ends wherever our strategic interests end." — VAJRA Doctrine, Clause 7</p>
             </div>
          </div>
       );
    case 11:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 11 // Polar Strategy: Claiming the Post-Ice World</h4>
             <div className="grid grid-cols-2 gap-8">
               <div className="space-y-6">
                 <p className="text-[15px] font-serif leading-relaxed text-black/90">
                   By 2040, <span className="font-black">40% of Arctic sea lanes</span> will be navigable year-round, unlocking $35 trillion in mineral wealth. India's VAJRA Polar Strategy positions the republic as a non-Arctic state with Arctic ambitions — investing now to claim stakes in the defining resource competition of the century.
                 </p>
                 <div className="p-5 bg-black text-white rounded shadow-xl">
                   <div className="text-[9px] font-mono text-amber-500 uppercase font-black mb-4">India's Polar Research Assets</div>
                   {([
                     ["Maitri Station","Antarctica","ACTIVE (1989)"],
                     ["Bharati Station","Larsemann Hills, Antarctica","ACTIVE (2012)"],
                     ["Himadri Station","Svalbard, Arctic","ACTIVE (2008)"],
                     ["INS Kesari-class IB","Future Nuclear Icebreaker","2031 Launch"],
                   ] as [string,string,string][]).map(([nm,loc,st])=>(
                     <div key={nm} className="border-b border-white/10 pb-3 mb-3">
                       <div className="text-[11px] font-mono font-black">{nm}</div>
                       <div className="flex justify-between mt-1">
                         <span className="text-[9px] text-white/30 font-mono">{loc}</span>
                         <span className="text-[8px] font-mono text-emerald-400 font-black">{st}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="space-y-4">
                 <div className="p-5 bg-blue-900 text-white rounded shadow-xl">
                   <div className="text-[9px] font-mono text-blue-300 uppercase font-black mb-2">Arctic Mineral Wealth</div>
                   <div className="text-[28px] font-orbitron font-black leading-none">$35T+</div>
                   <div className="text-[9px] text-blue-300/50 uppercase mt-1">Estimated Resource Value</div>
                   <p className="text-[10px] font-mono text-blue-200/50 mt-3 italic">Oil, gas, rare earth minerals, gold beneath melting ice sheets.</p>
                 </div>
                 <div className="p-5 bg-slate-100 border border-black/10 rounded">
                   <div className="text-[9px] font-mono font-black uppercase text-black/40 mb-3">Polar Treaty Status</div>
                   <ul className="space-y-2 text-[10px] font-mono text-black/70">
                     <li>• Arctic Council — Observer Status</li>
                     <li>• Antarctic Treaty — signatory (1983)</li>
                     <li>• Deep-sea mining rights (Indian Ocean Ridge)</li>
                     <li>• Arctic Science Agreement active</li>
                   </ul>
                 </div>
                 <div className="p-5 bg-amber-600 text-white rounded">
                   <div className="text-[10px] font-mono font-black uppercase mb-2">VAJRA Polar Directive</div>
                   <p className="text-[12px] font-serif italic leading-relaxed">"The nations that invest in poles today own the resources of tomorrow. India will not arrive late to this frontier."</p>
                 </div>
               </div>
             </div>
          </div>
       );
    case 12:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 12 // The Viral Shield: National Biodefense Architecture</h4>
             <div className="grid grid-cols-12 gap-8">
               <div className="col-span-8 space-y-6">
                 <p className="text-[15px] font-serif leading-relaxed text-black/90">
                   COVID-19 cost India an estimated 5.3 million lives and $2.1T in economic damage. The Viral Shield doctrine ensures this never repeats. Using AI-driven genomic sequencing and the world's largest vaccine manufacturing base (Serum Institute: 1.5B doses/year alone), India can identify a novel bio-threat and synthesize a <span className="font-black">national vaccine response in 72 hours</span>.
                 </p>
                 <div className="p-5 bg-red-50 border-y-2 border-red-900/10">
                   <div className="grid grid-cols-3 gap-4 text-center">
                     <div>
                       <div className="text-[9px] font-mono text-red-900/50 uppercase font-black">Response Speed</div>
                       <div className="text-[32px] font-orbitron font-black text-red-900 leading-none mt-1">72h</div>
                     </div>
                     <div className="border-x border-red-900/10">
                       <div className="text-[9px] font-mono text-red-900/50 uppercase font-black">Vaccine Prod. Cap.</div>
                       <div className="text-[28px] font-orbitron font-black text-red-900 leading-none mt-1">5B/yr</div>
                       <div className="text-[8px] text-red-900/30 uppercase">doses annually</div>
                     </div>
                     <div>
                       <div className="text-[9px] font-mono text-red-900/50 uppercase font-black">Genomic Labs</div>
                       <div className="text-[28px] font-orbitron font-black text-red-900 leading-none mt-1">22</div>
                       <div className="text-[8px] text-red-900/30 uppercase">INSACOG Network</div>
                     </div>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="text-[10px] font-mono font-black uppercase text-black/40">Biodefense Response Timeline</div>
                   {([
                     ["0-2h","AI threat signature identification","bg-red-700"],
                     ["2-8h","Genomic sequencing complete","bg-red-600"],
                     ["8-24h","Candidate vaccine / antidote design","bg-amber-600"],
                     ["24-48h","Emergency production authorized","bg-amber-500"],
                     ["48-72h","National distribution initiated","bg-emerald-600"],
                   ] as [string,string,string][]).map(([t,step,col])=>(
                     <div key={t} className="flex items-center gap-3">
                       <div className={`${col} text-white text-[9px] font-mono font-black px-2 py-1 rounded min-w-[48px] text-center`}>{t}</div>
                       <span className="text-[11px] font-mono text-black/70">{step}</span>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="col-span-4 space-y-4">
                 <div className="p-5 bg-black text-white rounded shadow-2xl">
                   <div className="text-[9px] font-mono text-amber-500 uppercase font-black mb-2">Vaccine Export (2021-23)</div>
                   <div className="text-[32px] font-orbitron font-black">1.6B</div>
                   <div className="text-[9px] text-white/30 uppercase mt-1">Doses Exported Globally</div>
                   <p className="text-[10px] font-mono text-white/40 mt-3 italic">"Vaccine Maitri" — India as the world's pharmacy.</p>
                 </div>
                 <div className="p-5 bg-red-900 text-white rounded">
                   <div className="text-[9px] font-mono text-red-300 uppercase font-black mb-2">Bio-Threat Priority</div>
                   <div className="text-[20px] font-orbitron font-black leading-none">CRITICAL</div>
                   <p className="text-[9px] text-red-200/50 mt-2 font-mono">State-sponsored bio-weapons are the invisible arms race of the 21st century.</p>
                 </div>
               </div>
             </div>
          </div>
       );
    case 13:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 13 // The P6 Era: UNSC Reform & India's Permanent Seat</h4>
             <div className="grid grid-cols-12 gap-8">
               <div className="col-span-8 space-y-6">
                 <p className="text-[15px] font-serif leading-relaxed text-black/90">
                   The UN Security Council's P5 structure was designed in 1945 for a world dominated by WWII victors. In 2026, India — representing <span className="font-black">17% of humanity</span> and 9.5% of global GDP — remains excluded from veto power. VAJRA's diplomatic objective: the <span className="font-black">P6 structure</span> formalized before 2035.
                 </p>
                 <div className="overflow-hidden rounded border border-black/10 shadow-sm">
                   <table className="w-full text-[11px] font-mono">
                     <thead>
                       <tr className="bg-black text-white">
                         <th className="text-left p-3 uppercase text-[9px]">Member</th>
                         <th className="text-right p-3 uppercase text-[9px]">GDP</th>
                         <th className="text-right p-3 uppercase text-[9px]">Population</th>
                         <th className="text-right p-3 uppercase text-[9px]">Seat Since</th>
                       </tr>
                     </thead>
                     <tbody>
                       {([
                         ["USA","$29T","335M","1945"],
                         ["China","$19T","1.41B","1971"],
                         ["Russia","$1.8T","145M","1945"],
                         ["UK","$3.2T","67M","1945"],
                         ["France","$3.1T","68M","1945"],
                         ["India (P6 Target)","$4.5T","1.44B","???"],
                       ] as [string,string,string,string][]).map(([m,g,p,s],i)=>(
                         <tr key={m} className={`${m.includes("India")?"bg-amber-50 font-black border-b-2 border-amber-400":i%2===0?"bg-white":"bg-slate-50"}`}>
                           <td className="p-3 font-black">{m}</td>
                           <td className="p-3 text-right">{g}</td>
                           <td className="p-3 text-right">{p}</td>
                           <td className={`p-3 text-right ${m.includes("India")?"text-red-600 font-black":"text-black/40"}`}>{s}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 <div className="p-5 bg-amber-500/10 border border-amber-600/30 rounded">
                   <div className="text-[9px] font-mono font-black text-amber-900 uppercase mb-2">VAJRA Reform Path</div>
                   <p className="text-[12px] font-serif italic text-amber-900/70 leading-relaxed">"The G4 (India, Germany, Japan, Brazil) reform coalition holds 25% of UNGA votes. A two-thirds UNGA majority can force a UNSC amendment—bypassing P5 opposition."</p>
                 </div>
               </div>
               <div className="col-span-4 space-y-4">
                 <div className="p-6 bg-black text-white rounded shadow-2xl flex flex-col items-center justify-center text-center gap-4">
                   <div className="text-[10px] font-mono text-amber-500 uppercase font-black">India's Seat Designation</div>
                   <div className="text-[56px] font-orbitron font-black leading-none">P6</div>
                   <div className="text-[10px] font-mono text-white/30 uppercase">Largest Nation Without UNSC Veto</div>
                 </div>
                 <div className="p-5 bg-emerald-900 text-white rounded">
                   <div className="text-[9px] font-mono text-emerald-300 uppercase font-black mb-1">UNGA Support</div>
                   <div className="text-[28px] font-orbitron font-black">124</div>
                   <div className="text-[9px] text-emerald-300/50 uppercase">Nations backing India's seat</div>
                 </div>
               </div>
             </div>
          </div>
       );
    case 14:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 14 // The Dharma of Power: Philosophical Foundation</h4>
             <div className="bg-[#fcf8e8] p-10 rounded border-l-[16px] border-amber-600 shadow-xl flex flex-col gap-8">
               <h5 className="text-[20px] font-serif font-black italic text-amber-900 border-b border-amber-900/10 pb-4">"Force for Order, Protection of Dharma"</h5>
               <p className="text-[17px] font-serif leading-relaxed text-black/90 italic">
                 "Power is not for expansion, but for the protection of Dharma — universal Order. Military strength in VAJRA doctrine is not an expression of aggression; it is the <span className="font-black underline">last shield of the righteous</span>. Any threat to the Republic is met with Vajra-level finality."
               </p>
               <div className="grid grid-cols-3 gap-4">
                 {([
                   ["Satya","Truth — intelligence operations rooted in verified fact, not ideology. No manufactured casus belli."],
                   ["Ahimsa","Non-violence preferred. The Vajra strikes only when all diplomatic channels fail and the sovereign is threatened."],
                   ["Dharma","Righteous order — India defends civilizational continuity, not mere territory or resources."],
                 ] as [string,string][]).map(([p,d],i)=>(
                   <div key={i} className="p-4 bg-amber-900/10 rounded border border-amber-900/20">
                     <div className="text-[14px] font-orbitron font-black text-amber-900 mb-2">{p}</div>
                     <p className="text-[10px] font-mono text-amber-900/60 italic leading-relaxed">{d}</p>
                   </div>
                 ))}
               </div>
               <div className="flex justify-end pt-6 border-t border-amber-900/10">
                 <div className="flex flex-col items-center opacity-50">
                   <div className="w-24 h-[2px] bg-black mb-1" />
                   <span className="text-[9px] font-mono text-black uppercase font-black">VAJRA Council Seal // 2047</span>
                 </div>
               </div>
             </div>
          </div>
       );
    case 15:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 15 // The Legacy Protocol: VAJRA Command Transfer</h4>
             <div className="grid grid-cols-12 gap-8">
               <div className="col-span-8 flex flex-col gap-5">
                 <p className="text-[15px] font-serif leading-relaxed text-black/90">
                   The formal authorization of all 2047 protocols, transferring command from the existing tri-service structure to the <span className="font-black">Integrated VAJRA Command (IVC)</span> — a unified military command co-led by the CDS and an AI-augmented strategic operations centre.
                 </p>
                 <div className="space-y-3">
                   <div className="text-[10px] font-mono font-black uppercase text-black/40">VAJRA Command Milestones</div>
                   {([
                     ["2019","CDS post created — Gen. Bipin Rawat (first CDS)","DONE"],
                     ["2022","Tri-Services Integrated Theatre Command proposed","ACTIVE"],
                     ["2025","VAJRA Strategic Command Centre (AI-augmented HQ)","IN PROGRESS"],
                     ["2030","Integrated Maritime Theatre Command operational","TARGET"],
                     ["2035","Air Defence Command — full AI-HUMINT fusion","TARGET"],
                     ["2047","Full IVC — VAJRA Command 1.0 online","VISION"],
                   ] as [string,string,string][]).map(([yr,ev,st])=>(
                     <div key={yr} className="flex gap-4 items-start">
                       <div className="bg-black text-white text-[9px] font-mono font-black px-2 py-1 rounded min-w-[40px] text-center">{yr}</div>
                       <div className="flex-1 text-[11px] font-mono text-black/70 pt-1">{ev}</div>
                       <span className={`text-[8px] font-mono font-black ${st==="DONE"?"text-emerald-700":st==="ACTIVE"?"text-amber-700":"text-black/30"}`}>{st}</span>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="col-span-4 space-y-4">
                 <div className="p-8 bg-black text-white rounded shadow-2xl flex flex-col items-center justify-center text-center gap-4">
                   <Lock className="w-12 h-12 text-amber-500" />
                   <span className="text-[10px] font-mono text-amber-500 uppercase font-black">SYSTEM SEALING...</span>
                   <div className="mt-2 w-full h-[1px] bg-white/10" />
                   <p className="text-[9px] font-mono text-white/30 uppercase leading-relaxed">Human Oversight: 15%<br/>AI Core Execution: 85%<br/>VAJRA Net: Absolute</p>
                 </div>
                 <div className="p-5 border-4 border-double border-black/10 rounded text-center">
                   <div className="text-[9px] font-mono font-black uppercase text-black/30 mb-2">Transition Progress</div>
                   <div className="text-[28px] font-orbitron font-black">37%</div>
                   <div className="text-[9px] text-black/30 uppercase">of IVC Protocols Active</div>
                 </div>
               </div>
             </div>
          </div>
       );
    case 16:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 16 // The Scoreboard: 2026 Reality vs. 2047 VAJRA Targets</h4>
             <p className="text-[13px] font-serif leading-relaxed text-black/60 italic">
               This is the only page that matters. Every number below is a target, a gap, and a mandate. VAJRA 2047 is not complete until every metric moves from the left column to the right.
             </p>
             <div className="overflow-hidden rounded border border-black/10 shadow-sm">
               <table className="w-full text-[11px] font-mono">
                 <thead>
                   <tr className="bg-black text-white">
                     <th className="text-left p-3 uppercase text-[9px] font-black">Domain</th>
                     <th className="text-left p-3 uppercase text-[9px] font-black">Metric</th>
                     <th className="text-center p-3 uppercase text-[9px] font-black text-red-400">2026 Reality</th>
                     <th className="text-center p-3 uppercase text-[9px] font-black text-amber-400">2047 VAJRA Target</th>
                     <th className="text-center p-3 uppercase text-[9px] font-black text-white/30">Change</th>
                   </tr>
                 </thead>
                 <tbody>
                   {([
                     ["Economy","GDP (Nominal)","$4.5 Trillion","$30 Trillion","▲ 567%"],
                     ["Economy","GDP Per Capita","$3,100","$20,000+","▲ 545%"],
                     ["Economy","Global GDP Rank","#4 (behind USA/China/Germany)","#2 (behind USA only)","▲ +2"],
                     ["Economy","Manufacturing % of GDP","17%","25%+","▲ +8pp"],
                     ["Air Force","IAF Combat Squadrons","~30 (vs 42 sanctioned)","60 squadrons","▲ +30 SQ"],
                     ["Air Force","5th/6th Gen Aircraft","0 (none in service)","200+ AMCA","▲ NEW"],
                     ["Air Force","Loyal Wingman UCAVs","<10 (prototype only)","500+ CATS Warrior","▲ NEW"],
                     ["Air Force","Indigenous Engine %","0% (100% imported)","80% Kaveri-derived","▲ +80pp"],
                     ["Navy","Total Warships","150+","350+ warships","▲ +130%"],
                     ["Navy","Aircraft Carriers","2 (Vikrant + Vikramaditya)","5 Nuclear CBGs","▲ +3"],
                     ["Navy","Nuclear Submarines","2 SSBN (Arihant, Arighat)","8+ SSBNs","▲ +6"],
                     ["Navy","Fleet Carriers Tonnage","~89,500 tonnes (2 carriers)","500,000+ tonnes (5 CBGs)","▲ 5x"],
                     ["Nuclear","Warhead Count (est.)","160–170","400–500","▲ ~2.5x"],
                     ["Nuclear","Delivery Systems","Triad (land+sea+air)","Triad + Hypersonic HGV","▲ +HGV"],
                     ["Nuclear","Agni-VI-H Status","In development","Deployed, Mach 12+","▲ ACTIVE"],
                     ["Space","Active Satellites","54","200+","▲ +272%"],
                     ["Space","Crewed Space Station","None","Bharatstaion (planned 2035)","▲ NEW"],
                     ["Space","Lunar Presence","Chandrayaan-3 (lander)","Permanent Lunar Outpost","▲ NEW"],
                     ["Digital","Cloud Sovereignty","3% (NIC/Meghraj)","70% BharatCloud","▲ +67pp"],
                     ["Digital","Military AI System","None (using US AI)","BharatGPT-Military (air-gapped)","▲ NEW"],
                     ["Digital","Indigenous Chip (nm)","None (all imported)","2nm Shakti CPU in production","▲ NEW"],
                     ["Digital","Subsea Cable Ownership","0%","30%+ owned/controlled","▲ NEW"],
                     ["Population","GDP Per Capita","$3,100","$20,000+","▲ 6x"],
                     ["Population","Poverty Rate (<$2.15/day)","11% (est.)","<1%","▲ -10pp"],
                     ["Diplomacy","UNSC Status","Non-permanent observer","P6 permanent member","▲ HISTORIC"],
                     ["Diplomacy","Global South Lead","Informal (G20 presidency)","Formalised SADP + ISR bloc","▲ FORMALISED"],
                   ] as [string,string,string,string,string][]).map(([dom,metric,now,target,chg],i)=>(
                     <tr key={i} className={i%2===0?"bg-white":"bg-slate-50/50"}>
                       <td className="p-3 text-[9px] font-mono font-black text-black/30 uppercase">{dom}</td>
                       <td className="p-3 font-black text-black">{metric}</td>
                       <td className="p-3 text-center text-red-700 font-black">{now}</td>
                       <td className="p-3 text-center text-emerald-700 font-black">{target}</td>
                       <td className="p-3 text-center text-amber-600 font-black text-[10px]">{chg}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="p-5 bg-black text-white rounded flex justify-between items-center">
               <div>
                 <div className="text-[9px] font-mono text-amber-500 uppercase font-black">The Central Target</div>
                 <div className="text-[28px] font-orbitron font-black leading-none mt-1">$30T · 60SQ · 5CV · P6</div>
               </div>
               <p className="text-[11px] font-mono text-white/40 italic max-w-xs leading-relaxed">"GDP is the foundation. Squadrons are the shield. Carriers are the power projection. The UNSC seat is the crown."</p>
             </div>
          </div>
       );
    case 17:
       return (
          <div className="flex flex-col gap-10">
             <h4 className="text-[14px] font-mono font-black text-black border-b-2 border-black pb-2 uppercase tracking-widest">Page 17 // Unfinished Business: The Critical Gaps</h4>
             <div className="p-3 bg-red-700 text-white font-mono text-[10px] font-black uppercase tracking-[0.3em] text-center">
               THE UNFINISHED — These gaps must close before VAJRA 2047 is achievable
             </div>
             <div className="space-y-4">
               {([
                 {gap:"High-Thrust Jet Engine — Full Self-Reliance",data:"Kaveri GTX-35VS: 83kN (dry). Target: 110kN (Tejas Mk2) then 130kN (AMCA). Timeline: 2030 / 2038.",severity:"CRITICAL",progress:35,detail:"Today: 100% import dependency on GE-414, AL-31FP, M88. A single sanctions order could ground the entire IAF. Single largest strategic vulnerability."},
                 {gap:"Semiconductor Fabrication at Scale",data:"Tata-PSMC 28nm fab (Gujarat) breaks ground 2024. Need 5nm/3nm class for military AI chips by 2035.",severity:"HIGH",progress:20,detail:"India designs chips (Shakti RISC-V) but cannot fab at volume. Every military system uses imported semiconductors."},
                 {gap:"IAF Squadron Deficit (30 of 42 Required)",data:"Currently ~30 squadrons. Sanctioned: 42. Gap: 12 SQ = ~250 aircraft. Jaguar + MiG-29 retiring 2025-30.",severity:"CRITICAL",progress:71,detail:"HAL current production: 8 aircraft/year. Required: 24/year. Tejas Mk1A order (83 ac) + Mk2 can close gap by 2033 if output scaling succeeds."},
                 {gap:"Border Dispute Finality (China + Pakistan)",data:"LAC: 3,488 km unresolved. LoC: 740 km contested. Post-Galwan (2020) status quo holds but is not settled.",severity:"HIGH",progress:15,detail:"VAJRA doctrine: overwhelming deterrence — not resolution through diplomacy, but making aggression suicidal for adversaries."},
                 {gap:"Carrier Strike Group Expansion (2 to 5)",data:"INS Vikrant (active) + Vikramaditya = 2. Target: 5 nuclear-powered CBGs by 2047.",severity:"MEDIUM",progress:40,detail:"IAC-2 design underway. Nuclear propulsion for IAC-3/4/5 requires mastering naval reactor tech. BARC + DRDO roadmap: 15 years."},
               ] as {gap:string,data:string,severity:string,progress:number,detail:string}[]).map((g,i)=>(
                 <div key={i} className="p-4 bg-white border border-black/10 rounded shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                     <div className="text-[11px] font-mono font-black uppercase">{g.gap}</div>
                     <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded text-white ${g.severity==="CRITICAL"?"bg-red-700":g.severity==="HIGH"?"bg-amber-600":"bg-slate-600"}`}>{g.severity}</span>
                   </div>
                   <div className="text-[10px] font-mono text-amber-700 font-black mb-2">{g.data}</div>
                   <div className="w-full h-1.5 bg-black/5 rounded-full mb-2">
                     <div className={`h-full rounded-full ${g.severity==="CRITICAL"?"bg-red-600":"bg-amber-500"}`} style={{width:`${g.progress}%`}}/>
                   </div>
                   <p className="text-[10px] font-serif text-black/50 italic leading-relaxed">{g.detail}</p>
                 </div>
               ))}
             </div>
          </div>
       );
    case 18:
       return (
          <div className="flex flex-col gap-10">
             <div className="border-b-4 border-black pb-6 flex justify-between items-end">
                <h4 className="text-[24px] font-orbitron font-black text-black uppercase tracking-tighter">Page 18 // Who Will Stop Us?</h4>
                <span className="text-[10px] font-mono text-black/40">FINAL RISK ASSESSMENT</span>
             </div>
             <p className="text-[15px] font-serif leading-relaxed text-black/80">
               Every grand strategy has adversaries. VAJRA doctrine does not pretend otherwise — it calculates them, models their responses, and architects India's posture to render their opposition irrelevant.
             </p>
             <div className="space-y-4">
               {([
                 {actor:"China — The Peer Competitor",risk:"CRITICAL",threat:"String of Pearls encirclement (Pakistan, Myanmar, Sri Lanka, Maldives, Djibouti). PLA modernization targeting 4th carrier by 2030. BRI debt-trap across India's neighborhood.",india:"Himalayan buildup (50K+ troops in Ladakh), Tawang + QUAD navalization, Agni-VI-H giving credible first-strike certainty.",color:"border-red-700 bg-red-700"},
                 {actor:"Pakistan — The Proxy Actor",risk:"HIGH",threat:"Nuclear arsenal growing (165+ warheads). Cross-border terrorism. China-Pakistan Economic Corridor (CPEC) integrating PLA logistics into Pakistan soil.",india:"Cold Start Doctrine + Balakot precedent established. Agni-I/II/III short-medium range deterrence. INS Arihant SSBN ensures second-strike.",color:"border-amber-600 bg-amber-600"},
                 {actor:"USA — The Reluctant Pivot",risk:"MEDIUM",threat:"USD hegemony threatened by ISR. Tech export controls (chips, jet engines). Historical F-16 supply to Pakistan, MQ-9 pressure, and CAATSA sanctions risk.",india:"QUAD membership (India-US-Japan-Australia). GE-414 engine deal signed 2023 for Tejas. Strategic Convergence on China make full conflict extremely unlikely.",color:"border-blue-700 bg-blue-700"},
                 {actor:"Internal Fractures — Domestic Risk",risk:"ONGOING",threat:"Information warfare targeting national unity (sectarian + separatist algorithms). Elite capture of key institutions. Economic inequality as a recruitment vector for radicalism.",india:"Integrated VAJRA domestic doctrine: economic inclusion at sub-$3K/capita baseline to eliminate recruitment. Cyber Defense Command active.",color:"border-slate-600 bg-slate-600"},
               ] as {actor:string,risk:string,threat:string,india:string,color:string}[]).map((r,i)=>(
                 <div key={i} className="p-5 bg-white border border-black/10 rounded shadow-sm">
                   <div className="flex items-start justify-between mb-3">
                     <div className="text-[13px] font-mono font-black uppercase">{r.actor}</div>
                     <span className={`text-[9px] font-mono font-black text-white px-3 py-1 rounded ${r.color}`}>{r.risk}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-red-50 border border-red-900/10 rounded">
                       <div className="text-[8px] font-mono font-black text-red-900 uppercase mb-1">Their Threat Vector</div>
                       <p className="text-[10px] font-serif text-red-900/70 italic leading-relaxed">{r.threat}</p>
                     </div>
                     <div className="p-3 bg-emerald-50 border border-emerald-900/10 rounded">
                       <div className="text-[8px] font-mono font-black text-emerald-900 uppercase mb-1">VAJRA Counter-Posture</div>
                       <p className="text-[10px] font-serif text-emerald-900/70 italic leading-relaxed">{r.india}</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-10 pt-10 border-t-2 border-double border-black/10 flex flex-col items-center opacity-30">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.5em]">End of Dossier // Project Vajra 2047</span>
                <div className="mt-4 flex gap-2">
                   <div className="w-8 h-[2px] bg-black" />
                   <div className="w-2 h-[2px] bg-black" />
                   <div className="w-8 h-[2px] bg-black" />
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
