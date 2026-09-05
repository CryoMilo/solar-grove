import type { CommandResult, CompetencyId } from '@solar-grove/game-types';
import type { ServiceManager } from '@solar-grove/infrastructure-model';

export type CommandHandler = (
  args: string[],
  serviceManager: ServiceManager
) => CommandResult | Promise<CommandResult>;

export class CommandEngine {
  private handlers: Map<string, CommandHandler> = new Map();

  constructor(private serviceManager: ServiceManager) {
    this.registerDefaultCommands();
  }

  register(command: string, handler: CommandHandler) {
    this.handlers.set(command.toLowerCase(), handler);
  }

  async execute(rawInput: string): Promise<CommandResult> {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { stdout: '', exitCode: 0 };
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const handler = this.handlers.get(cmd);
    if (!handler) {
      return {
        stdout: `solargrove: command not found: ${cmd}. Type 'help' for available commands.\r\n`,
        exitCode: 127,
      };
    }

    try {
      return await handler(args, this.serviceManager);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        stdout: `solargrove: error executing ${cmd}: ${errorMsg}\r\n`,
        exitCode: 1,
      };
    }
  }

  private registerDefaultCommands() {
    // HELP
    this.register('help', () => {
      const output = [
        '╔════════════════════════════════════════════════════════════════════╗',
        '║                   HELIOS OS — SOLAR GROVE TERMINAL                 ║',
        '╚════════════════════════════════════════════════════════════════════╝',
        '',
        'Available Core Utilities:',
        '  ps                     List running processes and PIDs',
        '  top                    Display dynamic real-time process list',
        '  systemctl <cmd> <unit> Control the systemd system and service manager',
        '                         (commands: status, start, stop, restart)',
        '  docker <cmd> [args]    Manage Docker containers and images',
        '                         (commands: ps, images, run, stop, logs)',
        '  curl <url>             Transfer data from or to a server / test HTTP',
        '  ping <host>            Send ICMP ECHO_REQUEST to network hosts',
        '  ls [path]              List directory contents',
        '  cat <file>             Concatenate and display files',
        '  status                 Quick health check of farm infrastructure',
        '  clear                  Clear the terminal screen',
        '  help                   Display this manual',
        '',
      ].join('\r\n');
      return { stdout: output, exitCode: 0 };
    });

    // PS
    this.register('ps', (_args, sm) => {
      const services = sm.getAllServices();
      const running = services.filter((s) => s.status === 'running');

      const lines = [
        'PID   USER     TTY      TIME     CMD',
        '    1 root     ?        00:00:04 /sbin/init systemd',
        '  104 root     ?        00:00:01 /lib/systemd/systemd-journald',
        '  412 system   ?        00:00:02 /usr/sbin/cron -f',
      ];

      for (const s of running) {
        const pidStr = String(s.pid || 1000).padStart(5, ' ');
        lines.push(`${pidStr} solargrv ?        00:00:03 ${s.command}`);
      }

      lines.push('');
      return {
        stdout: lines.join('\r\n'),
        exitCode: 0,
        unlockedCompetency: 'linux.processes',
      };
    });

    // TOP
    this.register('top', (_args, sm) => {
      const services = sm.getAllServices();
      const running = services.filter((s) => s.status === 'running');
      const loadAvg = (0.24 + running.length * 0.15).toFixed(2);

      const lines = [
        `top - ${new Date().toTimeString().split(' ')[0]} up 2 days, 1 user, load average: ${loadAvg}, 0.32, 0.28`,
        `Tasks: ${40 + running.length} total, 1 running, ${39 + running.length} sleeping, 0 stopped, 0 zombie`,
        '%Cpu(s):  4.2 us,  1.8 sy,  0.0 ni, 93.8 id,  0.2 wa,  0.0 hi,  0.0 si',
        'MiB Mem :   7962.4 total,   3140.2 free,   2218.4 used,   2603.8 buff/cache',
        'MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5412.6 avail Mem',
        '',
        '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
      ];

      for (const s of running) {
        const pidStr = String(s.pid || 1000).padStart(5, ' ');
        lines.push(
          `${pidStr} solargrv  20   0  384520  ${s.memoryMb}M  32400 S   ${s.cpu}.0   ${(s.memoryMb / 80).toFixed(1)}   0:04.12 ${s.name}`
        );
      }

      lines.push('');
      return { stdout: lines.join('\r\n'), exitCode: 0, unlockedCompetency: 'linux.processes' };
    });

    // SYSTEMCTL
    this.register('systemctl', (args, sm) => {
      if (args.length === 0) {
        return {
          stdout:
            'systemctl: missing command. Usage: systemctl [status|start|stop|restart] <service-name>\r\n',
          exitCode: 1,
        };
      }

      const sub = args[0].toLowerCase();
      let serviceName = args[1] || '';
      serviceName = serviceName.replace(/\.service$/, '');

      if (!serviceName) {
        return {
          stdout: `systemctl: missing service name for '${sub}'. Example: systemctl ${sub} irrigation-controller\r\n`,
          exitCode: 1,
        };
      }

      const service = sm.getService(serviceName);
      if (!service) {
        return {
          stdout: `Failed to ${sub} ${serviceName}.service: Unit ${serviceName}.service not found.\r\n`,
          exitCode: 1,
        };
      }

      if (sub === 'status') {
        const activeColor = service.status === 'running' ? 'active (running)' : 'inactive (dead)';
        const lines = [
          `● ${service.name}.service - ${service.description}`,
          `     Loaded: loaded (/etc/systemd/system/${service.name}.service; enabled; vendor preset: enabled)`,
          `     Active: ${activeColor} since ${new Date().toUTCString()}`,
          `    Process: ${service.pid ? `${service.pid} ExecStart=${service.command}` : 'None'}`,
          `   Main PID: ${service.pid || 'none'}`,
          `      Tasks: ${service.status === 'running' ? '4' : '0'}`,
          `     Memory: ${service.memoryMb}M`,
          `        CPU: ${service.cpu}%`,
          '',
          'Recent Logs:',
          ...service.logs.slice(-5).map((l) => `  ${l}`),
          '',
        ];
        return {
          stdout: lines.join('\r\n'),
          exitCode: 0,
          unlockedCompetency: 'linux.services',
        };
      }

      if (sub === 'start') {
        const res = sm.startService(serviceName);
        return {
          stdout: `${res.message}\r\n`,
          exitCode: res.success ? 0 : 1,
          affectedService: serviceName,
          unlockedCompetency: 'linux.services',
        };
      }

      if (sub === 'stop') {
        const res = sm.stopService(serviceName);
        return {
          stdout: `${res.message}\r\n`,
          exitCode: res.success ? 0 : 1,
          affectedService: serviceName,
        };
      }

      if (sub === 'restart') {
        const res = sm.restartService(serviceName);
        return {
          stdout: `${res.message}\r\n`,
          exitCode: res.success ? 0 : 1,
          affectedService: serviceName,
          unlockedCompetency: 'linux.services',
        };
      }

      return {
        stdout: `Unknown operation ${sub}.\r\n`,
        exitCode: 1,
      };
    });

    // DOCKER
    this.register('docker', (args, sm) => {
      if (args.length === 0) {
        return {
          stdout: 'Usage: docker [ps|images|run|stop|logs]\r\n',
          exitCode: 1,
        };
      }

      const sub = args[0].toLowerCase();

      if (sub === 'ps') {
        const containers = sm.getAllContainers();
        const lines = [
          'CONTAINER ID   IMAGE                                COMMAND                  CREATED         STATUS         PORTS                    NAMES',
        ];
        for (const c of containers) {
          lines.push(
            `${c.id}    ${c.image.padEnd(35, ' ')} "/bin/sh -c 'npm s…"   2 minutes ago   Up 2 minutes   ${c.ports.padEnd(24, ' ')} ${c.name}`
          );
        }
        if (containers.length === 0) {
          lines.push('(no containers currently running)');
        }
        lines.push('');
        return {
          stdout: lines.join('\r\n'),
          exitCode: 0,
          unlockedCompetency: 'containers.docker',
        };
      }

      if (sub === 'images') {
        const lines = [
          'REPOSITORY                          TAG       IMAGE ID       CREATED        SIZE',
          'solar-grove/greenhouse-controller   v1.2      c91f48a20de1   2 days ago     142MB',
          'solar-grove/harvest-worker          latest    a4891fcb0019   1 week ago     98MB',
          'postgres                            16        8df30291ba42   3 weeks ago    380MB',
          'node                                22-slim   fa284109e201   1 month ago    195MB',
          '',
        ];
        return {
          stdout: lines.join('\r\n'),
          exitCode: 0,
          unlockedCompetency: 'containers.images',
        };
      }

      if (sub === 'run') {
        // e.g. docker run -p 8080:8080 solar-grove/greenhouse-controller
        const container = sm.runContainer(
          'solar-grove/greenhouse-controller:v1.2',
          'greenhouse-api',
          '0.0.0.0:8080->8080/tcp'
        );
        // Also ensure greenhouse-api service state is active
        sm.startService('greenhouse-api');
        return {
          stdout: `${container.id}\r\nContainer ${container.name} started successfully.\r\n`,
          exitCode: 0,
          affectedService: 'greenhouse-api',
          unlockedCompetency: 'containers.docker',
        };
      }

      if (sub === 'stop') {
        const target = args[1];
        if (!target) {
          return { stdout: 'docker stop: requires at least 1 argument\r\n', exitCode: 1 };
        }
        sm.stopContainer(target);
        sm.stopService(target);
        return { stdout: `${target}\r\n`, exitCode: 0 };
      }

      if (sub === 'logs') {
        const target = args[1] || 'greenhouse-api';
        const lines = [
          `--- Logs for ${target} ---`,
          '[2026-09-06 02:00:00] [greenhouse-controller] Microclimate engine v1.2 initialized',
          '[2026-09-06 02:00:01] [greenhouse-controller] Connected to internal PostgreSQL db',
          '[2026-09-06 02:00:02] [greenhouse-controller] Sensor arrays active. Temperature 24.5C, Humidity 68%',
          '',
        ];
        return { stdout: lines.join('\r\n'), exitCode: 0 };
      }

      return { stdout: `docker: '${sub}' is not a recognized docker command.\r\n`, exitCode: 1 };
    });

    // CURL
    this.register('curl', (args, sm) => {
      const url = args[args.length - 1] || '';
      if (!url) {
        return { stdout: "curl: try 'curl --help' for more information\r\n", exitCode: 2 };
      }

      const isPort3000 = url.includes('3000');
      const isPort8080 = url.includes('8080');

      if (isPort3000) {
        const irrService = sm.getService('irrigation-controller');
        if (irrService?.status === 'running') {
          return {
            stdout: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nDate: ${new Date().toUTCString()}\r\n\r\n{"status":"healthy","service":"irrigation-controller","pressurePsi":45.2,"flowRateLpm":12.8}\r\n`,
            exitCode: 0,
            unlockedCompetency: 'networking.ports',
          };
        }
        return {
          stdout: 'curl: (7) Failed to connect to localhost port 3000: Connection refused\r\n',
          exitCode: 7,
          unlockedCompetency: 'networking.ports',
        };
      }

      if (isPort8080) {
        const ghService = sm.getService('greenhouse-api');
        if (ghService?.status === 'running') {
          return {
            stdout:
              'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"status":"active","greenhouse":"verdant-glasshouse","yieldMultiplier":1.4}\r\n',
            exitCode: 0,
            unlockedCompetency: 'networking.http',
          };
        }
        return {
          stdout: 'curl: (7) Failed to connect to localhost port 8080: Connection refused\r\n',
          exitCode: 7,
        };
      }

      return {
        stdout: `curl: (6) Could not resolve host: ${url}\r\n`,
        exitCode: 6,
      };
    });

    // PING
    this.register('ping', (args) => {
      const host = args[args.length - 1] || '127.0.0.1';
      const lines = [
        `PING ${host} (${host}): 56 data bytes`,
        `64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.048 ms`,
        `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.052 ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.041 ms`,
        '',
        `--- ${host} ping statistics ---`,
        '3 packets transmitted, 3 packets received, 0.0% packet loss',
        'round-trip min/avg/max/stddev = 0.041/0.047/0.052/0.005 ms',
        '',
      ];
      return { stdout: lines.join('\r\n'), exitCode: 0, unlockedCompetency: 'networking.ip' };
    });

    // LS
    this.register('ls', (args) => {
      const path = args[0] || '';
      if (path.includes('opt') || path.includes('solargrove')) {
        return {
          stdout:
            'drwxr-xr-x 4 solargrv solargrv 4096 Sep  6 02:00 irrigation\r\ndrwxr-xr-x 3 solargrv solargrv 4096 Sep  6 02:00 greenhouse\r\n-rwxr-xr-x 1 solargrv solargrv 1240 Sep  6 02:00 start-all.sh\r\n',
          exitCode: 0,
          unlockedCompetency: 'linux.filesystem',
        };
      }
      return {
        stdout:
          'bin   dev  home  lib64  mnt  proc  run   srv  tmp  var\r\nboot  etc  lib   media  opt  root  sbin  sys  usr\r\n',
        exitCode: 0,
        unlockedCompetency: 'linux.filesystem',
      };
    });

    // CAT
    this.register('cat', (args) => {
      const file = args[0] || '';
      if (file.includes('hosts')) {
        return {
          stdout:
            '127.0.0.1   localhost solargrove-node-01\r\n::1         localhost ip6-localhost ip6-loopback\r\n192.168.1.1 gateway.solargrove.internal\r\n',
          exitCode: 0,
          unlockedCompetency: 'networking.dns',
        };
      }
      if (file.includes('irrigation')) {
        return {
          stdout:
            '[Unit]\r\nDescription=Helio Irrigation Array Controller\r\nAfter=network.target\r\n\r\n[Service]\r\nType=simple\r\nUser=solargrv\r\nWorkingDirectory=/opt/solargrove/irrigation\r\nExecStart=/usr/local/bin/node index.js\r\nRestart=always\r\nRestartSec=5\r\nEnvironment=PORT=3000\r\n\r\n[Install]\r\nWantedBy=multi-user.target\r\n',
          exitCode: 0,
          unlockedCompetency: 'linux.services',
        };
      }
      return {
        stdout: `cat: ${file || 'file'}: No such file or directory\r\n`,
        exitCode: 1,
      };
    });

    // STATUS
    this.register('status', (_args, sm) => {
      const services = sm.getAllServices();
      const containers = sm.getAllContainers();
      const lines = [
        '=== SOLAR GROVE INFRASTRUCTURE STATUS ===',
        `Time: ${new Date().toISOString()}`,
        '',
        'Services:',
      ];
      for (const s of services) {
        const icon = s.status === 'running' ? '🟢' : '🔴';
        lines.push(
          `  ${icon} ${s.name.padEnd(24, ' ')} [${s.status.toUpperCase()}] Port: ${s.port} | CPU: ${s.cpu}% | RAM: ${s.memoryMb}MB`
        );
      }
      lines.push('');
      lines.push('Containers:');
      for (const c of containers) {
        const icon = c.status === 'running' ? '🟢' : '🔴';
        lines.push(
          `  ${icon} ${c.name.padEnd(24, ' ')} [${c.status.toUpperCase()}] Image: ${c.image}`
        );
      }
      if (containers.length === 0) {
        lines.push('  (none running)');
      }
      lines.push('=========================================');
      lines.push('');
      return { stdout: lines.join('\r\n'), exitCode: 0 };
    });

    // JOURNALCTL
    this.register('journalctl', (args, sm) => {
      let unitName = 'irrigation-controller';
      let linesCount = 20;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-u' && args[i + 1]) {
          unitName = args[i + 1].replace(/\.service$/, '');
        }
        if ((args[i] === '-n' || args[i] === '--lines') && args[i + 1]) {
          linesCount = Number.parseInt(args[i + 1], 10) || 20;
        }
      }

      const logs = sm.getJournalLogs(unitName, linesCount);
      const lines = [
        `-- Logs begin at ${new Date(Date.now() - 3600000).toUTCString()}, end at ${new Date().toUTCString()}. --`,
        ...logs,
        '',
      ];
      return {
        stdout: lines.join('\r\n'),
        exitCode: 0,
        unlockedCompetency: 'linux.services',
      };
    });

    // FUSER
    this.register('fuser', (args) => {
      const portArg = args[0] || '3000/tcp';
      return {
        stdout: `${portArg}:  1042\r\n`,
        exitCode: 0,
        unlockedCompetency: 'networking.ports',
      };
    });

    // CLEAR
    this.register('clear', () => {
      return { stdout: '\x1b[2J\x1b[3J\x1b[H', exitCode: 0 };
    });
  }
}
