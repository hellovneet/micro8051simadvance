/**
 * Micro8051SiM Execution Controller & Simulator Engine
 * High-performance cycle scheduler, breakpoint management, and UI throttling.
 */

import { CPU8051 } from '../core/cpu/cpu.ts';
import { PeripheralsManager } from '../peripherals/peripherals.ts';
import { ClockSpeedHz, SimulationSpeed, ConsoleMessage } from '../core/types.ts';

export type SimulatorStatus = 'READY' | 'RUNNING' | 'PAUSED' | 'BREAKPOINT' | 'HALTED';

export interface ControllerCallbacks {
  onStatusChange?: (status: SimulatorStatus) => void;
  onStateUpdate?: () => void;
  onConsoleLog?: (msg: Omit<ConsoleMessage, 'id' | 'timestamp'>) => void;
  onBreakpointHit?: (address: number, line?: number) => void;
}

export class ExecutionController {
  public cpu: CPU8051;
  public peripherals: PeripheralsManager;

  public status: SimulatorStatus = 'READY';
  public clockHz: ClockSpeedHz = 12000000; // 12 MHz default
  public speedMultiplier: SimulationSpeed = 1;

  // Breakpoints: set of code addresses
  public breakpoints: Set<number> = new Set();
  // Address to source line mapping (from assembler)
  public addressToLine: Map<number, number> = new Map();
  public lineToAddress: Map<number, number> = new Map();

  // Step-over target address (if stepping over LCALL/ACALL)
  private stepOverTarget: number | null = null;

  // Animation / execution loop handles
  private animFrameId: number | null = null;
  private lastFrameTime = 0;
  private slowStepAccumulator = 0; // For readable slow-motion stepping (0.05x / 0.1x)

  // UI state throttling
  private lastUiUpdateTime = 0;
  private readonly UI_UPDATE_INTERVAL_MS = 33; // ~30 fps UI refresh during continuous execution

  private callbacks: ControllerCallbacks = {};

  constructor(cpu: CPU8051, peripherals: PeripheralsManager, callbacks: ControllerCallbacks = {}) {
    this.cpu = cpu;
    this.peripherals = peripherals;
    this.callbacks = callbacks;

    // Connect CPU serial transmit to peripherals manager
    this.cpu.onSerialTransmit = (byte: number) => {
      this.peripherals.onCpuSerialTransmit(byte);
      this.log('uart', `TX: '${byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : `0x${byte.toString(16).toUpperCase()}`}'`);
    };
  }

