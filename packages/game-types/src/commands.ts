import type { CompetencyId } from './learning';

export interface CommandResult {
  stdout: string;
  stderr?: string;
  exitCode: number;
  unlockedCompetency?: CompetencyId;
  affectedService?: string;
  message?: string;
}

export interface TerminalCommandContext {
  cwd: string;
  user: string;
  hostname: string;
  env: Record<string, string>;
  services: {
    name: string;
    status: 'running' | 'stopped' | 'failed';
    pid?: number;
    port?: number;
    cpu: number;
    memoryMb: number;
  }[];
  containers: {
    id: string;
    image: string;
    status: 'running' | 'exited' | 'restarting';
    ports: string;
    names: string;
  }[];
}
