/**
 * Micro8051SiM - Comprehensive 8051 Microcontroller Knowledge & Learning Hub
 * Detailed architectural guide, DIP-40 pinout diagram, formulas, study material,
 * programming guide, serial communication, and why we learn 8051.
 */

import React, { useState } from 'react';
import { X, BookOpen, Cpu, Calculator, Code2, Radio, Sparkles, ExternalLink, Play, Search, Copy, Check } from 'lucide-react';
import { ExampleProgram } from '../../examples/examples.ts';

interface LearnMicro8051ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadExample?: (code: string, title: string) => void;
  theme?: 'dark' | 'light';
}

type TabId = 'overview' | 'why-learn' | 'formulas' | 'programming' | 'communication';

// DIP-40 Pin Data
interface PinInfo {
  pin: number;
  name: string;
  type: 'io' | 'power' | 'control' | 'clock';
  desc: string;
  altFunction?: string;
  notes?: string;
}

const PINS_LEFT: PinInfo[] = [
  { pin: 1, name: 'P1.0', type: 'io', desc: 'Port 1, Bit 0', altFunction: 'T2 (8052 Timer 2)', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 2, name: 'P1.1', type: 'io', desc: 'Port 1, Bit 1', altFunction: 'T2EX (8052 Timer 2 capture)', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 3, name: 'P1.2', type: 'io', desc: 'Port 1, Bit 2', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 4, name: 'P1.3', type: 'io', desc: 'Port 1, Bit 3', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 5, name: 'P1.4', type: 'io', desc: 'Port 1, Bit 4', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 6, name: 'P1.5', type: 'io', desc: 'Port 1, Bit 5', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 7, name: 'P1.6', type: 'io', desc: 'Port 1, Bit 6', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 8, name: 'P1.7', type: 'io', desc: 'Port 1, Bit 7', notes: 'Quasi-bidirectional I/O with internal pull-up' },
  { pin: 9, name: 'RST', type: 'control', desc: 'Reset Input', notes: 'Active HIGH. Must be held high for at least 2 machine cycles (24 clock pulses) to reset CPU.' },
  { pin: 10, name: 'P3.0', type: 'io', desc: 'Port 3, Bit 0', altFunction: 'RXD (Serial In)', notes: 'UART asynchronous serial data receive line' },
  { pin: 11, name: 'P3.1', type: 'io', desc: 'Port 3, Bit 1', altFunction: 'TXD (Serial Out)', notes: 'UART asynchronous serial data transmit line' },
  { pin: 12, name: 'P3.2', type: 'io', desc: 'Port 3, Bit 2', altFunction: 'INT0 (External Interrupt 0)', notes: 'Active LOW edge or level-triggered external interrupt' },
  { pin: 13, name: 'P3.3', type: 'io', desc: 'Port 3, Bit 3', altFunction: 'INT1 (External Interrupt 1)', notes: 'Active LOW edge or level-triggered external interrupt' },
  { pin: 14, name: 'P3.4', type: 'io', desc: 'Port 3, Bit 4', altFunction: 'T0 (Timer 0 External Clock)', notes: 'External pulse input for Timer/Counter 0' },
  { pin: 15, name: 'P3.5', type: 'io', desc: 'Port 3, Bit 5', altFunction: 'T1 (Timer 1 External Clock)', notes: 'External pulse input for Timer/Counter 1' },
  { pin: 16, name: 'P3.6', type: 'io', desc: 'Port 3, Bit 6', altFunction: 'WR (External RAM Write)', notes: 'Active LOW strobe for external data memory write (MOVX @DPTR, A)' },
  { pin: 17, name: 'P3.7', type: 'io', desc: 'Port 3, Bit 7', altFunction: 'RD (External RAM Read)', notes: 'Active LOW strobe for external data memory read (MOVX A, @DPTR)' },
  { pin: 18, name: 'XTAL2', type: 'clock', desc: 'Crystal Oscillator 2', notes: 'Output from internal inverting oscillator amplifier' },
  { pin: 19, name: 'XTAL1', type: 'clock', desc: 'Crystal Oscillator 1', notes: 'Input to internal clock generator. Connect quartz crystal (e.g. 11.0592 MHz / 12 MHz) with two 30pF capacitors.' },
  { pin: 20, name: 'GND', type: 'power', desc: 'Ground (0V Reference)', notes: 'Common system ground' },
];

const PINS_RIGHT: PinInfo[] = [
  { pin: 40, name: 'VCC', type: 'power', desc: '+5V Power Supply', notes: 'Standard 5V DC operational power input' },
  { pin: 39, name: 'P0.0', type: 'io', desc: 'Port 0, Bit 0', altFunction: 'AD0 (Address/Data 0)', notes: 'Open-drain I/O. Requires 10kΩ external pull-up resistors for general I/O.' },
  { pin: 38, name: 'P0.1', type: 'io', desc: 'Port 0, Bit 1', altFunction: 'AD1 (Address/Data 1)', notes: 'Open-drain I/O. Multiplexed low-order address/data bus.' },
  { pin: 37, name: 'P0.2', type: 'io', desc: 'Port 0, Bit 2', altFunction: 'AD2 (Address/Data 2)', notes: 'Open-drain I/O. Multiplexed low-order address/data bus.' },
  { pin: 36, name: 'P0.3', type: 'io', desc: 'Port 0, Bit 3', altFunction: 'AD3 (Address/Data 3)', notes: 'Open-drain I/O. Multiplexed low-order address/data bus.' },
  { pin: 35, name: 'P0.4', type: 'io', desc: 'Port 0, Bit 4', altFunction: 'AD4 (Address/Data 4)', notes: 'Open-drain I/O. Multiplexed low-order address/data bus.' },
  { pin: 34, name: 'P0.5', type: 'io', desc: 'Port 0, Bit 5', altFunction: 'AD5 (Address/Data 5)', notes: 'Open-drain I/O. Multiplexed low-order address/data bus.' },
  { pin: 33, name: 'P0.6', type: 'io', desc: 'Port 0, Bit 6', altFunction: 'AD6 (Address/Data 6)', notes: 'Open-drain I/O. Multiplexed low-order address/data bus.' },
  { pin: 32, name: 'P0.7', type: 'io', desc: 'Port 0, Bit 7', altFunction: 'AD7 (Address/Data 7)', notes: 'Open-drain I/O. Multiplexed low-order address/data bus.' },
  { pin: 31, name: 'EA/VPP', type: 'control', desc: 'External Access Enable', notes: 'Connect to +5V (VCC) to execute internal ROM (0000H-0FFFH). Connect to GND to force external ROM execution.' },
  { pin: 30, name: 'ALE/PROG', type: 'control', desc: 'Address Latch Enable', notes: 'Outputs pulses at F_osc/6 to demultiplex Address from Port 0 into external 74LS373 latch.' },
  { pin: 29, name: 'PSEN', type: 'control', desc: 'Program Store Enable', notes: 'Active LOW read strobe for external program code memory (ROM/EPROM).' },
  { pin: 28, name: 'P2.7', type: 'io', desc: 'Port 2, Bit 7', altFunction: 'A15 (High Address 15)', notes: 'High-order address bus byte for 64KB memory interfacing' },
  { pin: 27, name: 'P2.6', type: 'io', desc: 'Port 2, Bit 6', altFunction: 'A14 (High Address 14)', notes: 'High-order address bus byte' },
  { pin: 26, name: 'P2.5', type: 'io', desc: 'Port 2, Bit 5', altFunction: 'A13 (High Address 13)', notes: 'High-order address bus byte' },
  { pin: 25, name: 'P2.4', type: 'io', desc: 'Port 2, Bit 4', altFunction: 'A12 (High Address 12)', notes: 'High-order address bus byte' },
  { pin: 24, name: 'P2.3', type: 'io', desc: 'Port 2, Bit 3', altFunction: 'A11 (High Address 11)', notes: 'High-order address bus byte' },
  { pin: 23, name: 'P2.2', type: 'io', desc: 'Port 2, Bit 2', altFunction: 'A10 (High Address 10)', notes: 'High-order address bus byte' },
  { pin: 22, name: 'P2.1', type: 'io', desc: 'Port 2, Bit 1', altFunction: 'A9 (High Address 9)', notes: 'High-order address bus byte' },
  { pin: 21, name: 'P2.0', type: 'io', desc: 'Port 2, Bit 0', altFunction: 'A8 (High Address 8)', notes: 'High-order address bus byte' },
];

