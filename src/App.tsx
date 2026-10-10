/**
 * Micro8051SiM - 8051 Microcontroller Simulation & Learning Environment
 * Main Workbench Application (Clean, High-Visibility EdSim51-Style Layout)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CPU8051 } from './core/cpu/cpu.ts';
import { PeripheralsManager } from './peripherals/peripherals.ts';
import { ExecutionController, SimulatorStatus } from './simulator/execution-controller.ts';
import { assemble8051 } from './core/assembler/assembler.ts';
import {
  ClockSpeedHz,
  SimulationSpeed,
  AssemblerResult,
  ConsoleMessage,
  PinMapping,
} from './core/types.ts';
import { EXAMPLES, ExampleProgram } from './examples/examples.ts';
import { runCpuSelfTests } from './core/tests/cpu-tests.ts';

// UI Layout Components
import { PinMappingModal } from './components/pin-mapper/PinMappingModal.tsx';
import { InstructionRefModal } from './components/help/InstructionRefModal.tsx';
import { SettingsModal } from './components/settings/SettingsModal.tsx';
import { LearnMicro8051Modal } from './components/learn/LearnMicro8051Modal.tsx';
import { HomePage, SimulatorLevel } from './components/home/HomePage.tsx';
import { BeginnerView } from './components/views/BeginnerView.tsx';
import { IntermediateView } from './components/views/IntermediateView.tsx';
import { AdvancedView } from './components/views/AdvancedView.tsx';

export default function App() {
  // References to the simulator core and connected hardware
  const cpuRef = useRef<CPU8051>(new CPU8051());
  const peripheralsRef = useRef<PeripheralsManager>(new PeripheralsManager());
  const controllerRef = useRef<ExecutionController>(
    new ExecutionController(cpuRef.current, peripheralsRef.current)
  );

  // Navigation & Level State: Home vs Simulator Workbench
  const [currentView, setCurrentView] = useState<'home' | 'simulator'>('home');
  const [simulatorLevel, setSimulatorLevel] = useState<SimulatorLevel>('beginner');

  // Persistent Theme State (Dark / Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('micro8051_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('micro8051_theme', next);
      return next;
    });
  }, []);

  // Synchronize documentElement and body classes with theme
  useEffect(() => {
    localStorage.setItem('micro8051_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark');
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark');
    }
  }, [theme]);

  // High-contrast mode and saved preferences
  const [isHighContrast, setIsHighContrast] = useState<boolean>(
    () => localStorage.getItem('micro8051_high_contrast') === 'true'
  );

  // Main application state
  const [selectedExampleId, setSelectedExampleId] = useState<string>('led-blink');
  const [projectName, setProjectName] = useState<string>('led_blink.asm');
  const [sourceCode, setSourceCode] = useState<string>(EXAMPLES[0].sourceCode);
  const [assemblerResult, setAssemblerResult] = useState<AssemblerResult>(() =>
    assemble8051(EXAMPLES[0].sourceCode)
  );

  const [simulatorStatus, setSimulatorStatus] = useState<SimulatorStatus>('READY');
  const [clockHz, setClockHz] = useState<ClockSpeedHz>(12000000);
  const [speed, setSpeed] = useState<SimulationSpeed>(1);

  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

  // Modal windows
  const [isPinMapperOpen, setIsPinMapperOpen] = useState(false);
  const [isInstructionRefOpen, setIsInstructionRefOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLearn8051Open, setIsLearn8051Open] = useState(false);

  const handleToggleHighContrast = useCallback(() => {
    setIsHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('micro8051_high_contrast', String(next));
      return next;
    });
  }, []);

  // Refresh the UI when the simulation advances
  const [, setUiTick] = useState(0);
  const triggerUi = useCallback(() => setUiTick((t) => (t + 1) % 100000), []);

  const addLog = useCallback((type: ConsoleMessage['type'], text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setConsoleMessages((prev) => [
      ...prev.slice(-150),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr,
        type,
        text,
      },
    ]);
  }, []);

  // Set up controller callbacks and run the startup checks
  useEffect(() => {
    const controller = controllerRef.current;

    controller.setCallbacks({
      onStatusChange: (status) => {
        setSimulatorStatus(status);
        triggerUi();
      },
      onStateUpdate: () => {
        triggerUi();
      },
      onConsoleLog: (msg) => {
        addLog(msg.type, msg.text);
      },
      onBreakpointHit: (addr, line) => {
        addLog('cpu', `Breakpoint hit at 0x${addr.toString(16).toUpperCase().padStart(4, '0')}${line ? ` (Line ${line})` : ''}`);
        triggerUi();
      },
    });

    // Run automated self tests on boot
    const testResults = runCpuSelfTests();
    const failedTests = testResults.filter((t) => !t.passed);
    if (failedTests.length === 0) {
      addLog('info', `Self-Test Verification: All ${testResults.length} hardware tests passed.`);
    }

    // Initial assemble
    const initialAsm = assemble8051(sourceCode);
    setAssemblerResult(initialAsm);
    if (initialAsm.success) {
      controller.cpu.loadProgram(initialAsm.code, initialAsm.startAddress);
      controller.addressToLine = initialAsm.addressToLine;
      controller.lineToAddress = initialAsm.lineToAddress;
      addLog('assembler', `Loaded initial program (${initialAsm.programSize} bytes).`);
    }
  }, []);

  // Assemble the current source code
  const handleAssemble = useCallback(() => {
    controllerRef.current.pause();
    const result = assemble8051(sourceCode);
    setAssemblerResult(result);

    if (result.success) {
      controllerRef.current.cpu.loadProgram(result.code, result.startAddress);
      controllerRef.current.addressToLine = result.addressToLine;
      controllerRef.current.lineToAddress = result.lineToAddress;
      controllerRef.current.reset();
      addLog('assembler', `Build successful! ${result.programSize} bytes loaded at 0x${result.startAddress.toString(16).toUpperCase().padStart(4, '0')}H.`);
    } else {
      addLog('error', `Build failed with ${result.errors.length} error(s). See console.`);
    }
    triggerUi();
  }, [sourceCode, addLog, triggerUi]);

  // Simulation controls
  const handleRun = useCallback(() => {
    controllerRef.current.run();
  }, []);

  const handlePause = useCallback(() => {
    controllerRef.current.pause();
  }, []);

  const handleStep = useCallback(() => {
    controllerRef.current.step();
    triggerUi();
  }, [triggerUi]);

  const handleReset = useCallback(() => {
    controllerRef.current.reset();
    triggerUi();
  }, [triggerUi]);

  const handleStop = useCallback(() => {
    controllerRef.current.stop();
    triggerUi();
  }, [triggerUi]);

  const handleChangeClock = useCallback((hz: ClockSpeedHz) => {
    setClockHz(hz);
    controllerRef.current.clockHz = hz;
    peripheralsRef.current.frequencyAnalyzer.clockHz = hz;
    addLog('info', `Clock frequency configured to ${(hz / 1000000).toFixed(hz === 11059200 ? 4 : 0)} MHz.`);
    triggerUi();
  }, [addLog, triggerUi]);

  const handleChangeSpeed = useCallback((spd: SimulationSpeed) => {
    setSpeed(spd);
    controllerRef.current.speedMultiplier = spd;
    triggerUi();
  }, [triggerUi]);

  // Load an assembly preset, such as one from the frequency analyzer
  const handleLoadPresetCode = useCallback((code: string, title: string) => {
    controllerRef.current.pause();
    setSourceCode(code);
    setProjectName(`${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.asm`);

    const result = assemble8051(code);
    setAssemblerResult(result);
    if (result.success) {
      controllerRef.current.cpu.loadProgram(result.code, result.startAddress);
      controllerRef.current.addressToLine = result.addressToLine;
      controllerRef.current.lineToAddress = result.lineToAddress;
      controllerRef.current.reset();
      addLog('assembler', `Loaded "${title}" (${result.programSize} bytes). Ready to simulate!`);
    } else {
      addLog('error', `Build failed for "${title}".`);
    }
    triggerUi();
  }, [addLog, triggerUi]);

  // Breakpoints
  const handleToggleBreakpointLine = useCallback((line: number) => {
    const controller = controllerRef.current;
    controller.toggleBreakpointAtLine(line);
    setBreakpoints(new Set(controller.breakpoints));
    triggerUi();
  }, [triggerUi]);

  const handleToggleBreakpointAddr = useCallback((addr: number) => {
    const controller = controllerRef.current;
    controller.toggleBreakpointAtAddress(addr);
    setBreakpoints(new Set(controller.breakpoints));
    triggerUi();
  }, [triggerUi]);

  const handleClearBreakpoints = useCallback(() => {
    controllerRef.current.clearAllBreakpoints();
    setBreakpoints(new Set());
    addLog('info', 'All breakpoints cleared.');
    triggerUi();
  }, [addLog, triggerUi]);

  // Example Selection (Instant 1-Click Load)
  const handleSelectExample = useCallback((example: ExampleProgram) => {
    controllerRef.current.pause();
    setSelectedExampleId(example.id);
    setSourceCode(example.sourceCode);
    setProjectName(`${example.id}.asm`);

    const result = assemble8051(example.sourceCode);
    setAssemblerResult(result);
    if (result.success) {
      controllerRef.current.cpu.loadProgram(result.code, result.startAddress);
      controllerRef.current.addressToLine = result.addressToLine;
      controllerRef.current.lineToAddress = result.lineToAddress;
      controllerRef.current.reset();
      addLog('assembler', `Loaded "${example.title}" (${result.programSize} bytes).`);
    }
    triggerUi();
  }, [addLog, triggerUi]);

  // Switch Simulator Level and adapt view configuration
  const handleSwitchLevel = useCallback((level: SimulatorLevel) => {
    setSimulatorLevel(level);
    if (level === 'beginner') {
      setSpeed(0.5);
      controllerRef.current.speedMultiplier = 0.5;
      addLog('info', 'Switched to Beginner Mode: Visual guides and simplified registers enabled.');
    } else if (level === 'intermediate') {
      setSpeed(1.0);
      controllerRef.current.speedMultiplier = 1.0;
      addLog('info', 'Switched to Intermediate Mode: Full EdSim51 Virtual Lab active.');
    } else if (level === 'advanced') {
      setSpeed(1.0);
      controllerRef.current.speedMultiplier = 1.0;
      addLog('info', 'Switched to Advanced Mode: Pro Engineering IDE with timing metrics & disassembly enabled.');
    }
    triggerUi();
  }, [addLog, triggerUi]);

  const handleSelectLevelFromHome = useCallback((level: SimulatorLevel) => {
    handleSwitchLevel(level);
    setCurrentView('simulator');
  }, [handleSwitchLevel]);

  const handleLaunchExampleFromHome = useCallback((example: ExampleProgram, level: SimulatorLevel) => {
    handleSwitchLevel(level);
    handleSelectExample(example);
    setCurrentView('simulator');
  }, [handleSwitchLevel, handleSelectExample]);

  // Peripherals interaction
  const handleToggleSwitch = useCallback((index: number) => {
    peripheralsRef.current.toggleSwitch(index);
    triggerUi();
  }, [triggerUi]);

  const handleSetAllSwitches = useCallback((state: boolean) => {
    for (let i = 0; i < 8; i++) {
      peripheralsRef.current.setSwitch(i, state);
    }
    triggerUi();
  }, [triggerUi]);

  const handlePressKeypadKey = useCallback((row: number, col: number) => {
    peripheralsRef.current.pressKey(row, col);
    triggerUi();
  }, [triggerUi]);

  const handleReleaseKeypadKey = useCallback(() => {
    peripheralsRef.current.releaseKey();
    triggerUi();
  }, [triggerUi]);

  const handleAdcVoltageChange = useCallback((v: number) => {
    peripheralsRef.current.adcInputVoltage = v;
    peripheralsRef.current.updateInputsToCpu(cpuRef.current.state);
    triggerUi();
  }, [triggerUi]);

  const handleSendSerialData = useCallback((data: string) => {
    if (data.length > 0) {
      const code = data.charCodeAt(0);
      const cpu = cpuRef.current;
      cpu.setSfrDirect(0x99, code); // SBUF
      const scon = cpu.getSfrDirect(0x98); // SCON
      cpu.setSfrDirect(0x98, scon | 0x01); // Set RI (Receive Interrupt)
      addLog('uart', `User transmitted RX: '${data[0]}' to SBUF.`);
      triggerUi();
    }
  }, [addLog, triggerUi]);

  const handleClearSerialHistory = useCallback(() => {
    peripheralsRef.current.uartTxHistory = '';
    triggerUi();
  }, [triggerUi]);

  const handleSavePinMapping = useCallback((newMapping: PinMapping) => {
    peripheralsRef.current.mapping = newMapping;
    addLog('info', 'Hardware pin mapping updated.');
    triggerUi();
  }, [addLog, triggerUi]);

  // File exports
  const handleExportAsm = useCallback(() => {
    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = projectName;
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', `Exported source as ${projectName}`);
  }, [sourceCode, projectName, addLog]);

  const handleExportHex = useCallback(() => {
    const code = assemblerResult.code;
    const start = assemblerResult.startAddress;
    const size = assemblerResult.programSize;

    let hexStr = '';
    let addr = start;
    const end = start + size;

    while (addr < end) {
      const lineLen = Math.min(16, end - addr);
      let line = `:${lineLen.toString(16).toUpperCase().padStart(2, '0')}`;
      line += addr.toString(16).toUpperCase().padStart(4, '0');
      line += '00';

      let checksum = lineLen + ((addr >> 8) & 0xFF) + (addr & 0xFF) + 0x00;
      for (let i = 0; i < lineLen; i++) {
        const b = code[addr + i];
        line += b.toString(16).toUpperCase().padStart(2, '0');
        checksum += b;
      }

      checksum = ((-checksum) & 0xFF);
      line += checksum.toString(16).toUpperCase().padStart(2, '0');
      hexStr += line + '\r\n';
      addr += lineLen;
    }

    hexStr += ':00000001FF\r\n';
    const blob = new Blob([hexStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = projectName.replace(/\.[^/.]+$/, '') + '.hex';
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', 'Exported Intel HEX binary file.');
  }, [assemblerResult, projectName, addLog]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        if (controllerRef.current.status === 'RUNNING') handlePause();
        else handleRun();
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleStep();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleAssemble();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePause, handleRun, handleStep, handleReset, handleAssemble]);

  // Current PC and execution line
  const cpuState = cpuRef.current.state;
  const currentExecLine = controllerRef.current.addressToLine.get(cpuState.pc);

  // 1. Dedicated Homepage View
  if (currentView === 'home') {
    return (
      <div className={`${isHighContrast ? 'high-contrast' : ''} ${theme === 'light' ? 'light-mode' : 'dark'}`}>
        <HomePage
          onSelectLevel={handleSelectLevelFromHome}
          onLaunchExample={handleLaunchExampleFromHome}
          isHighContrast={isHighContrast}
          onToggleHighContrast={handleToggleHighContrast}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenInstructionRef={() => setIsInstructionRefOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Workstation Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          isHighContrast={isHighContrast}
          onToggleHighContrast={handleToggleHighContrast}
          clockHz={clockHz}
          onChangeClock={handleChangeClock}
          speed={speed}
          onChangeSpeed={handleChangeSpeed}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onResetAllSettings={() => {
            setIsHighContrast(false);
            localStorage.removeItem('micro8051_high_contrast');
            handleChangeClock(12000000);
            handleChangeSpeed(1);
            addLog('info', 'Workstation settings reset to defaults.');
          }}
        />

        {/* 8051 Instruction Reference Modal */}
        <InstructionRefModal
          isOpen={isInstructionRefOpen}
          onClose={() => setIsInstructionRefOpen(false)}
        />
      </div>
    );
  }

  // 2. Active Simulator Workbench View (Dedicated UIs for Beginner, Intermediate, and Advanced)
  return (
    <div className={`${isHighContrast ? 'high-contrast' : ''} ${theme === 'light' ? 'light-mode' : 'dark'}`}>
      {simulatorLevel === 'beginner' && (
        <BeginnerView
          cpuState={cpuState}
          peripherals={peripheralsRef.current}
          sourceCode={sourceCode}
          setSourceCode={setSourceCode}
          projectName={projectName}
          assemblerResult={assemblerResult}
          simulatorStatus={simulatorStatus}
          speed={speed}
          onChangeSpeed={handleChangeSpeed}
          clockHz={clockHz}
          breakpoints={breakpoints}
          onToggleBreakpoint={handleToggleBreakpointLine}
          onAssemble={handleAssemble}
          onRun={handleRun}
          onPause={handlePause}
          onStep={handleStep}
          onReset={handleReset}
          selectedExampleId={selectedExampleId}
          onSelectExample={handleSelectExample}
          currentExecLine={currentExecLine}
          onSwitchLevel={handleSwitchLevel}
          onGoHome={() => setCurrentView('home')}
          onOpenInstructionRef={() => setIsInstructionRefOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLearn8051={() => setIsLearn8051Open(true)}
          isHighContrast={isHighContrast}
          onToggleHighContrast={handleToggleHighContrast}
          onToggleSwitch={handleToggleSwitch}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          writeRam={(addr, val) => {
            cpuRef.current.writeRam(addr, val);
            triggerUi();
          }}
          writeDirect={(addr, val) => {
            cpuRef.current.writeDirect(addr, val);
            triggerUi();
          }}
          clearRam={(scratchpadOnly) => {
            cpuRef.current.clearRam(scratchpadOnly);
            triggerUi();
          }}
        />
      )}

      {simulatorLevel === 'intermediate' && (
        <IntermediateView
          cpuState={cpuState}
          peripherals={peripheralsRef.current}
          sourceCode={sourceCode}
          setSourceCode={setSourceCode}
          projectName={projectName}
          assemblerResult={assemblerResult}
          simulatorStatus={simulatorStatus}
          speed={speed}
          onChangeSpeed={handleChangeSpeed}
          clockHz={clockHz}
          onChangeClock={handleChangeClock}
          breakpoints={breakpoints}
          onToggleBreakpointLine={handleToggleBreakpointLine}
          onClearBreakpoints={handleClearBreakpoints}
          onAssemble={handleAssemble}
          onRun={handleRun}
          onPause={handlePause}
          onStep={handleStep}
          onReset={handleReset}
          selectedExampleId={selectedExampleId}
          onSelectExample={handleSelectExample}
          currentExecLine={currentExecLine}
          onSwitchLevel={handleSwitchLevel}
          onGoHome={() => setCurrentView('home')}
          onNewProject={() => {
            setSourceCode(`ORG 0000H\nSTART:\n    MOV A,#55H\n    MOV P1,A\nLOOP:\n    SJMP LOOP\nEND\n`);
            setProjectName('new_project.asm');
          }}
          onOpenPinMapper={() => setIsPinMapperOpen(true)}
          onOpenInstructionRef={() => setIsInstructionRefOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLearn8051={() => setIsLearn8051Open(true)}
          onExportAsm={handleExportAsm}
          onExportHex={handleExportHex}
          isHighContrast={isHighContrast}
          onToggleHighContrast={handleToggleHighContrast}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          consoleMessages={consoleMessages}
          onClearConsole={() => setConsoleMessages([])}
          onToggleSwitch={handleToggleSwitch}
          onSetAllSwitches={handleSetAllSwitches}
          onPressKeypadKey={handlePressKeypadKey}
          onReleaseKeypadKey={handleReleaseKeypadKey}
          onAdcVoltageChange={handleAdcVoltageChange}
          onSendSerialData={handleSendSerialData}
          onClearSerialHistory={handleClearSerialHistory}
          onLoadCodePreset={handleLoadPresetCode}
          writeDirect={(addr, val) => {
            cpuRef.current.writeDirect(addr, val);
            triggerUi();
          }}
          writeRam={(addr, val) => {
            cpuRef.current.writeRam(addr, val);
            triggerUi();
          }}
          writeXram={(addr, val) => {
            cpuRef.current.writeXram(addr, val);
            triggerUi();
          }}
          writeSfr={(addr, val) => {
            cpuRef.current.writeSfr(addr, val);
            triggerUi();
          }}
          writeBit={(bitAddr, val) => {
            cpuRef.current.writeBit(bitAddr, val);
            triggerUi();
          }}
          clearRam={(scratchpadOnly) => {
            cpuRef.current.clearRam(scratchpadOnly);
            triggerUi();
          }}
          clearXram={() => {
            cpuRef.current.clearXram();
            triggerUi();
          }}
          readDirect={(addr) => cpuRef.current.readDirect(addr)}
        />
      )}

      {simulatorLevel === 'advanced' && (
        <AdvancedView
          cpuState={cpuState}
          peripherals={peripheralsRef.current}
          sourceCode={sourceCode}
          setSourceCode={setSourceCode}
          projectName={projectName}
          assemblerResult={assemblerResult}
          simulatorStatus={simulatorStatus}
          speed={speed}
          onChangeSpeed={handleChangeSpeed}
          clockHz={clockHz}
          onChangeClock={handleChangeClock}
          breakpoints={breakpoints}
          onToggleBreakpointLine={handleToggleBreakpointLine}
          onToggleBreakpointAddr={handleToggleBreakpointAddr}
          onClearBreakpoints={handleClearBreakpoints}
          onAssemble={handleAssemble}
          onRun={handleRun}
          onPause={handlePause}
          onStep={handleStep}
          onReset={handleReset}
          selectedExampleId={selectedExampleId}
          onSelectExample={handleSelectExample}
          currentExecLine={currentExecLine}
          onSwitchLevel={handleSwitchLevel}
          onGoHome={() => setCurrentView('home')}
          onNewProject={() => {
            setSourceCode(`ORG 0000H\nSTART:\n    MOV A,#55H\n    MOV P1,A\nLOOP:\n    SJMP LOOP\nEND\n`);
            setProjectName('new_project.asm');
          }}
          onOpenPinMapper={() => setIsPinMapperOpen(true)}
          onOpenInstructionRef={() => setIsInstructionRefOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLearn8051={() => setIsLearn8051Open(true)}
          onExportAsm={handleExportAsm}
          onExportHex={handleExportHex}
          isHighContrast={isHighContrast}
          onToggleHighContrast={handleToggleHighContrast}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          consoleMessages={consoleMessages}
          onClearConsole={() => setConsoleMessages([])}
          onSendSerialData={handleSendSerialData}
          onClearSerialHistory={handleClearSerialHistory}
          writeDirect={(addr, val) => {
            cpuRef.current.writeDirect(addr, val);
            triggerUi();
          }}
          writeRam={(addr, val) => {
            cpuRef.current.writeRam(addr, val);
            triggerUi();
          }}
          writeXram={(addr, val) => {
            cpuRef.current.writeXram(addr, val);
            triggerUi();
          }}
          writeSfr={(addr, val) => {
            cpuRef.current.writeSfr(addr, val);
            triggerUi();
          }}
          writeBit={(bitAddr, val) => {
            cpuRef.current.writeBit(bitAddr, val);
            triggerUi();
          }}
          clearRam={(scratchpadOnly) => {
            cpuRef.current.clearRam(scratchpadOnly);
            triggerUi();
          }}
          clearXram={() => {
            cpuRef.current.clearXram();
            triggerUi();
          }}
          readDirect={(addr) => cpuRef.current.readDirect(addr)}
        />
      )}

      {/* Hardware Pin Mapping Modal */}
      <PinMappingModal
        isOpen={isPinMapperOpen}
        onClose={() => setIsPinMapperOpen(false)}
        currentMapping={peripheralsRef.current.mapping}
        onSaveMapping={handleSavePinMapping}
      />

      {/* 8051 Instruction Reference Modal */}
      <InstructionRefModal
        isOpen={isInstructionRefOpen}
        onClose={() => setIsInstructionRefOpen(false)}
      />

      {/* Workstation Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={handleToggleHighContrast}
        clockHz={clockHz}
        onChangeClock={handleChangeClock}
        speed={speed}
        onChangeSpeed={handleChangeSpeed}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onResetAllSettings={() => {
          setIsHighContrast(false);
          localStorage.removeItem('micro8051_high_contrast');
          handleChangeClock(12000000);
          handleChangeSpeed(1);
          addLog('info', 'Workstation settings reset to defaults.');
        }}
      />

      {/* Comprehensive 8051 Knowledge & Study Hub Modal */}
      <LearnMicro8051Modal
        isOpen={isLearn8051Open}
        onClose={() => setIsLearn8051Open(false)}
        onLoadExample={(code, title) => {
          setSourceCode(code);
          setProjectName(title.toLowerCase().replace(/\s+/g, '_') + '.asm');
          handleAssemble();
          setCurrentView('simulator');
        }}
        theme={theme}
      />
    </div>
  );
}
