/**
 * Micro8051SiM Dedicated Hardware Status Bar
 * Displays current cycle count, Program Counter (PC), and Stack Pointer (SP) in real-time,
 * optimized for the current simulation level (Beginner, Intermediate, Advanced).
 */

import React from 'react';
import { SimulatorStatus } from '../../simulator/execution-controller.ts';
import { ClockSpeedHz } from '../../core/types.ts';
import { SimulatorLevel } from '../home/HomePage.tsx';

interface StatusBarProps {
  status: SimulatorStatus;
  clockHz: ClockSpeedHz;
  cycles: number;
  instructions: number;
  pc: number;
  sp: number;
  breakpointCount: number;
  programSize: number;
  level?: SimulatorLevel;
  className?: string;
  theme?: 'dark' | 'light';
  copyrightAuthors?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  clockHz,
  cycles,
  instructions,
  pc,
  sp,
  breakpointCount,
  programSize,
  level = 'intermediate',
  className = '',
  theme = 'dark',
  copyrightAuthors = '© 2026 Vineet Sharma , Chaman Vashishth',
}) => {
  const clockMhz = (clockHz / 1000000).toFixed(clockHz === 11059200 ? 4 : 0);
  
  // Calculate approximate real hardware execution time based on machine cycles (1 cycle = 12 clock pulses)
  const secondsElapsed = cycles * (12 / clockHz);
  const timeFormatted =
    secondsElapsed < 0.001
      ? `${(secondsElapsed * 1000000).toFixed(1)} µs`
      : secondsElapsed < 1
      ? `${(secondsElapsed * 1000).toFixed(2)} ms`
      : `${secondsElapsed.toFixed(3)} s`;

  const statusColor = {
    RUNNING: 'text-[#22c55e] bg-[#22c55e]/15 border-[#22c55e]/40',
    PAUSED: 'text-[#fbbf24] bg-[#fbbf24]/15 border-[#fbbf24]/40',
    READY: 'text-[#38bdf8] bg-[#38bdf8]/15 border-[#38bdf8]/40',
    BREAKPOINT: 'text-[#f87171] bg-[#f87171]/15 border-[#f87171]/40',
    HALTED: 'text-[#ef4444] bg-[#ef4444]/15 border-[#ef4444]/40',
  }[status] || 'text-[#a8a29e] bg-[#292524] border-[#44403c]';

  // --- BEGINNER MODE STATUS BAR ---
  if (level === 'beginner') {
    return (
      <footer className={`bg-[#161b22] border-t border-[#30363d] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none shrink-0 text-[#8b949e] ${className}`}>
        {/* Core Live Microcontroller Status Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className={`px-2 py-0.5 rounded text-[11px] font-black uppercase border flex items-center gap-1.5 ${statusColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{status}</span>
          </div>

          {/* Program Counter (PC) */}
          <div
            className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] px-2.5 py-0.5 rounded text-[11px]"
            title="Program Counter (PC): 16-bit register holding the address in ROM of the next instruction to execute"
          >
            <span className="text-[#10b981] font-black">PC:</span>
            <span className="text-[#ffffff] font-mono font-black">
              0x{pc.toString(16).toUpperCase().padStart(4, '0')}H
            </span>
            <span className="text-[10px] text-[#8b949e] hidden sm:inline">(Addr)</span>
          </div>

          {/* Stack Pointer (SP) */}
          <div
            className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] px-2.5 py-0.5 rounded text-[11px]"
            title="Stack Pointer (SP): 8-bit pointer to top of stack in Internal RAM (Default after reset: 07H)"
          >
            <span className="text-[#38bdf8] font-black">SP:</span>
            <span className="text-[#ffffff] font-mono font-black">
              0x{sp.toString(16).toUpperCase().padStart(2, '0')}H
            </span>
            <span className="text-[10px] text-[#8b949e] hidden sm:inline">
              (RAM[{sp.toString(16).toUpperCase().padStart(2, '0')}H])
            </span>
          </div>

          {/* Machine Cycles */}
          <div
            className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] px-2.5 py-0.5 rounded text-[11px]"
            title="Machine Cycles: Total 8051 execution cycles elapsed"
          >
            <span className="text-[#f59e0b] font-black">CYCLES:</span>
            <span className="text-[#fbbf24] font-mono font-black">
              {cycles.toLocaleString()}
            </span>
          </div>

          {/* Instructions Count */}
          <div className="hidden md:flex items-center gap-1 text-[11px]">
            <span className="text-[#8b949e]">Instructions:</span>
            <strong className="text-[#ffffff] font-mono">{instructions.toLocaleString()}</strong>
          </div>
        </div>

        {/* Authors Copyright */}
        <div className="font-bold text-[#e2e8f0] text-xs">
          {copyrightAuthors}
        </div>
      </footer>
    );
  }

  // --- INTERMEDIATE MODE STATUS BAR (EdSim51 High-Density Bench) ---
  if (level === 'intermediate') {
    return (
      <div className={`bg-[#141210] border-t border-[#44403c] px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono select-none text-[#a8a29e] z-20 gap-2 w-full ${className}`}>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#78716c]">CPU:</span>
            <span className={`px-1.5 py-0.2 rounded-xs text-[10px] font-black uppercase border ${statusColor}`}>
              {status}
            </span>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#78716c]">CLOCK:</span>
            <span className="text-[#ffffff] font-black">{clockMhz} MHz</span>
          </div>

          {/* Program Counter (PC) - Highlighted */}
          <div
            className="flex items-center gap-1 bg-[#1c1917] border border-[#524d43] px-2 py-0.5 rounded-xs"
            title="Program Counter (PC): 16-bit address pointing to current instruction in ROM"
          >
            <span className="font-black text-[#fbbf24]">PC:</span>
            <span className="text-[#ffffff] font-black">
              0x{pc.toString(16).toUpperCase().padStart(4, '0')}H
            </span>
          </div>

          {/* Stack Pointer (SP) - Highlighted */}
          <div
            className="flex items-center gap-1 bg-[#1c1917] border border-[#524d43] px-2 py-0.5 rounded-xs"
            title="Stack Pointer (SP): 8-bit pointer pointing to the current top of stack in Internal RAM"
          >
            <span className="font-black text-[#38bdf8]">SP:</span>
            <span className="text-[#ffffff] font-black">
              0x{sp.toString(16).toUpperCase().padStart(2, '0')}H
            </span>
            <span className="text-[10px] text-[#78716c] hidden sm:inline">
              (@RAM {sp.toString(16).toUpperCase().padStart(2, '0')}H)
            </span>
          </div>

          {/* Machine Cycles */}
          <div
            className="flex items-center gap-1 bg-[#1c1917] border border-[#524d43] px-2 py-0.5 rounded-xs"
            title="Total Machine Cycles (12 clock periods per machine cycle)"
          >
            <span className="font-black text-[#fbbf24]">CYCLES:</span>
            <span className="text-[#fbbf24] font-black">
              {cycles.toString().padStart(8, '0')}
            </span>
          </div>

          {/* Instructions executed */}
          <div className="hidden lg:flex items-center gap-1">
            <span className="font-bold text-[#78716c]">INSTR:</span>
            <span className="text-[#ffffff] font-bold">
              {instructions.toString().padStart(7, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Breakpoints */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="font-bold text-[#78716c]">BP:</span>
            <span className="text-[#fbbf24] font-bold">{breakpointCount}</span>
          </div>

          {/* Program Code Size */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="font-bold text-[#78716c]">CODE:</span>
            <span className="text-[#ffffff] font-bold">{programSize} B</span>
          </div>

          {/* Memory Integrity */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#78716c]">MEM:</span>
            <span className="text-[#22c55e] font-black">128B OK</span>
          </div>
        </div>
      </div>
    );
  }

  // --- ADVANCED MODE STATUS BAR (Pro Engineering Telemetry) ---
  return (
    <div className={`bg-[#080b0f] border-t border-[#1e293b] px-3.5 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono select-none text-[#94a3b8] z-20 gap-2 w-full ${className}`}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* CPU Status */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#64748b]">STATUS:</span>
          <span className={`px-2 py-0.5 rounded-xs text-[10px] font-black uppercase border ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Clock & Calculated Hardware Timing */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#64748b]">CLOCK:</span>
          <span className="text-[#38bdf8] font-black">{clockMhz} MHz</span>
          <span className="text-[#64748b] text-[10px] hidden md:inline">({timeFormatted})</span>
        </div>

        {/* Real-time Program Counter (PC) */}
        <div
          className="flex items-center gap-1.5 bg-[#0f172a] border border-[#38bdf8]/40 px-2 py-0.5 rounded-xs"
          title="Program Counter (PC) Register (16-bit)"
        >
          <span className="text-[#38bdf8] font-black">PC:</span>
          <span className="text-[#ffffff] font-black">
            0x{pc.toString(16).toUpperCase().padStart(4, '0')}H
          </span>
        </div>

        {/* Real-time Stack Pointer (SP) */}
        <div
          className="flex items-center gap-1.5 bg-[#0f172a] border border-[#06b6d4]/40 px-2 py-0.5 rounded-xs"
          title="Stack Pointer (SP) Register (8-bit)"
        >
          <span className="text-[#06b6d4] font-black">SP:</span>
          <span className="text-[#ffffff] font-black">
            0x{sp.toString(16).toUpperCase().padStart(2, '0')}H
          </span>
          <span className="text-[10px] text-[#64748b] hidden sm:inline">
            [RAM: 0x{sp.toString(16).toUpperCase().padStart(2, '0')}]
          </span>
        </div>

        {/* Real-time Cycle Count */}
        <div
          className="flex items-center gap-1.5 bg-[#0f172a] border border-[#f59e0b]/40 px-2 py-0.5 rounded-xs"
          title="Machine Cycle Accumulator"
        >
          <span className="text-[#f59e0b] font-black">CYCLES:</span>
          <span className="text-[#fbbf24] font-black">
            {cycles.toString().padStart(8, '0')}
          </span>
        </div>

        {/* Instructions */}
        <div className="hidden lg:flex items-center gap-1">
          <span className="font-bold text-[#64748b]">INSTRUCTIONS:</span>
          <span className="text-[#ffffff] font-bold">
            {instructions.toString().padStart(8, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Breakpoints */}
        <div className="flex items-center gap-1">
          <span className="font-bold text-[#64748b]">BREAKPOINTS:</span>
          <span className="text-[#f87171] font-bold">{breakpointCount}</span>
        </div>

        {/* Program Size */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="font-bold text-[#64748b]">ROM:</span>
          <span className="text-[#ffffff] font-bold">{programSize} / 65536 B</span>
        </div>

        {/* 64KB Memory Matrix Indicator */}
        <div className="flex items-center gap-1">
          <span className="text-[#22c55e] font-black text-[10px]">● SYSTEM HEALTHY</span>
        </div>
      </div>
    </div>
  );
};
