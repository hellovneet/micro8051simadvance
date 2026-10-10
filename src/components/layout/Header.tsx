/**
 * Main application header and menu bar.
 * Includes quick access to simulation, tools, help, and display settings.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { InstrumentButton } from '../common/InstrumentButton.tsx';
import { SimulatorLevel } from '../home/HomePage.tsx';

interface HeaderProps {
  onNewProject: () => void;
  onOpenPinMapper: () => void;
  onOpenInstructionRef: () => void;
  onOpenSettings: () => void;
  onExportAsm: () => void;
  onExportHex: () => void;
  onClearBreakpoints: () => void;
  onResetCpu: () => void;
  onAssemble: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  isAssembling?: boolean;
  currentLevel?: SimulatorLevel;
  onSelectLevel?: (level: SimulatorLevel) => void;
  onGoHome?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenLearn8051?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProject,
  onOpenPinMapper,
  onOpenInstructionRef,
  onOpenSettings,
  onExportAsm,
  onExportHex,
  onClearBreakpoints,
  onResetCpu,
  onAssemble,
  isHighContrast,
  onToggleHighContrast,
  isAssembling = false,
  currentLevel = 'intermediate',
  onSelectLevel,
  onGoHome,
  theme = 'dark',
  onToggleTheme,
  onOpenLearn8051,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <header className="bg-[#1c1917] border-b border-[#44403c] px-3.5 py-1.5 flex flex-wrap items-center justify-between select-none font-mono text-xs z-30 relative shadow-sm gap-2">
      {/* Brand Identity & Home Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group cursor-pointer bg-transparent border-none text-left p-0"
          title="Go to Homepage / Level Selector"
        >
          {/* Amber CRT Power Lamp */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shadow-[0_0_10px_#f59e0b] border-2 border-[#fbbf24] group-hover:scale-110 transition-transform" />
          <div>
            <span className="font-black tracking-widest text-[#fbbf24] text-base group-hover:text-[#fef08a] transition-colors">
              Micro8051SiM
            </span>
          </div>
        </button>

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-2 py-0.5 text-[11px] font-bold text-[#a8a29e] hover:text-[#fbbf24] bg-[#141210] hover:bg-[#292524] border border-[#524d43] rounded-sm cursor-pointer transition-colors flex items-center gap-1"
            title="Return to Homepage"
          >
            <span>⌂</span>
            <span className="hidden sm:inline">Home</span>
          </button>
        )}

        {/* Desktop Menu Bar */}
        <div ref={menuRef} className="hidden md:flex items-center gap-1 ml-2">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('file')}
              className={`px-2.5 py-1 rounded-sm font-bold hover:bg-[#292524] hover:text-[#fbbf24] transition-colors cursor-pointer ${
                openMenu === 'file' ? 'bg-[#292524] text-[#fbbf24]' : 'text-[#ffffff]'
              }`}
            >
              File
            </button>
            {openMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1c1917] border border-[#524d43] rounded-sm shadow-2xl py-1 z-50">
                <button
                  onClick={() => { onNewProject(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] flex justify-between font-bold"
                >
                  <span>New File</span>
                  <span className="text-[#a8a29e]">Ctrl+N</span>
                </button>
                <div className="border-t border-[#44403c] my-1" />
                <button
                  onClick={() => { onExportAsm(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  Export .ASM Source
                </button>
                <button
                  onClick={() => { onExportHex(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  Export Intel .HEX File
                </button>
              </div>
            )}
          </div>

          {/* Simulation Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('sim')}
              className={`px-2.5 py-1 rounded-sm font-bold hover:bg-[#292524] hover:text-[#fbbf24] transition-colors cursor-pointer ${
                openMenu === 'sim' ? 'bg-[#292524] text-[#fbbf24]' : 'text-[#ffffff]'
              }`}
            >
              Simulation
            </button>
            {openMenu === 'sim' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1c1917] border border-[#524d43] rounded-sm shadow-2xl py-1 z-50">
                <button
                  onClick={() => { onAssemble(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] flex justify-between font-bold"
                >
                  <span>Assemble Code</span>
                  <span className="text-[#a8a29e]">F4</span>
                </button>
                <button
                  onClick={() => { onResetCpu(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  Reset CPU (Power On)
                </button>
                <div className="border-t border-[#44403c] my-1" />
                <button
                  onClick={() => { onClearBreakpoints(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  Clear All Breakpoints
                </button>
              </div>
            )}
          </div>

          {/* Tools Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('tools')}
              className={`px-2.5 py-1 rounded-sm font-bold hover:bg-[#292524] hover:text-[#fbbf24] transition-colors cursor-pointer ${
                openMenu === 'tools' ? 'bg-[#292524] text-[#fbbf24]' : 'text-[#ffffff]'
              }`}
            >
              Tools
            </button>
            {openMenu === 'tools' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1c1917] border border-[#524d43] rounded-sm shadow-2xl py-1 z-50">
                <button
                  onClick={() => { onOpenPinMapper(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  Hardware Pin Mapper
                </button>
                <button
                  onClick={() => { onOpenSettings(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  Workstation Settings
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('help')}
              className={`px-2.5 py-1 rounded-sm font-bold hover:bg-[#292524] hover:text-[#fbbf24] transition-colors cursor-pointer ${
                openMenu === 'help' ? 'bg-[#292524] text-[#fbbf24]' : 'text-[#ffffff]'
              }`}
            >
              Help
            </button>
            {openMenu === 'help' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-[#1c1917] border border-[#524d43] rounded-sm shadow-2xl py-1 z-50">
                <button
                  onClick={() => { onOpenInstructionRef(); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  8051 Instruction Reference Card
                </button>
                <div className="border-t border-[#44403c] my-1" />
                <button
                  onClick={() => { setShowAboutModal(true); setOpenMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#292524] hover:text-[#fbbf24] font-bold"
                >
                  About & Copyright Credits
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Section: 3-Level Simulator Switcher */}
      {onSelectLevel && (
        <div className="flex items-center gap-1 bg-[#141210] border border-[#524d43] p-1 rounded-sm shadow-inner">
          <span className="text-[10px] text-[#a8a29e] uppercase font-bold px-1.5 hidden xl:inline">
            LEVEL:
          </span>

          {/* Level 1: Beginner */}
          <button
            onClick={() => onSelectLevel('beginner')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-all flex items-center gap-1.5 ${
              currentLevel === 'beginner'
                ? 'bg-[#10b981] text-[#000000] font-black shadow-sm'
                : 'text-[#a8a29e] hover:text-[#ffffff] hover:bg-[#292524]'
            }`}
            title="Switch to Beginner UI (Visual guidance & plain-English explanations)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentLevel === 'beginner' ? 'bg-[#000000]' : 'bg-[#10b981]'}`} />
            <span>Beginner</span>
          </button>

          {/* Level 2: Intermediate */}
          <button
            onClick={() => onSelectLevel('intermediate')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-all flex items-center gap-1.5 ${
              currentLevel === 'intermediate'
                ? 'bg-[#f59e0b] text-[#000000] font-black shadow-sm'
                : 'text-[#a8a29e] hover:text-[#ffffff] hover:bg-[#292524]'
            }`}
            title="Switch to Intermediate UI (Classic EdSim51 Virtual Lab Workbench)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentLevel === 'intermediate' ? 'bg-[#000000]' : 'bg-[#f59e0b]'}`} />
            <span>Intermediate</span>
          </button>

          {/* Level 3: Advanced */}
          <button
            onClick={() => onSelectLevel('advanced')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-all flex items-center gap-1.5 ${
              currentLevel === 'advanced'
                ? 'bg-[#06b6d4] text-[#000000] font-black shadow-sm'
                : 'text-[#a8a29e] hover:text-[#ffffff] hover:bg-[#292524]'
            }`}
            title="Switch to Advanced UI (Pro Engineering IDE with Oscilloscope & Memory Hex editor)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentLevel === 'advanced' ? 'bg-[#000000]' : 'bg-[#06b6d4]'}`} />
            <span>Advanced</span>
          </button>
        </div>
      )}

      {/* Right Controls: Theme Toggle, High Contrast, Settings & Assemble Button */}
      <div className="flex items-center gap-2">
        {/* Persistent Theme Toggle (Dark / Light Mode) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`px-2.5 py-1 text-[11px] font-mono font-black uppercase rounded-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${
              theme === 'light'
                ? 'bg-[#ffffff] text-[#0f172a] border-[#cbd5e1] hover:border-[#94a3b8] shadow-xs'
                : 'bg-[#292524] text-[#ded7cd] border-[#57534e] hover:border-[#fbbf24]'
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

        {/* Quick High Contrast Mode Toggle */}
        <button
          onClick={onToggleHighContrast}
          className={`px-2.5 py-1 text-[11px] font-mono font-black uppercase rounded-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${
            isHighContrast
              ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
              : 'bg-[#292524] text-[#fbbf24] border-[#57534e] hover:border-[#fbbf24]'
          }`}
          title="Toggle High Contrast Mode (Strict black-and-white borders & text)"
        >
          <span>◐</span>
          <span className="hidden sm:inline">{isHighContrast ? 'CONTRAST: ON' : 'HIGH CONTRAST'}</span>
        </button>

        {/* Quick Learn 8051 Button */}
        {onOpenLearn8051 && (
          <button
            onClick={onOpenLearn8051}
            className="px-2.5 py-1 text-[11px] font-mono font-black uppercase rounded-sm border transition-colors cursor-pointer flex items-center gap-1.5 bg-[#fbbf24] hover:bg-[#f59e0b] text-black border-[#fbbf24] shadow-xs"
            title="Open comprehensive 8051 architecture & learning hub"
          >
            <span>Learn 8051</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="px-2 py-1 text-xs font-mono font-bold text-[#e7e5e4] hover:text-[#ffffff] bg-[#292524] hover:bg-[#38332c] border border-[#524d43] rounded-sm cursor-pointer"
          title="Open Workstation Settings"
        >
          ⚙ SETTINGS
        </button>

        <InstrumentButton
          variant="amber"
          size="sm"
          onClick={onAssemble}
          disabled={isAssembling}
          className="text-[#000000] bg-[#f59e0b] hover:bg-[#fbbf24] border-[#fbbf24] font-black"
        >
          {isAssembling ? 'BUILDING...' : '⚡ ASSEMBLE'}
        </InstrumentButton>
      </div>

      {/* About & Copyright Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs select-none">
          <div className="bg-[#1c1917] border-2 border-[#524d43] rounded-sm w-full max-w-md p-5 font-mono text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#44403c]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
                <h3 className="text-sm font-black text-[#fbbf24]">Micro8051SiM</h3>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="text-[#a8a29e] hover:text-[#ffffff] font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[#d4ccc2] leading-relaxed">
              <p>
                <strong>Micro8051SiM</strong> is a cycle-accurate Intel 8051 microcontroller simulation, assembly debugger, and virtual electronics hardware workbench.
              </p>
              <div className="bg-[#141210] border border-[#38332c] p-3 rounded-xs text-[11px] space-y-1">
                <div className="text-[#fbbf24] font-bold">Simulator Levels:</div>
                <div>• <strong>Beginner</strong>: Visual & plain-English step-by-step guidance</div>
                <div>• <strong>Intermediate</strong>: EdSim51 full lab workbench</div>
                <div>• <strong>Advanced</strong>: Pro engineering IDE with oscilloscope & deep memory</div>
              </div>
              <div className="pt-2 text-center border-t border-[#38332c]">
                <div className="font-bold text-[#ffffff] text-xs">
                  © 2026 Vineet Sharma , Chaman Vashishth
                </div>
                <div className="text-[10px] text-[#a8a29e] mt-0.5">
                  All rights reserved.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <InstrumentButton variant="amber" size="sm" onClick={() => setShowAboutModal(false)}>
                Close
              </InstrumentButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

