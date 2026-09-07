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
        '  docker <cmd> [args]    Manage Docker containers, images, and networks',
        '                         (commands: pull, images, run, ps, stop, logs, inspect, network)',
        '  docker compose <cmd>   Multi-container orchestration (up, down, ps, logs)',
        '  env                    Display session and container environment variables',
        '  ip [addr|route]        Inspect network interfaces and routing table',
        '  nslookup <domain>      Query DNS name servers for domain A-records',
        '  dig <domain>           DNS lookup utility with packet headers',
        '  nginx [-t|-s reload]   Test and reload Nginx reverse proxy configuration',
        '  openssl s_client ...   TLS handshake test and certificate inspection',
        '  certbot -d <domain>    Automated ACME TLS certificate requester',
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
      const processes = sm.getProcesses ? sm.getProcesses() : [];
      const lines = ['PID   USER     TTY      TIME     CMD'];

      for (const p of processes) {
        const pidStr = String(p.pid).padStart(5, ' ');
        const user = p.pid < 500 ? 'root   ' : 'solargrv';
        lines.push(`${pidStr} ${user} ?        00:00:03 ${p.command}`);
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
        let activeStatusText = 'inactive (dead)';
        if (service.status === 'running') {
          activeStatusText = 'active (running)';
        } else if (service.status === 'failed') {
          activeStatusText = 'failed (Result: exit-code)';
        }

        const lines = [
          `● ${service.name}.service - ${service.description}`,
          `     Loaded: loaded (/etc/systemd/system/${service.name}.service; enabled; vendor preset: enabled)`,
          `     Active: ${activeStatusText} since ${new Date().toUTCString()}`,
          `       Port: ${service.port} (TCP)`,
          `    Process: ${service.pid ? `${service.pid} ExecStart=${service.command}` : 'None'}`,
          `   Main PID: ${service.pid || 'none'}${service.status === 'failed' ? ' (code=exited, status=1/FAILURE)' : ''}`,
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
          exitCode: service.status === 'failed' ? 3 : 0,
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
        const usage = [
          'Usage:  docker [OPTIONS] COMMAND',
          '',
          'A self-sufficient runtime for containers',
          '',
          'Management Commands:',
          '  compose     Docker Compose orchestration (up, down, ps, logs)',
          '  network     Manage networks (ls, inspect)',
          '',
          'Commands:',
          '  pull        Download an image from a registry',
          '  images      List images',
          '  run         Create and run a new container from an image',
          '  ps          List containers',
          '  stop        Stop one or more running containers',
          '  start       Start one or more stopped containers',
          '  restart     Restart one or more containers',
          '  logs        Fetch the logs of a container',
          '  inspect     Return low-level information on Docker objects',
          '',
        ].join('\r\n');
        return { stdout: usage, exitCode: 0 };
      }

      const sub = args[0].toLowerCase();

      // DOCKER PULL
      if (sub === 'pull') {
        const imageArg = args[1];
        if (!imageArg) {
          return {
            stdout: '"docker pull" requires exactly 1 argument.\r\nSee \'docker pull --help\'.\r\n',
            exitCode: 1,
          };
        }
        const res = sm.pullImage(imageArg);
        return {
          stdout: res.output,
          exitCode: res.success ? 0 : 1,
          unlockedCompetency: res.success ? 'containers.images' : undefined,
        };
      }

      // DOCKER IMAGES
      if (sub === 'images') {
        const images = sm.getLocalImages();
        const lines = [
          'REPOSITORY                          TAG       IMAGE ID       CREATED        SIZE',
        ];
        for (const img of images) {
          lines.push(
            `${img.repository.padEnd(35, ' ')} ${img.tag.padEnd(9, ' ')} ${img.id.padEnd(14, ' ')} ${img.createdAt.padEnd(14, ' ')} ${img.size}`
          );
        }
        if (images.length === 0) {
          lines.push('(no images pulled yet - use "docker pull <image>")');
        }
        lines.push('');
        return {
          stdout: lines.join('\r\n'),
          exitCode: 0,
          unlockedCompetency: 'containers.images',
        };
      }

      // DOCKER RUN
      if (sub === 'run') {
        let containerName: string | undefined;
        let network: string | undefined;
        const portMappings: string[] = [];
        const envVars: Record<string, string> = {};
        let imageArg = '';

        for (let i = 1; i < args.length; i++) {
          const a = args[i];
          if (a === '--name' && args[i + 1]) {
            containerName = args[++i];
          } else if (a.startsWith('--name=')) {
            containerName = a.split('=')[1];
          } else if ((a === '-p' || a === '--publish') && args[i + 1]) {
            portMappings.push(args[++i]);
          } else if (a.startsWith('-p=')) {
            portMappings.push(a.split('=')[1]);
          } else if ((a === '-e' || a === '--env') && args[i + 1]) {
            const raw = args[++i];
            const eqIdx = raw.indexOf('=');
            if (eqIdx !== -1) {
              envVars[raw.substring(0, eqIdx)] = raw.substring(eqIdx + 1);
            }
          } else if (a.startsWith('-e=')) {
            const raw = a.substring(3);
            const eqIdx = raw.indexOf('=');
            if (eqIdx !== -1) {
              envVars[raw.substring(0, eqIdx)] = raw.substring(eqIdx + 1);
            }
          } else if (a === '--network' && args[i + 1]) {
            network = args[++i];
          } else if (a.startsWith('--network=')) {
            network = a.split('=')[1];
          } else if (a === '-d' || a === '--detach') {
            // Detached run
          } else if (!a.startsWith('-') && !imageArg) {
            imageArg = a;
          }
        }

        if (!imageArg) {
          return {
            stdout:
              '"docker run" requires at least 1 image argument.\r\nSee \'docker run --help\'.\r\n',
            exitCode: 1,
          };
        }

        const res = sm.createOrRunContainer({
          image: imageArg,
          name: containerName,
          ports: portMappings,
          environment: envVars,
          network,
        });

        if (!res.success || !res.container) {
          return {
            stdout: `docker: ${res.error || 'Failed to start container.'}\r\n`,
            exitCode: 125,
          };
        }

        return {
          stdout: `${res.container.id}\r\n`,
          exitCode: 0,
          unlockedCompetency: 'containers.docker',
          affectedService: res.container.name,
        };
      }

      // DOCKER PS
      if (sub === 'ps') {
        const containers = sm.getAllContainers();
        const showAll = args.includes('-a') || args.includes('--all');
        const displayed = showAll ? containers : containers.filter((c) => c.status === 'RUNNING');

        const lines = [
          'CONTAINER ID   IMAGE                                  COMMAND                  CREATED         STATUS                    PORTS                    NAMES',
        ];

        for (const c of displayed) {
          const statusStr =
            c.status === 'RUNNING'
              ? `Up 2 minutes (${c.health.toLowerCase()})`
              : 'Exited (0) 1 minute ago';
          lines.push(
            `${c.id.padEnd(14, ' ')} ${c.image.padEnd(38, ' ')} "${c.command.substring(0, 20).padEnd(22, ' ')}" 2 minutes ago   ${statusStr.padEnd(25, ' ')} ${c.ports.padEnd(24, ' ')} ${c.name}`
          );
        }

        if (displayed.length === 0) {
          lines.push('(no containers currently running)');
        }
        lines.push('');
        return {
          stdout: lines.join('\r\n'),
          exitCode: 0,
          unlockedCompetency: 'containers.docker',
        };
      }

      // DOCKER STOP
      if (sub === 'stop') {
        const target = args[1];
        if (!target) {
          return { stdout: 'docker stop: requires at least 1 argument\r\n', exitCode: 1 };
        }
        const ok = sm.stopContainer(target);
        if (!ok) {
          return {
            stdout: `Error response from daemon: No such container: ${target}\r\n`,
            exitCode: 1,
          };
        }
        return { stdout: `${target}\r\n`, exitCode: 0, affectedService: target };
      }

      // DOCKER START
      if (sub === 'start') {
        const target = args[1];
        if (!target) {
          return { stdout: 'docker start: requires at least 1 argument\r\n', exitCode: 1 };
        }
        const ok = sm.startContainer(target);
        if (!ok) {
          return {
            stdout: `Error response from daemon: No such container: ${target}\r\n`,
            exitCode: 1,
          };
        }
        return { stdout: `${target}\r\n`, exitCode: 0, affectedService: target };
      }

      // DOCKER RESTART
      if (sub === 'restart') {
        const target = args[1];
        if (!target) {
          return { stdout: 'docker restart: requires at least 1 argument\r\n', exitCode: 1 };
        }
        const ok = sm.restartContainer(target);
        if (!ok) {
          return {
            stdout: `Error response from daemon: No such container: ${target}\r\n`,
            exitCode: 1,
          };
        }
        return { stdout: `${target}\r\n`, exitCode: 0, affectedService: target };
      }

      // DOCKER LOGS
      if (sub === 'logs') {
        let target = '';
        for (let i = 1; i < args.length; i++) {
          if (!args[i].startsWith('-')) {
            target = args[i];
            break;
          }
        }
        if (!target) {
          return { stdout: 'docker logs: requires container name or ID\r\n', exitCode: 1 };
        }
        const logs = sm.getContainerLogs(target);
        return {
          stdout: `${logs.join('\r\n')}\r\n`,
          exitCode: 0,
          unlockedCompetency: 'containers.logs',
        };
      }

      // DOCKER INSPECT
      if (sub === 'inspect') {
        const target = args[1];
        if (!target) {
          return { stdout: 'docker inspect: requires container name or ID\r\n', exitCode: 1 };
        }
        const info = sm.inspectContainer(target);
        if (!info) {
          return { stdout: `Error: No such object: ${target}\r\n`, exitCode: 1 };
        }
        return {
          stdout: `${JSON.stringify([info], null, 2)}\r\n`,
          exitCode: 0,
          unlockedCompetency: 'linux.env',
        };
      }

      // DOCKER NETWORK
      if (sub === 'network') {
        const netCmd = (args[1] || 'ls').toLowerCase();
        if (netCmd === 'ls') {
          const networks = sm.getNetworks();
          const lines = ['NETWORK ID     NAME                 DRIVER    SCOPE'];
          for (const n of networks) {
            lines.push(
              `${n.id.padEnd(14, ' ')} ${n.name.padEnd(20, ' ')} ${n.driver.padEnd(9, ' ')} local`
            );
          }
          lines.push('');
          return {
            stdout: lines.join('\r\n'),
            exitCode: 0,
            unlockedCompetency: 'containers.networking',
          };
        }
        if (netCmd === 'inspect') {
          const netName = args[2] || 'greenhouse-network';
          const net = sm.getNetwork(netName);
          if (!net) {
            return { stdout: `Error: No such network: ${netName}\r\n`, exitCode: 1 };
          }
          const netInfo = [
            {
              Name: net.name,
              Id: net.id,
              Driver: net.driver,
              IPAM: {
                Config: [{ Subnet: net.subnet, Gateway: net.subnet.replace('0.0/16', '0.1') }],
              },
              Containers: net.containers.reduce(
                (acc, cName, idx) => {
                  acc[`cont-${idx}`] = { Name: cName, IPv4Address: `172.28.0.${idx + 2}/16` };
                  return acc;
                },
                {} as Record<string, unknown>
              ),
            },
          ];
          return {
            stdout: `${JSON.stringify(netInfo, null, 2)}\r\n`,
            exitCode: 0,
            unlockedCompetency: 'containers.networking',
          };
        }
        return {
          stdout: `docker network: unknown command '${netCmd}'. Valid: ls, inspect\r\n`,
          exitCode: 1,
        };
      }

      // DOCKER COMPOSE
      if (sub === 'compose') {
        const compCmd = (args[1] || 'ps').toLowerCase();
        if (compCmd === 'up') {
          const res = sm.composeUp();
          return {
            stdout: res.output,
            exitCode: 0,
            unlockedCompetency: 'containers.compose',
            affectedService: 'greenhouse-controller',
          };
        }
        if (compCmd === 'down') {
          return {
            stdout: sm.composeDown(),
            exitCode: 0,
            affectedService: 'greenhouse-controller',
          };
        }
        if (compCmd === 'ps') {
          return {
            stdout: sm.composePs(),
            exitCode: 0,
            unlockedCompetency: 'containers.docker',
          };
        }
        if (compCmd === 'logs') {
          return {
            stdout: sm.composeLogs(),
            exitCode: 0,
            unlockedCompetency: 'containers.logs',
          };
        }
        return {
          stdout: `docker compose: unknown command '${compCmd}'. Valid: up, down, ps, logs\r\n`,
          exitCode: 1,
        };
      }

      return {
        stdout: `docker: '${sub}' is not a docker command.\r\nSee 'docker --help'.\r\n`,
        exitCode: 1,
      };
    });

    // DOCKER-COMPOSE (alias)
    this.register('docker-compose', (args, sm) => {
      return this.handlers.get('docker')!(['compose', ...args], sm);
    });

    // ENV
    this.register('env', () => {
      const lines = [
        'USER=solargrv',
        'HOME=/home/solargrv',
        'LOGNAME=solargrv',
        'SHELL=/bin/zsh',
        'TERM=xterm-256color',
        'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        'DOCKER_HOST=unix:///var/run/docker.sock',
        'NODE_ENV=production',
        '',
      ];
      return {
        stdout: lines.join('\r\n'),
        exitCode: 0,
        unlockedCompetency: 'linux.env',
      };
    });

    // IP
    this.register('ip', (args) => {
      const sub = args[0] || 'addr';
      if (sub === 'a' || sub === 'addr' || sub === 'address') {
        const output = [
          '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000',
          '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
          '    inet 127.0.0.1/8 scope host lo',
          '       valid_lft forever preferred_lft forever',
          '    inet6 ::1/128 scope host',
          '       valid_lft forever preferred_lft forever',
          '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000',
          '    link/ether 02:42:0a:00:00:02 brd ff:ff:ff:ff:ff:ff',
          '    inet 10.0.0.2/24 brd 10.0.0.255 scope global eth0',
          '       valid_lft forever preferred_lft forever',
          '',
        ].join('\r\n');
        return { stdout: output, exitCode: 0, unlockedCompetency: 'networking.ip' };
      }
      if (sub === 'r' || sub === 'route') {
        const output = [
          'default via 10.0.0.1 dev eth0 proto dhcp src 10.0.0.2 metric 100',
          '10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.2',
          '',
        ].join('\r\n');
        return { stdout: output, exitCode: 0, unlockedCompetency: 'networking.ip' };
      }
      return {
        stdout: 'Usage: ip [addr|route]\r\n',
        exitCode: 1,
      };
    });

    // NSLOOKUP
    this.register('nslookup', (args, sm) => {
      const domain = args[0] || '';
      if (!domain) {
        return {
          stdout: 'Usage: nslookup <domain>\r\n',
          exitCode: 1,
        };
      }

      const ip = sm.resolveDns ? sm.resolveDns(domain) : undefined;
      if (!ip) {
        return {
          stdout: `Server:\t\t10.0.0.1\r\nAddress:\t10.0.0.1#53\r\n\r\n** server can't find ${domain}: NXDOMAIN\r\n`,
          exitCode: 1,
        };
      }

      return {
        stdout: `Server:\t\t10.0.0.1\r\nAddress:\t10.0.0.1#53\r\n\r\nNon-authoritative answer:\r\nName:\t${domain}\r\nAddress: ${ip}\r\n`,
        exitCode: 0,
        unlockedCompetency: 'networking.dns',
      };
    });

    // DIG
    this.register('dig', (args, sm) => {
      const domain = args.filter((a) => !a.startsWith('+') && !a.startsWith('@'))[0] || '';
      if (!domain) {
        return {
          stdout: 'Usage: dig <domain> [@nameserver]\r\n',
          exitCode: 1,
        };
      }

      const ip = sm.resolveDns ? sm.resolveDns(domain) : undefined;
      if (!ip) {
        return {
          stdout: `; <<>> DiG 9.18.1-1ubuntu1.3-Ubuntu <<>> ${domain}\r\n;; Got answer:\r\n;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 31204\r\n;; QUESTION SECTION:\r\n;${domain}.\t\t\tIN\tA\r\n\r\n;; Query time: 1 msec\r\n;; SERVER: 10.0.0.1#53(10.0.0.1) (UDP)\r\n`,
          exitCode: 1,
        };
      }

      const output = [
        `; <<>> DiG 9.18.1-1ubuntu1.3-Ubuntu <<>> ${domain}`,
        ';; Got answer:',
        ';; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 31204',
        ';; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1',
        '',
        ';; QUESTION SECTION:',
        `;${domain}.\t\t\tIN\tA`,
        '',
        ';; ANSWER SECTION:',
        `${domain}.\t\t300\tIN\tA\t${ip}`,
        '',
        ';; Query time: 1 msec',
        ';; SERVER: 10.0.0.1#53(10.0.0.1) (UDP)',
        `;; WHEN: ${new Date().toUTCString()}`,
        ';; MSG SIZE  rcvd: 56',
        '',
      ].join('\r\n');

      return {
        stdout: output,
        exitCode: 0,
        unlockedCompetency: 'networking.dns',
      };
    });

    // NGINX
    this.register('nginx', (args, sm) => {
      if (args.includes('-t')) {
        const res = sm.testNginxConfig ? sm.testNginxConfig() : { valid: true, output: '' };
        return {
          stdout: `${res.output}\r\n`,
          exitCode: res.valid ? 0 : 1,
          unlockedCompetency: 'networking.reverse-proxy',
        };
      }
      if (args.includes('-s') && args.includes('reload')) {
        return {
          stdout: 'nginx: configuration reloaded successfully.\r\n',
          exitCode: 0,
          unlockedCompetency: 'networking.reverse-proxy',
        };
      }
      return {
        stdout: 'nginx version: nginx/1.24.0 (Ubuntu)\r\nUsage: nginx [-t] [-s reload]\r\n',
        exitCode: 0,
        unlockedCompetency: 'networking.reverse-proxy',
      };
    });

    // OPENSSL
    this.register('openssl', (args, sm) => {
      if (args[0] === 's_client') {
        let connectTarget = '';
        let servername = '';
        for (let i = 1; i < args.length; i++) {
          if (args[i] === '-connect' && args[i + 1]) connectTarget = args[i + 1];
          if (args[i] === '-servername' && args[i + 1]) servername = args[i + 1];
        }

        const domain = servername || connectTarget.split(':')[0] || 'solar-grove.local';
        const cert = sm.getMatchingCertificate ? sm.getMatchingCertificate(domain) : undefined;

        if (!cert || cert.status !== 'VALID') {
          const lines = [
            'CONNECTED(00000003)',
            `depth=0 CN = ${cert?.domain || domain}`,
            'verify error:num=20:unable to get local issuer certificate',
            'verify return:1',
            '---',
            'Certificate chain',
            ` 0 s:CN = ${cert?.domain || domain}`,
            '   i:CN = Untrusted / Self-Signed CA',
            '---',
            'No client certificate CA names sent',
            'Peer signing digest: SHA256',
            'Server Temp Key: X25519, 253 bits',
            '---',
            'SSL handshake has read 1422 bytes and written 384 bytes',
            'Verification error: certificate has expired or is untrusted',
            '---',
            'New, (NONE), Cipher is (NONE)',
            'Secure Renegotiation IS NOT supported',
            'Compression: NONE',
            'Expansion: NONE',
            'No ALPN negotiated',
            'SSL-Session:',
            '    Protocol  : TLSv1.3',
            '    Cipher    : 0000',
            '    Verify return code: 21 (unable to verify the first certificate)',
            '---',
            '',
          ];
          return {
            stdout: lines.join('\r\n'),
            exitCode: 1,
            unlockedCompetency: 'networking.tls',
          };
        }

        const lines = [
          'CONNECTED(00000003)',
          'depth=2 C = US, O = Internet Security Research Group, CN = ISRG Root X1',
          'verify return:1',
          "depth=1 C = US, O = Let's Encrypt, CN = R3",
          'verify return:1',
          `depth=0 CN = ${cert.domain}`,
          'verify return:1',
          '---',
          'Certificate chain',
          ` 0 s:CN = ${cert.domain}`,
          "   i:C = US, O = Let's Encrypt, CN = R3",
          '---',
          'Server certificate',
          '-----BEGIN CERTIFICATE-----',
          'MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OcIwAwDQYJKoZIhvcNAQELBQAw',
          'TzELMAkGA1UEBhMCVVMxEzARBgNVBAoTCkVsZWN0cm9uaWMgRnJvbnRpZXIgRm91',
          'bmRhdGlvbjEZMBcGA1UEAxMQZGVtby5zb2xhcmdyb3ZlMB4XDTI2MDkwNzAwMDAw',
          '-----END CERTIFICATE-----',
          `subject=CN = ${cert.domain}`,
          "issuer=C = US, O = Let's Encrypt, CN = R3",
          '---',
          'No client certificate CA names sent',
          'Peer signing digest: SHA256',
          'Peer signature type: RSA-PSS',
          'Server Temp Key: X25519, 253 bits',
          '---',
          'SSL handshake has read 3824 bytes and written 432 bytes',
          'Verification: OK',
          '---',
          'New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384',
          'Server public key is 2048 bit',
          'Secure Renegotiation IS supported',
          'Compression: NONE',
          'Expansion: NONE',
          'ALPN protocol: h2',
          'SSL-Session:',
          '    Protocol  : TLSv1.3',
          '    Cipher    : TLS_AES_256_GCM_SHA384',
          '    Session-ID: 7B4491DE3C8AF169021188AC2B905EFE09A13D88',
          '    Session-ID-ctx: ',
          '    Master-Key: 512B4...',
          '    PSK identity: None',
          '    PSK identity hint: None',
          `    Start Time: ${Math.floor(Date.now() / 1000)}`,
          '    Timeout   : 7200 (sec)',
          '    Verify return code: 0 (ok)',
          '---',
          '',
        ];
        return {
          stdout: lines.join('\r\n'),
          exitCode: 0,
          unlockedCompetency: 'networking.tls',
        };
      }

      return {
        stdout:
          'OpenSSL 3.0.2 15 Mar 2022\r\nUsage: openssl s_client -connect <host:port> [-servername <domain>]\r\n',
        exitCode: 0,
      };
    });

    // CERTBOT
    this.register('certbot', (args, sm) => {
      let domain = '*.solar-grove.local';
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-d' && args[i + 1]) {
          domain = args[i + 1];
        }
      }

      const res = sm.requestCertificate(domain);
      return {
        stdout: `${res.logs.join('\r\n')}\r\n`,
        exitCode: res.success ? 0 : 1,
        unlockedCompetency: 'networking.certificates',
      };
    });

    // CURL
    this.register('curl', (args, sm) => {
      let isHead = false;
      let url = '';
      for (const arg of args) {
        if (arg === '-I' || arg === '--head') {
          isHead = true;
        } else if (!arg.startsWith('-')) {
          url = arg;
        }
      }

      if (!url) {
        return { stdout: "curl: try 'curl --help' for more information\r\n", exitCode: 2 };
      }

      if (sm.dispatchHttp) {
        const res = sm.dispatchHttp(url);

        // 1. HTTP 301 Redirect
        if (res.statusCode === 301) {
          const loc = res.headers['Location'] || '';
          const headerLines = [
            'HTTP/1.1 301 Moved Permanently',
            'Server: nginx/1.24.0',
            `Date: ${new Date().toUTCString()}`,
            'Content-Type: text/html',
            'Content-Length: 162',
            `Location: ${loc}`,
            'Connection: keep-alive',
          ];
          const out = isHead
            ? headerLines.join('\r\n') + '\r\n'
            : `${headerLines.join('\r\n')}\r\n\r\n${res.body}\r\n`;
          return {
            stdout: out,
            exitCode: 0,
            unlockedCompetency: 'networking.http-redirect',
          };
        }

        // 2. SSL Error (495)
        if (res.statusCode === 495 || res.error === 'NET::ERR_CERT_COMMON_NAME_INVALID') {
          return {
            stdout:
              'curl: (60) SSL certificate problem: unable to get local issuer certificate\r\nMore details here: https://curl.se/docs/sslcerts.html\r\n\r\ncurl failed to verify the certificate of the server. Untrusted or missing TLS certificate.\r\n',
            exitCode: 60,
            unlockedCompetency: 'networking.tls',
          };
        }

        // 3. HTTP 502 Bad Gateway
        if (res.statusCode === 502) {
          const headerLines = [
            'HTTP/1.1 502 Bad Gateway',
            'Server: nginx/1.24.0',
            `Date: ${new Date().toUTCString()}`,
            'Content-Type: application/json',
            'Connection: keep-alive',
          ];
          const out = isHead
            ? headerLines.join('\r\n') + '\r\n'
            : `${headerLines.join('\r\n')}\r\n\r\n${res.body}\r\n`;
          return {
            stdout: out,
            exitCode: 0,
            unlockedCompetency: 'networking.upstream',
          };
        }

        // 4. HTTP 200 OK
        if (res.statusCode === 200) {
          const headerLines = [
            'HTTP/1.1 200 OK',
            ...Object.entries(res.headers || {}).map(([k, v]) => `${k}: ${v}`),
            `Date: ${new Date().toUTCString()}`,
          ];
          const out = isHead
            ? headerLines.join('\r\n') + '\r\n'
            : `${headerLines.join('\r\n')}\r\n\r\n${res.body}\r\n`;
          const unlockedCompetency: CompetencyId = url.includes('solar-grove.local')
            ? 'networking.reverse-proxy'
            : 'networking.http';
          return {
            stdout: out,
            exitCode: 0,
            unlockedCompetency,
          };
        }

        // 5. Connection refused (0)
        if (res.statusCode === 0) {
          const hostPort = url.replace(/^https?:\/\//, '').split('/')[0];
          return {
            stdout: `curl: (7) Failed to connect to ${hostPort}: Connection refused\r\n`,
            exitCode: 7,
            unlockedCompetency: 'networking.ports',
          };
        }

        // 404 Not Found or Unresolved
        if (res.statusCode === 404 && res.error === 'ERR_NAME_NOT_RESOLVED') {
          return {
            stdout: `curl: (6) Could not resolve host: ${url}\r\n`,
            exitCode: 6,
          };
        }

        return {
          stdout: `HTTP/1.1 ${res.statusCode} ${res.statusText}\r\n\r\n${res.body}\r\n`,
          exitCode: 0,
        };
      }

      return {
        stdout: `curl: (7) Failed to connect to ${url}: Connection refused\r\n`,
        exitCode: 7,
      };
    });

    // SS / NETSTAT
    this.register('ss', (_args, sm) => {
      const ports = sm.getListeningPorts ? sm.getListeningPorts() : [];
      const lines = [
        'Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process',
      ];
      for (const p of ports) {
        lines.push(
          `tcp    ${p.status.padEnd(7, ' ')} 0       128            ${p.address}:${p.port}        0.0.0.0:*      users:(("${p.processName}",pid=${p.pid},fd=18))`
        );
      }
      lines.push('');
      return { stdout: lines.join('\r\n'), exitCode: 0, unlockedCompetency: 'networking.ports' };
    });

    this.register('netstat', (args, sm) => {
      return this.handlers.get('ss')!(args, sm);
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
        const lines = [
          '127.0.0.1   localhost',
          '::1         localhost ip6-localhost ip6-loopback',
          '10.0.0.1    farm-dns.solar-grove.local',
          '10.0.0.2    pixel-pc.solar-grove.local',
          '10.0.0.10   relay.solar-grove.local greenhouse.solar-grove.local irrigation.solar-grove.local',
          '10.0.0.20   greenhouse.local',
          '10.0.0.30   irrigation.local',
          '',
        ];
        return {
          stdout: lines.join('\r\n'),
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
        const icon =
          c.status === 'RUNNING' && c.health === 'HEALTHY'
            ? '🟢'
            : c.status === 'RUNNING'
              ? '🟡'
              : '🔴';
        const healthStr = c.status === 'RUNNING' ? ` (${c.health})` : '';
        lines.push(
          `  ${icon} ${c.name.padEnd(24, ' ')} [${c.status}${healthStr}] Image: ${c.image}`
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
