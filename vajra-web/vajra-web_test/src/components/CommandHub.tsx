"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Library, Activity, Zap, Globe, Shield, Target, ChevronRight, Cpu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import StrategicArchive from "./StrategicArchive";
import VajraSplash from "./VajraSplash";

const tabs = [
  { id: "airavat", label: "Airavat AI", icon: Cpu },
  { id: "archive", label: "Strategic Archive", icon: Library },
];

const GREETING_CARDS = [
  {
    icon: Shield,
    title: "VAJRA 2047",
    desc: "India's path to become the 3rd largest economy & a Global Pole of power by the centennial year.",
    prompt: "What is the VAJRA 2047 mission and what does India need to achieve by 2047?",
  },
  {
    icon: Globe,
    title: "Viksit Bharat",
    desc: "Developed India — $30T GDP, 60 IAF squadrons, 5 Nuclear Carrier Battle Groups, digital sovereignty.",
    prompt: "What are India's key 2047 targets for GDP, military strength, and digital sovereignty?",
  },
  {
    icon: Target,
    title: "Adversary Playbook",
    desc: "Map US energy coercion, China's encirclement, and Pakistan proxy tactics against India.",
    prompt: "What is the adversary playbook against India — US coercion, China encirclement, Pakistan proxy strategy?",
  },
  {
    icon: Zap,
    title: "Strategic Autonomy",
    desc: "India's doctrine of never joining any bloc — RIC or Quad — while building unbeatable leverage.",
    prompt: "Should India join RIC or Quad, or is strategic autonomy India's true power doctrine?",
  },
];

