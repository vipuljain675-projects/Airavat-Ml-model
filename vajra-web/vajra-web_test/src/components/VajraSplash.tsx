"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Radio, Activity, Zap, Volume2, VolumeX } from "lucide-react";

interface VajraSplashProps {
  onComplete: () => void;
}

const leaders = [
  { id: "trump", name: "TRUMP", country: "USA", img: "/assets/leader_trump.png", pos: { top: "38%", left: "18%" }, scale: 0.9 },
  { id: "putin", name: "PUTIN", country: "RUSSIA", img: "/assets/leader_putin.png", pos: { top: "28%", left: "68%" }, scale: 1.0 },
  { id: "bibi", name: "NETANYAHU", country: "ISRAEL", img: "/assets/leader_netanyahu.png", pos: { top: "48%", left: "54%" }, scale: 0.85 },
  { id: "modi", name: "MODI", country: "INDIA", img: "/assets/leader_modi.png", pos: { top: "58%", left: "73%" }, scale: 1.1 },
  { id: "xi", name: "XI JINPING", country: "CHINA", img: "/assets/leader_xi.png", pos: { top: "45%", left: "84%" }, scale: 0.95 },
];

export default function VajraSplash({ onComplete }: VajraSplashProps) {
  const [stage, setStage] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Stage sequence
    const timers = [
      setTimeout(() => setStage(1), 500),  // Show Map
      setTimeout(() => setStage(2), 1500), // Show Leaders
      setTimeout(() => setStage(3), 4000), // Show Title
      setTimeout(() => setStage(4), 5500), // Show Button
    ];

    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4500);

    return () => {
      timers.forEach(t => clearTimeout(t));
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
      
      {/* VIBRANT DOT-GRID MAP BACKGROUND */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: stage >= 1 ? 0.7 : 0, scale: stage >= 1 ? 1 : 1.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="/assets/world_map_dots.png" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-90 brightness-125"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)]" />
      </motion.div>

      {/* OVERLAY EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30" />
      
      {/* SCANLINE */}
      <motion.div 
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-cyan-400/20 shadow-[0_0_15px_#00f2ff] z-20 pointer-events-none"
      />

      {/* LEADERS LAYER (GEOGRAPHIC POSITIONING) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {leaders.map((leader, i) => (
          <motion.div
            key={leader.id}
            initial={{ opacity: 0, scale: 0.5, y: 30, filter: "blur(20px)" }}
            animate={{ 
              opacity: stage >= 2 ? 1 : 0, 
              scale: stage >= 2 ? leader.scale : 0.5, 
              y: stage >= 2 ? 0 : 30,
              filter: stage >= 2 ? "blur(0px)" : "blur(20px)",
              x: glitch ? (i % 2 === 0 ? 4 : -4) : 0
            }}
            transition={{ 
              duration: 1.0, 
              delay: 1.5 + (i * 0.2), 
              ease: [0.16, 1, 0.3, 1] 
            }}
            style={{ 
              position: "absolute", 
              top: leader.pos.top, 
              left: leader.pos.left,
              transform: "translate(-50%, -50%)"
            }}
            className="w-32 md:w-52 aspect-square"
          >
            <div className="relative group overflow-hidden">
               {/* Leader Portrait */}
               <div className="relative z-10 p-1 border border-cyan-500/30 bg-black/40 backdrop-blur-sm shadow-[0_0_40px_rgba(0,242,255,0.15)]">
                  <img 
                    src={leader.img} 
                    alt={leader.name}
                    className="w-full h-full object-cover brightness-105 contrast-115 grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  
                  {/* Hexagonal Frame Overlay (Implied by Border) */}
                  <div className="absolute inset-0 border-[4px] border-cyan-500/10 pointer-events-none" />
               </div>
               
               {/* Leader Label HUD */}
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: stage >= 2 ? 1 : 0, x: 0 }}
                 transition={{ delay: 2.5 + (i * 0.2) }}
                 className="absolute -bottom-6 left-2 z-20"
               >
                  <div className="bg-black/90 border-l-2 border-cyan-500 px-3 py-1 flex flex-col items-start">
                     <span className="text-[10px] md:text-sm font-bold text-white tracking-[0.2em]">{leader.name}</span>
                     <span className="text-[8px] md:text-[10px] text-cyan-400/70 font-mono tracking-widest">{leader.country}</span>
                  </div>
               </motion.div>

               {/* Ambient Glow behind portrait */}
               <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full translate-y-4" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* TYPOGRAPHY SECTION (CENTER-BOTTOM) */}
      <div className="absolute bottom-[20%] z-30 flex flex-col items-center w-full px-6 text-center">
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col items-center"
            >
              <h1 className="font-orbitron font-black text-4xl md:text-7xl text-white uppercase tracking-[0.3em] drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] leading-tight">
                SOVEREIGNTY IS SUPREME
              </h1>
              
              <motion.div 
                 className="mt-6 flex items-center gap-6"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.7 }}
                 transition={{ delay: 0.5 }}
              >
                 <div className="h-[1px] w-12 md:w-40 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                 <p className="text-[10px] md:text-xs tracking-[0.8em] uppercase font-bold text-amber-500">
                    Initializing Vajra Strategic Command Platform
                 </p>
                 <div className="h-[1px] w-12 md:w-40 bg-gradient-to-l from-transparent via-cyan-500 to-transparent" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ENTER ACTION (BOTTOM) */}
      <div className="absolute bottom-[8%] z-40">
        <AnimatePresence>
          {stage >= 4 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(0,242,255,0.3)" }}
              onClick={onComplete}
              className="group relative flex items-center gap-8 border-2 border-cyan-500/40 bg-black/60 backdrop-blur-xl text-cyan-400 px-20 py-6 font-orbitron font-black tracking-[0.5em] uppercase transition-all"
            >
              <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors" />
              <span>Enter War Room</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* HUD DECORATIONS */}
      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end opacity-40 text-[8px] md:text-[10px] z-50 pointer-events-none font-mono">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
               <span className="tracking-[0.2em]">GLOBAL FREQ: 144.92 MHZ [SYNC]</span>
            </div>
            <div className="flex items-center gap-3">
               <Activity className="w-4 h-4 text-amber-500" />
               <span className="tracking-[0.2em]">ANALYTIC BLADE: OPERATIONAL</span>
            </div>
         </div>
         
         <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-3">
               <Zap className="w-4 h-4 text-cyan-500" />
               <span className="tracking-[0.2em]">POWER GRID: STABLE ALPHA</span>
            </div>
            <div className="flex items-center gap-3 text-cyan-400">
               <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
               <span className="tracking-[0.2em] font-bold">SECURE CHANNEL ACTIVE</span>
            </div>
         </div>
      </div>

      {/* AUDIO TOGGLE */}
      <div className="fixed bottom-10 right-10 z-50">
         <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-14 h-14 rounded-full border border-cyan-500/20 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all bg-black/40 backdrop-blur-md"
         >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
         </button>
      </div>

    </div>
  );
}
