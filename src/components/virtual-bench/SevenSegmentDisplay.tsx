/**
 * Micro8051SiM - Realistic 4-Digit 7-Segment Display Module
 * Authentic physical LED module simulation (e.g. 5641AH 0.56" multiplexed display)
 * Features slanted beveled segment geometry, authentic LED phosphor glow filters,
 * unlit segment channels, decimal points, decoded character readouts,
 * phosphor color selection (Red, Amber, Green, Blue), and interactive segment designer.
 */

import React, { useState } from 'react';
import { PinMapping } from '../../core/types.ts';

export type LedColor = 'red' | 'amber' | 'green' | 'blue' | 'white';

interface SevenSegmentDisplayProps {
  segmentDigits: number[];
  segmentPersistence: number[];
  mapping: PinMapping;
  className?: string;
  onTestSegmentChange?: (digitIdx: number, val: number) => void;
}

// 7-segment hex to character decoder map (common cathode active-high standard: a=bit0, b=bit1, ..., dp=bit7)
const CHAR_MAP: Record<number, string> = {
  0x3f: '0', 0x06: '1', 0x5b: '2', 0x4f: '3',
  0x66: '4', 0x6d: '5', 0x7d: '6', 0x07: '7',
  0x7f: '8', 0x6f: '9', 0x77: 'A', 0x7c: 'b',
  0x39: 'C', 0x5e: 'd', 0x79: 'E', 0x71: 'F',
  0x76: 'H', 0x38: 'L', 0x73: 'P', 0x3e: 'U',
  0x40: '-', 0x08: '_', 0x00: ' ', 0x63: '°',
  0x49: '≡', 0x1c: 'u', 0x50: 'r', 0x78: 't',
  0x54: 'n', 0x5c: 'o', 0x67: 'q', 0x1e: 'J',
};

const COLOR_CONFIGS: Record<LedColor, {
  name: string;
  glow: string;
  core: string;
  hotspot: string;
  unlitFill: string;
  unlitStroke: string;
  lensBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
}> = {
  red: {
    name: 'Ruby Red (660nm)',
    glow: 'rgba(255, 30, 30, 0.95)',
    core: '#ff3b3b',
    hotspot: '#ffe0e0',
    unlitFill: '#22080a',
    unlitStroke: '#381014',
    lensBg: '#0b0405',
    accentBorder: '#ef4444',
    badgeBg: '#450a0a',
    badgeText: '#fca5a5',
  },
  amber: {
    name: 'Vintage Amber (590nm)',
    glow: 'rgba(245, 158, 11, 0.95)',
    core: '#fbbf24',
    hotspot: '#fffbeb',
    unlitFill: '#241804',
    unlitStroke: '#3d2b09',
    lensBg: '#0c0803',
    accentBorder: '#f59e0b',
    badgeBg: '#451a03',
    badgeText: '#fcd34d',
  },
  green: {
    name: 'Emerald Green (565nm)',
    glow: 'rgba(34, 197, 94, 0.95)',
    core: '#4ade80',
    hotspot: '#ecfdf5',
    unlitFill: '#06200f',
    unlitStroke: '#0d381c',
    lensBg: '#020b05',
    accentBorder: '#10b981',
    badgeBg: '#064e3b',
    badgeText: '#86efac',
  },
  blue: {
    name: 'Ice Blue (470nm)',
    glow: 'rgba(56, 189, 248, 0.95)',
    core: '#38bdf8',
    hotspot: '#f0f9ff',
    unlitFill: '#061826',
    unlitStroke: '#0d2d47',
    lensBg: '#02080f',
    accentBorder: '#0ea5e9',
    badgeBg: '#082f49',
    badgeText: '#7dd3fc',
  },
  white: {
    name: 'Cool White (6500K)',
    glow: 'rgba(241, 245, 249, 0.95)',
    core: '#f8fafc',
    hotspot: '#ffffff',
    unlitFill: '#1a1d24',
    unlitStroke: '#2f3542',
    lensBg: '#090a0d',
    accentBorder: '#cbd5e1',
    badgeBg: '#1e293b',
    badgeText: '#f1f5f9',
  },
};

