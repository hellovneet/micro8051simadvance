/**
 * Micro8051SiM - Streamlined & Attractive Homepage
 * Clean, modern, retro-electronic lab portal.
 * Simple, uncluttered presentation without overwhelming details.
 * Features realistic 7-segment badge, sleek level selection cards, and quick starts.
 */

import React, { useState } from 'react';
import { Sun, Moon, Cpu, BookOpen } from 'lucide-react';
import { EXAMPLES, ExampleProgram } from '../../examples/examples.ts';
import { RealisticSingleDigit } from '../virtual-bench/SevenSegmentDisplay.tsx';
import { LearnMicro8051Modal } from '../learn/LearnMicro8051Modal.tsx';

export type SimulatorLevel = 'beginner' | 'intermediate' | 'advanced';

interface HomePageProps {
  onSelectLevel: (level: SimulatorLevel) => void;
  onLaunchExample: (example: ExampleProgram, level: SimulatorLevel) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenSettings: () => void;
  onOpenInstructionRef: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectLevel,
  onLaunchExample,
  isHighContrast,
  onToggleHighContrast,
  onOpenSettings,
  onOpenInstructionRef,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [hoveredCard, setHoveredCard] = useState<SimulatorLevel | null>(null);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState<boolean>(false);

  return (
    <div className={`min-h-screen w-full bg-[#0d0c0b] text-[#ded7cd] font-mono flex flex-col selection:bg-[#fbbf24]/30 selection:text-[#ffffff] ${isHighContrast ? 'high-contrast' : ''}`}>
      {/* Top Navigation */}
      <header className="bg-[#141210]/90 backdrop-blur-md border-b border-[#292524] px-4 sm:px-6 py-3 flex items-center justify-between select-none sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_12px_#f59e0b] border-2 border-[#fbbf24]" />
          <div className="flex items-baseline gap-2">
            <span className="font-black tracking-wider text-[#fbbf24] text-base">
              Micro8051SiM
            </span>
            <span className="hidden md:inline-block text-[11px] text-[#78716c] font-medium">
              Virtual 8051 Electronics Lab
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dedicated Learn about Micro8051 Button */}
          <button
            onClick={() => setIsLearnModalOpen(true)}
            className="px-3 py-1.5 text-xs font-black text-black bg-[#fbbf24] hover:bg-[#f59e0b] rounded-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            title="Open comprehensive 8051 learning hub with pinouts, formulas, study material and programming guides"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Learn about Micro8051</span>
          </button>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-[#ffffff] text-[#0f172a] border-[#cbd5e1] hover:border-[#94a3b8]'
                  : 'bg-[#1c1917] text-[#ded7cd] hover:text-[#ffffff] border-[#38332c]'
              }`}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode (balanced for long simulation sessions)`}
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span className="hidden sm:inline">DARK</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#d97706]" />
                  <span className="hidden sm:inline">LIGHT</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={onOpenInstructionRef}
            className="px-3 py-1.5 text-xs font-bold text-[#e7e5e4] hover:text-[#fbbf24] bg-[#1c1917] hover:bg-[#26221f] border border-[#38332c] rounded-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>Instruction Reference</span>
          </button>
          <button
            onClick={onToggleHighContrast}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
              isHighContrast
                ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                : 'bg-[#1c1917] text-[#a8a29e] hover:text-[#ffffff] border-[#38332c]'
            }`}
            title="Toggle High Contrast Display"
          >
            <span>◐</span>
            <span className="hidden sm:inline">{isHighContrast ? 'CONTRAST ON' : 'CONTRAST'}</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 text-xs font-bold text-[#e7e5e4] hover:text-[#ffffff] bg-[#1c1917] hover:bg-[#26221f] border border-[#38332c] rounded-xs cursor-pointer transition-all"
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col gap-12">
        {/* Simple & Attractive Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto pt-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a1714] border border-[#38332c] rounded-full text-[11px] text-[#fbbf24] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-bold tracking-wide uppercase">8051 Virtual Hardware Laboratory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#ffffff] tracking-tight leading-tight">
            Learn, Build & Simulate <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#ea580c]">
              8051 Microcontrollers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#a8a29e] max-w-2xl mx-auto leading-relaxed font-sans">
            Write and execute 8051 Assembly in real time with interactive LEDs, switches, LCD, 
            and cycle-accurate execution. Choose your simulation mode to begin.
          </p>

          {/* Realistic 7-Segment "8051" Hardware Badge */}
          <div className="pt-2 flex justify-center">
            <div className="bg-[#090706] border-2 border-[#2b2723] px-4 py-2 rounded-sm shadow-xl flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {/* 8: 0x7F, 0: 0x3F, 5: 0x6D, 1: 0x06 */}
                <RealisticSingleDigit byteVal={0x7f} intensity={1} color="red" />
                <RealisticSingleDigit byteVal={0x3f} intensity={1} color="red" />
                <RealisticSingleDigit byteVal={0x6d} intensity={1} color="red" />
                <RealisticSingleDigit byteVal={0x06} intensity={1} color="red" />
              </div>
              <div className="text-left border-l border-[#2b2723] pl-3 py-1 hidden sm:block">
                <div className="text-[10px] text-[#78716c] font-black tracking-widest uppercase">REAL-TIME DISPLAY</div>
                <div className="text-xs font-black text-[#fca5a5]">5641AH 4-DIGIT LED</div>
                <div className="text-[9.5px] text-[#a8a29e]">Multiplexed Common Cathode</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Streamlined Level Selection Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level 1: Beginner */}
          <div
            onMouseEnter={() => setHoveredCard('beginner')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-[#141210] border-2 border-[#10b981]/40 hover:border-[#10b981] rounded-sm p-6 flex flex-col justify-between shadow-lg hover:shadow-emerald-950/20 transition-all duration-300 group relative hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 rounded-xs">
                  Level 1 · Beginner
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                  01
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-[#ffffff] group-hover:text-[#10b981] transition-colors">
                  Beginner Friendly
                </h2>
                <p className="text-xs text-[#a8a29e] mt-1.5 leading-relaxed font-sans">
                  Visual, guided learning for students and first-time assembly coders with plain-English instruction explanation.
                </p>
              </div>

              {/* Concise Highlights */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Plain-English Translator
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  8 LEDs & Switches Bench
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Data Memory RAM (128B)
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Step-by-Step Guidance
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#26221d]">
              <button
                onClick={() => onSelectLevel('beginner')}
                className="w-full py-2.5 px-4 bg-[#10b981] hover:bg-[#34d399] text-[#000000] font-black text-xs uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md group-hover:shadow-emerald-500/25"
              >
                <span>Launch Beginner Mode</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          {/* Level 2: Intermediate */}
          <div
            onMouseEnter={() => setHoveredCard('intermediate')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-[#141210] border-2 border-[#f59e0b]/40 hover:border-[#fbbf24] rounded-sm p-6 flex flex-col justify-between shadow-lg hover:shadow-amber-950/20 transition-all duration-300 group relative hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30 rounded-xs">
                  Level 2 · Intermediate
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/20">
                  02
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-[#ffffff] group-hover:text-[#fbbf24] transition-colors">
                  Virtual Lab Workbench
                </h2>
                <p className="text-xs text-[#a8a29e] mt-1.5 leading-relaxed font-sans">
                  EdSim51-grade lab environment for university coursework and practical microcontroller assignments.
                </p>
              </div>

              {/* Concise Highlights */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Full R0–R7 Register Banks
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Realistic 7-Segment & LCD
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  4×4 Keypad & DC Motor
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Full Assembly Editor
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#26221d]">
              <button
                onClick={() => onSelectLevel('intermediate')}
                className="w-full py-2.5 px-4 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#000000] font-black text-xs uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md group-hover:shadow-amber-500/25"
              >
                <span>Launch Workbench Mode</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          {/* Level 3: Advanced */}
          <div
            onMouseEnter={() => setHoveredCard('advanced')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-[#141210] border-2 border-[#06b6d4]/40 hover:border-[#22d3ee] rounded-sm p-6 flex flex-col justify-between shadow-lg hover:shadow-cyan-950/20 transition-all duration-300 group relative hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#06b6d4]/15 text-[#22d3ee] border border-[#06b6d4]/30 rounded-xs">
                  Level 3 · Advanced
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/20">
                  03
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-[#ffffff] group-hover:text-[#22d3ee] transition-colors">
                  Pro Engineering IDE
                </h2>
                <p className="text-xs text-[#a8a29e] mt-1.5 leading-relaxed font-sans">
                  Deep engineering studio for firmware developers with cycle-accurate timing and advanced instruments.
                </p>
              </div>

              {/* Concise Highlights */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Synchronized Disassembly
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  64KB Memory Matrix & SFR
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  Dual-Channel Oscilloscope
                </span>
                <span className="text-[11px] font-bold px-2 py-1 bg-[#1a1714] text-[#ded7cd] border border-[#2b2723] rounded-xs">
                  UART Serial Terminal
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#26221d]">
              <button
                onClick={() => onSelectLevel('advanced')}
                className="w-full py-2.5 px-4 bg-[#06b6d4] hover:bg-[#22d3ee] text-[#000000] font-black text-xs uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md group-hover:shadow-cyan-500/25"
              >
                <span>Launch Advanced Mode</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dedicated "Learn about Micro8051" Hub Section */}
        <section className="bg-gradient-to-r from-[#1c1712] via-[#161310] to-[#1a1714] border-2 border-[#f59e0b]/50 hover:border-[#fbbf24] rounded-sm p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all group">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/30 text-[11px] font-black uppercase">
                <Cpu className="w-3.5 h-3.5" />
                <span>Microcontroller 8051 Complete Knowledge & Study Center</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Learn About Microcontroller 8051
              </h2>
              <p className="text-xs sm:text-sm text-[#cbd5e1] font-sans leading-relaxed">
                Understand why engineering universities teach the 8051, explore the interactive 40-pin DIP chip architecture, master key formulas (machine cycles, 16-bit timer reload, 9600-baud UART calculation), and learn assembly programming with verified code walkthroughs.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
                <span className="px-2 py-0.5 bg-[#0e0c0a] text-[#fbbf24] border border-[#38332c] rounded-xs font-bold">
                  ★ 40-Pin DIP Pinout & ALU
                </span>
                <span className="px-2 py-0.5 bg-[#0e0c0a] text-[#38bdf8] border border-[#38332c] rounded-xs font-bold">
                  ★ Why We Learn 8051
                </span>
                <span className="px-2 py-0.5 bg-[#0e0c0a] text-[#4ade80] border border-[#38332c] rounded-xs font-bold">
                  ★ Timing & Baud Formulas
                </span>
                <span className="px-2 py-0.5 bg-[#0e0c0a] text-[#f472b6] border border-[#38332c] rounded-xs font-bold">
                  ★ 5 Addressing Modes
                </span>
                <span className="px-2 py-0.5 bg-[#0e0c0a] text-[#a78bfa] border border-[#38332c] rounded-xs font-bold">
                  ★ UART Serial & Interrupts
                </span>
              </div>
            </div>

            {/* Launch Button & Guidance */}
            <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsLearnModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-black text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 group-hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore 8051 Study Hub</span>
                <span>→</span>
              </button>
              <span className="text-[10px] text-[#78716c] font-mono">
                Interactive diagrams, formula calculator & code guides
              </span>
            </div>
          </div>
        </section>

        {/* Quick Launch Pre-loaded Examples (Clean & Compact) */}
        <section className="bg-[#141210] border border-[#292524] rounded-sm p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#26221d] gap-1">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#ffffff]">
                Quick Start Programs
              </h3>
              <p className="text-xs text-[#a8a29e] mt-0.5 font-sans">
                Select a verified example to jump straight into simulation:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: 'led-blink', title: '1. LED Blink & Delay', desc: 'DJNZ loop delay toggling P1.0', level: 'beginner' as SimulatorLevel, tag: 'BEGINNER' },
              { id: 'led-counter', title: '2. 8-Bit Binary Counter', desc: 'Binary counter 0–255 on Port 1', level: 'beginner' as SimulatorLevel, tag: 'BEGINNER' },
              { id: 'seven-segment', title: '3. 7-Segment Multiplex', desc: 'Multiplexed 4-digit display scanning', level: 'intermediate' as SimulatorLevel, tag: 'INTERMEDIATE' },
              { id: 'lcd-hello', title: '4. 16×2 LCD Character Display', desc: 'HD44780 initialization & string output', level: 'intermediate' as SimulatorLevel, tag: 'INTERMEDIATE' },
              { id: 'keypad-reader', title: '5. 4×4 Matrix Keypad', desc: 'Row/column scanning on Port 0', level: 'intermediate' as SimulatorLevel, tag: 'INTERMEDIATE' },
              { id: 'uart-echo', title: '6. UART Serial Echo', desc: 'Timer 1 Mode 2 9600-baud serial echo', level: 'advanced' as SimulatorLevel, tag: 'ADVANCED' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const ex = EXAMPLES.find((e) => e.id === item.id) || EXAMPLES[0];
                  onLaunchExample(ex, item.level);
                }}
                className="bg-[#1a1714] hover:bg-[#221e1a] border border-[#2b2723] hover:border-[#fbbf24]/60 p-3 rounded-xs cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-[9.5px] font-black text-[#fbbf24] tracking-wider mb-0.5">
                    {item.tag}
                  </div>
                  <h4 className="font-bold text-xs text-[#ffffff] group-hover:text-[#fbbf24] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#78716c] font-sans">
                    {item.desc}
                  </p>
                </div>
                <div className="text-[#fbbf24] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all pl-2 text-sm font-bold">
                  →
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer with Specified Authors Copyright */}
      <footer className="bg-[#0f0e0d] border-t border-[#24201c] px-4 sm:px-6 py-4 text-xs select-none mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[#78716c]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="font-bold text-[#ded7cd]">Micro8051SiM</span>
            <span>·</span>
            <span>Virtual Microcontroller Simulator</span>
          </div>

          <div className="font-bold text-[#ded7cd] text-center sm:text-right tracking-wide">
            © 2026 Vineet Sharma , Chaman Vashishth
          </div>
        </div>
      </footer>

      {/* Comprehensive 8051 Knowledge & Learning Modal */}
      <LearnMicro8051Modal
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
        onLoadExample={(code, title) => {
          const matched = EXAMPLES.find((e) => e.title.toLowerCase().includes(title.toLowerCase())) || EXAMPLES[0];
          onLaunchExample({ ...matched, sourceCode: code, title }, 'intermediate');
        }}
        theme={theme}
      />
    </div>
  );
};
