"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import ForceGraph2D with no SSR to avoid Canvas node mismatch issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function ThreatWeb() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>();

  useEffect(() => {
    fetch("http://localhost:8005/graph")
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load graph:", err);
        setLoading(false);
      });
  }, []);

  const getNodeColor = (node: any) => {
    switch (node.group) {
      case 1: return "#f97316"; // Event: Saffron/Orange
      case 2: return "#3b82f6"; // Actor: Blue
      case 3: return "#10b981"; // Category: Green
      case 4: return "#8b5cf6"; // Region: Purple
      default: return "#94a3b8"; // Slate
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z || 0);

    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(8, 2000);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <div className="text-slate-400 font-mono text-sm tracking-widest uppercase">
          Initializing Threat Web...
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full h-full bg-[#0a0f18] overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md p-4 rounded-lg border border-slate-800">
        <h2 className="text-orange-500 font-bold tracking-widest uppercase mb-2 text-sm">Strategic Web Legend</h2>
        <div className="flex flex-col space-y-2 text-xs text-slate-300 font-mono">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-500 mr-2 shadow-[0_0_8px_#f97316]"></div> Strategic Event</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_#3b82f6]"></div> State / Actor</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_#10b981]"></div> Doctrine / Category</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-500 mr-2 shadow-[0_0_8px_#8b5cf6]"></div> Theater / Region</div>
        </div>
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={getNodeColor}
        nodeVal={(node: any) => (node.val || 1) * 3}
        linkColor={() => "rgba(255, 255, 255, 0.15)"}
        linkWidth={1}
        linkOpacity={0.5}
        backgroundColor="#0a0f18"
        onNodeClick={handleNodeClick}
        d3Force={(forceName: string, force: any) => {
            if (forceName === 'link' && force) {
              force.distance(70);
            }
        }}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px "SF Mono", monospace`;
          
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

          // Draw text background
          ctx.fillStyle = 'rgba(10, 15, 24, 0.8)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 + 10, bckgDimensions[0], bckgDimensions[1]);

          // Draw Node Text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff'; // White text
          ctx.fillText(label, node.x, node.y + 10);

          // Draw glowing node circle
          const radius = (node.val || 1) * 1.5;
          const color = getNodeColor(node);
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          
          // Glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        }}
      />
    </div>
  );
}
