/**
 * Micro8051SiM - Beginner Level Interface
 * Clean, professional, visual learning station for students and beginners.
 * Features a comfortable code editor, clean plain-English instruction explainer,
 * core CPU registers, live hardware (LEDs, switches, LCD, 7-seg), and a dedicated
 * DATA MEMORY (Internal RAM) section with real-time inspection.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, History, StepForward } from 'lucide-react';
import { CPUState, ClockSpeedHz, SimulationSpeed, AssemblerResult } from '../../core/types.ts';
import { SimulatorStatus } from '../../simulator/execution-controller.ts';
import { PeripheralsManager } from '../../peripherals/peripherals.ts';
import { EXAMPLES, ExampleProgram } from '../../examples/examples.ts';
import { AssemblyEditor } from '../editor/AssemblyEditor.tsx';
import { SimulatorLevel } from '../home/HomePage.tsx';
import { SevenSegmentDisplay } from '../virtual-bench/SevenSegmentDisplay.tsx';
import { StatusBar } from '../layout/StatusBar.tsx';

interface BeginnerViewProps {
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
  breakpoints: Set<number>;
  onToggleBreakpoint: (line: number) => void;
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
  onOpenInstructionRef: () => void;
  onOpenSettings: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onToggleSwitch: (index: number) => void;
  writeDirect?: (address: number, value: number) => void;
  writeRam?: (address: number, value: number) => void;
  clearRam?: (scratchpadOnly?: boolean) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenLearn8051?: () => void;
}

export const BeginnerView: React.FC<BeginnerViewProps> = ({
  cpuState,
  peripherals,
  sourceCode,
  setSourceCode,
  projectName,
  assemblerResult,
  simulatorStatus,
  speed,
  onChangeSpeed,
  clockHz = 12000000,
  breakpoints,
  onToggleBreakpoint,
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
  onOpenInstructionRef,
  onOpenSettings,
  isHighContrast,
  onToggleHighContrast,
  onToggleSwitch,
  writeRam,
  writeDirect,
  clearRam,
  theme = 'dark',
  onToggleTheme,
  onOpenLearn8051,
}) => {
  const [hardwareTab, setHardwareTab] = useState<'leds' | 'lcd' | 'seven-seg'>('leds');
  const [memoryFilter, setMemoryFilter] = useState<'scratchpad' | 'banks' | 'bit' | 'all'>('scratchpad');
  const [rightPanelTab, setRightPanelTab] = useState<'hardware' | 'memory' | 'registers'>('hardware');

  // Manual RAM edit state
  const [ramEditAddrInput, setRamEditAddrInput] = useState<string>('30');
  const [ramEditValInput, setRamEditValInput] = useState<string>('55');
  const [ramFeedback, setRamFeedback] = useState<string | null>(null);

  const isRunning = simulatorStatus === 'RUNNING';

  const acc = cpuState.acc & 0xFF;
  const b = cpuState.b & 0xFF;
  const pc = cpuState.pc & 0xFFFF;
  const dptr = cpuState.dptr & 0xFFFF;
  const sp = cpuState.sp & 0xFF;
  const p1 = cpuState.portLatches[1] ?? 0xFF;
  const p3 = cpuState.portPins[3] ?? 0xFF;

  // Active Register Bank (PSW bits 3 and 4)
  const rs0 = (cpuState.psw >> 3) & 1;
  const rs1 = (cpuState.psw >> 4) & 1;
  const activeBank = (rs1 << 1) | rs0;
  const bankStartAddr = activeBank * 8;

  // R0 - R7 for current active bank
  const rRegisters = [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
    const addr = bankStartAddr + idx;
    return cpuState.ram[addr] ?? 0;
  });

  // Find instruction currently at PC
  const currentInstruction = assemblerResult.disassembly.find((d) => d.address === cpuState.pc);
  const nextInstructionIdx = assemblerResult.disassembly.findIndex((d) => d.address === cpuState.pc);
  const nextInstruction = nextInstructionIdx >= 0 && nextInstructionIdx + 1 < assemblerResult.disassembly.length
    ? assemblerResult.disassembly[nextInstructionIdx + 1]
    : undefined;

  // Beginner Quick Code Snippets
  const loadSnippet = (snippetCode: string) => {
    setSourceCode(snippetCode);
  };

  // Alter RAM cell directly
  const handleWriteRam = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const addr = parseInt(ramEditAddrInput, 16);
    const val = parseInt(ramEditValInput, 16);

    if (isNaN(addr) || addr < 0 || addr > 0x7F) {
      setRamFeedback('Address must be between 00H and 7FH');
      setTimeout(() => setRamFeedback(null), 2500);
      return;
    }
    if (isNaN(val) || val < 0 || val > 0xFF) {
      setRamFeedback('Value must be between 00H and FFH');
      setTimeout(() => setRamFeedback(null), 2500);
      return;
    }

    if (writeRam) {
      writeRam(addr, val);
    } else if (writeDirect) {
      writeDirect(addr, val);
    }
    setRamFeedback(`RAM [${addr.toString(16).toUpperCase().padStart(2, '0')}H] updated to ${val.toString(16).toUpperCase().padStart(2, '0')}H`);
    setTimeout(() => setRamFeedback(null), 2500);
  };

  // Plain-English instruction translator
  const getExplanation = (): { what: string; hardware: string; tip: string } => {
    if (!currentInstruction) {
      return {
        what: 'Click "BUILD CODE [F4]" to compile, then click "STEP LINE [F7]" to execute one instruction at a time.',
        hardware: 'Connected hardware (LEDs, switches, registers, RAM) will update automatically.',
        tip: 'Assembly language instructions execute sequentially from top to bottom unless a jump occurs.',
      };
    }

    const m = currentInstruction.mnemonic.toUpperCase();
    const ops = currentInstruction.operands;

    if (m === 'MOV') {
      if (ops.includes('P1') && ops.includes('A')) {
        return {
          what: `Sends the value in Accumulator A (${acc} or ${acc.toString(16).toUpperCase()}H) to Port 1.`,
          hardware: `Port 1 LEDs will update! Bits that are 1 turn ON.`,
          tip: `Port 1 pins directly control the 8 output LEDs (D0 to D7).`,
        };
      }
      if (ops.includes('P1') && ops.includes('#')) {
        return {
          what: `Directly writes constant value ${ops.split('#')[1]} to Port 1 output.`,
          hardware: `Connected LEDs update immediately with new pattern.`,
          tip: `The # prefix indicates an immediate constant value rather than a memory address.`,
        };
      }
      if (ops.includes('A') && ops.includes('#')) {
        return {
          what: `Loads constant value ${ops.split('#')[1]} into Accumulator A.`,
          hardware: `Accumulator A now holds ${ops.split('#')[1]} (${parseInt(ops.split('#')[1], 16) || ops.split('#')[1]} decimal).`,
          tip: `Accumulator A is the primary mathematical and logic working register.`,
        };
      }
      if (ops.includes('30H') || ops.includes('31H') || ops.includes('32H')) {
        return {
          what: `Writes data into Internal Data Memory (RAM).`,
          hardware: `Data Memory section updates. Location now stores the value.`,
          tip: `Internal RAM (locations 30H-7FH) is used to store program variables and data.`,
        };
      }
      return {
        what: `Copies data: ${ops}.`,
        hardware: `Updates internal register or RAM memory location.`,
        tip: `MOV copies data from the source to the destination without erasing the source.`,
      };
    }

    if (m === 'CPL') {
      return {
        what: `Inverts (complements) ${ops}. Bit changes from 0 to 1, or from 1 to 0.`,
        hardware: `Toggles state! If the LED was ON it turns OFF; if OFF it turns ON.`,
        tip: `CPL P1.0 is the standard 8051 method to blink an output LED.`,
      };
    }

    if (m === 'SETB') {
      return {
        what: `Sets bit ${ops} to 1 (HIGH logic level, 5V).`,
        hardware: `Output pin goes HIGH. Connected LED turns ON.`,
        tip: `SETB stands for "Set Bit".`,
      };
    }

    if (m === 'CLR') {
      return {
        what: `Clears bit ${ops} to 0 (LOW logic level, 0V / Ground).`,
        hardware: `Output pin goes LOW. Connected LED turns OFF.`,
        tip: `CLR stands for "Clear Bit".`,
      };
    }

    if (m === 'DJNZ') {
      return {
        what: `Decrements counter register by 1 and jumps to loop target if not zero.`,
        hardware: `Forms a time delay loop so LED transitions remain visible to human eyes.`,
        tip: `Without delay loops, microcontrollers execute instructions in microseconds.`,
      };
    }

    if (m === 'SJMP') {
      return {
        what: `Short jump back to label "${ops}".`,
        hardware: `Loops program execution continuously.`,
        tip: `SJMP stands for "Short Jump" within relative memory range.`,
      };
    }

    if (m === 'ACALL' || m === 'LCALL') {
      return {
        what: `Calls subroutine "${ops}". Saves return address to stack (SP: 0x${sp.toString(16).toUpperCase()}H).`,
        hardware: `Executes the subroutine, then returns when RET is reached.`,
        tip: `Subroutines allow reusable blocks such as delay functions.`,
      };
    }

    if (m === 'RET') {
      return {
        what: `Returns from subroutine back to the caller address from stack.`,
        hardware: `Restores Program Counter from stack and resumes main sequence.`,
        tip: `Every subroutine ends with a RET instruction.`,
      };
    }

    return {
      what: `Executes instruction: ${currentInstruction.mnemonic} ${currentInstruction.operands}.`,
      hardware: `CPU internal state updated. Machine cycles: ${currentInstruction.cycles}.`,
      tip: `Step through instructions to watch registers and memory update.`,
    };
  };

  const explanation = getExplanation();

  // Translation history so users can read past instructions at their own pace
  const [translationHistory, setTranslationHistory] = useState<Array<{
    pc: number;
    mnemonic: string;
    operands: string;
    what: string;
    hardware: string;
    tip: string;
  }>>([]);
  const [showTranslationHistory, setShowTranslationHistory] = useState<boolean>(false);
  const lastRecordedPcRef = useRef<number>(-1);

  useEffect(() => {
    if (currentInstruction && cpuState.pc !== lastRecordedPcRef.current) {
      lastRecordedPcRef.current = cpuState.pc;
      const expl = getExplanation();
      setTranslationHistory((prev) => [
        {
          pc: cpuState.pc,
          mnemonic: currentInstruction.mnemonic,
          operands: currentInstruction.operands,
          what: expl.what,
          hardware: expl.hardware,
          tip: expl.tip,
        },
        ...prev.slice(0, 9),
      ]);
    }
  }, [cpuState.pc, currentInstruction]);

  // Helper for Beginner Data Memory rows
  const getMemoryRows = () => {
    let startAddr = 0x30;
    let endAddr = 0x7F;

    if (memoryFilter === 'banks') {
      startAddr = 0x00;
      endAddr = 0x1F;
    } else if (memoryFilter === 'bit') {
      startAddr = 0x20;
      endAddr = 0x2F;
    } else if (memoryFilter === 'scratchpad') {
      startAddr = 0x30;
      endAddr = 0x7F;
    } else if (memoryFilter === 'all') {
      startAddr = 0x00;
      endAddr = 0x7F;
    }

    const rows: { addr: number; bytes: number[] }[] = [];
    const alignedStart = startAddr & ~0x07;
    for (let addr = alignedStart; addr <= endAddr; addr += 8) {
      const bytes: number[] = [];
      for (let offset = 0; offset < 8; offset++) {
        const cellAddr = addr + offset;
        bytes.push(cpuState.ram[cellAddr] ?? 0);
      }
      rows.push({ addr, bytes });
    }
    return rows;
  };

  const memoryRows = getMemoryRows();

  return (
    <div className={`min-h-screen w-full bg-[#0d1117] text-[#e2e8f0] font-mono flex flex-col overflow-y-auto ${isHighContrast ? 'high-contrast' : ''}`}>
      {/* 1. Header: Professional, Clean, Level Switcher */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none text-xs shrink-0 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 group cursor-pointer bg-transparent border-none text-left p-0"
            title="Return to Homepage"
          >
            <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            <span className="font-black tracking-widest text-[#10b981] text-base group-hover:text-[#6ee7b7] transition-colors">
              Micro8051SiM
            </span>
          </button>

          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
            BEGINNER MODE
          </span>

          <button
            onClick={onGoHome}
            className="px-2.5 py-1 text-[11px] font-bold text-[#94a3b8] hover:text-[#ffffff] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded cursor-pointer transition-colors"
          >
            Home
          </button>
        </div>

        {/* Level Switcher (Clean buttons, zero emojis) */}
        <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] p-1 rounded">
          <span className="text-[10px] text-[#94a3b8] font-bold px-1.5 hidden md:inline">LEVEL:</span>
          <button
            onClick={() => onSwitchLevel('beginner')}
            className="px-2.5 py-1 text-[11px] font-black rounded bg-[#10b981] text-[#000000] shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
            <span>Beginner</span>
          </button>
          <button
            onClick={() => onSwitchLevel('intermediate')}
            className="px-2.5 py-1 text-[11px] font-bold text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#21262d] rounded cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span>Intermediate</span>
          </button>
          <button
            onClick={() => onSwitchLevel('advanced')}
            className="px-2.5 py-1 text-[11px] font-bold text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#21262d] rounded cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
            <span>Advanced</span>
          </button>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-[#ffffff] text-[#0f172a] border border-[#cbd5e1] hover:border-[#94a3b8]'
                  : 'bg-[#21262d] text-[#e2e8f0] hover:text-[#ffffff] border border-[#30363d]'
              }`}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>Light</span>
                </>
              )}
            </button>
          )}
          {onOpenLearn8051 && (
            <button
              onClick={onOpenLearn8051}
              className="px-2.5 py-1 text-xs font-black text-black bg-[#fbbf24] hover:bg-[#f59e0b] rounded cursor-pointer transition-colors shadow-xs"
              title="Open Microcontroller 8051 Study Hub"
            >
              Learn 8051
            </button>
          )}
          <button
            onClick={onOpenInstructionRef}
            className="px-2.5 py-1 text-xs font-bold text-[#fbbf24] hover:text-[#ffffff] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded cursor-pointer"
          >
            Instruction Reference
          </button>
          <button
            onClick={onToggleHighContrast}
            className="px-2.5 py-1 text-[11px] font-bold text-[#94a3b8] hover:text-[#ffffff] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded cursor-pointer"
          >
            {isHighContrast ? 'Contrast: ON' : 'Contrast'}
          </button>
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 text-xs font-bold text-[#94a3b8] hover:text-[#ffffff] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded cursor-pointer"
          >
            Settings
          </button>
        </div>
      </header>

      {/* 2. Action Toolbar: Clean, labeled buttons with shortcut keys */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none text-xs shrink-0 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Example Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] px-2.5 py-1.5 rounded">
            <span className="text-[11px] text-[#10b981] font-black uppercase">LESSON:</span>
            <select
              value={selectedExampleId}
              onChange={(e) => {
                const ex = EXAMPLES.find((item) => item.id === e.target.value);
                if (ex) onSelectExample(ex);
              }}
              className="bg-transparent text-[#ffffff] font-bold text-xs outline-none cursor-pointer max-w-[200px] sm:max-w-[280px]"
            >
              {EXAMPLES.map((ex) => (
                <option key={ex.id} value={ex.id} className="bg-[#161b22] text-[#ffffff]">
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          {/* Action 1: Build / Assemble */}
          <button
            onClick={onAssemble}
            className="py-1.5 px-3.5 bg-[#10b981] hover:bg-[#34d399] text-[#000000] font-black rounded cursor-pointer shadow-sm transition-colors"
            title="Compile assembly code into microcontroller instructions (F4)"
          >
            BUILD CODE [F4]
          </button>

          {/* Action 2: Step Next Line */}
          <button
            onClick={onStep}
            className="py-1.5 px-3.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#000000] font-black rounded cursor-pointer shadow-sm transition-colors"
            title="Execute one single instruction line (F7)"
          >
            STEP LINE [F7]
          </button>

          {/* Action 3: Run / Pause */}
          <button
            onClick={isRunning ? onPause : onRun}
            className={`py-1.5 px-3.5 font-black rounded cursor-pointer shadow-sm transition-colors ${
              isRunning
                ? 'bg-[#ef4444] hover:bg-[#f87171] text-[#ffffff]'
                : 'bg-[#21262d] hover:bg-[#30363d] text-[#ffffff] border border-[#30363d]'
            }`}
          >
            {isRunning ? 'PAUSE' : 'RUN [F5]'}
          </button>

          {/* Action 4: Reset */}
          <button
            onClick={onReset}
            className="py-1.5 px-3 bg-[#21262d] hover:bg-[#30363d] text-[#94a3b8] hover:text-[#ffffff] font-bold rounded border border-[#30363d] cursor-pointer"
            title="Reset CPU to initial address 0000H (F9)"
          >
            RESET [F9]
          </button>
        </div>

        {/* Speed adjustment */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded">
            <span className="text-[10px] text-[#94a3b8] font-bold uppercase">SPEED:</span>
            <select
              value={speed}
              onChange={(e) => onChangeSpeed(parseFloat(e.target.value) as SimulationSpeed)}
              className="bg-transparent text-[#10b981] font-bold text-xs outline-none cursor-pointer"
            >
              <option value={0.05} className="bg-[#161b22] text-[#ffffff]">🐢 0.05x Ultra-Slow (1 step/sec for Reading)</option>
              <option value={0.1} className="bg-[#161b22] text-[#ffffff]">📖 0.1x Slow (2 steps/sec for Reading)</option>
              <option value={0.25} className="bg-[#161b22] text-[#ffffff]">0.25x Step observation</option>
              <option value={0.5} className="bg-[#161b22] text-[#ffffff]">0.5x Normal</option>
              <option value={1} className="bg-[#161b22] text-[#ffffff]">1.0x Real-time</option>
              <option value={5} className="bg-[#161b22] text-[#ffffff]">5.0x Fast</option>
            </select>
          </div>

          <div className={`px-2.5 py-1 rounded text-[11px] font-black uppercase ${
            isRunning ? 'bg-[#10b981] text-[#000000]' : 'bg-[#21262d] text-[#94a3b8]'
          }`}>
            {simulatorStatus}
          </div>
        </div>
      </div>

      {/* 3. Main Workbench Layout */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-3.5 flex flex-col lg:flex-row gap-4">
        {/* LEFT COLUMN: Spacious Editor + Live Instruction Explainer */}
        <div className="lg:w-[50%] w-full flex flex-col gap-3">
          {/* Quick Code Snippets Bar (Clean, no emojis) */}
          <div className="bg-[#161b22] border border-[#30363d] p-2.5 rounded flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#10b981]">
              <span className="uppercase tracking-wider">Quick Code Templates (1-Click Load):</span>
              <span className="text-[10px] text-[#8b949e]">Click to load into editor</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => loadSnippet(`ORG 0000H\nSTART:\n    CPL P1.0      ; Toggle LED on Port 1, Pin 0\n    ACALL DELAY   ; Wait so human eye can see blink\n    SJMP START    ; Repeat forever\nDELAY:\n    MOV R2, #200\nD1: MOV R1, #255\nD2: DJNZ R1, D2\n    DJNZ R2, D1\n    RET\nEND\n`)}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#21262d] hover:bg-[#10b981] hover:text-[#000000] text-[#c9d1d9] rounded border border-[#30363d] cursor-pointer transition-colors"
              >
                Blink LED 0
              </button>
              <button
                onClick={() => loadSnippet(`ORG 0000H\nSTART:\n    MOV P1, #0FFH ; Turn on all 8 LEDs on Port 1\n    ACALL DELAY\n    MOV P1, #00H  ; Turn off all LEDs\n    ACALL DELAY\n    SJMP START\nDELAY:\n    MOV R2, #200\nD1: MOV R1, #255\nD2: DJNZ R1, D2\n    DJNZ R2, D1\n    RET\nEND\n`)}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#21262d] hover:bg-[#10b981] hover:text-[#000000] text-[#c9d1d9] rounded border border-[#30363d] cursor-pointer transition-colors"
              >
                All LEDs On/Off
              </button>
              <button
                onClick={() => loadSnippet(`ORG 0000H\n    MOV A, #00H\nLOOP:\n    MOV P1, A     ; Send binary count to LEDs\n    INC A         ; Add 1 to accumulator\n    ACALL DELAY   ; Wait\n    SJMP LOOP\nDELAY:\n    MOV R2, #100\nD1: DJNZ R2, D1\n    RET\nEND\n`)}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#21262d] hover:bg-[#10b981] hover:text-[#000000] text-[#c9d1d9] rounded border border-[#30363d] cursor-pointer transition-colors"
              >
                Binary Counter
              </button>
              <button
                onClick={() => loadSnippet(`ORG 0000H\nSTART:\n    MOV A, P3     ; Read inputs from Port 3 DIP switches\n    MOV P1, A     ; Send directly to Port 1 LEDs\n    SJMP START    ; Keep checking continuously\nEND\n`)}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#21262d] hover:bg-[#10b981] hover:text-[#000000] text-[#c9d1d9] rounded border border-[#30363d] cursor-pointer transition-colors"
              >
                Read Switch to LED
              </button>
              <button
                onClick={() => loadSnippet(`ORG 0000H\nSTART:\n    ; Store variables into Data Memory (RAM)\n    MOV 30H, #55H    ; Write 55H into RAM address 30H\n    MOV 31H, #0AAH   ; Write AAH into RAM address 31H\n    MOV R0, #30H     ; Load pointer R0 with 30H\n    MOV A, @R0       ; Read RAM at address pointed by R0\n    MOV P1, A        ; Display on Port 1 LEDs\n    SJMP START\nEND\n`)}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#21262d] hover:bg-[#38bdf8] hover:text-[#000000] text-[#38bdf8] rounded border border-[#0284c7] cursor-pointer transition-colors"
                title="Demonstrates writing and reading 8051 Internal Data Memory"
              >
                Write Data to RAM
              </button>
            </div>
          </div>

          {/* Code Window Header */}
          <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] px-3 py-2 rounded text-xs font-bold shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#ffffff] font-black">{projectName}</span>
              <span className="text-[11px] text-[#8b949e]">({assemblerResult.programSize} Bytes in ROM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#10b981] font-black">
                {currentExecLine ? `Line ${currentExecLine}` : 'PC: 0000H'}
              </span>
            </div>
          </div>

          {/* Assembly Code Editor */}
          <div className="h-[460px] lg:h-[500px] w-full rounded border border-[#30363d] overflow-hidden shadow-sm">
            <AssemblyEditor
              sourceCode={sourceCode}
              onChange={setSourceCode}
              currentLine={currentExecLine}
              currentPc={cpuState.pc}
              breakpoints={breakpoints}
              lineToAddress={assemblerResult.lineToAddress}
              disassembly={assemblerResult.disassembly}
              onToggleBreakpoint={onToggleBreakpoint}
              errors={assemblerResult.errors}
            />
          </div>

          {/* Live Plain-English Instruction Explainer with Pacing Controls */}
          <div className="bg-[#161b22] border border-[#30363d] rounded p-3.5 shadow-sm flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between border-b border-[#30363d] pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase text-[#10b981] tracking-wider">
                  Live Instruction Translation
                </span>
                {currentInstruction && (
                  <span className="bg-[#10b981]/20 text-[#10b981] font-black px-2 py-0.5 rounded text-xs">
                    {currentInstruction.mnemonic} {currentInstruction.operands}
                  </span>
                )}
              </div>

              {/* Reading Pace Controls & History Button */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#8b949e] font-bold uppercase hidden sm:inline">PACE:</span>
                <button
                  onClick={() => onChangeSpeed(0.05)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors border ${
                    speed === 0.05
                      ? 'bg-[#10b981] text-black border-[#10b981]'
                      : 'bg-[#21262d] text-[#cbd5e1] hover:text-white border-[#30363d]'
                  }`}
                  title="Slow down execution to 1 instruction per second so you can easily read the live translation"
                >
                  🐢 1 Step/s (Read)
                </button>
                <button
                  onClick={() => onChangeSpeed(0.1)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors border ${
                    speed === 0.1
                      ? 'bg-[#10b981] text-black border-[#10b981]'
                      : 'bg-[#21262d] text-[#cbd5e1] hover:text-white border-[#30363d]'
                  }`}
                  title="Slow down execution to 2 instructions per second"
                >
                  📖 2 Steps/s
                </button>
                <button
                  onClick={() => onChangeSpeed(1)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors border ${
                    speed === 1
                      ? 'bg-[#38bdf8] text-black border-[#38bdf8]'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-white border-[#30363d]'
                  }`}
                  title="Normal real-time speed"
                >
                  ⚡ 1x
                </button>
                <button
                  onClick={() => setShowTranslationHistory(!showTranslationHistory)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors border flex items-center gap-1 ${
                    showTranslationHistory
                      ? 'bg-[#fbbf24] text-black border-[#fbbf24]'
                      : 'bg-[#21262d] text-[#fbbf24] hover:bg-[#30363d] border-[#30363d]'
                  }`}
                  title="View history log of recent instruction translations"
                >
                  <History className="w-3 h-3" />
                  <span>Log ({translationHistory.length})</span>
                </button>
              </div>
            </div>

            {/* Current Active Instruction Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-[#10b981] font-black shrink-0">Action:</span>
                <span className="text-[#ffffff] font-bold leading-relaxed">{explanation.what}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#f59e0b] font-black shrink-0">Hardware:</span>
                <span className="text-[#cbd5e1] leading-relaxed">{explanation.hardware}</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-[#8b949e] pt-1 border-t border-[#30363d]/50">
                <span className="font-bold shrink-0">Note:</span>
                <span>{explanation.tip}</span>
              </div>
            </div>

            {/* Step Next Line Shortcut Button */}
            <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/40">
              <div className="text-[11px] text-[#8b949e]">
                {nextInstruction ? (
                  <span>
                    Next: <strong className="text-[#38bdf8] font-bold">{nextInstruction.mnemonic} {nextInstruction.operands}</strong>
                  </span>
                ) : (
                  <span>Ready for next step</span>
                )}
              </div>
              <button
                onClick={onStep}
                className="px-2.5 py-1 text-[11px] font-black bg-[#f59e0b] hover:bg-[#fbbf24] text-black rounded cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                title="Execute 1 instruction and translate its effect (F7)"
              >
                <StepForward className="w-3 h-3" />
                <span>Step & Explain (F7)</span>
              </button>
            </div>

            {/* Expandable Translation History Log */}
            {showTranslationHistory && (
              <div className="mt-2 pt-2 border-t border-[#30363d] space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                  <span className="font-bold uppercase tracking-wider text-[#fbbf24]">Recent Instruction Translation Log:</span>
                  <span className="text-[10px]">Last {translationHistory.length} steps</span>
                </div>
                {translationHistory.length === 0 ? (
                  <div className="text-[11px] text-[#8b949e] italic py-2 text-center">
                    Step or run code to log instruction translations here.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {translationHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0d1117] border border-[#30363d] p-2 rounded text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[#38bdf8] font-mono font-bold">
                            {item.mnemonic} {item.operands}
                          </span>
                          <span className="text-[#78716c] font-mono text-[10px]">
                            PC: 0x{item.pc.toString(16).toUpperCase().padStart(4, '0')}H
                          </span>
                        </div>
                        <div className="text-[#ffffff] leading-tight font-medium">
                          {item.what}
                        </div>
                        <div className="text-[#94a3b8] text-[10.5px]">
                          {item.hardware}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Basic Components & DATA MEMORY */}
        <div className="lg:w-[50%] w-full flex flex-col gap-3">
          {/* Navigation Tabs for Right Column */}
          <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] p-1.5 rounded text-xs shadow-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRightPanelTab('hardware')}
                className={`px-3 py-1 font-black rounded cursor-pointer transition-colors ${
                  rightPanelTab === 'hardware'
                    ? 'bg-[#10b981] text-[#000000]'
                    : 'text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#21262d]'
                }`}
              >
                Hardware I/O
              </button>
              <button
                onClick={() => setRightPanelTab('memory')}
                className={`px-3 py-1 font-black rounded cursor-pointer transition-colors ${
                  rightPanelTab === 'memory'
                    ? 'bg-[#10b981] text-[#000000]'
                    : 'text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#21262d]'
                }`}
              >
                Data Memory (RAM)
              </button>
              <button
                onClick={() => setRightPanelTab('registers')}
                className={`px-3 py-1 font-black rounded cursor-pointer transition-colors ${
                  rightPanelTab === 'registers'
                    ? 'bg-[#10b981] text-[#000000]'
                    : 'text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#21262d]'
                }`}
              >
                CPU Registers
              </button>
            </div>

            <span className="text-[10px] text-[#8b949e] hidden sm:inline">
              {rightPanelTab === 'memory' ? 'Internal RAM: 00H - 7FH' : 'Interactive Laboratory'}
            </span>
          </div>

          {/* VIEW 1: DATA MEMORY (INTERNAL RAM: 00H - 7FH) */}
          {rightPanelTab === 'memory' && (
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3.5 flex flex-col gap-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d] pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs uppercase text-[#38bdf8] tracking-wider">
                      DATA MEMORY (INTERNAL RAM: 00H - 7FH)
                    </span>
                    <span className="text-[10px] bg-[#38bdf8]/15 text-[#38bdf8] px-1.5 py-0.2 rounded border border-[#38bdf8]/30 font-bold">
                      128 Bytes
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e] mt-0.5">
                    Holds working register banks, bit flags, user variables, and call stack frames.
                  </p>
                </div>

                {/* Sub-Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#0d1117] p-0.5 rounded border border-[#30363d] text-[10px] font-bold">
                  <button
                    onClick={() => setMemoryFilter('scratchpad')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      memoryFilter === 'scratchpad' ? 'bg-[#38bdf8] text-[#000000] font-black' : 'text-[#8b949e] hover:text-[#ffffff]'
                    }`}
                  >
                    Scratchpad (30H-7FH)
                  </button>
                  <button
                    onClick={() => setMemoryFilter('banks')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      memoryFilter === 'banks' ? 'bg-[#38bdf8] text-[#000000] font-black' : 'text-[#8b949e] hover:text-[#ffffff]'
                    }`}
                  >
                    Banks (00H-1FH)
                  </button>
                  <button
                    onClick={() => setMemoryFilter('bit')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      memoryFilter === 'bit' ? 'bg-[#38bdf8] text-[#000000] font-black' : 'text-[#8b949e] hover:text-[#ffffff]'
                    }`}
                  >
                    Bit RAM (20H-2FH)
                  </button>
                  <button
                    onClick={() => setMemoryFilter('all')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      memoryFilter === 'all' ? 'bg-[#38bdf8] text-[#000000] font-black' : 'text-[#8b949e] hover:text-[#ffffff]'
                    }`}
                  >
                    All 128B (00-7F)
                  </button>
                </div>
              </div>

              {/* Quick Alter / Write Box for Beginners */}
              <form
                onSubmit={handleWriteRam}
                className="bg-[#0d1117] border border-[#30363d] p-2 rounded flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-[#38bdf8] font-bold">ALTER RAM:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#8b949e] text-[11px]">Address:</span>
                    <input
                      type="text"
                      value={ramEditAddrInput}
                      onChange={(e) => setRamEditAddrInput(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="w-10 bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-center font-bold text-[#ffffff] outline-none"
                    />
                    <span className="text-[#8b949e] text-[11px]">H</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[#8b949e] text-[11px]">Value:</span>
                    <input
                      type="text"
                      value={ramEditValInput}
                      onChange={(e) => setRamEditValInput(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="w-10 bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-center font-bold text-[#fbbf24] outline-none"
                    />
                    <span className="text-[#8b949e] text-[11px]">H</span>
                  </div>

                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#000000] font-black rounded cursor-pointer transition-colors text-[11px]"
                  >
                    WRITE BYTE
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {clearRam && (
                    <button
                      type="button"
                      onClick={() => clearRam(true)}
                      className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#94a3b8] hover:text-[#ffffff] rounded border border-[#30363d] cursor-pointer text-[10px] font-bold"
                      title="Clear user variables (30H-7FH) to 00H"
                    >
                      CLEAR SCRATCHPAD
                    </button>
                  )}
                  {ramFeedback && (
                    <span className="text-[11px] text-[#4ade80] font-bold animate-pulse">
                      {ramFeedback}
                    </span>
                  )}
                </div>
              </form>

              {/* Data Memory Hex & Decimal Table */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-10 text-[11px] text-[#8b949e]">
                    <tr>
                      <th className="py-1.5 px-3">ADDR</th>
                      <th className="py-1.5 px-2 text-center">+0</th>
                      <th className="py-1.5 px-2 text-center">+1</th>
                      <th className="py-1.5 px-2 text-center">+2</th>
                      <th className="py-1.5 px-2 text-center">+3</th>
                      <th className="py-1.5 px-2 text-center">+4</th>
                      <th className="py-1.5 px-2 text-center">+5</th>
                      <th className="py-1.5 px-2 text-center">+6</th>
                      <th className="py-1.5 px-2 text-center">+7</th>
                      <th className="py-1.5 px-3">PURPOSE / LABEL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {memoryRows.map((row) => {
                      // Determine row label / purpose
                      let rowPurpose = 'Scratchpad Variables';
                      if (row.addr >= 0x00 && row.addr < 0x08) rowPurpose = 'Bank 0 (R0 - R7)';
                      else if (row.addr >= 0x08 && row.addr < 0x10) rowPurpose = 'Bank 1 (R0 - R7)';
                      else if (row.addr >= 0x10 && row.addr < 0x18) rowPurpose = 'Bank 2 (R0 - R7)';
                      else if (row.addr >= 0x18 && row.addr < 0x20) rowPurpose = 'Bank 3 (R0 - R7)';
                      else if (row.addr >= 0x20 && row.addr < 0x30) rowPurpose = 'Bit-Addressable RAM';

                      return (
                        <tr key={row.addr} className="hover:bg-[#161b22]/70 transition-colors">
                          <td className="py-1.5 px-3 font-bold text-[#38bdf8]">
                            0x{row.addr.toString(16).toUpperCase().padStart(2, '0')}H
                          </td>
                          {row.bytes.map((byteVal, colIdx) => {
                            const cellAddr = row.addr + colIdx;
                            const isStackPointer = cellAddr === sp;
                            const isBankRegister = cellAddr >= bankStartAddr && cellAddr < bankStartAddr + 8;
                            const isNonZero = byteVal !== 0;

                            return (
                              <td
                                key={colIdx}
                                onClick={() => {
                                  setRamEditAddrInput(cellAddr.toString(16).toUpperCase().padStart(2, '0'));
                                  setRamEditValInput(byteVal.toString(16).toUpperCase().padStart(2, '0'));
                                }}
                                className={`py-1.5 px-2 text-center font-mono cursor-pointer rounded transition-all ${
                                  isStackPointer
                                    ? 'bg-[#f59e0b]/25 text-[#fbbf24] font-black border border-[#f59e0b]/50'
                                    : isBankRegister
                                    ? 'bg-[#10b981]/15 text-[#34d399] font-bold'
                                    : isNonZero
                                    ? 'bg-[#38bdf8]/15 text-[#ffffff] font-bold'
                                    : 'text-[#64748b] hover:text-[#ffffff]'
                                }`}
                                title={`RAM Address: 0x${cellAddr.toString(16).toUpperCase().padStart(2, '0')}H | Value: ${byteVal.toString(16).toUpperCase().padStart(2, '0')}H (${byteVal} Dec)${isStackPointer ? ' [Current SP]' : ''}${isBankRegister ? ` [Active R${cellAddr - bankStartAddr}]` : ''}`}
                              >
                                {byteVal.toString(16).toUpperCase().padStart(2, '0')}
                              </td>
                            );
                          })}
                          <td className="py-1.5 px-3 text-[10px] text-[#8b949e]">
                            {rowPurpose}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Quick Guide to 8051 Memory */}
              <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded text-[11px] text-[#94a3b8] space-y-1">
                <span className="font-bold text-[#e2e8f0]">Memory Map Guide:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div><strong className="text-[#10b981]">00H - 1FH:</strong> Register Banks 0-3 (R0 - R7)</div>
                  <div><strong className="text-[#38bdf8]">20H - 2FH:</strong> Bit-addressable flags (128 bits)</div>
                  <div><strong className="text-[#fbbf24]">30H - 7FH:</strong> General variables & Stack (SP)</div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: HARDWARE I/O (LEDs, Switches, LCD, 7-Segment) */}
          {rightPanelTab === 'hardware' && (
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3.5 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <span className="font-black text-xs uppercase text-[#ffffff] tracking-wider">
                  Visual Hardware Outputs & Inputs
                </span>

                {/* Sub-tabs */}
                <div className="flex items-center gap-1 bg-[#0d1117] p-0.5 rounded border border-[#30363d]">
                  <button
                    onClick={() => setHardwareTab('leds')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                      hardwareTab === 'leds' ? 'bg-[#10b981] text-[#000000] font-black' : 'text-[#8b949e] hover:text-[#ffffff]'
                    }`}
                  >
                    LEDs & Switches
                  </button>
                  <button
                    onClick={() => setHardwareTab('lcd')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                      hardwareTab === 'lcd' ? 'bg-[#10b981] text-[#000000] font-black' : 'text-[#8b949e] hover:text-[#ffffff]'
                    }`}
                  >
                    16x2 LCD
                  </button>
                  <button
                    onClick={() => setHardwareTab('seven-seg')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                      hardwareTab === 'seven-seg' ? 'bg-[#10b981] text-[#000000] font-black' : 'text-[#8b949e] hover:text-[#ffffff]'
                    }`}
                  >
                    7-Segment
                  </button>
                </div>
              </div>

              {/* SUBTAB 1: LEDs & Switches */}
              {hardwareTab === 'leds' && (
                <div className="space-y-3.5">
                  {/* Port 1 LEDs */}
                  <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#10b981]">
                        Port 1 LEDs (Microcontroller Output)
                      </span>
                      <span className="text-[11px] font-mono text-[#8b949e]">
                        Value: <strong className="text-[#ffffff]">{p1.toString(16).toUpperCase().padStart(2, '0')}H</strong> ({p1} Dec)
                      </span>
                    </div>

                    <div className="grid grid-cols-8 gap-2 py-1">
                      {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                        const isHigh = ((p1 >> bit) & 1) === 1;
                        return (
                          <div key={bit} className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#8b949e]">D{bit}</span>
                            <div
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                isHigh
                                  ? 'bg-[#ef4444] border-[#fca5a5] shadow-[0_0_15px_#ef4444]'
                                  : 'bg-[#1c2128] border-[#30363d]'
                              }`}
                            >
                              <span className={`text-[9px] font-black ${isHigh ? 'text-[#ffffff]' : 'text-[#484f58]'}`}>
                                {isHigh ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-[#8b949e]">P1.{bit}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Port 3 Switches */}
                  <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#f59e0b]">
                        Port 3 DIP Switches (Interactive Inputs)
                      </span>
                      <span className="text-[10px] text-[#8b949e]">Click any switch to toggle ON/OFF</span>
                    </div>

                    <div className="grid grid-cols-8 gap-2 py-1">
                      {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                        const isClosed = peripherals.switchStates[bit];
                        return (
                          <div key={bit} className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#8b949e]">SW{bit}</span>
                            <button
                              onClick={() => onToggleSwitch(bit)}
                              className={`w-9 h-11 sm:w-11 sm:h-12 rounded border-2 flex flex-col items-center justify-between p-1 cursor-pointer transition-all ${
                                isClosed
                                  ? 'bg-[#f59e0b] border-[#fbbf24] text-[#000000] shadow-[0_0_10px_#f59e0b]/50'
                                  : 'bg-[#21262d] border-[#30363d] text-[#8b949e]'
                              }`}
                              title={`Click to flip Switch ${bit}`}
                            >
                              <span className="text-[8.5px] font-black">{isClosed ? 'ON' : 'OFF'}</span>
                              <div className={`w-full h-2.5 rounded-xs ${isClosed ? 'bg-[#000000]' : 'bg-[#30363d]'}`} />
                            </button>
                            <span className="text-[9px] font-mono text-[#8b949e]">P3.{bit}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: LCD */}
              {hardwareTab === 'lcd' && (
                <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded space-y-2">
                  <span className="text-xs font-black text-[#38bdf8]">16x2 Character LCD Screen</span>
                  <div className="bg-[#0f2e24] border-2 border-[#10b981] p-3 rounded font-mono text-sm text-[#4ade80] shadow-inner tracking-wider">
                    <div className="h-6 flex items-center overflow-hidden">
                      {peripherals.lcd.line1 || '                '}
                    </div>
                    <div className="h-6 flex items-center overflow-hidden border-t border-[#10b981]/30">
                      {peripherals.lcd.line2 || '                '}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: Realistic 4-Digit 7-Segment Display */}
              {hardwareTab === 'seven-seg' && (
                <SevenSegmentDisplay
                  segmentDigits={peripherals.segmentDigits}
                  segmentPersistence={peripherals.segmentPersistence}
                  mapping={peripherals.mapping}
                />
              )}
            </div>
          )}

          {/* VIEW 3: CPU REGISTERS & PSW FLAGS */}
          {rightPanelTab === 'registers' && (
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3.5 flex flex-col gap-3 shadow-sm">
              <span className="font-black text-xs uppercase text-[#ffffff] tracking-wider border-b border-[#30363d] pb-1.5">
                CPU Working Registers & Flags
              </span>

              {/* Accumulator, B, PC, DPTR, SP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded">
                  <span className="text-[10px] font-bold text-[#10b981]">Accumulator (A)</span>
                  <div className="text-lg font-black text-[#ffffff]">
                    {acc.toString(16).toUpperCase().padStart(2, '0')}H
                  </div>
                  <span className="text-[10px] text-[#8b949e]">{acc} Dec</span>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded">
                  <span className="text-[10px] font-bold text-[#f59e0b]">B Register</span>
                  <div className="text-lg font-black text-[#ffffff]">
                    {b.toString(16).toUpperCase().padStart(2, '0')}H
                  </div>
                  <span className="text-[10px] text-[#8b949e]">{b} Dec</span>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded">
                  <span className="text-[10px] font-bold text-[#38bdf8]">Program Counter (PC)</span>
                  <div className="text-lg font-black text-[#38bdf8]">
                    {pc.toString(16).toUpperCase().padStart(4, '0')}H
                  </div>
                  <span className="text-[10px] text-[#8b949e]">ROM Code Pointer</span>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded">
                  <span className="text-[10px] font-bold text-[#a78bfa]">Stack Pointer (SP)</span>
                  <div className="text-lg font-black text-[#a78bfa]">
                    {sp.toString(16).toUpperCase().padStart(2, '0')}H
                  </div>
                  <span className="text-[10px] text-[#8b949e]">{sp >= 7 ? `${sp - 7} bytes pushed` : 'Reset'}</span>
                </div>
              </div>

              {/* Active Working Register Bank (R0 - R7) */}
              <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#10b981]">
                    Active Register Bank {activeBank} (R0 - R7 at 0x{bankStartAddr.toString(16).toUpperCase().padStart(2, '0')}H)
                  </span>
                  <span className="text-[10px] text-[#8b949e]">
                    RS0: {rs0} | RS1: {rs1}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                  {rRegisters.map((val, rIdx) => (
                    <div key={rIdx} className="bg-[#161b22] border border-[#30363d] p-1.5 rounded">
                      <span className="text-[10px] font-bold text-[#8b949e]">R{rIdx}</span>
                      <div className="text-sm font-black text-[#ffffff]">
                        {val.toString(16).toUpperCase().padStart(2, '0')}H
                      </div>
                      <span className="text-[9px] text-[#64748b]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PSW Flags */}
              <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded">
                <span className="text-xs font-black text-[#f59e0b] block mb-1.5">
                  PSW Status Flags (Program Status Word: 0x{cpuState.psw.toString(16).toUpperCase().padStart(2, '0')}H)
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center text-xs">
                  {[
                    { label: 'CY', bit: 7, desc: 'Carry' },
                    { label: 'AC', bit: 6, desc: 'Aux Carry' },
                    { label: 'F0', bit: 5, desc: 'Flag 0' },
                    { label: 'RS1', bit: 4, desc: 'Bank Sel 1' },
                    { label: 'RS0', bit: 3, desc: 'Bank Sel 0' },
                    { label: 'OV', bit: 2, desc: 'Overflow' },
                    { label: 'UD', bit: 1, desc: 'User Defined' },
                    { label: 'P', bit: 0, desc: 'Parity' },
                  ].map((flag) => {
                    const isSet = ((cpuState.psw >> flag.bit) & 1) === 1;
                    return (
                      <div
                        key={flag.label}
                        className={`p-1 rounded border ${
                          isSet ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981] font-black' : 'bg-[#161b22] border-[#30363d] text-[#64748b]'
                        }`}
                        title={`${flag.label}: ${flag.desc} (${isSet ? '1' : '0'})`}
                      >
                        <span className="text-[9px] block">{flag.label}</span>
                        <span className="text-xs font-mono">{isSet ? '1' : '0'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Dedicated Real-Time Microcontroller Status Bar */}
      <StatusBar
        status={simulatorStatus}
        clockHz={clockHz}
        cycles={cpuState.cycles}
        instructions={cpuState.instructionCount}
        pc={cpuState.pc}
        sp={cpuState.sp}
        breakpointCount={breakpoints.size}
        programSize={assemblerResult.programSize}
        level="beginner"
        theme={theme}
      />
    </div>
  );
};
