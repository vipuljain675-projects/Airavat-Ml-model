"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, MessageSquare, Library, Activity, ShieldAlert } from "lucide-react";
import TacticalRadar from "./TacticalRadar";
import SignalHub from "./SignalHub";
import StrategicArchive from "./StrategicArchive";

const tabs = [
  { id: "radar", label: "Tactical Radar", icon: Radar },
  { id: "warroom", label: "War Room", icon: MessageSquare },
  { id: "archive", label: "Strategic Archive", icon: Library },
  { id: "signal", label: "Signal Analyzer", icon: Activity },
];

export default function CommandHub() {
  const [activeTab, setActiveTab] = useState("warroom");
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    const query = input;
    setInput("");

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query, include_news: true }),
      });

      if (!response.ok) throw new Error("Bridge communication failed");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.intelligence_brief,
          data: data,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ ERROR: Failed to reach the strategic bridge." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* ... (Welcome Overlay remains same) ... */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <ShieldAlert className="w-16 h-16 text-cyan-400 rotate-12" />
              </div>
              <h1 className="font-orbitron text-2xl md:text-4xl tracking-widest text-white mb-2">
                MISSION VAJRA ACTIVE
              </h1>
              <p className="text-cyan-400/80 font-mono tracking-tighter uppercase">
                Authenticating Strategic Analyst Session...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 glass z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-orbitron font-bold tracking-tight text-lg">VAJRA</span>
        </div>

        <div className="flex items-center gap-1 md:gap-4 md:absolute md:left-1/2 md:-translate-x-1/2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 flex items-center gap-2 transition-all group ${
                  isActive ? "text-cyan-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "group-hover:text-cyan-300"}`} />
                <span className="hidden md:block text-xs font-semibold uppercase tracking-wider">
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#00f2ff]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
           <span className="hidden lg:block text-cyan-500/50">LEVEL: ALPHA</span>
           <div className="flex flex-col items-end">
              <span>SYSTEM: ONLINE</span>
              <span className="text-[10px] text-amber-500/50">SOVEREIGNTY: 5.5/10</span>
           </div>
        </div>
      </nav>

      {/* Dynamic Tab Content */}
      <div className="w-full mt-24 px-6 md:px-12 flex-1 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
             {activeTab === 'warroom' && (
                <div className="flex flex-col space-y-8">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                         <h2 className="font-orbitron text-3xl font-bold tracking-tight">WAR ROOM</h2>
                         <p className="text-gray-400 text-sm mt-1">Awaiting analysis parameters for current operational theater.</p>
                      </div>
                      <div className="glass px-6 py-4 flex items-center gap-6 border-l-4 border-amber-500 cyan-glow bg-obsidian-900/50">
                         <div>
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Mission Vajra Status</p>
                            <div className="flex items-baseline gap-2">
                               <span className="text-3xl font-bold text-white">5.5</span>
                               <span className="text-gray-500 text-sm">/ 10</span>
                            </div>
                         </div>
                         <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '55%' }}
                               className="h-full bg-amber-500 shadow-[0_0_10px_#ffaa00]"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 glass border-cyan-500/20 relative flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                         {messages.length === 0 ? (
                            <div className="h-full flex flex-col justify-center items-center text-center opacity-50">
                               <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center animate-pulse mb-4">
                                  <MessageSquare className="w-8 h-8 text-cyan-400" />
                               </div>
                               <p className="font-mono text-xs">
                                  [ ENCRYPTED CHANNEL ESTABLISHED ]<br/>
                                  Request strategic simulation or intelligence synthesis to begin.
                               </p>
                            </div>
                         ) : (
                            messages.map((msg, i) => (
                               <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                               >
                                  <div className={`max-w-[85%] px-4 py-3 rounded-lg font-mono text-sm ${
                                     msg.role === 'user' 
                                        ? 'bg-cyan-500/10 border border-cyan-500/30 text-white' 
                                        : 'bg-obsidian-800 border border-white/5 text-gray-300'
                                  }`}>
                                     <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                     {msg.data && (
                                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                               <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-2 font-bold">Risk Vectors</p>
                                               {Object.entries(msg.data.risk_scores).map(([k, v]: [any, any]) => (
                                                  <div key={k} className="flex justify-between items-center text-[10px] mb-1">
                                                     <span className="text-gray-500">{k}</span>
                                                     <span className={v > 0.5 ? 'text-amber-500' : 'text-gray-400'}>{(v as number).toFixed(3)}</span>
                                                  </div>
                                               ))}
                                            </div>
                                            <div>
                                               <p className="text-[10px] text-amber-500 uppercase tracking-widest mb-2 font-bold">Top Analogs</p>
                                               {msg.data.top_analogs.slice(0, 3).map((a: any) => (
                                                  <div key={a.id} className="text-[10px] mb-1 text-gray-400 border-b border-white/5 pb-1">
                                                     {a.category} ({a.similarity})
                                                  </div>
                                               ))}
                                            </div>
                                        </div>
                                     )}
                                  </div>
                               </motion.div>
                            ))
                         )}
                         {isLoading && (
                            <div className="flex justify-start">
                               <div className="bg-obsidian-800 border border-white/5 px-4 py-2 rounded-lg">
                                  <div className="flex gap-1">
                                     <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                     <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                     <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>

                      <div className="p-4 border-t border-white/5 bg-black/20">
                         <div className="relative group">
                            <input 
                               type="text" 
                               value={input}
                               onChange={(e) => setInput(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                               placeholder="Type strategic inquiry or command..."
                               className="w-full bg-black/50 border border-white/10 rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all placeholder:text-gray-600"
                            />
                            <button 
                               onClick={handleSendMessage}
                               disabled={isLoading}
                               className="absolute right-3 top-3 bottom-3 px-4 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 transition-colors"
                            >
                               {isLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'radar' && (
                <div className="h-[75vh]">
                   <TacticalRadar />
                </div>
             )}

             {activeTab === 'signal' && (
                <div className="h-[75vh]">
                   <SignalHub />
                </div>
             )}

             {activeTab === 'archive' && (
                <div className="h-[75vh]">
                   <StrategicArchive />
                </div>
             )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