export const LearnMicro8051Modal: React.FC<LearnMicro8051ModalProps> = ({
  isOpen,
  onClose,
  onLoadExample,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedPin, setSelectedPin] = useState<PinInfo>(PINS_LEFT[0]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Formula Calculator State
  const [calcOscMhz, setCalcOscMhz] = useState<number>(11.0592);
  const [desiredDelayMs, setDesiredDelayMs] = useState<number>(10);
  const [targetBaudRate, setTargetBaudRate] = useState<number>(9600);
  const [smodBit, setSmodBit] = useState<number>(0);

  if (!isOpen) return null;

  // Real-time Calculations
  const machineCycleMicroSec = 12 / calcOscMhz;
  const timer1CountsNeeded = (desiredDelayMs * 1000) / machineCycleMicroSec;
  const timer1InitValue = Math.max(0, Math.min(65535, Math.round(65536 - timer1CountsNeeded)));
  const timer1Th0 = (timer1InitValue >> 8) & 0xFF;
  const timer1Tl0 = timer1InitValue & 0xFF;

  // Baud rate TH1 reload value:
  // Baud = (2^SMOD / 32) * (F_osc / (12 * (256 - TH1)))
  // => (256 - TH1) = (2^SMOD * F_osc) / (32 * 12 * Baud)
  const baudFactor = (Math.pow(2, smodBit) * (calcOscMhz * 1000000)) / (384 * targetBaudRate);
  const th1ReloadValue = Math.round(256 - baudFactor);
  const actualBaud = (Math.pow(2, smodBit) * (calcOscMhz * 1000000)) / (384 * (256 - th1ReloadValue));
  const baudErrorPercent = Math.abs((actualBaud - targetBaudRate) / targetBaudRate) * 100;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleLaunchCode = (code: string, title: string) => {
    if (onLoadExample) {
      onLoadExample(code, title);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="bg-[#12100e] text-[#ded7cd] border-2 border-[#524d43] rounded-md shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-[#1a1714] border-b border-[#38332c] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#f59e0b]/20 border border-[#f59e0b] flex items-center justify-center text-[#fbbf24]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-[#ffffff] tracking-wide">
                  Intel 8051 Microcontroller Knowledge & Learning Hub
                </h1>
                <span className="text-[10px] bg-[#fbbf24] text-black font-black px-1.5 py-0.2 rounded-xs">
                  8-BIT HARVARD
                </span>
              </div>
              <p className="text-[11px] text-[#a8a29e] font-sans">
                Complete architectural guide, timing formulas, study material, programming walkthroughs, and communication.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#a8a29e] hover:text-[#ffffff] hover:bg-[#26221d] rounded border border-[#38332c] cursor-pointer transition-colors"
            title="Close Learning Hub (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Navigation Strip */}
        <nav className="bg-[#141210] border-b border-[#38332c] px-3 flex items-center gap-1 overflow-x-auto shrink-0 text-xs">
          {[
            { id: 'overview', label: '1. Architecture & 40-Pin DIP Chip', icon: Cpu },
            { id: 'why-learn', label: '2. Why Learn 8051?', icon: BookOpen },
            { id: 'formulas', label: '3. Formulas & Timing Math', icon: Calculator },
            { id: 'programming', label: '4. How to Program 8051', icon: Code2 },
            { id: 'communication', label: '5. Serial & Interfacing', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`px-3 py-2.5 font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#fbbf24] text-[#fbbf24] bg-[#1c1917]'
                    : 'border-transparent text-[#a8a29e] hover:text-[#ffffff] hover:bg-[#181512]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: ARCHITECTURE & 40-PIN CHIP DIAGRAM */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Summary Card */}
              <div className="bg-[#1a1714] border border-[#38332c] p-4 rounded-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/30">
                    SILICON ARCHITECTURE SNAPSHOT
                  </div>
                  <h2 className="text-lg font-black text-white">The Classic Intel MCS-51 (8051) Architecture</h2>
                  <p className="text-xs text-[#a8a29e] leading-relaxed font-sans">
                    Introduced by Intel in 1980, the 8051 is an 8-bit Harvard-architecture microcontroller. Unlike pure microprocessors like the 8085 or Z80, the 8051 integrates a central processing unit (CPU), RAM, ROM, parallel I/O ports, timers, interrupt controller, and a serial UART onto a single silicon die.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="bg-[#0f0e0c] p-2 rounded border border-[#2b2723]">
                      <span className="text-[#78716c] block">DATA BUS:</span>
                      <strong className="text-[#fbbf24]">8-Bit Parallel</strong>
                    </div>
                    <div className="bg-[#0f0e0c] p-2 rounded border border-[#2b2723]">
                      <span className="text-[#78716c] block">ADDRESS BUS:</span>
                      <strong className="text-[#38bdf8]">16-Bit (64KB Code)</strong>
                    </div>
                    <div className="bg-[#0f0e0c] p-2 rounded border border-[#2b2723]">
                      <span className="text-[#78716c] block">INTERNAL RAM:</span>
                      <strong className="text-[#4ade80]">128 Bytes (00-7FH)</strong>
                    </div>
                    <div className="bg-[#0f0e0c] p-2 rounded border border-[#2b2723]">
                      <span className="text-[#78716c] block">I/O PORTS:</span>
                      <strong className="text-[#f472b6]">4 × 8-Bit (P0-P3)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Realistic 40-Pin DIP Package Visualizer & Inspector */}
              <div className="bg-[#141210] border border-[#38332c] p-4 rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#2b2723] gap-2">
                  <div>
                    <h3 className="text-sm font-black text-[#fbbf24] uppercase tracking-wider">
                      Interactive 8051 DIP-40 Package Pinout
                    </h3>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Click any pin on the dual-in-line package below to inspect electrical characteristics, alternate functions, and hardware notes:
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#292524] text-[#fbbf24] border border-[#524d43]">
                    Selected: Pin {selectedPin.pin} ({selectedPin.name})
                  </span>
                </div>

                {/* The DIP-40 Chip Visual Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left Column: Pins 1-20 */}
                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[10px] font-bold text-[#78716c] block mb-1">PINS 1 TO 20 (LEFT SIDE):</span>
                    {PINS_LEFT.map((p) => {
                      const isSel = selectedPin.pin === p.pin;
                      return (
                        <div
                          key={p.pin}
                          onClick={() => setSelectedPin(p)}
                          className={`flex items-center justify-between px-2 py-1 rounded-xs text-[11px] cursor-pointer transition-all border ${
                            isSel
                              ? 'bg-[#fbbf24] text-black border-[#fbbf24] font-black shadow-md'
                              : 'bg-[#1c1917] hover:bg-[#2b2723] text-[#ded7cd] border-[#2b2723]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 text-center font-mono font-bold ${isSel ? 'text-black' : 'text-[#78716c]'}`}>
                              {p.pin}
                            </span>
                            <span className="font-bold">{p.name}</span>
                          </div>
                          <span className={`text-[10px] ${isSel ? 'text-black/80 font-bold' : 'text-[#a8a29e]'}`}>
                            {p.altFunction ? p.altFunction.split(' ')[0] : p.desc.slice(0, 16)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Center Column: The IC Silicon Body */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-[#0a0807] border-2 border-[#2b2723] rounded-sm relative shadow-inner">
                    {/* Notch at Top */}
                    <div className="w-8 h-4 bg-[#141210] border-b-2 border-x-2 border-[#38332c] rounded-b-full mb-3" />
                    
                    {/* Chip Laser Etching */}
                    <div className="text-center space-y-1 my-6 py-6 border-y border-[#26221d] w-full">
                      <div className="text-[11px] text-[#78716c] tracking-widest font-black">INTEL MCS-51</div>
                      <div className="text-xl font-black text-[#ded7cd] tracking-wider">i8051AH</div>
                      <div className="text-[9.5px] text-[#a8a29e]">DIP-40 CERAMIC / PLASTIC</div>
                      <div className="text-[8.5px] text-[#57534e]">8-BIT MICROCONTROLLER</div>
                    </div>

                    {/* Selected Pin Details Box */}
                    <div className="w-full bg-[#161310] border border-[#38332c] p-3 rounded text-left space-y-2 mt-2">
                      <div className="flex items-center justify-between border-b border-[#2b2723] pb-1">
                        <span className="text-xs font-black text-[#fbbf24]">
                          PIN {selectedPin.pin}: {selectedPin.name}
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-[#26221d] text-[#ffffff] rounded uppercase">
                          {selectedPin.type}
                        </span>
                      </div>
                      <div className="text-xs text-white font-bold">{selectedPin.desc}</div>
                      {selectedPin.altFunction && (
                        <div className="text-[11px] text-[#38bdf8]">
                          <strong className="text-[#78716c]">Alternate Function:</strong> {selectedPin.altFunction}
                        </div>
                      )}
                      {selectedPin.notes && (
                        <div className="text-[11px] text-[#cbd5e1] font-sans leading-relaxed pt-1 border-t border-[#26221d]">
                          {selectedPin.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Pins 40 down to 21 */}
                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[10px] font-bold text-[#78716c] block mb-1">PINS 40 TO 21 (RIGHT SIDE):</span>
                    {PINS_RIGHT.map((p) => {
                      const isSel = selectedPin.pin === p.pin;
                      return (
                        <div
                          key={p.pin}
                          onClick={() => setSelectedPin(p)}
                          className={`flex items-center justify-between px-2 py-1 rounded-xs text-[11px] cursor-pointer transition-all border ${
                            isSel
                              ? 'bg-[#fbbf24] text-black border-[#fbbf24] font-black shadow-md'
                              : 'bg-[#1c1917] hover:bg-[#2b2723] text-[#ded7cd] border-[#2b2723]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 text-center font-mono font-bold ${isSel ? 'text-black' : 'text-[#78716c]'}`}>
                              {p.pin}
                            </span>
                            <span className="font-bold">{p.name}</span>
                          </div>
                          <span className={`text-[10px] ${isSel ? 'text-black/80 font-bold' : 'text-[#a8a29e]'}`}>
                            {p.altFunction ? p.altFunction.split(' ')[0] : p.desc.slice(0, 16)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Internal Block Diagram */}
              <div className="bg-[#141210] border border-[#38332c] p-4 rounded-sm space-y-3">
                <h3 className="text-sm font-black text-[#fbbf24] uppercase tracking-wider">
                  8051 Functional Silicon Blocks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <span className="font-black text-[#4ade80]">1. Arithmetic Logic Unit (ALU)</span>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Performs 8-bit addition, subtraction, multiplication (`MUL AB`), division (`DIV AB`), boolean logic, and BCD decimal adjustments (`DA A`).
                    </p>
                  </div>
                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <span className="font-black text-[#38bdf8]">2. Accumulator (ACC) & B Register</span>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      ACC (E0H) is the central 8-bit register for all math and data transfers. B (F0H) is used exclusively during multiply and divide operations.
                    </p>
                  </div>
                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <span className="font-black text-[#fbbf24]">3. Program Status Word (PSW)</span>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Holds status flags: Carry (CY), Auxiliary Carry (AC), Register Bank Select (RS1, RS0), Overflow (OV), and Parity (P).
                    </p>
                  </div>
                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <span className="font-black text-[#f472b6]">4. Internal RAM (128 Bytes)</span>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Bank 0-3 (00H-1FH), Bit-Addressable RAM (20H-2FH), and Scratchpad RAM (30H-7FH).
                    </p>
                  </div>
                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <span className="font-black text-[#a78bfa]">5. Dual 16-Bit Timers (T0, T1)</span>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Two configurable 16-bit timer/counters (TL0/TH0, TL1/TH1) for baud rate generation, delay loops, and pulse counting.
                    </p>
                  </div>
                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <span className="font-black text-[#34d399]">6. Full-Duplex Serial UART</span>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Provides asynchronous transmission (TXD) and reception (RXD) with double-buffered receive and programmable baud generation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHY WE LEARN 8051 & WHY WE MUST KNOW IT */}
          {activeTab === 'why-learn' && (
            <div className="space-y-6">
              <div className="bg-[#1a1714] border border-[#38332c] p-5 rounded-sm space-y-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                  PEDAGOGICAL & INDUSTRIAL SIGNIFICANCE
                </span>
                <h2 className="text-xl font-black text-white">Why Learn the 8051 Microcontroller?</h2>
                <p className="text-xs text-[#ded7cd] leading-relaxed font-sans">
                  In every major electrical, electronics, and computer engineering curriculum across the globe, the 8051 remains the undisputed foundation of embedded systems education. But why do we learn a chip designed decades ago? Here is why:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reason 1 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#fbbf24] text-black font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <h3 className="font-black text-white text-sm">Pure Silicon Transparency (No OS Abstraction)</h3>
                  </div>
                  <p className="text-xs text-[#a8a29e] font-sans leading-relaxed">
                    Modern microcontrollers like ARM Cortex-M or ESP32 have thousands of registers, layered vendor HALs (Hardware Abstraction Layers), and RTOS schedulers that hide what the hardware is actually doing. The 8051 has no OS. You directly manipulate real memory addresses, set individual port flip-flops, and manage hardware timers at the exact machine cycle level.
                  </p>
                </div>

                {/* Reason 2 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#38bdf8] text-black font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <h3 className="font-black text-white text-sm">The World's Best Example of Harvard Architecture</h3>
                  </div>
                  <p className="text-xs text-[#a8a29e] font-sans leading-relaxed">
                    The 8051 cleanly separates Program Code Memory (ROM accessed with `MOVC`) from Data Memory (RAM accessed with `MOV` and `MOVX`). Understanding this separation is essential for understanding modern cache structures, memory-mapped I/O, and secure microcontrollers.
                  </p>
                </div>

                {/* Reason 3 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#4ade80] text-black font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <h3 className="font-black text-white text-sm">The Revolutionary Silicon Boolean Processor</h3>
                  </div>
                  <p className="text-xs text-[#a8a29e] font-sans leading-relaxed">
                    The 8051 features a complete 1-bit boolean processor embedded directly into the CPU! It has 128 individually addressable bits in RAM (20H-2FH) and SFRs. You can execute `SETB P1.0`, `CPL P1.1`, or `ANL C, 20H.3` in a single machine cycle without clumsy shift-and-mask operations.
                  </p>
                </div>

                {/* Reason 4 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#f472b6] text-black font-black text-xs flex items-center justify-center">
                      4
                    </div>
                    <h3 className="font-black text-white text-sm">Over 1 Billion 8051-Core Chips Manufactured Yearly</h3>
                  </div>
                  <p className="text-xs text-[#a8a29e] font-sans leading-relaxed">
                    The 8051 is not a museum piece. Modern semiconductor companies (Silicon Labs, STC Micro, NXP, Microchip, Infineon) manufacture high-speed 1-clock (1T) 8051 chips. Millions of automotive sensor hubs, USB keyboards, Bluetooth BLE SoC chips, smart cards, and battery management systems run on 8051 cores!
                  </p>
                </div>
              </div>

              {/* Takeaway Banner */}
              <div className="bg-[#161310] border border-[#f59e0b]/50 p-4 rounded-sm flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#fbbf24] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-black text-white text-xs">The Golden Engineering Principle:</h4>
                  <p className="text-xs text-[#ded7cd] font-sans leading-relaxed">
                    "If you can write an interrupt-driven timer and UART driver in 8051 assembly, configuring ARM Cortex-M or RISC-V registers becomes second nature. The fundamental rules of memory maps, vector tables, and pin latches never change."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMULAS & TIMING CALCULATIONS */}
          {activeTab === 'formulas' && (
            <div className="space-y-6">
              {/* Interactive Timing & Reload Calculator */}
              <div className="bg-[#161310] border-2 border-[#f59e0b] p-4 rounded-sm space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#38332c] gap-2">
                  <div>
                    <h3 className="text-sm font-black text-[#fbbf24] uppercase tracking-wider flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Interactive 8051 Math & Formula Calculator
                    </h3>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Test crystal frequencies, timer counts, machine cycle times, and baud rate calculations live:
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setCalcOscMhz(11.0592); setDesiredDelayMs(10); setTargetBaudRate(9600); }}
                      className="px-2 py-1 text-[10px] font-bold bg-[#1f1b17] hover:bg-[#2b2723] text-[#fbbf24] rounded border border-[#38332c] cursor-pointer"
                    >
                      Preset: 11.0592 MHz (UART)
                    </button>
                    <button
                      onClick={() => { setCalcOscMhz(12.0); setDesiredDelayMs(1); setTargetBaudRate(9600); }}
                      className="px-2 py-1 text-[10px] font-bold bg-[#1f1b17] hover:bg-[#2b2723] text-white rounded border border-[#38332c] cursor-pointer"
                    >
                      Preset: 12.0 MHz (1µs Cycle)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Input 1: Crystal Frequency */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#78716c] font-bold block">1. CRYSTAL FREQUENCY (F_osc):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={calcOscMhz}
                        onChange={(e) => setCalcOscMhz(parseFloat(e.target.value) || 12)}
                        className="w-full bg-[#0a0807] border border-[#524d43] px-2 py-1.5 rounded text-[#ffffff] font-bold outline-none text-xs"
                      />
                      <span className="text-[#a8a29e] font-bold text-xs">MHz</span>
                    </div>
                  </div>

                  {/* Input 2: Desired Delay */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#78716c] font-bold block">2. DESIRED TIMER DELAY:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={desiredDelayMs}
                        onChange={(e) => setDesiredDelayMs(parseFloat(e.target.value) || 1)}
                        className="w-full bg-[#0a0807] border border-[#524d43] px-2 py-1.5 rounded text-[#ffffff] font-bold outline-none text-xs"
                      />
                      <span className="text-[#a8a29e] font-bold text-xs">ms</span>
                    </div>
                  </div>

                  {/* Input 3: Target Baud Rate */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#78716c] font-bold block">3. UART BAUD RATE:</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={targetBaudRate}
                        onChange={(e) => setTargetBaudRate(parseInt(e.target.value))}
                        className="w-full bg-[#0a0807] border border-[#524d43] px-2 py-1.5 rounded text-[#ffffff] font-bold outline-none text-xs"
                      >
                        <option value={9600}>9600 Baud</option>
                        <option value={4800}>4800 Baud</option>
                        <option value={2400}>2400 Baud</option>
                        <option value={1200}>1200 Baud</option>
                        <option value={19200}>19200 Baud</option>
                      </select>
                      <button
                        onClick={() => setSmodBit(smodBit === 0 ? 1 : 0)}
                        className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border ${
                          smodBit === 1 ? 'bg-[#10b981] text-black border-[#10b981]' : 'bg-[#1c1917] text-[#78716c] border-[#38332c]'
                        }`}
                        title="Toggle SMOD bit in PCON (doubles baud rate)"
                      >
                        SMOD={smodBit}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculation Results Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="bg-[#0a0807] border border-[#2b2723] p-3 rounded space-y-1">
                    <span className="text-[10px] text-[#78716c] font-bold block">1 MACHINE CYCLE TIME (T_mc):</span>
                    <div className="text-base font-black text-[#fbbf24]">
                      {machineCycleMicroSec.toFixed(4)} µs
                    </div>
                    <span className="text-[9.5px] text-[#a8a29e]">Formula: 12 / F_osc</span>
                  </div>

                  <div className="bg-[#0a0807] border border-[#2b2723] p-3 rounded space-y-1">
                    <span className="text-[10px] text-[#78716c] font-bold block">TIMER 0/1 MODE 1 RELOAD (16-BIT):</span>
                    <div className="text-base font-black text-[#38bdf8]">
                      TH0={timer1Th0.toString(16).toUpperCase().padStart(2, '0')}H, TL0={timer1Tl0.toString(16).toUpperCase().padStart(2, '0')}H
                    </div>
                    <span className="text-[9.5px] text-[#a8a29e]">
                      Init Decimal: {timer1InitValue} ({timer1CountsNeeded.toFixed(0)} counts)
                    </span>
                  </div>

                  <div className="bg-[#0a0807] border border-[#2b2723] p-3 rounded space-y-1">
                    <span className="text-[10px] text-[#78716c] font-bold block">TIMER 1 UART BAUD RELOAD (TH1):</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-[#4ade80]">
                        TH1 = {th1ReloadValue > 0 ? `0x${(th1ReloadValue & 0xFF).toString(16).toUpperCase()}H (${th1ReloadValue})` : 'ERR'}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${baudErrorPercent < 0.5 ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                        Error: {baudErrorPercent.toFixed(2)}%
                      </span>
                    </div>
                    <span className="text-[9.5px] text-[#a8a29e]">
                      Actual Baud: {actualBaud.toFixed(1)} bps
                    </span>
                  </div>
                </div>
              </div>

              {/* Study Material Formulas Reference Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formula 1 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2b2723] pb-1.5">
                    <h4 className="font-black text-[#fbbf24] text-xs">1. Machine Cycle & Clock Formula</h4>
                    <span className="text-[9.5px] font-mono text-[#78716c]">Timing</span>
                  </div>
                  <div className="bg-[#0a0807] p-2.5 rounded font-mono text-xs text-[#ffffff] border border-[#26221d] space-y-1">
                    <div>1 Machine Cycle = 12 Oscillator Clock Cycles</div>
                    <div className="text-[#fbbf24]">F_mc = F_osc / 12</div>
                    <div className="text-[#38bdf8]">T_mc = 12 / F_osc</div>
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    Every 8051 machine cycle consists of 6 states (S1 to S6), and each state consists of 2 clock pulses (P1 and P2).
                  </p>
                </div>

                {/* Formula 2 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2b2723] pb-1.5">
                    <h4 className="font-black text-[#fbbf24] text-xs">2. Timer Mode 1 Delay Formula (16-Bit)</h4>
                    <span className="text-[9.5px] font-mono text-[#78716c]">Timers</span>
                  </div>
                  <div className="bg-[#0a0807] p-2.5 rounded font-mono text-xs text-[#ffffff] border border-[#26221d] space-y-1">
                    <div>Max Capacity = 65536 (2^16)</div>
                    <div className="text-[#fbbf24]">Counts Needed = Delay / T_mc</div>
                    <div className="text-[#38bdf8]">Initial Value = 65536 - Counts</div>
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    Timer starts counting up until overflow at FFFFH &rarr; 0000H, which triggers TF0 / TF1 overflow flag in TCON.
                  </p>
                </div>

                {/* Formula 3 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2b2723] pb-1.5">
                    <h4 className="font-black text-[#fbbf24] text-xs">3. Baud Rate Formula (Timer 1 Mode 2)</h4>
                    <span className="text-[9.5px] font-mono text-[#78716c]">UART</span>
                  </div>
                  <div className="bg-[#0a0807] p-2.5 rounded font-mono text-xs text-[#ffffff] border border-[#26221d] space-y-1">
                    <div className="text-[#fbbf24]">Baud = (2^SMOD / 32) × [F_osc / (12 × (256 - TH1))]</div>
                    <div className="text-[#38bdf8]">Reload: TH1 = 256 - [(2^SMOD × F_osc) / (384 × Baud)]</div>
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    Why 11.0592 MHz is used: (11.0592M / 12) / 32 = 28,800 Hz. Dividing by 3 yields exactly 9600 Hz with 0.00% error!
                  </p>
                </div>

                {/* Formula 4 */}
                <div className="bg-[#141210] border border-[#38332c] p-4 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2b2723] pb-1.5">
                    <h4 className="font-black text-[#fbbf24] text-xs">4. Program Status Word (PSW) Bit Flags</h4>
                    <span className="text-[9.5px] font-mono text-[#78716c]">CPU Status</span>
                  </div>
                  <div className="bg-[#0a0807] p-2 rounded text-[11px] font-mono text-[#ffffff] border border-[#26221d] grid grid-cols-4 gap-1 text-center">
                    <div className="p-1 bg-[#1a1714] rounded"><span className="text-[#fbbf24] font-black block">CY (7)</span>Carry</div>
                    <div className="p-1 bg-[#1a1714] rounded"><span className="text-[#38bdf8] font-black block">AC (6)</span>Aux Carry</div>
                    <div className="p-1 bg-[#1a1714] rounded"><span className="text-[#4ade80] font-black block">RS1:0</span>Bank 0-3</div>
                    <div className="p-1 bg-[#1a1714] rounded"><span className="text-[#f472b6] font-black block">OV (2)</span>Overflow</div>
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    Parity bit (P, bit 0) is automatically calculated by hardware: set to 1 if Accumulator has odd number of 1s.
                  </p>
                </div>
              </div>

              {/* Memory Map Diagram */}
              <div className="bg-[#141210] border border-[#38332c] p-4 rounded space-y-3">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">
                  8051 Internal Data Memory (RAM) Address Map (128 Bytes: 00H - 7FH)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <div className="flex items-center justify-between text-[#fbbf24] font-black">
                      <span>00H – 1FH (32 Bytes)</span>
                      <span className="text-[10px] text-[#78716c]">4 Banks</span>
                    </div>
                    <strong className="text-white block text-xs">Register Banks 0 to 3</strong>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      Contains R0 through R7 for each bank. Selected by PSW.RS1 and PSW.RS0 bits. Bank 0 active by default.
                    </p>
                  </div>

                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <div className="flex items-center justify-between text-[#38bdf8] font-black">
                      <span>20H – 2FH (16 Bytes)</span>
                      <span className="text-[10px] text-[#78716c]">128 Bits</span>
                    </div>
                    <strong className="text-white block text-xs">Bit-Addressable RAM</strong>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      128 individual bit addresses (00H to 7FH). Direct bit operations like `SETB 00H` modify individual flip-flops.
                    </p>
                  </div>

                  <div className="bg-[#1c1917] p-3 rounded border border-[#2b2723] space-y-1">
                    <div className="flex items-center justify-between text-[#4ade80] font-black">
                      <span>30H – 7FH (80 Bytes)</span>
                      <span className="text-[10px] text-[#78716c]">80 Bytes</span>
                    </div>
                    <strong className="text-white block text-xs">Scratchpad / Stack Space</strong>
                    <p className="text-[11px] text-[#a8a29e] font-sans">
                      General user storage and stack. Stack Pointer (SP) points to 07H after reset, so stack grows upward into 08H+.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO PROGRAM 8051 */}
          {activeTab === 'programming' && (
            <div className="space-y-6">
              <div className="bg-[#1a1714] border border-[#38332c] p-4 rounded space-y-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  The 5 Core Addressing Modes of 8051 Assembly
                </h3>
                <p className="text-xs text-[#a8a29e] font-sans">
                  Every 8051 instruction obtains its data using one of five fundamental addressing methods:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* 1. Immediate */}
                <div className="bg-[#141210] border border-[#38332c] p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#fbbf24]">1. Immediate (#)</span>
                    <span className="text-[10px] text-[#78716c]">From ROM</span>
                  </div>
                  <div className="bg-[#0a0807] p-2 rounded text-[11px] font-mono text-[#ffffff] border border-[#26221d]">
                    MOV A, #55H<br />
                    MOV DPTR, #1234H
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    The constant `#` follows the instruction directly in code ROM.
                  </p>
                </div>

                {/* 2. Direct */}
                <div className="bg-[#141210] border border-[#38332c] p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#38bdf8]">2. Direct</span>
                    <span className="text-[10px] text-[#78716c]">Address Byte</span>
                  </div>
                  <div className="bg-[#0a0807] p-2 rounded text-[11px] font-mono text-[#ffffff] border border-[#26221d]">
                    MOV A, 30H<br />
                    MOV P1, 40H
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    Reads or writes memory by its direct RAM or SFR address (e.g. 30H).
                  </p>
                </div>

                {/* 3. Register */}
                <div className="bg-[#141210] border border-[#38332c] p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#4ade80]">3. Register (Rn)</span>
                    <span className="text-[10px] text-[#78716c]">R0–R7</span>
                  </div>
                  <div className="bg-[#0a0807] p-2 rounded text-[11px] font-mono text-[#ffffff] border border-[#26221d]">
                    MOV A, R2<br />
                    ADD A, R5
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    Uses one of 8 working registers (R0-R7) in the currently active register bank.
                  </p>
                </div>

                {/* 4. Indirect */}
                <div className="bg-[#141210] border border-[#38332c] p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#f472b6]">4. Indirect (@)</span>
                    <span className="text-[10px] text-[#78716c]">Pointer</span>
                  </div>
                  <div className="bg-[#0a0807] p-2 rounded text-[11px] font-mono text-[#ffffff] border border-[#26221d]">
                    MOV R0, #30H<br />
                    MOV A, @R0
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    R0 or R1 acts as a pointer holding the RAM address to access.
                  </p>
                </div>

                {/* 5. Indexed */}
                <div className="bg-[#141210] border border-[#38332c] p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#a78bfa]">5. Indexed (@A+DPTR)</span>
                    <span className="text-[10px] text-[#78716c]">Lookup Table</span>
                  </div>
                  <div className="bg-[#0a0807] p-2 rounded text-[11px] font-mono text-[#ffffff] border border-[#26221d]">
                    MOV DPTR, #TABLE<br />
                    MOVC A, @A+DPTR
                  </div>
                  <p className="text-[11px] text-[#a8a29e] font-sans">
                    Reads lookup tables stored in ROM. Effective address is `A + DPTR`.
                  </p>
                </div>
              </div>

              {/* Ready-to-Run Verified Programs */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-black text-[#fbbf24] uppercase tracking-wider">
                  Verified Real-World 8051 Programs (1-Click Run in Simulator)
                </h3>

                {/* Example 1 */}
                <div className="bg-[#141210] border border-[#38332c] rounded p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-white text-sm">Program 1: LED Flasher with DJNZ Nested Loop Delay</h4>
                      <p className="text-xs text-[#a8a29e] font-sans">
                        Toggles LED connected to Port 1 Pin 0 (P1.0) with human-perceptible delay:
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(`ORG 0000H\nSTART:\n    CPL P1.0      ; Invert P1.0 state\n    ACALL DELAY   ; Wait so blink is visible\n    SJMP START    ; Loop continuously\n\nDELAY:\n    MOV R2, #200\nD1: MOV R1, #255\nD2: DJNZ R1, D2   ; Inner loop: decrement R1 until 0\n    DJNZ R2, D1   ; Outer loop: decrement R2 until 0\n    RET\nEND\n`, 'code1')}
                        className="px-2.5 py-1 text-xs font-bold bg-[#1f1b17] hover:bg-[#2b2723] text-white rounded border border-[#38332c] cursor-pointer flex items-center gap-1"
                      >
                        {copiedCodeId === 'code1' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy ASM</span>
                      </button>
                      <button
                        onClick={() => handleLaunchCode(`ORG 0000H\nSTART:\n    CPL P1.0      ; Invert P1.0 state\n    ACALL DELAY   ; Wait so blink is visible\n    SJMP START    ; Loop continuously\n\nDELAY:\n    MOV R2, #200\nD1: MOV R1, #255\nD2: DJNZ R1, D2   ; Inner loop: decrement R1 until 0\n    DJNZ R2, D1   ; Outer loop: decrement R2 until 0\n    RET\nEND\n`, 'LED Blink')}
                        className="px-3 py-1 text-xs font-black bg-[#10b981] hover:bg-[#34d399] text-black rounded cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run in Simulator</span>
                      </button>
                    </div>
                  </div>
                  <pre className="bg-[#0a0807] border border-[#26221d] p-3 rounded text-[11px] font-mono text-[#4ade80] overflow-x-auto leading-relaxed">
{`ORG 0000H
START:
    CPL P1.0      ; Toggle LED on Port 1 Pin 0
    ACALL DELAY   ; Wait for human eye
    SJMP START    ; Repeat forever

DELAY:
    MOV R2, #200
D1: MOV R1, #255
D2: DJNZ R1, D2   ; 2-cycle loop
    DJNZ R2, D1
    RET
END`}
                  </pre>
                </div>

                {/* Example 2 */}
                <div className="bg-[#141210] border border-[#38332c] rounded p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-white text-sm">Program 2: 7-Segment Display Counter using Lookup Table</h4>
                      <p className="text-xs text-[#a8a29e] font-sans">
                        Reads common-cathode seven segment hex codes from ROM and drives Port 0:
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(`ORG 0000H\n    MOV P2, #01H       ; Enable Digit 0 on Port 2\n    MOV R0, #00H       ; Counter index\nMAIN:\n    MOV A, R0\n    MOV DPTR, #SEGMAP  ; Point DPTR to lookup table\n    MOVC A, @A+DPTR    ; Fetch 7-segment segment byte\n    MOV P0, A          ; Output to 7-segment display\n    ACALL DELAY\n    INC R0\n    CJNE R0, #10, MAIN ; Count 0 to 9\n    MOV R0, #00H       ; Reset back to 0\n    SJMP MAIN\n\nDELAY:\n    MOV R2, #150\nD1: DJNZ R2, D1\n    RET\n\nSEGMAP:\n    DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H, 7FH, 6FH\nEND\n`, 'code2')}
                        className="px-2.5 py-1 text-xs font-bold bg-[#1f1b17] hover:bg-[#2b2723] text-white rounded border border-[#38332c] cursor-pointer flex items-center gap-1"
                      >
                        {copiedCodeId === 'code2' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy ASM</span>
                      </button>
                      <button
                        onClick={() => handleLaunchCode(`ORG 0000H\n    MOV P2, #01H       ; Enable Digit 0 on Port 2\n    MOV R0, #00H       ; Counter index\nMAIN:\n    MOV A, R0\n    MOV DPTR, #SEGMAP  ; Point DPTR to lookup table\n    MOVC A, @A+DPTR    ; Fetch 7-segment segment byte\n    MOV P0, A          ; Output to 7-segment display\n    ACALL DELAY\n    INC R0\n    CJNE R0, #10, MAIN ; Count 0 to 9\n    MOV R0, #00H       ; Reset back to 0\n    SJMP MAIN\n\nDELAY:\n    MOV R2, #150\nD1: DJNZ R2, D1\n    RET\n\nSEGMAP:\n    DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H, 7FH, 6FH\nEND\n`, '7-Seg Counter')}
                        className="px-3 py-1 text-xs font-black bg-[#fbbf24] hover:bg-[#f59e0b] text-black rounded cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run in Simulator</span>
                      </button>
                    </div>
                  </div>
                  <pre className="bg-[#0a0807] border border-[#26221d] p-3 rounded text-[11px] font-mono text-[#38bdf8] overflow-x-auto leading-relaxed">
{`ORG 0000H
    MOV P2, #01H       ; Enable Digit 0 on Port 2
    MOV R0, #00H       ; Counter index 0-9
MAIN:
    MOV A, R0
    MOV DPTR, #SEGMAP  ; Base address of character table
    MOVC A, @A+DPTR    ; Read code from ROM into Accumulator
    MOV P0, A          ; Send to 7-Segment Bus (P0)
    ACALL DELAY
    INC R0
    CJNE R0, #10, MAIN ; Loop until 10 then reset
    MOV R0, #00H
    SJMP MAIN

SEGMAP:
    DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H, 7FH, 6FH
END`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SERIAL & HARDWARE COMMUNICATION */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div className="bg-[#1a1714] border border-[#38332c] p-4 rounded space-y-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  8051 UART Serial Port Architecture (SCON & SBUF)
                </h3>
                <p className="text-xs text-[#a8a29e] font-sans">
                  The 8051 includes a hardware full-duplex universal asynchronous receiver/transmitter (UART). It can transmit and receive data simultaneously:
                </p>
              </div>

              {/* SCON Register Breakdown */}
              <div className="bg-[#141210] border border-[#38332c] p-4 rounded space-y-3">
                <div className="flex items-center justify-between border-b border-[#2b2723] pb-2">
                  <h4 className="font-black text-[#fbbf24] text-xs">SCON: Serial Control Register (SFR 98H, Bit-Addressable)</h4>
                  <span className="text-[10px] text-[#78716c]">SFR 98H</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center text-xs">
                  <div className="bg-[#1c1917] p-2 rounded border border-[#2b2723]">
                    <span className="text-[#fbbf24] font-black block">SM0 (7)</span>
                    <span className="text-[10px] text-[#a8a29e]">Mode 0</span>
                  </div>
                  <div className="bg-[#1c1917] p-2 rounded border border-[#2b2723]">
                    <span className="text-[#fbbf24] font-black block">SM1 (6)</span>
                    <span className="text-[10px] text-[#a8a29e]">Mode 1 (8b)</span>
                  </div>
                  <div className="bg-[#1c1917] p-2 rounded border border-[#2b2723]">
                    <span className="text-[#38bdf8] font-black block">SM2 (5)</span>
                    <span className="text-[10px] text-[#a8a29e]">Multiprocessor</span>
                  </div>
                  <div className="bg-[#1c1917] p-2 rounded border border-[#2b2723]">
                    <span className="text-[#4ade80] font-black block">REN (4)</span>
                    <span className="text-[10px] text-[#a8a29e]">Rx Enable</span>
                  </div>
                  <div className="bg-[#1c1917] p-2 rounded border border-[#2b2723]">
                    <span className="text-[#78716c] font-black block">TB8 (3)</span>
                    <span className="text-[10px] text-[#a8a29e]">Bit 8 Tx</span>
                  </div>
                  <div className="bg-[#1c1917] p-2 rounded border border-[#2b2723]">
                    <span className="text-[#78716c] font-black block">RB8 (2)</span>
                    <span className="text-[10px] text-[#a8a29e]">Bit 8 Rx</span>
                  </div>
                  <div className="bg-[#1c1917] p-2 rounded border border-[#f59e0b]">
                    <span className="text-[#f59e0b] font-black block">TI (1)</span>
                    <span className="text-[10px] text-[#a8a29e]">Tx Flag</span>
                  </div>
                  <div className="bg-[#1c1917] p-2 rounded border border-[#10b981]">
                    <span className="text-[#10b981] font-black block">RI (0)</span>
                    <span className="text-[10px] text-[#a8a29e]">Rx Flag</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#a8a29e] font-sans space-y-1 pt-1">
                  <div>• <strong className="text-white">TI (Transmit Interrupt Flag):</strong> Set by hardware at the end of stop bit transmission. Must be cleared by software (`CLR TI`).</div>
                  <div>• <strong className="text-white">RI (Receive Interrupt Flag):</strong> Set by hardware when a byte is received into SBUF. Must be cleared by software (`CLR RI`).</div>
                  <div>• <strong className="text-white">Standard Configuration (`50H`):</strong> Sets Mode 1 (8-bit UART with Timer 1 baud) and enables reception (`REN=1`).</div>
                </div>
              </div>

              {/* Complete Serial Echo Program Walkthrough */}
              <div className="bg-[#141210] border border-[#38332c] rounded p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-white text-sm">Step-by-Step UART Transmitter Program</h4>
                    <p className="text-xs text-[#a8a29e] font-sans">
                      Configures Timer 1 in Mode 2 for 9600 Baud and continuously transmits "8051":
                    </p>
                  </div>
                  <button
                    onClick={() => handleLaunchCode(`ORG 0000H\n    MOV TMOD, #20H     ; Timer 1 Mode 2 (8-bit auto-reload)\n    MOV TH1, #-3       ; 9600 Baud at 11.0592 MHz (FDH)\n    MOV SCON, #50H     ; Mode 1 8-bit UART, Receive Enabled\n    SETB TR1           ; Start Timer 1\n\nTRANSMIT_LOOP:\n    MOV A, #'H'\n    ACALL SEND_CHAR\n    MOV A, #'E'\n    ACALL SEND_CHAR\n    MOV A, #'L'\n    ACALL SEND_CHAR\n    MOV A, #'L'\n    ACALL SEND_CHAR\n    MOV A, #'O'\n    ACALL SEND_CHAR\n    SJMP TRANSMIT_LOOP\n\nSEND_CHAR:\n    MOV SBUF, A        ; Load byte into serial buffer\nWAIT_TX:\n    JNB TI, WAIT_TX    ; Wait until TI flag set by hardware\n    CLR TI             ; Clear TI flag for next byte\n    RET\nEND\n`, 'UART Transmit')}
                    className="px-3 py-1 text-xs font-black bg-[#38bdf8] hover:bg-[#0284c7] text-black rounded cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run in Simulator</span>
                  </button>
                </div>
                <pre className="bg-[#0a0807] border border-[#26221d] p-3 rounded text-[11px] font-mono text-[#fbbf24] overflow-x-auto leading-relaxed">
{`ORG 0000H
    MOV TMOD, #20H     ; Timer 1 Mode 2 (8-bit auto-reload)
    MOV TH1, #-3       ; 9600 Baud at 11.0592 MHz (FDH)
    MOV SCON, #50H     ; Mode 1 8-bit UART, Receive Enabled
    SETB TR1           ; Start Timer 1

SEND_CHAR:
    MOV SBUF, A        ; Load byte into serial buffer
WAIT_TX:
    JNB TI, WAIT_TX    ; Wait until TI set by hardware
    CLR TI             ; Clear TI for next byte
    RET
END`}
                </pre>
              </div>

              {/* Interrupt Vectors Table */}
              <div className="bg-[#141210] border border-[#38332c] p-4 rounded space-y-3">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">
                  8051 Hardware Interrupt Vector Table
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#38332c] text-[#78716c]">
                        <th className="py-1.5 px-2">INTERRUPT SOURCE</th>
                        <th className="py-1.5 px-2">VECTOR ADDRESS</th>
                        <th className="py-1.5 px-2">FLAG PIN</th>
                        <th className="py-1.5 px-2">ENABLE BIT (IE)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26221d] text-[#ded7cd]">
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-white">Power-On Reset</td>
                        <td className="py-1.5 px-2 text-[#fbbf24]">0000H</td>
                        <td className="py-1.5 px-2">RST Pin (9)</td>
                        <td className="py-1.5 px-2 text-[#78716c]">Non-maskable</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-white">External Interrupt 0 (INT0)</td>
                        <td className="py-1.5 px-2 text-[#fbbf24]">0003H</td>
                        <td className="py-1.5 px-2">IE0 (TCON.1 / P3.2)</td>
                        <td className="py-1.5 px-2 text-[#38bdf8]">EX0 (IE.0)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-white">Timer 0 Overflow (TF0)</td>
                        <td className="py-1.5 px-2 text-[#fbbf24]">000BH</td>
                        <td className="py-1.5 px-2">TF0 (TCON.5)</td>
                        <td className="py-1.5 px-2 text-[#38bdf8]">ET0 (IE.1)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-white">External Interrupt 1 (INT1)</td>
                        <td className="py-1.5 px-2 text-[#fbbf24]">0013H</td>
                        <td className="py-1.5 px-2">IE1 (TCON.3 / P3.3)</td>
                        <td className="py-1.5 px-2 text-[#38bdf8]">EX1 (IE.2)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-white">Timer 1 Overflow (TF1)</td>
                        <td className="py-1.5 px-2 text-[#fbbf24]">001BH</td>
                        <td className="py-1.5 px-2">TF1 (TCON.7)</td>
                        <td className="py-1.5 px-2 text-[#38bdf8]">ET1 (IE.3)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-white">Serial UART (TI / RI)</td>
                        <td className="py-1.5 px-2 text-[#fbbf24]">0023H</td>
                        <td className="py-1.5 px-2">TI or RI (SCON)</td>
                        <td className="py-1.5 px-2 text-[#38bdf8]">ES (IE.4)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-[#1a1714] border-t border-[#38332c] px-4 py-2.5 flex items-center justify-between text-xs shrink-0 text-[#a8a29e]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Interactive 8051 Study Module</span>
          </div>
          <div className="font-bold text-[#ded7cd]">
            © 2026 Vineet Sharma , Chaman Vashishth
          </div>
        </footer>
      </div>
    </div>
  );
};