export default function CommandHub() {
  const [activeTab, setActiveTab] = useState("airavat");
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const CASUAL_PATTERNS = /^(hi|hello|hey|sup|yo|hii|helo|howdy|greetings|namaste|jai hind|good\s*(morning|evening|afternoon|night)|thanks?|thank you|ok|okay|cool|nice|great|got it|noted|bye|goodbye|ciao|what'?s up|who are you|what are you|what can you do)[\s!?.]*$/i;
  const STRATEGIC_KEYWORDS = /india|china|usa|pakistan|iran|russia|military|nuclear|energy|sanction|vajra|2047|war|alliance|quad|ric|nato|oil|gdp|sovereign|terror|border|missile|navy|air force|defence|defense/i;

  const isCasual = (text: string) => {
    const trimmed = text.trim();
    return CASUAL_PATTERNS.test(trimmed) || (trimmed.split(/\s+/).length <= 3 && !STRATEGIC_KEYWORDS.test(trimmed));
  };

  const getCasualReply = (text: string): string => {
    const t = text.toLowerCase().trim();
    if (/bye|goodbye|ciao/.test(t)) return "Acknowledged, Commander. The mission continues. Return when you need strategic clarity. 🇮🇳";
    if (/thanks?|thank you/.test(t)) return "Acknowledged. That's what I'm here for — keeping India's strategic edge sharp. Ask away.";
    if (/who are you|what are you/.test(t)) return "I am **Airavat** — India's retrieval-grounded strategic intelligence system, built to serve **Mission VAJRA 2047**.\n\nMy purpose: help India become an *unchallengeable global pole of power* by the centennial year — **$30T GDP, 60 IAF squadrons, 5 Nuclear Carrier Battle Groups, and true digital sovereignty**.\n\nAsk me about any geopolitical scenario, historical precedent, or strategic decision India faces.";
    if (/what can you do/.test(t)) return "I analyze geopolitical scenarios, historical precedents, and strategic threats — all grounded in India's intelligence database.\n\nTry asking:\n- *\"Should India join RIC or Quad?\"*\n- *\"What happens if Iran falls?\"*\n- *\"How does US energy coercion impact India?\"*";
    if (/namaste|jai hind/.test(t)) return "Jai Hind, Commander. 🇮🇳 Airavat is online and ready. What's the strategic situation?";
    // Generic greeting
    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    return `${timeGreet}, Commander. Airavat is online.\n\nI'm your strategic intelligence interface for **Mission VAJRA 2047**. Ask me anything about India's geopolitical challenges, adversary tactics, or the path to Viksit Bharat.`;
  };

  const handleSend = async (query?: string) => {
    const q = query || input;
    if (!q.trim() || isLoading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Intercept casual / non-strategic messages — no need to hit the backend
    if (isCasual(q)) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: getCasualReply(q) }]);
      }, 400);
      return;
    }

    setIsLoading(true);


    try {
      const response = await fetch("http://localhost:8005/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, include_news: true }),
      });

      if (!response.ok) throw new Error("Bridge communication failed");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.intelligence_brief, data },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Could not reach the Airavat strategic bridge. Ensure the backend is running on port 8005." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <main className="min-h-screen flex flex-col bg-[#0f1117] text-white">
      <AnimatePresence>
        {showWelcome && <VajraSplash onComplete={() => setShowWelcome(false)} />}
      </AnimatePresence>

      {/* ── Top Nav ── */}
      <nav className="fixed top-0 left-0 right-0 h-14 z-40 border-b border-white/[0.06] bg-[#0f1117]/95 backdrop-blur-xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-saffron-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-orbitron font-bold tracking-tight text-[15px] bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            VAJRA
          </span>
        </div>

        <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-1.5 flex items-center gap-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:block">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-600">
          <span className="hidden lg:block">LEVEL: ALPHA</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          <span className="text-gray-500">ONLINE</span>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="flex-1 pt-14">
        <AnimatePresence mode="wait">
          {activeTab === "airavat" && (
            <motion.div
              key="airavat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-[calc(100vh-56px)]"
            >
              {/* ── Scrollable messages area ── */}
              <div className="flex-1 overflow-y-auto">
                {!hasMessages ? (
                  /* ── Welcome / Greeting Screen ── */
                  <div className="max-w-3xl mx-auto px-6 pt-14 pb-6">
                    {/* Greeting header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mb-10 text-center"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-widest mb-5">
                        <Zap className="w-3 h-3" />
                        Mission VAJRA 2047
                      </div>
                      <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Good evening, Commander.
                      </h1>
                      <p className="text-gray-400 text-[15px] leading-relaxed max-w-2xl mx-auto">
                        I am <span className="text-white font-semibold">Airavat</span> — India's retrieval-grounded strategic intelligence system.
                        My mission is singular: to help India achieve{" "}
                        <span className="text-orange-400 font-semibold">VAJRA 2047</span> and become a{" "}
                        <span className="text-orange-400 font-semibold">Viksit Bharat</span> — a fully developed,
                        sovereign, and unchallengeable global power by 2047.
                      </p>
                    </motion.div>

                    {/* Mission pillars */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="mb-8 grid grid-cols-3 gap-3 text-center"
                    >
                      {[
                        { label: "$30T GDP", sub: "Target by 2047" },
                        { label: "60 Squadrons", sub: "IAF Target" },
                        { label: "5 NCBGs", sub: "Nuclear Carrier Battle Groups" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
                        >
                          <p className="text-lg font-bold text-orange-400">{stat.label}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{stat.sub}</p>
                        </div>
                      ))}
                    </motion.div>

                    {/* Suggestion cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {GREETING_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                          <button
                            key={card.title}
                            onClick={() => handleSend(card.prompt)}
                            className="group text-left rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-orange-500/30 p-4 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-3.5 h-3.5 text-orange-400" />
                                </div>
                                <p className="text-sm font-semibold text-white">{card.title}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-0.5" />
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed pl-[37px]">{card.desc}</p>
                          </button>
                        );
                      })}
                    </motion.div>
                  </div>
                ) : (
                  /* ── Conversation thread ── */
                  <div className="max-w-3xl mx-auto px-6 pt-8 pb-4 space-y-8">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                      >
                        {msg.role === "user" ? (
                          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#1e2030] border border-white/[0.07] px-4 py-3 text-sm text-white leading-relaxed">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="w-full">
                            {/* Airavat avatar + label */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <Zap className="w-3 h-3 text-white" fill="white" />
                              </div>
                              <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Airavat</span>
                              {msg.data?.response_source === "groq" && (
                                <span className="text-[10px] text-gray-600 font-mono">· Llama-3.3-70b</span>
                              )}
                            </div>

                            {/* LLM fallback banner */}
                            {msg.data?.response_source !== "groq" && (
                              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-300">
                                <span className="font-bold uppercase tracking-wider text-amber-400">Fallback Mode</span>
                                <span className="ml-2 text-amber-200/70">{msg.data?.llm_error || "Showing deterministic brief."}</span>
                              </div>
                            )}

                            {/* Brief content */}
                            <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed
                              prose-headings:text-white prose-headings:font-semibold prose-headings:text-sm
                              prose-strong:text-white prose-code:text-orange-300 prose-li:text-gray-300
                              prose-a:text-orange-400">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>

                            {/* Risk scores + analogs */}
                            {msg.data && (
                              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                  <p className="text-[10px] text-orange-400 uppercase tracking-widest font-bold mb-3">Risk Vectors</p>
                                  {Object.entries(msg.data.risk_scores).slice(0, 5).map(([k, v]: [any, any]) => (
                                    <div key={k} className="mb-2">
                                      <div className="flex justify-between text-[10px] mb-0.5">
                                        <span className="text-gray-500 capitalize">{k.replace(/_/g, " ")}</span>
                                        <span className={v > 0.5 ? "text-orange-400 font-semibold" : "text-gray-600"}>{(v as number).toFixed(3)}</span>
                                      </div>
                                      <div className="h-0.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(v as number) * 100}%` }}
                                          transition={{ duration: 0.8, ease: "easeOut" }}
                                          className={`h-full rounded-full ${v > 0.5 ? "bg-orange-500" : "bg-gray-600"}`}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                  <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-3">Top Analogs</p>
                                  {msg.data.top_analogs.slice(0, 3).map((a: any) => (
                                    <div key={a.id} className="mb-3 pb-3 border-b border-white/[0.04] last:border-0 last:mb-0 last:pb-0">
                                      <p className="text-xs text-gray-200 font-medium leading-tight line-clamp-2">{a.title || a.category}</p>
                                      <div className="flex justify-between mt-1">
                                        <span className="text-[10px] text-gray-600">{a.date}</span>
                                        <span className="text-[10px] font-semibold text-blue-400">{(a.similarity * 100).toFixed(1)}% match</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-white" fill="white" />
                        </div>
                        <div className="flex gap-1 items-center">
                          {[0, 0.15, 0.3].map((delay, k) => (
                            <motion.div
                              key={k}
                              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                              transition={{ repeat: Infinity, duration: 1.2, delay }}
                              className="w-1.5 h-1.5 rounded-full bg-orange-400"
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1 font-mono">Analyzing...</span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* ── Input bar (always pinned to bottom) ── */}
              <div className="border-t border-white/[0.06] bg-[#0f1117] px-6 py-4">
                <div className="max-w-3xl mx-auto">
                  <div className="relative flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#1a1d27] px-4 py-3 focus-within:border-orange-500/40 focus-within:shadow-[0_0_0_1px_rgba(249,115,22,0.15)] transition-all">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask Airavat anything about India's strategic future..."
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={isLoading || !input.trim()}
                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-500 hover:bg-orange-400 disabled:bg-gray-800 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
                    >
                      {isLoading ? (
                        <Activity className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-gray-700 mt-2 font-mono">
                    Airavat · VAJRA 2047 · Retrieval-Grounded Strategic Intelligence · LEVEL ALPHA
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "archive" && (
            <motion.div
              key="archive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-56px)] px-6 md:px-12 pt-8"
            >
              <StrategicArchive />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
