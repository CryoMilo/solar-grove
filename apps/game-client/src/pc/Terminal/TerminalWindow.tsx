import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { Copy, HelpCircle, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const TerminalWindow: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const [copied, setCopied] = useState(false);

  const runTerminalCommand = useGameStore((s) => s.runTerminalCommand);

  const prompt = () => {
    if (xtermInstance.current) {
      xtermInstance.current.write('\x1b[1;32msolargrv@helios-node\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
    }
  };

  const executeCommand = (rawCmd: string) => {
    const term = xtermInstance.current;
    if (!term) return;

    const cmd = rawCmd.trim();
    term.writeln('');
    if (cmd) {
      commandHistory.current.push(cmd);
      historyIndex.current = commandHistory.current.length;

      runTerminalCommand(cmd).then((output) => {
        if (output) {
          const formatted = output.replace(/\n/g, '\r\n');
          term.write(formatted);
          if (!formatted.endsWith('\r\n')) {
            term.writeln('');
          }
        }
        prompt();
      });
    } else {
      prompt();
    }
    inputBuffer.current = '';
  };

  const handleQuickCommand = (cmd: string) => {
    const term = xtermInstance.current;
    if (!term) return;

    // Clear currently typed buffer
    while (inputBuffer.current.length > 0) {
      term.write('\b \b');
      inputBuffer.current = inputBuffer.current.slice(0, -1);
    }
    term.write(cmd);
    inputBuffer.current = cmd;
    executeCommand(cmd);
  };

  const handleClear = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
      prompt();
    }
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      lineHeight: 1.25,
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
      '\x1b[38;2;72;187;120mSystem online. Type \x1b[1;33mhelp\x1b[0;38;2;72;187;120m for commands or click quick chips below.\x1b[0m\r\n'
    );

    prompt();

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) {
        // Enter
        executeCommand(inputBuffer.current);
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

  const quickCommands = [
    'help',
    'ps',
    'systemctl status irrigation-controller',
    'journalctl -u irrigation-controller',
    'docker ps',
    'docker logs greenhouse-controller',
    'curl -I http://greenhouse.local:4000',
    'nslookup greenhouse.solar-grove.local',
    'aws s3 ls',
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '6px',
          border: '1px solid rgba(72, 187, 120, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ecc94b' }}>
          <TerminalIcon size={15} />
          <span style={{ fontWeight: 700 }}>HELIOS SHELL</span>
          <span style={{ color: '#a0aec0', fontSize: '11px' }}>• (↑ / ↓ for command history)</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn-solarpunk"
            onClick={handleClear}
            style={{ padding: '3px 8px', fontSize: '11px' }}
            title="Clear Terminal Output"
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#0a1410',
          border: '1px solid rgba(72, 187, 120, 0.3)',
        }}
      />

      {/* Quick Command Chips Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          padding: '4px 0',
        }}
      >
        <span style={{ fontSize: '11px', color: '#a0aec0', whiteSpace: 'nowrap' }}>Quick Run:</span>
        {quickCommands.map((cmd, idx) => (
          <button
            key={idx}
            type="button"
            className="btn-solarpunk"
            onClick={() => handleQuickCommand(cmd)}
            style={{
              padding: '3px 10px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              whiteSpace: 'nowrap',
              background: 'rgba(56, 161, 105, 0.15)',
              borderColor: 'rgba(72, 187, 120, 0.3)',
              color: '#9ae6b4',
            }}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};
