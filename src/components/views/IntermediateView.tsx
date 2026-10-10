/**
 * Micro8051SiM - Intermediate Level Interface
 * Classic EdSim51 Virtual Microcontroller Laboratory Workbench.
 * Spacious assembly editor with full registers bank, I/O ports monitor, and peripheral suite.
 */

import React, { useState } from 'react';
import { CPUState, ClockSpeedHz, SimulationSpeed, AssemblerResult, ConsoleMessage } from '../../core/types.ts';
import { SimulatorStatus } from '../../simulator/execution-controller.ts';
import { PeripheralsManager } from '../../peripherals/peripherals.ts';
import { ExampleProgram } from '../../examples/examples.ts';
import { AssemblyEditor } from '../editor/AssemblyEditor.tsx';
import { CpuRegistersView } from '../debugger/CpuRegistersView.tsx';
import { MemoryViewer } from '../debugger/MemoryViewer.tsx';
import { SfrViewer } from '../debugger/SfrViewer.tsx';
import { VirtualBench, HardwareViewMode } from '../virtual-bench/VirtualBench.tsx';
import { Toolbar } from '../layout/Toolbar.tsx';
import { Header } from '../layout/Header.tsx';
import { StatusBar } from '../layout/StatusBar.tsx';
import { ConsolePanel } from '../layout/ConsolePanel.tsx';
import { SimulatorLevel } from '../home/HomePage.tsx';

interface IntermediateViewProps {
  cpuState: CPUState;
  peripherals: PeripheralsManager;
  sourceCode: string;
  setSourceCode: (code: string) => void;
  projectName: string;
  assemblerResult: AssemblerResult;
  simulatorStatus: SimulatorStatus;
  speed: SimulationSpeed;
  onChangeSpeed: (spd: SimulationSpeed) => void;
  clockHz: ClockSpeedHz;
  onChangeClock: (hz: ClockSpeedHz) => void;
  breakpoints: Set<number>;
  onToggleBreakpointLine: (line: number) => void;
  onClearBreakpoints: () => void;
  onAssemble: () => void;
  onRun: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  selectedExampleId: string;
  onSelectExample: (ex: ExampleProgram) => void;
  currentExecLine?: number;
  onSwitchLevel: (level: SimulatorLevel) => void;
  onGoHome: () => void;
  onNewProject: () => void;
  onOpenPinMapper: () => void;
  onOpenInstructionRef: () => void;
  onOpenSettings: () => void;
  onExportAsm: () => void;
  onExportHex: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenLearn8051?: () => void;
  consoleMessages: ConsoleMessage[];
  onClearConsole: () => void;
  onToggleSwitch: (index: number) => void;
  onSetAllSwitches: (state: boolean) => void;
  onPressKeypadKey: (row: number, col: number) => void;
  onReleaseKeypadKey: () => void;
  onAdcVoltageChange: (v: number) => void;
  onSendSerialData: (data: string) => void;
  onClearSerialHistory: () => void;
  onLoadCodePreset?: (code: string, title: string) => void;
  writeDirect: (addr: number, val: number) => void;
  writeRam: (addr: number, val: number) => void;
  writeXram: (addr: number, val: number) => void;
  writeSfr: (addr: number, val: number) => void;
  writeBit: (bitAddr: number, val: boolean) => void;
  clearRam: (scratchpadOnly?: boolean) => void;
  clearXram: () => void;
  readDirect: (addr: number) => number;
}

