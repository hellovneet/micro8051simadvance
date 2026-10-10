/**
 * Micro8051SiM - Beginner Friendly Register Inspector
 * Simplified, human-readable CPU cards with decimal + hex values and plain-language descriptions.
 */

import React from 'react';
import { CPUState, PSW_BITS } from '../../core/types.ts';

interface BeginnerRegistersViewProps {
  cpuState: CPUState;
}

export const BeginnerRegistersView: React.FC<BeginnerRegistersViewProps> = ({ cpuState }) => {
  const acc = cpuState.acc & 0xFF;
  const b = cpuState.b & 0xFF;
  const pc = cpuState.pc & 0xFFFF;
  const p1 = cpuState.portLatches[1] ?? 0xFF;
  const psw = cpuState.psw & 0xFF;

  const isCarry = (psw & (1 << PSW_BITS.CY)) !== 0;
  const isAuxCarry = (psw & (1 << PSW_BITS.AC)) !== 0;
  const isOverflow = (psw & (1 << PSW_BITS.OV)) !== 0;
  const isParity = (psw & (1 << PSW_BITS.P)) !== 0;
  const isZero = acc === 0;

  // Working bank registers R0, R1, R7
  const bank = cpuState.activeBank;
  const r0 = cpuState.r[0] ?? 0;
  const r1 = cpuState.r[1] ?? 0;
  const r7 = cpuState.r[7] ?? 0;

  return (
    <div className="bg-[#1c1917] border border-[#524d43] rounded-sm p-3 font-mono text-xs select-none shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#38332c]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-black uppercase text-[#10b981] tracking-wider">
            Beginner CPU Overview
          </span>
        </div>
        <span className="text-[11px] text-[#a8a29e]">
          Active Bank: <strong className="text-[#fbbf24]">Bank {bank}</strong>
        </span>
      </div>

      {/* Primary Registers: Accumulator, B, PC, Port 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Accumulator (A) */}
        <div className="bg-[#141210] border border-[#524d43] p-2.5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#fbbf24] text-xs">Accumulator (A)</span>
            <span className="text-[9px] text-[#a8a29e] uppercase">Primary</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-xl font-black text-[#ffffff]">
              {acc.toString(16).toUpperCase().padStart(2, '0')}H
            </span>
            <span className="text-xs text-[#a8a29e] font-bold">
              Dec: <strong className="text-[#38bdf8]">{acc}</strong>
            </span>
          </div>
          <p className="text-[10px] text-[#a8a29e] leading-tight">
            Central math & data register.
          </p>
        </div>

        {/* B Register */}
        <div className="bg-[#141210] border border-[#524d43] p-2.5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#fbbf24] text-xs">B Register</span>
            <span className="text-[9px] text-[#a8a29e] uppercase">Math</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-xl font-black text-[#ffffff]">
              {b.toString(16).toUpperCase().padStart(2, '0')}H
            </span>
            <span className="text-xs text-[#a8a29e] font-bold">
              Dec: <strong className="text-[#38bdf8]">{b}</strong>
            </span>
          </div>
          <p className="text-[10px] text-[#a8a29e] leading-tight">
            Used with A for MUL and DIV.
          </p>
        </div>

        {/* Program Counter (PC) */}
        <div className="bg-[#141210] border border-[#524d43] p-2.5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#fbbf24] text-xs">Program Counter (PC)</span>
            <span className="text-[9px] text-[#a8a29e] uppercase">ROM</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-xl font-black text-[#38bdf8]">
              0x{pc.toString(16).toUpperCase().padStart(4, '0')}H
            </span>
            <span className="text-xs text-[#a8a29e] font-bold">
              Addr: <strong className="text-[#ffffff]">{pc}</strong>
            </span>
          </div>
          <p className="text-[10px] text-[#a8a29e] leading-tight">
            Address of next code instruction.
          </p>
        </div>

        {/* Port 1 LED Latch */}
        <div className="bg-[#141210] border border-[#524d43] p-2.5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#fbbf24] text-xs">Port 1 (LEDs)</span>
            <span className="text-[9px] text-[#a8a29e] uppercase">I/O</span>
          </div>
          <div className="my-1.5 flex items-center justify-between">
            <span className="text-xl font-black text-[#ffffff]">
              {p1.toString(16).toUpperCase().padStart(2, '0')}H
            </span>
            {/* 8 mini LED dots */}
            <div className="flex items-center gap-0.5">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                const isHigh = ((p1 >> bit) & 1) === 1;
                return (
                  <span
                    key={bit}
                    title={`P1.${bit}: ${isHigh ? 'HIGH (1)' : 'LOW (0)'}`}
                    className={`w-2 h-2 rounded-full border border-black ${
                      isHigh
                        ? 'bg-[#ef4444] shadow-[0_0_4px_#ef4444]'
                        : 'bg-[#292524]'
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-[#a8a29e] leading-tight">
            Output driving Port 1 LED pins.
          </p>
        </div>
      </div>

      {/* Helpful Auxiliary: Working Registers R0, R1, R7 & Simplified Flags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#2d2822]">
        {/* Working Registers */}
        <div className="bg-[#141210] border border-[#38332c] p-2 rounded-xs flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#a8a29e]">General Registers:</span>
          <div className="flex items-center gap-3 text-xs">
            <span>R0: <strong className="text-[#ffffff]">{r0.toString(16).toUpperCase().padStart(2, '0')}H</strong></span>
            <span>R1: <strong className="text-[#ffffff]">{r1.toString(16).toUpperCase().padStart(2, '0')}H</strong></span>
            <span>R7 (Loop): <strong className="text-[#fbbf24]">{r7.toString(16).toUpperCase().padStart(2, '0')}H</strong></span>
          </div>
        </div>

        {/* Simplified Status Flags */}
        <div className="bg-[#141210] border border-[#38332c] p-2 rounded-xs flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#a8a29e]">Key Flags:</span>
          <div className="flex items-center gap-2 text-[11px]">
            <span
              className={`px-1.5 py-0.5 rounded-xs font-black ${
                isCarry ? 'bg-[#f59e0b] text-[#000000]' : 'bg-[#292524] text-[#78716c]'
              }`}
              title="Carry Flag (CY): Set when math overflows 8 bits"
            >
              CARRY
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-xs font-black ${
                isZero ? 'bg-[#38bdf8] text-[#000000]' : 'bg-[#292524] text-[#78716c]'
              }`}
              title="Zero: Accumulator is currently 0"
            >
              ZERO
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-xs font-black ${
                isOverflow ? 'bg-[#ef4444] text-[#ffffff]' : 'bg-[#292524] text-[#78716c]'
              }`}
              title="Overflow Flag (OV)"
            >
              OVERFLOW
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-xs font-black ${
                isParity ? 'bg-[#10b981] text-[#000000]' : 'bg-[#292524] text-[#78716c]'
              }`}
              title="Parity (P): 1 if number of 1s in Accumulator is odd"
            >
              PARITY (ODD)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
