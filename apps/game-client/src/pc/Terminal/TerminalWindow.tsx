import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const TerminalWindow: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);

  const runTerminalCommand = useGameStore((s) => s.runTerminalCommand);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      lineHeight: 1.2,
      theme: {
        background: '#0a1410',
        foreground: '#e6fffa',
        cursor: '#ecc94b',
        cursorAccent: '#0a1410',
        selectionBackground: 'rgba(56, 161, 105, 0.4)',
        black: '#1a202c',
        red: '#e53e3e',
        green: '#48bb78',
        yellow: '#ecc94b',
        blue: '#4299e1',
        magenta: '#9f7aea',
        cyan: '#38b2ac',
        white: '#edf2f7',
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    fit.fit();

    xtermInstance.current = term;
    fitAddon.current = fit;

    // Welcome banner
    term.writeln(
      '\x1b[38;2;236;201;75m╔══════════════════════════════════════════════════════════════════╗\x1b[0m'
    );
    term.writeln(
      '\x1b[38;2;236;201;75m║           SOLAR GROVE — HELIOS WORKSTATION v1.0.4               ║\x1b[0m'
    );
    term.writeln(
      '\x1b[38;2;236;201;75m╚══════════════════════════════════════════════════════════════════╝\x1b[0m'
    );
    term.writeln(
      '\x1b[38;2;72;187;120mSystem online. Type \x1b[1;33mhelp\x1b[0;38;2;72;187;120m for commands or inspect blueprints to learn.\x1b[0m\r\n'
    );

    const prompt = () => {
      term.write('\x1b[1;32msolargrv@helios-node\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
    };
    prompt();

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) {
        // Enter
        term.writeln('');
        const cmd = inputBuffer.current.trim();
        if (cmd) {
          commandHistory.current.push(cmd);
          historyIndex.current = commandHistory.current.length;

          runTerminalCommand(cmd).then((output) => {
            if (output) {
              const formatted = output.replace(/\n/g, '\r\n');
              term.write(formatted);
            }
            prompt();
          });
        } else {
          prompt();
        }
        inputBuffer.current = '';
      } else if (domEvent.keyCode === 8) {
        // Backspace
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (domEvent.keyCode === 38) {
        // Up Arrow (History)
        if (historyIndex.current > 0) {
          historyIndex.current--;
          const prev = commandHistory.current[historyIndex.current] || '';
          // Clear current line
          while (inputBuffer.current.length > 0) {
            term.write('\b \b');
            inputBuffer.current = inputBuffer.current.slice(0, -1);
          }
          inputBuffer.current = prev;
          term.write(prev);
        }
      } else if (domEvent.keyCode === 40) {
        // Down Arrow
        if (historyIndex.current < commandHistory.current.length - 1) {
          historyIndex.current++;
          const next = commandHistory.current[historyIndex.current] || '';
          while (inputBuffer.current.length > 0) {
            term.write('\b \b');
            inputBuffer.current = inputBuffer.current.slice(0, -1);
          }
          inputBuffer.current = next;
          term.write(next);
        }
      } else if (printable) {
        inputBuffer.current += key;
        term.write(key);
      }
    });

    const handleResize = () => fit.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [runTerminalCommand]);

  return (
    <div style={{ width: '100%', height: '100%', padding: '12px', boxSizing: 'border-box' }}>
      <div
        ref={terminalRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#0a1410',
          border: '1px solid rgba(72, 187, 120, 0.3)',
        }}
      />
    </div>
  );
};