/**
 * Realistic Single 7-Segment Digit with beveled slanted geometry and optical glow
 */
export const RealisticSingleDigit: React.FC<{
  byteVal: number;
  intensity?: number;
  color?: LedColor;
  interactive?: boolean;
  onSegmentToggle?: (bitIndex: number) => void;
  showLabels?: boolean;
}> = ({
  byteVal,
  intensity = 1.0,
  color = 'red',
  interactive = false,
  onSegmentToggle,
}) => {
  const cfg = COLOR_CONFIGS[color];

  // Decode bits:
  // bit 0 = a, bit 1 = b, bit 2 = c, bit 3 = d, bit 4 = e, bit 5 = f, bit 6 = g, bit 7 = dp
  const segA = (byteVal & 0x01) !== 0;
  const segB = (byteVal & 0x02) !== 0;
  const segC = (byteVal & 0x04) !== 0;
  const segD = (byteVal & 0x08) !== 0;
  const segE = (byteVal & 0x10) !== 0;
  const segF = (byteVal & 0x20) !== 0;
  const segG = (byteVal & 0x40) !== 0;
  const segDp = (byteVal & 0x80) !== 0;

  const effectiveIntensity = Math.min(1.0, Math.max(0.2, intensity));

  // Handler for clicking a segment in interactive mode
  const handleSegClick = (bitIdx: number) => {
    if (interactive && onSegmentToggle) {
      onSegmentToggle(bitIdx);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center p-2 rounded-sm border select-none transition-colors"
      style={{
        backgroundColor: cfg.lensBg,
        borderColor: '#2b2927',
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.9), 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Acrylic glass reflection gradient highlight on top */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-t-sm" />

      {/* SVG Digit Canvas with 8-degree authentic slanted segments */}
      <svg
        viewBox="0 0 66 100"
        className="w-16 h-26 sm:w-20 sm:h-32 transition-transform filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Authentic Gaussian Bloom Glow Filter */}
          <filter id={`led-glow-${color}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.8" result="blur1" />
            <feGaussianBlur stdDeviation="4.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Slanted Container Group (-6 degrees standard 7-segment italic angle) */}
        <g transform="skewX(-6)" style={{ transformOrigin: '33px 50px' }}>
          {/* ================= Segment A (Top) ================= */}
          <g
            onClick={() => handleSegClick(0)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            {/* Unlit Channel silhouette */}
            <polygon
              points="14,10 50,10 44,18 20,18"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {/* Lit Segment with Glow */}
            {segA && (
              <>
                <polygon
                  points="14,10 50,10 44,18 20,18"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <polygon
                  points="14,10 50,10 44,18 20,18"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <line
                  x1="22" y1="14" x2="42" y2="14"
                  stroke={cfg.hotspot}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={effectiveIntensity * 0.9}
                />
              </>
            )}
          </g>

          {/* ================= Segment B (Top Right) ================= */}
          <g
            onClick={() => handleSegClick(1)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            <polygon
              points="51,12 58,19 54,47 46,43 49,16"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {segB && (
              <>
                <polygon
                  points="51,12 58,19 54,47 46,43 49,16"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <polygon
                  points="51,12 58,19 54,47 46,43 49,16"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <line
                  x1="52" y1="20" x2="49" y2="41"
                  stroke={cfg.hotspot}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={effectiveIntensity * 0.9}
                />
              </>
            )}
          </g>

          {/* ================= Segment C (Bottom Right) ================= */}
          <g
            onClick={() => handleSegClick(2)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            <polygon
              points="53,52 57,56 50,84 43,80 45,51"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {segC && (
              <>
                <polygon
                  points="53,52 57,56 50,84 43,80 45,51"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <polygon
                  points="53,52 57,56 50,84 43,80 45,51"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <line
                  x1="48" y1="56" x2="46" y2="77"
                  stroke={cfg.hotspot}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={effectiveIntensity * 0.9}
                />
              </>
            )}
          </g>

          {/* ================= Segment D (Bottom) ================= */}
          <g
            onClick={() => handleSegClick(3)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            <polygon
              points="16,80 42,80 48,88 10,88"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {segD && (
              <>
                <polygon
                  points="16,80 42,80 48,88 10,88"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <polygon
                  points="16,80 42,80 48,88 10,88"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <line
                  x1="18" y1="84" x2="40" y2="84"
                  stroke={cfg.hotspot}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={effectiveIntensity * 0.9}
                />
              </>
            )}
          </g>

          {/* ================= Segment E (Bottom Left) ================= */}
          <g
            onClick={() => handleSegClick(4)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            <polygon
              points="16,51 18,80 12,84 7,56 11,52"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {segE && (
              <>
                <polygon
                  points="16,51 18,80 12,84 7,56 11,52"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <polygon
                  points="16,51 18,80 12,84 7,56 11,52"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <line
                  x1="13" y1="56" x2="15" y2="77"
                  stroke={cfg.hotspot}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={effectiveIntensity * 0.9}
                />
              </>
            )}
          </g>

          {/* ================= Segment F (Top Left) ================= */}
          <g
            onClick={() => handleSegClick(5)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            <polygon
              points="18,16 20,43 14,47 9,19 15,13"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {segF && (
              <>
                <polygon
                  points="18,16 20,43 14,47 9,19 15,13"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <polygon
                  points="18,16 20,43 14,47 9,19 15,13"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <line
                  x1="16" y1="20" x2="17" y2="40"
                  stroke={cfg.hotspot}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={effectiveIntensity * 0.9}
                />
              </>
            )}
          </g>

          {/* ================= Segment G (Middle Hexagon) ================= */}
          <g
            onClick={() => handleSegClick(6)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            <polygon
              points="15,49 20,45 42,45 47,49 42,53 20,53"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {segG && (
              <>
                <polygon
                  points="15,49 20,45 42,45 47,49 42,53 20,53"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <polygon
                  points="15,49 20,45 42,45 47,49 42,53 20,53"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <line
                  x1="21" y1="49" x2="41" y2="49"
                  stroke={cfg.hotspot}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={effectiveIntensity * 0.9}
                />
              </>
            )}
          </g>

          {/* ================= Decimal Point (DP) ================= */}
          <g
            onClick={() => handleSegClick(7)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
          >
            {/* Outer Lens Bezel */}
            <circle
              cx="57" cy="86" r="4.2"
              fill={cfg.unlitFill}
              stroke={cfg.unlitStroke}
              strokeWidth="0.8"
            />
            {segDp && (
              <>
                <circle
                  cx="57" cy="86" r="3.8"
                  fill={cfg.glow}
                  filter={`url(#led-glow-${color})`}
                  opacity={effectiveIntensity * 0.9}
                />
                <circle
                  cx="57" cy="86" r="3.5"
                  fill={cfg.core}
                  opacity={effectiveIntensity}
                />
                <circle
                  cx="56" cy="85" r="1.2"
                  fill={cfg.hotspot}
                  opacity={effectiveIntensity * 0.95}
                />
              </>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

export const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = ({
  segmentDigits,
  segmentPersistence,
  mapping,
  className = '',
}) => {
  const [ledColor, setLedColor] = useState<LedColor>('red');
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [interactiveDigits, setInteractiveDigits] = useState<number[]>([0x3f, 0x06, 0x5b, 0x4f]); // "0 1 2 3"
  const [selectedDigitIdx, setSelectedDigitIdx] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  // Hardware Component Adjustability
  const [polarity, setPolarity] = useState<'common-cathode' | 'common-anode'>('common-cathode');
  const [glowIntensity, setGlowIntensity] = useState<number>(1.0);
  const [busPort, setBusPort] = useState<number>(mapping.sevenSegment.segmentPort);
  const [showAdjustDrawer, setShowAdjustDrawer] = useState<boolean>(false);

  // Active digits depending on mode and polarity (common anode inverts bits)
  const rawDigits = isInteractiveMode ? interactiveDigits : segmentDigits;
  const currentDigits = rawDigits.map((val) => (polarity === 'common-anode' ? (~val & 0xFF) : val));

  const handleToggleSegment = (digitIdx: number, bitIdx: number) => {
    setInteractiveDigits((prev) => {
      const next = [...prev];
      next[digitIdx] = next[digitIdx] ^ (1 << bitIdx);
      return next;
    });
    setSelectedDigitIdx(digitIdx);
  };

  const handleSetPreset = (digitIdx: number, hexVal: number) => {
    setInteractiveDigits((prev) => {
      const next = [...prev];
      next[digitIdx] = hexVal;
      return next;
    });
  };

  const handleApplyPresetAll = (digits: number[]) => {
    setIsInteractiveMode(true);
    setInteractiveDigits([...digits]);
  };

  const activeByte = currentDigits[selectedDigitIdx] ?? 0;
  const decodedChar = CHAR_MAP[activeByte & 0x7f] ?? (activeByte === 0 ? 'BLANK' : 'CUSTOM');

  const copyAssemblyCode = () => {
    const hex = activeByte.toString(16).toUpperCase().padStart(2, '0');
    const asm = `; 8051 Output to 7-Segment (Port ${busPort})\nMOV P${busPort}, #${hex}H ; Displays '${decodedChar}' (${polarity === 'common-anode' ? 'Common Anode' : 'Common Cathode'})`;
    navigator.clipboard.writeText(asm).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  return (
    <div className={`bg-[#141210] border-2 border-[#38332c] rounded-sm p-3.5 shadow-md flex flex-col justify-between select-none ${className}`}>
      {/* Physical Silkscreen Header */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2.5 border-b border-[#2b2723] gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border shadow-sm transition-colors"
            style={{
              backgroundColor: COLOR_CONFIGS[ledColor].core,
              borderColor: COLOR_CONFIGS[ledColor].hotspot,
              boxShadow: `0 0 8px ${COLOR_CONFIGS[ledColor].glow}`,
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-[#ded7cd]">
                5641AH 4-Digit 7-Segment
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-[#26221d] text-[#a8a29e] rounded border border-[#3d372e]">
                0.56" LED
              </span>
            </div>
            <span className="text-[10px] text-[#78716c] font-mono">
              Bus Port: P{mapping.sevenSegment.segmentPort} · Multiplex: P2.0–P2.3
            </span>
          </div>
        </div>

        {/* Phosphor Color Selector & Mode Toggle */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Polarity (Common Cathode / Common Anode) Quick Toggle */}
          <button
            onClick={() => setPolarity((p) => (p === 'common-cathode' ? 'common-anode' : 'common-cathode'))}
            className={`px-2 py-1 text-[9.5px] font-mono font-bold rounded-xs border cursor-pointer transition-colors ${
              polarity === 'common-anode'
                ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/50'
                : 'bg-[#1c1815] text-[#a8a29e] hover:text-white border-[#38332c]'
            }`}
            title="Toggle segment driving polarity: Common Cathode (1=ON) vs Common Anode (0=ON)"
          >
            {polarity === 'common-anode' ? 'ANODE (0=ON)' : 'CATHODE (1=ON)'}
          </button>

          {/* Adjust Component Settings Drawer Button */}
          <button
            onClick={() => setShowAdjustDrawer((s) => !s)}
            className={`px-2 py-1 text-[9.5px] font-mono font-bold rounded-xs border cursor-pointer transition-colors ${
              showAdjustDrawer
                ? 'bg-[#fbbf24] text-black border-[#fbbf24]'
                : 'bg-[#1c1815] text-[#fbbf24] border-[#38332c] hover:bg-[#26221d]'
            }`}
            title="Adjust display hardware settings: glow brightness, port pins, test presets"
          >
            ⚙ ADJUST
          </button>

          {/* LED Color selector */}
          <div className="flex items-center bg-[#1c1815] p-0.5 rounded border border-[#38332c] gap-0.5">
            {(['red', 'amber', 'green', 'blue', 'white'] as LedColor[]).map((c) => (
              <button
                key={c}
                onClick={() => setLedColor(c)}
                className={`w-4 h-4 rounded-xs transition-transform cursor-pointer flex items-center justify-center ${
                  ledColor === c ? 'scale-110 ring-1 ring-white/50 z-10' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: COLOR_CONFIGS[c].core }}
                title={`Switch phosphor to ${COLOR_CONFIGS[c].name}`}
              />
            ))}
          </div>

          {/* Interactive Test / Live Switch */}
          <button
            onClick={() => setIsInteractiveMode((m) => !m)}
            className={`px-2 py-1 text-[10px] font-bold font-mono rounded-xs border cursor-pointer transition-colors ${
              isInteractiveMode
                ? 'bg-[#fbbf24] text-[#000000] border-[#fbbf24]'
                : 'bg-[#1c1815] text-[#a8a29e] hover:text-[#ded7cd] border-[#38332c]'
            }`}
            title="Toggle between Live 8051 Bus and Interactive Segment Click Mode"
          >
            {isInteractiveMode ? 'INTERACTIVE' : 'LIVE 8051'}
          </button>
        </div>
      </div>

      {/* Adjustability Drawer */}
      {showAdjustDrawer && (
        <div className="bg-[#0c0a09] border border-[#f59e0b]/50 p-2.5 rounded-sm mb-2 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#2b2723] pb-1">
            <span className="font-black text-[#fbbf24] text-[10.5px]">
              7-SEGMENT HARDWARE ADJUSTABILITY & CONFIGURATION
            </span>
            <button
              onClick={() => setShowAdjustDrawer(false)}
              className="text-[#78716c] hover:text-white text-[10px] font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
            {/* 1. Driving Polarity */}
            <div className="bg-[#141210] p-1.5 rounded border border-[#2b2723] space-y-1">
              <span className="text-[#78716c] block font-bold">SEGMENT POLARITY:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPolarity('common-cathode')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border ${
                    polarity === 'common-cathode' ? 'bg-[#10b981] text-black border-[#10b981]' : 'bg-[#1c1815] text-[#ded7cd] border-[#38332c]'
                  }`}
                >
                  Cathode (1=ON)
                </button>
                <button
                  onClick={() => setPolarity('common-anode')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border ${
                    polarity === 'common-anode' ? 'bg-[#38bdf8] text-black border-[#38bdf8]' : 'bg-[#1c1815] text-[#ded7cd] border-[#38332c]'
                  }`}
                >
                  Anode (0=ON)
                </button>
              </div>
            </div>

            {/* 2. Glow Brightness */}
            <div className="bg-[#141210] p-1.5 rounded border border-[#2b2723] space-y-1">
              <span className="text-[#78716c] block font-bold">PHOSPHOR INTENSITY:</span>
              <div className="flex items-center gap-1">
                {[0.4, 0.7, 1.0].map((int) => (
                  <button
                    key={int}
                    onClick={() => setGlowIntensity(int)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border ${
                      glowIntensity === int ? 'bg-[#fbbf24] text-black border-[#fbbf24]' : 'bg-[#1c1815] text-[#ded7cd] border-[#38332c]'
                    }`}
                  >
                    {int === 0.4 ? '40% Dim' : int === 0.7 ? '70% Med' : '100% High'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Bus Port Selection */}
            <div className="bg-[#141210] p-1.5 rounded border border-[#2b2723] space-y-1">
              <span className="text-[#78716c] block font-bold">BUS PORT PIN ASSIGNMENT:</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3].map((port) => (
                  <button
                    key={port}
                    onClick={() => setBusPort(port)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border ${
                      busPort === port ? 'bg-[#f59e0b] text-black border-[#f59e0b]' : 'bg-[#1c1815] text-[#ded7cd] border-[#38332c]'
                    }`}
                  >
                    P{port}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Test Patterns */}
          <div className="pt-1 border-t border-[#2b2723] flex flex-wrap items-center justify-between gap-1">
            <span className="text-[#78716c] text-[10px] font-bold">1-CLICK TEST PATTERNS:</span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => handleApplyPresetAll([0x3f, 0x06, 0x5b, 0x4f])}
                className="px-1.5 py-0.5 rounded bg-[#1c1815] hover:bg-[#2b2723] text-white border border-[#38332c] text-[9.5px]"
              >
                "0 1 2 3"
              </button>
              <button
                onClick={() => handleApplyPresetAll([0x7f, 0x7f, 0x7f, 0x7f])}
                className="px-1.5 py-0.5 rounded bg-[#1c1815] hover:bg-[#2b2723] text-white border border-[#38332c] text-[9.5px]"
              >
                "8 8 8 8" (All ON)
              </button>
              <button
                onClick={() => handleApplyPresetAll([0x76, 0x79, 0x38, 0x73])}
                className="px-1.5 py-0.5 rounded bg-[#1c1815] hover:bg-[#2b2723] text-[#38bdf8] border border-[#38332c] text-[9.5px]"
              >
                "H E L P"
              </button>
              <button
                onClick={() => handleApplyPresetAll([0x39, 0x5c, 0x5c, 0x38])}
                className="px-1.5 py-0.5 rounded bg-[#1c1815] hover:bg-[#2b2723] text-[#4ade80] border border-[#38332c] text-[9.5px]"
              >
                "C o o L"
              </button>
              <button
                onClick={() => handleApplyPresetAll([0x06, 0x6f, 0x7f, 0x3f])}
                className="px-1.5 py-0.5 rounded bg-[#1c1815] hover:bg-[#2b2723] text-[#fbbf24] border border-[#38332c] text-[9.5px]"
              >
                "1 9 8 0"
              </button>
              <button
                onClick={() => handleApplyPresetAll([0x00, 0x00, 0x00, 0x00])}
                className="px-1.5 py-0.5 rounded bg-[#1c1815] hover:bg-[#2b2723] text-[#a8a29e] border border-[#38332c] text-[9.5px]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physical Casing / Acrylic Bezel with 4 Digits */}
      <div
        className="relative bg-[#090706] border-2 border-[#2b2723] p-3 rounded-sm shadow-inner flex items-center justify-center gap-2 sm:gap-4 my-1 overflow-x-auto"
        style={{
          boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.95), 0 2px 4px rgba(0,0,0,0.4)',
        }}
      >
        {/* Subtle molded screw mounts in corners */}
        <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-[#1f1b17] border border-[#38332c]" />
        <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#1f1b17] border border-[#38332c]" />
        <div className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-full bg-[#1f1b17] border border-[#38332c]" />
        <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#1f1b17] border border-[#38332c]" />

        {currentDigits.map((byteVal, idx) => {
          const char = CHAR_MAP[byteVal & 0x7f] ?? (byteVal === 0 ? '' : '·');
          const isSelected = isInteractiveMode && selectedDigitIdx === idx;
          const isLit = byteVal > 0;

          return (
            <div
              key={idx}
              onClick={() => setSelectedDigitIdx(idx)}
              className={`flex flex-col items-center p-1 rounded-sm transition-all ${
                isSelected
                  ? 'ring-1 ring-[#fbbf24] bg-[#1c1917]/70'
                  : 'hover:bg-[#12100e]'
              }`}
            >
              {/* Digit Header & Selection Pin Indicator */}
              <div className="flex items-center gap-1 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: isLit ? COLOR_CONFIGS[ledColor].core : '#26221d',
                    boxShadow: isLit ? `0 0 4px ${COLOR_CONFIGS[ledColor].glow}` : 'none',
                  }}
                />
                <span className="text-[10px] font-mono text-[#a8a29e] font-black">
                  DIG {idx}
                </span>
                <span className="text-[8.5px] font-mono text-[#78716c]">
                  (P2.{idx})
                </span>
              </div>

              {/* Realistic Digit SVG with Beveled Slanted Segments */}
              <RealisticSingleDigit
                byteVal={byteVal}
                intensity={(isInteractiveMode ? 1.0 : (segmentPersistence[idx] ?? 1.0)) * glowIntensity}
                color={ledColor}
                interactive={isInteractiveMode}
                onSegmentToggle={(bitIdx) => handleToggleSegment(idx, bitIdx)}
              />

              {/* Decoded Character Readout Badge */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-mono font-black text-[#ffffff] bg-[#1c1815] px-1.5 py-0.5 rounded border border-[#38332c]">
                  {char || '—'}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#fbbf24]">
                  {byteVal.toString(16).toUpperCase().padStart(2, '0')}H
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Helper & Live Inspection Ribbon */}
      <div className="mt-2 pt-2 border-t border-[#26221d] flex flex-col gap-2">
        {/* Segment Pin Map & Binary breakdown */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#a8a29e]">
          <div className="flex items-center gap-1">
            <span className="text-[#78716c]">ACTIVE DIGIT {selectedDigitIdx}:</span>
            <span className="font-bold text-[#ded7cd]">
              0x{activeByte.toString(16).toUpperCase().padStart(2, '0')}H
            </span>
            <span className="text-[#78716c]">
              (0b{activeByte.toString(2).padStart(8, '0')})
            </span>
          </div>

          {/* Quick Segment Status indicators */}
          <div className="flex items-center gap-0.5">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((seg, bitIdx) => {
              const active = (activeByte & (1 << bitIdx)) !== 0;
              return (
                <button
                  key={seg}
                  onClick={() => isInteractiveMode && handleToggleSegment(selectedDigitIdx, bitIdx)}
                  className={`w-4 h-4 text-[9px] font-black rounded-xs flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-[#fbbf24] text-[#000000]'
                      : 'bg-[#1c1815] text-[#57534e] border border-[#2b2723]'
                  } ${isInteractiveMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  title={`Segment ${seg} (bit ${bitIdx}) - ${active ? 'HIGH (ON)' : 'LOW (OFF)'}`}
                >
                  {seg}
                </button>
              );
            })}
          </div>
        </div>

        {/* If Interactive Mode: Quick Digit Presets & Copy Code */}
        {isInteractiveMode && (
          <div className="bg-[#0c0a09] border border-[#2b2723] p-2 rounded-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[9.5px] font-mono text-[#78716c]">
              <span>QUICK DIGIT PRESETS:</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                  const hexVals = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];
                  return (
                    <button
                      key={n}
                      onClick={() => handleSetPreset(selectedDigitIdx, hexVals[n])}
                      className="px-1 py-0.2 text-[9px] font-black bg-[#1c1917] hover:bg-[#2b2723] text-[#ded7cd] rounded border border-[#38332c] cursor-pointer"
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={copyAssemblyCode}
              className="px-2 py-1 text-[9.5px] font-mono font-bold bg-[#292524] hover:bg-[#38332c] text-[#fbbf24] rounded border border-[#524d43] cursor-pointer transition-colors"
              title="Copy 8051 MOV instruction to clipboard"
            >
              {copiedCode ? '✓ COPIED ASM CODE' : 'COPY 8051 ASM (MOV P0)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