export const IntermediateView: React.FC<IntermediateViewProps> = ({
  cpuState,
  peripherals,
  sourceCode,
  setSourceCode,
  projectName,
  assemblerResult,
  simulatorStatus,
  speed,
  onChangeSpeed,
  clockHz,
  onChangeClock,
  breakpoints,
  onToggleBreakpointLine,
  onClearBreakpoints,
  onAssemble,
  onRun,
  onPause,
  onStep,
  onReset,
  selectedExampleId,
  onSelectExample,
  currentExecLine,
  onSwitchLevel,
  onGoHome,
  onNewProject,
  onOpenPinMapper,
  onOpenInstructionRef,
  onOpenSettings,
  onExportAsm,
  onExportHex,
  isHighContrast,
  onToggleHighContrast,
  theme = 'dark',
  onToggleTheme,
  onOpenLearn8051,
  consoleMessages,
  onClearConsole,
  onToggleSwitch,
  onSetAllSwitches,
  onPressKeypadKey,
  onReleaseKeypadKey,
  onAdcVoltageChange,
  onSendSerialData,
  onClearSerialHistory,
  onLoadCodePreset,
  writeDirect,
  writeRam,
  writeXram,
  writeSfr,
  writeBit,
  clearRam,
  clearXram,
  readDirect,
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<'registers' | 'ram' | 'sfr'>('registers');
  const [isBottomTabCollapsed, setIsBottomTabCollapsed] = useState<boolean>(false);
  const [dockHeight, setDockHeight] = useState<'normal' | 'tall' | 'max'>('tall');
  const [hardwareViewMode, setHardwareViewMode] = useState<HardwareViewMode>('all');
  const [showConsoleDrawer, setShowConsoleDrawer] = useState(false);

  return (
    <div className={`min-h-screen w-full bg-[#121110] text-[#e6ded5] font-mono flex flex-col overflow-y-auto ${isHighContrast ? 'high-contrast' : ''}`}>
      {/* 1. Header with EdSim51 Workbench branding & Level Switcher */}
      <Header
        onNewProject={onNewProject}
        onOpenPinMapper={onOpenPinMapper}
        onOpenInstructionRef={onOpenInstructionRef}
        onOpenSettings={onOpenSettings}
        onExportAsm={onExportAsm}
        onExportHex={onExportHex}
        onClearBreakpoints={onClearBreakpoints}
        onResetCpu={onReset}
        onAssemble={onAssemble}
        isHighContrast={isHighContrast}
        onToggleHighContrast={onToggleHighContrast}
        currentLevel="intermediate"
        onSelectLevel={onSwitchLevel}
        onGoHome={onGoHome}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenLearn8051={onOpenLearn8051}
      />

      {/* 2. EdSim51 Classic Instrument Toolbar */}
      <Toolbar
        status={simulatorStatus}
        clockHz={clockHz}
        speed={speed}
        cycles={cpuState.cycles}
        instructions={cpuState.instructionCount}
        pc={cpuState.pc}
        selectedExampleId={selectedExampleId}
        onSelectExample={onSelectExample}
        onAssemble={onAssemble}
        onRun={onRun}
        onPause={onPause}
        onStep={onStep}
        onReset={onReset}
        onChangeClock={onChangeClock}
        onChangeSpeed={onChangeSpeed}
        isHighContrast={isHighContrast}
        onToggleHighContrast={onToggleHighContrast}
        currentLevel="intermediate"
      />

      {/* 3. Main Split Viewport: Left (Large Code Editor & Registers) | Right (Trainer Kit Bench) */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-3.5 flex flex-col lg:flex-row gap-3.5">
        {/* LEFT COLUMN: Spacious Assembly Code Window & Collapsible Registers */}
        <div className="lg:w-[48%] w-full flex flex-col gap-2.5">
          {/* Code Window Header */}
          <div className="flex items-center justify-between bg-[#1c1917] border border-[#524d43] px-3 py-2 rounded-sm text-xs select-none shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#fbbf24] font-black">📄</span>
              <span className="text-[#ffffff] font-black">{projectName}</span>
              <span className="text-[11px] text-[#fbbf24]">({assemblerResult.programSize}B ROM)</span>
            </div>

            <div className="flex items-center gap-2">
              {breakpoints.size > 0 && (
                <button
                  onClick={onClearBreakpoints}
                  className="px-2 py-0.5 text-[10px] font-bold text-[#fca5a5] hover:bg-[#3d1818] rounded-xs border border-[#7f1d1d] cursor-pointer"
                >
                  Clear BP ({breakpoints.size})
                </button>
              )}
              {/* Expand/Collapse Bottom Registers to make Code Editor Huge! */}
              <button
                onClick={() => setIsBottomTabCollapsed((c) => !c)}
                className="px-2.5 py-1 text-[10px] font-bold text-[#fbbf24] bg-[#292524] hover:bg-[#38332c] rounded-xs border border-[#524d43] cursor-pointer transition-colors"
                title={isBottomTabCollapsed ? 'Show CPU Registers & RAM' : 'Expand Code Editor to Full Height'}
              >
                {isBottomTabCollapsed ? 'SHOW DOCK' : 'EXPAND EDITOR'}
              </button>
            </div>
          </div>

          {/* Assembly Editor: Proportional height depending on bottom dock */}
          <div className={`${isBottomTabCollapsed ? 'h-[720px]' : dockHeight === 'max' ? 'h-[320px]' : dockHeight === 'tall' ? 'h-[390px]' : 'h-[450px]'} w-full rounded-sm border border-[#524d43] overflow-hidden shadow-sm transition-all duration-200`}>
            <AssemblyEditor
              sourceCode={sourceCode}
              onChange={setSourceCode}
              currentLine={currentExecLine}
              currentPc={cpuState.pc}
              breakpoints={breakpoints}
              lineToAddress={assemblerResult.lineToAddress}
              disassembly={assemblerResult.disassembly}
              onToggleBreakpoint={onToggleBreakpointLine}
              errors={assemblerResult.errors}
            />
          </div>

          {/* Bottom Tabs: CPU Registers & Data Memory (Generous, expandable height!) */}
          {!isBottomTabCollapsed && (
            <div className="flex flex-col bg-[#1c1917] border border-[#44403c] rounded-sm overflow-hidden shadow-sm">
              <div className="flex items-center justify-between border-b border-[#44403c] bg-[#141210] text-[11px] font-mono pr-2">
                <div className="flex flex-1">
                  <button
                    onClick={() => setActiveBottomTab('registers')}
                    className={`flex-1 py-1.5 text-center font-black uppercase transition-colors cursor-pointer ${
                      activeBottomTab === 'registers'
                        ? 'bg-[#1c1917] text-[#fbbf24] border-b-2 border-[#f59e0b]'
                        : 'text-[#a8a29e] hover:text-[#ffffff]'
                    }`}
                  >
                    CPU REGISTERS & PSW
                  </button>
                  <button
                    onClick={() => setActiveBottomTab('ram')}
                    className={`flex-1 py-1.5 text-center font-black uppercase transition-colors cursor-pointer ${
                      activeBottomTab === 'ram'
                        ? 'bg-[#1c1917] text-[#fbbf24] border-b-2 border-[#f59e0b]'
                        : 'text-[#a8a29e] hover:text-[#ffffff]'
                    }`}
                  >
                    DATA MEMORY (RAM & XRAM)
                  </button>
                  <button
                    onClick={() => setActiveBottomTab('sfr')}
                    className={`flex-1 py-1.5 text-center font-black uppercase transition-colors cursor-pointer ${
                      activeBottomTab === 'sfr'
                        ? 'bg-[#1c1917] text-[#fbbf24] border-b-2 border-[#f59e0b]'
                        : 'text-[#a8a29e] hover:text-[#ffffff]'
                    }`}
                  >
                    SFR TABLE
                  </button>
                </div>

                {/* Dock Height Controls for Data Memory expansion */}
                <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-[#38332c] text-[10px]">
                  <span className="text-[#78716c]">HEIGHT:</span>
                  <button
                    onClick={() => setDockHeight('normal')}
                    className={`px-1.5 py-0.5 rounded-xs cursor-pointer font-bold ${
                      dockHeight === 'normal' ? 'bg-[#f59e0b] text-black' : 'text-[#a8a29e] hover:text-white bg-[#1c1917]'
                    }`}
                    title="Normal Dock Height (360px)"
                  >
                    360px
                  </button>
                  <button
                    onClick={() => setDockHeight('tall')}
                    className={`px-1.5 py-0.5 rounded-xs cursor-pointer font-bold ${
                      dockHeight === 'tall' ? 'bg-[#f59e0b] text-black' : 'text-[#a8a29e] hover:text-white bg-[#1c1917]'
                    }`}
                    title="Tall Dock Height (480px) - Great for RAM inspection"
                  >
                    480px
                  </button>
                  <button
                    onClick={() => setDockHeight('max')}
                    className={`px-1.5 py-0.5 rounded-xs cursor-pointer font-bold ${
                      dockHeight === 'max' ? 'bg-[#f59e0b] text-black' : 'text-[#a8a29e] hover:text-white bg-[#1c1917]'
                    }`}
                    title="Maximized Dock Height (580px)"
                  >
                    580px
                  </button>
                </div>
              </div>

              <div className={`${dockHeight === 'max' ? 'h-[580px]' : dockHeight === 'tall' ? 'h-[480px]' : 'h-[360px]'} p-1.5 overflow-hidden flex flex-col`}>
                {activeBottomTab === 'registers' && (
                  <div className="h-full overflow-y-auto">
                    <CpuRegistersView cpuState={cpuState} />
                  </div>
                )}
                {activeBottomTab === 'ram' && (
                  <div className="h-full w-full overflow-hidden flex flex-col">
                    <MemoryViewer
                      cpuState={cpuState}
                      onWriteByte={writeDirect}
                      onWriteRam={writeRam}
                      onWriteXram={writeXram}
                      onWriteSfr={writeSfr}
                      onWriteBit={writeBit}
                      onClearRam={clearRam}
                      onClearXram={clearXram}
                      readDirect={readDirect}
                    />
                  </div>
                )}
                {activeBottomTab === 'sfr' && (
                  <div className="h-full overflow-y-auto">
                    <SfrViewer cpuState={cpuState} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Virtual Hardware Trainer Kit */}
        <div className="lg:w-[52%] w-full flex flex-col min-h-[580px] h-auto lg:h-[780px] overflow-hidden rounded-sm border border-[#524d43]">
          <VirtualBench
            peripherals={peripherals}
            portLatches={cpuState.portLatches}
            portPins={cpuState.portPins}
            cpuCycles={cpuState.cycles}
            clockHz={clockHz}
            onToggleSwitch={onToggleSwitch}
            onSetAllSwitches={onSetAllSwitches}
            onPressKeypadKey={onPressKeypadKey}
            onReleaseKeypadKey={onReleaseKeypadKey}
            onAdcVoltageChange={onAdcVoltageChange}
            onSendSerialData={onSendSerialData}
            onClearSerialHistory={onClearSerialHistory}
            onLoadCodePreset={onLoadCodePreset}
            activeViewMode={hardwareViewMode}
            onViewModeChange={setHardwareViewMode}
          />
        </div>
      </div>

      {/* 4. Collapsible Console Drawer */}
      {showConsoleDrawer && (
        <div className="h-44 border-t border-[#383129] bg-[#141210] p-2 relative z-30 shrink-0">
          <div className="flex justify-between items-center pb-1 mb-1 border-b border-[#2d2722]">
            <span className="text-xs font-mono font-bold text-[#fbbf24]">
              System Logs & Assembler Diagnostics
            </span>
            <button
              onClick={() => setShowConsoleDrawer(false)}
              className="text-[#8c8275] hover:text-[#fef3c7] text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              ✕ Close Drawer
            </button>
          </div>
          <div className="h-32">
            <ConsolePanel
              messages={consoleMessages}
              errors={assemblerResult.errors}
              onClear={onClearConsole}
            />
          </div>
        </div>
      )}

      {/* 5. Bottom Hardware Status Bar with Copyright */}
      <footer className="flex items-center justify-between bg-[#100e0c] border-t border-[#26221d] px-3.5 py-1 text-[10px] select-none shrink-0 mt-auto">
        <StatusBar
          status={simulatorStatus}
          clockHz={clockHz}
          cycles={cpuState.cycles}
          instructions={cpuState.instructionCount}
          pc={cpuState.pc}
          sp={cpuState.sp}
          breakpointCount={breakpoints.size}
          programSize={assemblerResult.programSize}
          level="intermediate"
          theme={theme}
        />
        <div className="flex items-center gap-4">
          <span className="text-[#a8a29e] hidden md:inline font-bold">
            © 2026 Vineet Sharma , Chaman Vashishth
          </span>
          <button
            onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
            className="px-2 py-0.5 rounded border transition-colors cursor-pointer font-bold bg-[#1a1714] text-[#8c8275] border-[#383129] hover:text-[#ded7cd]"
          >
            {showConsoleDrawer ? 'Hide Logs' : `Logs (${consoleMessages.length})`}
          </button>
        </div>
      </footer>
    </div>
  );
};
