'use client';

import { useEffect, useState } from 'react';

interface Agent {
  id: string;
  angle: number;
  dist: number;
  status: 'ok' | 'warn' | 'error';
  time: string;
  isActive?: boolean; // Is currently executing a mission
  currentOperation?: string; // Name of current operation
}

interface RadarProps {
  agents: Agent[];
  size?: number;
}

export function Radar({ agents, size = 420 }: RadarProps) {
  const center = size / 2;
  const [animationFrame, setAnimationFrame] = useState(0);
  
  // Animate active agents with smooth movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric circles */}
        {[80, 140, 190].map((r) => (
          <circle
            key={r}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}
        
        {/* Radial lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = center + Math.cos(rad) * 190;
          const y2 = center + Math.sin(rad) * 190;
          return (
            <line
              key={angle}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      
      {/* Agents */}
      {agents.map((agent) => {
        const baseRadius = agent.dist * 2;
        
        // Enhanced animation for active agents
        let activeRadius = baseRadius;
        let activeAngle = agent.angle;
        let orbitOffset = 0;
        
        if (agent.isActive) {
          // Move closer to center (70% of original distance)
          activeRadius = baseRadius * 0.7;
          // Add orbital motion - slow rotation around center
          orbitOffset = Math.sin(animationFrame * 0.1) * 8; // 8 degree oscillation
          activeAngle = agent.angle + orbitOffset;
        }
        
        const activeRad = (activeAngle * Math.PI) / 180;
        const x = center + Math.cos(activeRad) * activeRadius;
        const y = center + Math.sin(activeRad) * activeRadius;
        const color = agent.status === 'ok' ? '#13c6a8' : agent.status === 'warn' ? '#f4c95d' : '#ff5f5f';
        
        return (
          <div 
            key={agent.id} 
            className="absolute transition-all duration-300 ease-out" 
            style={{ 
              left: x - 6, 
              top: y - 6,
              transform: agent.isActive ? 'scale(1.3)' : 'scale(1)',
              transition: agent.isActive ? 'transform 0.3s ease-out' : 'all 0.3s ease-out'
            }}
          >
            {/* Agent marker with enhanced pulse animation when active */}
            <div 
              className={`w-3 h-3 rotate-45 ${
                agent.isActive ? 'animate-pulse' : ''
              }`}
              style={{ 
                background: color,
                boxShadow: agent.isActive 
                  ? `0 0 16px ${color}, 0 0 32px ${color}60, 0 0 48px ${color}40` 
                  : 'none',
                transition: 'all 0.3s ease-out'
              }}
            ></div>
            
            {/* Active operation indicator with enhanced animation */}
            {agent.isActive && (
              <>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full"></div>
              </>
            )}
            
            <div className="text-[9px] text-white/60 -ml-2 mt-1 sc-mono">{agent.id}</div>
            
            {/* Show operation name when active */}
            {agent.isActive && agent.currentOperation ? (
              <div className="text-[7px] text-cyan-400 -ml-2 mt-0 sc-mono truncate w-16 animate-pulse">
                {agent.currentOperation}
              </div>
            ) : agent.currentOperation === 'Completed' ? (
              <div className="text-[7px] text-emerald-400 -ml-2 mt-0 sc-mono truncate w-16 animate-pulse">
                ✓ Completed
              </div>
            ) : (
            <div className="text-[8px] text-white/40 -ml-2 mt-0 sc-mono">{agent.time}</div>
            )}
          </div>
        );
      })}
      
      {/* Center indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400/50 rounded-full"></div>
    </div>
  );
}

