/**
 * Micro8051SiM - Advanced Engineering & Timing Analysis Panel
 * Cycle-accurate execution timing, microsecond clock calculation, and memory utilization.
 */

import React from 'react';
import { CPUState, ClockSpeedHz } from '../../core/types.ts';

interface AdvancedTimingPanelProps {
  cpuState: CPUState;
  clockHz: ClockSpeedHz;
  programSize: number;
  onOpenPinMapper: () => void;
  onOpenOscilloscope: () => void;
  onOpenUart: () => void;
}

export const AdvancedTimingPanel: React.FC<AdvancedTimingPanelProps> = ({
  cpuState,
  clockHz,
  programSize,
  onOpenPinMapper,
  onOpenOscilloscope,
  onOpenUart,
}) => {
  // In standard 8051, 1 machine cycle = 12 oscillator periods.
  // Machine cycle period = 12 / clockHz seconds.
  const machineCycleSec = 12 / clockHz;
  const elapsedMicroseconds = (cpuState.cycles * machineCycleSec * 1_000_000).toFixed(2);
  const elapsedMilliseconds = (cpuState.cycles * machineCycleSec * 1_000).toFixed(3);

  const romPercent = Math.min(100, ((programSize / 4096) * 100)).toFixed(1);
  const dptr = cpuState.dptr & 0xFFFF;
  const dph = (dptr >> 8) & 0xFF;
  const dpl = dptr & 0xFF;

  return (
    <div className="bg-[#141210] border border-[#524d43] rounded-sm p-3 font-mono text-xs select-none shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#38332c]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
          <span className="text-xs font-black uppercase text-[#06b6d4] tracking-wider">
            Advanced Architectural Metrics & Cycle Timing
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenOscilloscope}
            className="px-2 py-0.5 bg-[#292524] hover:bg-[#38332c] text-[#38bdf8] text-[10px] font-bold rounded-xs border border-[#524d43] cursor-pointer"
            title="Jump to Virtual Oscilloscope"
          >
            📊 Oscilloscope
          </button>
          <button
            onClick={onOpenUart}
            className="px-2 py-0.5 bg-[#292524] hover:bg-[#38332c] text-[#fbbf24] text-[10px] font-bold rounded-xs border border-[#524d43] cursor-pointer"
            title="Jump to Serial Terminal"
          >
            ⚡ UART Terminal
          </button>
          <button
            onClick={onOpenPinMapper}
            className="px-2 py-0.5 bg-[#292524] hover:bg-[#38332c] text-[#a8a29e] hover:text-[#ffffff] text-[10px] font-bold rounded-xs border border-[#524d43] cursor-pointer"
            title="Open Pin-to-Port Matrix"
          >
            📌 Pin Matrix
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Real-time Elapsed Microseconds */}
        <div className="bg-[#1c1917] border border-[#38332c] p-2 rounded-xs flex flex-col justify-between">
          <span className="text-[10px] text-[#a8a29e] uppercase font-bold">Calculated Execution Time</span>
          <div className="my-1">
            <span className="text-base font-black text-[#06b6d4]">
              {Number(elapsedMicroseconds) >= 1000 ? `${elapsedMilliseconds} ms` : `${elapsedMicroseconds} µs`}
            </span>
          </div>
          <span className="text-[9px] text-[#78716c]">
            Based on {clockHz / 1_000_000}MHz (1 cycle = {(machineCycleSec * 1e6).toFixed(3)}µs)
          </span>
        </div>

        {/* Machine Cycles */}
        <div className="bg-[#1c1917] border border-[#38332c] p-2 rounded-xs flex flex-col justify-between">
          <span className="text-[10px] text-[#a8a29e] uppercase font-bold">Machine Cycles</span>
          <div className="my-1">
            <span className="text-base font-black text-[#fbbf24]">
              {cpuState.cycles.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] text-[#78716c]">
            {cpuState.instructionCount.toLocaleString()} instructions executed
          </span>
        </div>

        {/* 16-bit DPTR & Stack Pointer SP */}
        <div className="bg-[#1c1917] border border-[#38332c] p-2 rounded-xs flex flex-col justify-between">
          <span className="text-[10px] text-[#a8a29e] uppercase font-bold">16-bit DPTR & Stack SP</span>
          <div className="my-1 flex items-baseline justify-between">
            <span className="text-sm font-black text-[#ffffff]">
              DPTR: 0x{dptr.toString(16).toUpperCase().padStart(4, '0')}
            </span>
            <span className="text-xs font-bold text-[#fbbf24]">
              SP: 0x{cpuState.sp.toString(16).toUpperCase().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] text-[#78716c]">
            DPH: 0x{dph.toString(16).toUpperCase().padStart(2, '0')} · DPL: 0x{dpl.toString(16).toUpperCase().padStart(2, '0')}
          </span>
        </div>

        {/* ROM Footprint */}
        <div className="bg-[#1c1917] border border-[#38332c] p-2 rounded-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#a8a29e] uppercase font-bold">Internal ROM Footprint</span>
            <span className="text-[9px] text-[#fbbf24] font-bold">{romPercent}% of 4KB</span>
          </div>
          <div className="my-1">
            <span className="text-sm font-black text-[#ffffff]">
              {programSize} / 4096 Bytes
            </span>
          </div>
          <div className="w-full bg-[#292524] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#06b6d4] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(2, (programSize / 4096) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