  public setCallbacks(callbacks: ControllerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setStatus(newStatus: SimulatorStatus): void {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
  }

  public log(type: ConsoleMessage['type'], text: string): void {
    if (this.callbacks.onConsoleLog) {
      this.callbacks.onConsoleLog({ type, text });
    }
  }

  // --- BREAKPOINT MANAGEMENT ---

  public toggleBreakpointAtLine(line: number): boolean {
    const addr = this.lineToAddress.get(line);
    if (addr !== undefined) {
      if (this.breakpoints.has(addr)) {
        this.breakpoints.delete(addr);
        return false;
      } else {
        this.breakpoints.add(addr);
        return true;
      }
    }
    return false;
  }

  public toggleBreakpointAtAddress(address: number): boolean {
    if (this.breakpoints.has(address)) {
      this.breakpoints.delete(address);
      return false;
    } else {
      this.breakpoints.add(address);
      return true;
    }
  }

  public hasBreakpointAtLine(line: number): boolean {
    const addr = this.lineToAddress.get(line);
    return addr !== undefined && this.breakpoints.has(addr);
  }

  public clearAllBreakpoints(): void {
    this.breakpoints.clear();
  }

  // --- EXECUTION CONTROLS ---

  public run(): void {
    if (this.status === 'RUNNING') return;

    this.setStatus('RUNNING');
    this.lastFrameTime = performance.now();
    this.loop();
  }

  public pause(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.setStatus('PAUSED');
    this.notifyUi();
  }

  public stop(): void {
    this.pause();
    this.setStatus('READY');
  }

  public reset(): void {
    this.pause();
    this.cpu.reset(true);
    this.peripherals.reset();
    this.stepOverTarget = null;
    this.setStatus('READY');
    this.log('cpu', `CPU & Peripherals reset. PC: 0000H`);
    this.notifyUi();
  }

  public step(): void {
    this.pause();
    this.executeSingleStep();
    this.setStatus('PAUSED');
    this.notifyUi();
  }

  public stepOver(): void {
    this.pause();
    const pc = this.cpu.state.pc;
    const op = this.cpu.state.codeMemory[pc];

    // Check if LCALL (0x12) or ACALL (op & 0x1F === 0x11)
    const isCall = op === 0x12 || (op & 0x1F) === 0x11;
    if (isCall) {
      const instrLen = op === 0x12 ? 3 : 2;
      this.stepOverTarget = (pc + instrLen) & 0xFFFF;
      this.run();
    } else {
      this.step();
    }
  }

  private executeSingleStep(): boolean {
    // 1. Update external inputs into CPU
    this.peripherals.updateInputsToCpu(this.cpu.state);

    // 2. Execute 1 instruction
    this.cpu.step();

    // 3. Update peripherals from CPU outputs
    this.peripherals.updateOutputsFromCpu(this.cpu.state);

    return true;
  }

  private loop = (): void => {
    if (this.status !== 'RUNNING') return;

    const frameStartTime = performance.now();
    const dt = Math.min(frameStartTime - this.lastFrameTime, 100);
    this.lastFrameTime = frameStartTime;

    // Readable Slow Execution Mode (0.05x = 1000ms delay per instruction, 0.1x = 500ms delay per instruction)
    if (this.speedMultiplier <= 0.1) {
      const stepDelayMs = this.speedMultiplier === 0.05 ? 1000 : 500;
      this.slowStepAccumulator += dt;
      if (this.slowStepAccumulator >= stepDelayMs) {
        this.slowStepAccumulator = 0;
        this.executeSingleStep();
        this.notifyUi();

        if (this.cpu.state.isHalted) {
          this.pause();
          this.setStatus('HALTED');
          this.log('cpu', 'CPU execution halted.');
          this.notifyUi();
          return;
        }

        const pc = this.cpu.state.pc;
        if (this.breakpoints.has(pc)) {
          this.pause();
          this.setStatus('BREAKPOINT');
          const line = this.addressToLine.get(pc);
          this.log('cpu', `Breakpoint reached at 0x${pc.toString(16).toUpperCase().padStart(4, '0')}${line ? ` (line ${line})` : ''}`);
          if (this.callbacks.onBreakpointHit) {
            this.callbacks.onBreakpointHit(pc, line);
          }
          this.notifyUi();
          return;
        }
      }

      if (this.status === 'RUNNING') {
        this.animFrameId = requestAnimationFrame(this.loop);
      }
      return;
    }

    // Determine target cycles for this animation frame based on speed multiplier.
    // In visual educational simulators, real-time stepping is balanced so the human eye
    // can perceive LED changes, multiplexed 7-segment scans, LCD strings, and DC motor rotations.
    let targetCyclesThisFrame: number;
    if (this.speedMultiplier === 999) {
      targetCyclesThisFrame = 25000;
    } else if (this.speedMultiplier <= 0.25) {
      targetCyclesThisFrame = Math.max(1, Math.round(150 * (dt / 1000)));
    } else if (this.speedMultiplier <= 0.5) {
      targetCyclesThisFrame = Math.max(2, Math.round(500 * (dt / 1000)));
    } else if (this.speedMultiplier <= 1) {
      targetCyclesThisFrame = Math.max(5, Math.round(2000 * (dt / 1000)));
    } else if (this.speedMultiplier <= 2) {
      targetCyclesThisFrame = Math.max(10, Math.round(5000 * (dt / 1000)));
    } else if (this.speedMultiplier <= 5) {
      targetCyclesThisFrame = Math.max(20, Math.round(12000 * (dt / 1000)));
    } else {
      targetCyclesThisFrame = Math.max(50, Math.round(25000 * (dt / 1000)));
    }

    let executedCycles = 0;
    let hitBreakpoint = false;

    // Pre-sync inputs before batch execution
    this.peripherals.updateInputsToCpu(this.cpu.state);

    while (executedCycles < targetCyclesThisFrame && !hitBreakpoint) {
      const pc = this.cpu.state.pc;

      // Check step-over target
      if (this.stepOverTarget !== null && pc === this.stepOverTarget) {
        this.stepOverTarget = null;
        this.pause();
        this.notifyUi();
        return;
      }

      // Check breakpoints
      if (this.breakpoints.has(pc)) {
        hitBreakpoint = true;
        this.pause();
        this.setStatus('BREAKPOINT');
        const line = this.addressToLine.get(pc);
        this.log('cpu', `Breakpoint reached at 0x${pc.toString(16).toUpperCase().padStart(4, '0')}${line ? ` (line ${line})` : ''}`);
        if (this.callbacks.onBreakpointHit) {
          this.callbacks.onBreakpointHit(pc, line);
        }
        this.notifyUi();
        return;
      }

      // Execute instruction
      const cycles = this.cpu.step();
      executedCycles += Math.max(1, cycles);

      // Refresh outputs periodically during large batches
      if ((executedCycles & 15) === 0) {
        this.peripherals.updateOutputsFromCpu(this.cpu.state);
      }

      if (this.cpu.state.isHalted) {
        this.pause();
        this.setStatus('HALTED');
        this.log('cpu', 'CPU execution halted.');
        this.notifyUi();
        return;
      }

      // TIME-BUDGET GUARD: Never lock the main JS thread for > 10ms per frame!
      // Guarantees 60 FPS buttery-smooth scrolling, responsive clicks, and zero freezing.
      if ((executedCycles & 63) === 0) {
        if (performance.now() - frameStartTime > 10) {
          break;
        }
      }
    }

    // Always ensure final peripheral state is synchronized at end of frame
    this.peripherals.updateOutputsFromCpu(this.cpu.state);

    // Throttle UI re-renders to prevent lagging
    if (frameStartTime - this.lastUiUpdateTime >= this.UI_UPDATE_INTERVAL_MS) {
      this.lastUiUpdateTime = frameStartTime;
      this.notifyUi();
    }

    if (this.status === 'RUNNING') {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  private notifyUi(): void {
    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate();
    }
  }
}
