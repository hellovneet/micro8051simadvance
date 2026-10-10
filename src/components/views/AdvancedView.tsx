/**
 * Micro8051SiM - Advanced Level Interface
 * Pro Embedded Systems Engineering Studio / IDE.
 * Features synchronized split disassembly with raw machine opcodes, dual-channel oscilloscope,
 * bidirectional UART terminal, deep RAM/XRAM hex matrix editor, and cycle-accurate microsecond timing.
 */

import React, { useState } from 'react';
import { CPUState, ClockSpeedHz, SimulationSpeed, AssemblerResult, ConsoleMessage } from '../../core/types.ts';
import { SimulatorStatus } from '../../simulator/execution-controller.ts';
import { PeripheralsManager } from '../../peripherals/peripherals.ts';
import { ExampleProgram } from '../../examples/examples.ts';
import { AssemblyEditor } from '../editor/AssemblyEditor.tsx';
import { DisassemblyView } from '../debugger/DisassemblyView.tsx';
import { MemoryViewer } from '../debugger/MemoryViewer.tsx';
import { SfrViewer } from '../debugger/SfrViewer.tsx';
import { CpuRegistersView } from '../debugger/CpuRegistersView.tsx';
import { Oscilloscope } from '../virtual-bench/Oscilloscope.tsx';
import { UartTerminal } from '../virtual-bench/UartTerminal.tsx';
import { FrequencyDisplay } from '../virtual-bench/FrequencyDisplay.tsx';
import { AdvancedTimingPanel } from '../advanced/AdvancedTimingPanel.tsx';
import { Header } from '../layout/Header.tsx';
import { Toolbar } from '../layout/Toolbar.tsx';
import { StatusBar } from '../layout/StatusBar.tsx';
import { ConsolePanel } from '../layout/ConsolePanel.tsx';
import { SimulatorLevel } from '../home/HomePage.tsx';

interface AdvancedViewProps {
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
  onToggleBreakpointAddr: (addr: number) => void;
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
  onSendSerialData: (data: string) => void;
  onClearSerialHistory: () => void;
  writeDirect: (addr: number, val: number) => void;
  writeRam: (addr: number, val: number) => void;
  writeXram: (addr: number, val: number) => void;
  writeSfr: (addr: number, val: number) => void;
  writeBit: (bitAddr: number, val: boolean) => void;
  clearRam: (scratchpadOnly?: boolean) => void;
  clearXram: () => void;
  readDirect: (addr: number) => number;
}

