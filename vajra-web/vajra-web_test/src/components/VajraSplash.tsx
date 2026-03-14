"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Radio, Activity, Zap, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/components/GlobalAudioContext";

interface VajraSplashProps {
  onComplete: () => void;
}

const leaders = [
  { id: "putin", name: "VLADIMIR PUTIN", country: "RUSSIA", img: "/assets/leader_putin.png", pos: { top: "25%", left: "12%" }, scale: 1.05 },
  { id: "xi", name: "XI JINPING", country: "CHINA", img: "/assets/leader_xi.png", pos: { top: "18%", left: "25%" }, scale: 1.0 },
  { id: "trump", name: "DONALD TRUMP", country: "USA", img: "/assets/leader_trump.png", pos: { top: "45%", left: "22%" }, scale: 1.1 },
  { id: "modi", name: "NARENDRA MODI", country: "INDIA", img: "/assets/leader_modi.png", pos: { top: "65%", left: "10%" }, scale: 1.15 },
  { id: "bibi", name: "BENJAMIN NETANYAHU", country: "ISRAEL", img: "/assets/leader_netanyahu.png", pos: { top: "78%", left: "24%" }, scale: 1.0 },
];

export default function VajraSplash({ onComplete }: VajraSplashProps) {
  const [stage, setStage] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { play, isMuted, toggleMute } = useAudio();

  const handleEnter = () => {
    // Play a high-tech synthesized click sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log(e);
    }

    setShowVideo(true); // Transition to video overlay
  };

  const handleInitialInteraction = () => {
    play(); // Start the background theme legally
    setHasInteracted(true); // Reveal the splash sequence
  };

  useEffect(() => {
    if (!hasInteracted) return;

    // Stage sequence starts only AFTER user interaction
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
  }, [hasInteracted]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
      
      {/* PRE-SPLASH INTERACTION WALL (Bypasses Autoplay Restrictions) */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onClick={handleInitialInteraction}
            className="absolute inset-0 z-[300] bg-black flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,100,150,0.1)_0%,_black_60%)] pointer-events-none" />
            
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-6 z-10"
            >
              <div className="relative">
                <Activity className="w-12 h-12 text-cyan-500 animate-pulse" />
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-30 animate-pulse" />
              </div>
              
              <div className="text-center flex flex-col gap-2">
                <span className="text-cyan-400 font-orbitron tracking-[0.5em] text-sm md:text-base group-hover:text-cyan-300 transition-colors">
                  [ TAP TO ESTABLISH SECURE UPLINK ]
                </span>
                <span className="text-[10px] text-cyan-600/50 tracking-widest uppercase font-mono">
                  Authentication Protocol Required
                </span>
              </div>
            </motion.div>
            
            {/* Ambient scanlines on pre-loader */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,242,255,0)_50%,rgba(0,242,255,0.05)_50%)] bg-[length:100%_4px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main animated content wrapper - hidden until interacted */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${hasInteracted ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* VIBRANT DOT-GRID MAP BACKGROUND */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: stage >= 1 ? 0.8 : 0, scale: stage >= 1 ? 1 : 1.05 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
        >
        <img 
          src="/assets/world_map_dots.png" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-80 brightness-150 filter hue-rotate-[160deg] contrast-125"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(0,40,60,0.6)_0%,_rgba(0,0,0,0.9)_80%)]" />
      </motion.div>

      {/* OVERLAY EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30" />
      
      {/* SCANLINE */}
      <motion.div 
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-cyan-400/20 shadow-[0_0_15px_#00f2ff] z-20 pointer-events-none"
      />

      {/* LEADERS LAYER (HEXAGONAL CLUSTER ON LEFT) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {leaders.map((leader, i) => (
          <motion.div
            key={leader.id}
            initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
            animate={{ 
              opacity: stage >= 2 ? 1 : 0, 
              scale: stage >= 2 ? leader.scale : 0.5, 
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
            className="w-36 md:w-52 aspect-square"
          >
            <div className="relative group w-full h-full flex items-center justify-center">
               
               {/* Outer glowing hexagon border */}
               <div 
                 className="absolute inset-0 bg-cyan-400 opacity-60 group-hover:opacity-100 group-hover:shadow-[0_0_40px_rgba(0,242,255,1)] transition-all duration-500 scale-[1.03]"
                 style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
               />
               
               {/* Inner black hexagon background */}
               <div 
                 className="absolute inset-[2px] bg-black z-0 scale-[1.02]"
                 style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
               />

               {/* Portrait */}
               <div 
                  className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden bg-black/40"
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
               >
                  <img 
                    src={leader.img} 
                    alt={leader.name}
                    className="w-full h-full object-cover brightness-110 contrast-125 grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay pointer-events-none" />
               </div>
               
               {/* Leader Label HUD (shifted to bottom to prevent overlap) */}
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: stage >= 2 ? 1 : 0, y: 0 }}
                 transition={{ delay: 2.5 + (i * 0.2) }}
                 className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
               >
                  <div className="bg-black/90 border-t-2 border-cyan-400 px-4 py-1.5 md:py-2 flex flex-col items-center shadow-[0_0_15px_rgba(0,242,255,0.3)]">
                     <span className="text-[10px] md:text-xs font-bold text-white tracking-[0.2em] uppercase">{leader.name}</span>
                     <span className="text-[8px] md:text-[9px] text-cyan-400 font-mono tracking-widest uppercase">{leader.country}</span>
                  </div>
               </motion.div>

               {/* Ambient Glow behind portrait */}
               <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* TYPOGRAPHY & BUTTON SECTION (RIGHT-ALIGNED) */}
      <div className="absolute right-[4%] md:right-[6%] top-1/2 -translate-y-1/2 z-30 flex flex-col items-end w-full md:w-[48%] px-6 text-right">
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col items-end"
            >
              <h1 className="font-orbitron font-black text-4xl md:text-6xl lg:text-[4.8rem] text-white uppercase tracking-[0.05em] drop-shadow-[0_0_30px_rgba(0,242,255,0.4)] leading-tight text-right mb-4">
                SOVEREIGNTY<br/>IS SUPREME
              </h1>
              
              <motion.div 
                 className="flex flex-col items-end gap-3 mt-4"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.9 }}
                 transition={{ delay: 0.5 }}
              >
                 <p className="text-xs md:text-sm lg:text-base text-cyan-300 font-mono tracking-widest max-w-xl opacity-90 uppercase leading-relaxed text-right drop-shadow-md">
                   MULTIPOLAR DYNAMICS DETECTED. The global paradigm has shifted. Five strategic nodes dictate the new balance of power. Assess threats, anticipate moves, and execute protocol.
                 </p>
                 
                 <div className="flex items-center gap-4 mt-2 justify-end">
                    <div className="h-[1px] w-12 md:w-32 bg-gradient-to-r from-transparent to-cyan-500" />
                    <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold text-amber-500">
                       Initializing Vajra Command
                    </p>
                 </div>
              </motion.div>

              {/* ENTER ACTION BUTTON */}
              {stage >= 4 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,242,255,0.4)" }}
                  onClick={handleEnter}
                  className="group relative flex items-center gap-8 mt-12 border border-cyan-400 bg-cyan-950/40 backdrop-blur-xl text-cyan-300 px-12 md:px-16 py-5 font-orbitron font-bold tracking-[0.4em] uppercase transition-all shadow-[0_0_20px_rgba(0,242,255,0.15)] rounded-md pointer-events-auto"
                >
                  <div className="absolute inset-0 bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-colors rounded-md" />
                  <span className="relative z-10 text-sm md:text-base">Enter War Room</span>
                  <ChevronRight className="relative z-10 w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  
                  {/* Button crosshairs */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400" />
                </motion.button>
              )}
            </motion.div>
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

      {/* AUDIO TOGGLE (CONNECTS TO GLOBAL CONTEXT) */}
      <div className="fixed bottom-10 right-10 z-50">
         <button 
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            className="w-14 h-14 rounded-full border border-cyan-500/20 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all bg-black/40 backdrop-blur-md"
         >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
         </button>
      </div>

     </div> {/* End of hasInteracted wrapper */}

      {/* CINEMATIC VIDEO TRANSITION OVERLAY */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-[1000] bg-black flex items-center justify-center flex-col"
          >
            {/* The Cinematic Video */}
            <video 
              autoPlay 
              className={`w-full h-full object-cover ${videoError ? 'hidden' : 'block'}`}
              onEnded={() => onComplete()}
              onError={() => setVideoError(true)}
            >
              <source src="/assets/vajra_intro_video.mp4" type="video/mp4" />
            </video>
            
            {/* Fallback Error UI if video file is missing */}
            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-cyan-500 text-center p-8 bg-black z-50">
                 <Activity className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
                 <h2 className="text-2xl text-red-500 tracking-widest mb-4 uppercase">NO SIGNAL DECODED</h2>
                 <div className="max-w-xl text-sm leading-relaxed border border-red-500/30 p-6 bg-red-950/20 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
                   <p className="text-red-400 font-bold mb-4">[SYSTEM ALERT]: Video transition file not found.</p>
                   <p className="text-cyan-200/70 mb-6">
                     To enable the cinematic sequence, place your 1-2 minute video file exactly here:<br/><br/>
                     <code className="bg-black border border-cyan-500/50 px-3 py-2 text-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.2)]">public/assets/vajra_intro_video.mp4</code>
                   </p>
                   <p className="text-cyan-500/50 text-xs animate-pulse">Bypassing to Command Hub in 5 seconds...</p>
                 </div>
                 {/* Auto-bypass after 5 seconds if errored */}
                 {(() => { setTimeout(() => onComplete(), 5000); return null; })()}
              </div>
            )}
            
            {/* Skip Button (only if video is playing correctly) */}
            {!videoError && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={() => onComplete()}
                className="absolute bottom-10 right-10 text-cyan-500/50 hover:text-cyan-400 font-mono tracking-widest text-xs uppercase z-[1010] border border-cyan-500/30 hover:border-cyan-400/80 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-sm transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              >
                [ SKIP TRANSMISSION ]
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
