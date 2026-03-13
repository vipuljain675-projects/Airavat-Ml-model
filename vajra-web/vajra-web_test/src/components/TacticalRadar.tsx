"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Stars, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);
  
  // Rotate globe slowly
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#0a1a2a" 
          wireframe={true} 
          transparent 
          opacity={0.3} 
          emissive="#00f2ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* India Marker */}
      <mesh position={[0.7, 0.9, 1.7]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#00f2ff" />
        <Html distanceFactor={10}>
          <div className="bg-black/80 border border-cyan-500 p-2 rounded text-[10px] font-orbitron text-cyan-400 whitespace-nowrap">
            HQ: NEW DELHI
          </div>
        </Html>
      </mesh>

      {/* Front 3.5 Heat Zones (Simulated) */}
      <mesh position={[0.5, 1.2, 1.5]}>
         <sphereGeometry args={[0.08, 16, 16]} />
         <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export default function TacticalRadar() {
  return (
    <div className="w-full h-full relative glass overflow-hidden flex flex-col">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="font-orbitron text-lg tracking-widest text-cyan-400">TACTICAL RADAR</h3>
        <p className="text-[10px] font-mono text-gray-500 uppercase">3.5 Front Heatmap | Real-time Encirclement Monitoring</p>
      </div>

      <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-cyan-500">LINK: STABLE</span>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-mono text-gray-400">SAT-ID: VAJRA-EYE-01</p>
            <p className="text-[10px] font-mono text-gray-400">LAT: 28.6139° N | LON: 77.2090° E</p>
         </div>
      </div>

      <div className="flex-1 w-full bg-black/40">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Globe />
          <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={10} />
        </Canvas>
      </div>

      <div className="p-4 border-t border-cyan-500/10 flex justify-between items-center text-[10px] font-mono bg-obsidian-900/50">
        <div className="flex gap-4">
          <span className="text-amber-500 underline cursor-pointer">SCAN: NORTHERN THEATER</span>
          <span className="text-gray-500">SCAN: MARITIME CHOKEPOINTS</span>
        </div>
        <div className="text-cyan-500/50 uppercase tracking-tighter">
          Tactical Projection v1.02.4
        </div>
      </div>
    </div>
  );
}