export const AdvancedView: React.FC<AdvancedViewProps> = ({
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
  onToggleBreakpointAddr,
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
  onSendSerialData,
  onClearSerialHistory,
  writeDirect,
  writeRam,
  writeXram,
  writeSfr,
  writeBit,
  clearRam,
  clearXram,
  readDirect,
}) => {
  // Pro layout state
  const [editorMode, setEditorMode] = useState<'editor' | 'disasm' | 'split'>('split');
  const [proTab, setProTab] = useState<'scope' | 'uart' | 'memory' | 'registers' | 'frequency'>('scope');
  const [isMemoryWideView, setIsMemoryWideView] = useState(false);
  const [showConsoleDrawer, setShowConsoleDrawer] = useState(false);

  return (
    <div className={`min-h-screen w-full bg-[#0b0f14] text-[#cbd5e1] font-mono flex flex-col overflow-y-auto ${isHighContrast ? 'high-contrast' : ''}`}>
      {/* 1. Pro Header with Cyan Accents */}
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
        currentLevel="advanced"
        onSelectLevel={onSwitchLevel}
        onGoHome={onGoHome}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenLearn8051={onOpenLearn8051}
      />

      {/* 2. Pro Instrument Control Toolbar */}
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
        currentLevel="advanced"
      />

      {/* 3. Top Architectural Timing & Memory Footprint Banner */}
      <div className="max-w-[1700px] w-full mx-auto px-3.5 pt-2 shrink-0">
        <AdvancedTimingPanel
          cpuState={cpuState}
          clockHz={clockHz}
          programSize={assemblerResult.programSize}
          onOpenPinMapper={onOpenPinMapper}
          onOpenOscilloscope={() => setProTab('scope')}
          onOpenUart={() => setProTab('uart')}
        />
      </div>

      {/* 4. Pro Split Workstation: Left (Dual Editor/Disassembly) | Right (Pro Instruments) */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-3.5 flex flex-col lg:flex-row gap-3.5">
        {/* LEFT COLUMN: Spacious Pro Code & Disassembly Studio */}
        <div className="lg:w-[50%] w-full flex flex-col gap-2.5">
          {/* Studio Code Header & Mode Toggles */}
          <div className="flex items-center justify-between bg-[#111827] border border-[#1e293b] px-3 py-2 rounded-sm text-xs shadow-sm select-none">
            <div className="flex items-center gap-2">
              <span className="text-[#38bdf8] font-black">⚙</span>
              <span className="text-[#ffffff] font-black">{projectName}</span>
              <span className="text-[11px] text-[#38bdf8]">
                PC: 0x{cpuState.pc.toString(16).toUpperCase().padStart(4, '0')}H
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded border border-[#334155] p-0.5 bg-[#0b0f14]">
                <button
                  onClick={() => setEditorMode('editor')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-xs cursor-pointer transition-colors ${
                    editorMode === 'editor' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                  }`}
                >
                  SOURCE
                </button>
                <button
                  onClick={() => setEditorMode('disasm')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-xs cursor-pointer transition-colors ${
                    editorMode === 'disasm' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                  }`}
                >
                  DISASSEMBLY
                </button>
                <button
                  onClick={() => setEditorMode('split')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-xs cursor-pointer transition-colors ${
                    editorMode === 'split' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                  }`}
                >
                  SPLIT (SYNC)
                </button>
              </div>

              {breakpoints.size > 0 && (
                <button
                  onClick={onClearBreakpoints}
                  className="px-2 py-0.5 text-[10px] font-bold text-[#f87171] hover:bg-[#3b1515] rounded-xs border border-[#7f1d1d] cursor-pointer"
                >
                  BP ({breakpoints.size})
                </button>
              )}
            </div>
          </div>

          {/* Full-Height Responsive Code Workspace */}
          <div className="h-[540px] lg:h-[640px] w-full rounded-sm border border-[#1e293b] overflow-hidden shadow-sm">
            {editorMode === 'editor' && (
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
            )}
            {editorMode === 'disasm' && (
              <DisassemblyView
                disassembly={assemblerResult.disassembly}
                currentPc={cpuState.pc}
                breakpoints={breakpoints}
                onToggleBreakpoint={onToggleBreakpointAddr}
              />
            )}
            {editorMode === 'split' && (
              <div className="flex flex-col h-full gap-1.5">
                <div className="h-1/2 min-h-0 overflow-hidden">
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
                <div className="h-1/2 min-h-0 overflow-hidden border-t border-[#1e293b]">
                  <DisassemblyView
                    disassembly={assemblerResult.disassembly}
                    currentPc={cpuState.pc}
                    breakpoints={breakpoints}
                    onToggleBreakpoint={onToggleBreakpointAddr}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Pro Engineering Instrumentation Suite */}
        <div className="lg:w-[50%] w-full flex flex-col gap-2.5">
          {/* Instrument Selector Tabs */}
          <div className="flex items-center justify-between bg-[#111827] border border-[#1e293b] px-3 py-2 rounded-sm text-xs select-none shadow-sm overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-[#38bdf8] font-bold mr-1">PRO SUITE:</span>
              <button
                onClick={() => setProTab('scope')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-colors ${
                  proTab === 'scope' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                }`}
              >
                OSCILLOSCOPE
              </button>
              <button
                onClick={() => setProTab('uart')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-colors ${
                  proTab === 'uart' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                }`}
              >
                UART SERIAL
              </button>
              <button
                onClick={() => setProTab('memory')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-colors ${
                  proTab === 'memory' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                }`}
              >
                DATA MEMORY (HEX)
              </button>
              <button
                onClick={() => setProTab('registers')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-colors ${
                  proTab === 'registers' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                }`}
              >
                CPU & SFR
              </button>
              <button
                onClick={() => setProTab('frequency')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer transition-colors ${
                  proTab === 'frequency' ? 'bg-[#06b6d4] text-[#000000] font-black' : 'text-[#94a3b8] hover:text-[#ffffff]'
                }`}
              >
                LOGIC PROBE
              </button>
            </div>
          </div>

          {/* Instrument Body: Fills Remaining Height with Independent Scroll */}
          <div className={`${proTab === 'memory' ? 'p-1.5 overflow-hidden flex flex-col' : 'p-3 overflow-y-auto'} h-[560px] lg:h-[680px] w-full rounded-sm border border-[#1e293b] bg-[#111827] shadow-sm`}>
            {proTab === 'scope' && (
              <div className="space-y-3">
                <Oscilloscope
                  dacVoltage={peripherals.dacVoltage}
                  dacHistory={peripherals.dacWaveformHistory}
                  adcVoltage={peripherals.adcInputVoltage}
                  adcDigital={Math.round((peripherals.adcInputVoltage / 5.0) * 255)}
                  onAdcVoltageChange={(v: number) => {
                    peripherals.adcInputVoltage = v;
                    peripherals.updateInputsToCpu(cpuState);
                  }}
                  mapping={peripherals.mapping}
                  comparatorEnabled={peripherals.comparatorEnabled}
                  comparatorOutput={peripherals.comparatorOutput}
                  onToggleComparator={() => peripherals.toggleComparator()}
                />
              </div>
            )}

            {proTab === 'uart' && (
              <div className="space-y-3">
                <UartTerminal
                  txHistory={peripherals.uartTxHistory}
                  onSendSerialData={onSendSerialData}
                  onClearHistory={onClearSerialHistory}
                />
              </div>
            )}

            {proTab === 'memory' && (
              <div className="h-full w-full flex flex-col overflow-hidden">
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

            {proTab === 'registers' && (
              <div className="space-y-3">
                <CpuRegistersView cpuState={cpuState} />
                <SfrViewer cpuState={cpuState} />
              </div>
            )}

            {proTab === 'frequency' && (
              <div className="space-y-3">
                <FrequencyDisplay
                  analyzer={peripherals.frequencyAnalyzer}
                  cpuCycles={cpuState.cycles}
                  clockHz={clockHz}
                  onSelectPin={(port: number, pin: number, label: string) => {
                    peripherals.frequencyAnalyzer.setProbe(port, pin, label);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Collapsible Console Drawer */}
      {showConsoleDrawer && (
        <div className="h-44 border-t border-[#1e293b] bg-[#0b0f14] p-2 relative z-30 shrink-0">
          <div className="flex justify-between items-center pb-1 mb-1 border-b border-[#1e293b]">
            <span className="text-xs font-mono font-bold text-[#38bdf8]">
              Firmware Diagnostics & Build Console
            </span>
            <button
              onClick={() => setShowConsoleDrawer(false)}
              className="text-[#94a3b8] hover:text-[#ffffff] text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
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

      {/* 6. Pro Footer with Copyright */}
      <footer className="flex flex-col sm:flex-row items-center justify-between bg-[#080b0f] border-t border-[#1e293b] px-3.5 py-2 text-[10px] select-none shrink-0 text-[#94a3b8] mt-auto gap-2">
        <StatusBar
          status={simulatorStatus}
          clockHz={clockHz}
          cycles={cpuState.cycles}
          instructions={cpuState.instructionCount}
          pc={cpuState.pc}
          sp={cpuState.sp}
          breakpointCount={breakpoints.size}
          programSize={assemblerResult.programSize}
          level="advanced"
          theme={theme}
        />
        <div className="flex items-center gap-4">
          <span className="text-[#38bdf8] font-black hidden md:inline">
            PRO STUDIO · 64KB MEMORY MAP
          </span>
          <span className="text-[#cbd5e1] font-bold">
            © 2026 Vineet Sharma , Chaman Vashishth
          </span>
          <button
            onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
            className="px-2 py-0.5 rounded border transition-colors cursor-pointer font-bold bg-[#111827] text-[#38bdf8] border-[#1e293b] hover:text-[#ffffff]"
          >
            {showConsoleDrawer ? 'Hide Logs' : `Logs (${consoleMessages.length})`}
          </button>
        </div>
      </footer>
    </div>
  );
};
