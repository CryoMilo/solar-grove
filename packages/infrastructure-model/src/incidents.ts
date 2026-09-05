import type { Incident, IncidentType } from '@solar-grove/game-types';

export class IncidentEngine {
  private activeIncidents: Map<string, Incident> = new Map();

  triggerIncident(type: IncidentType, buildingId: string, serviceName: string): Incident {
    const id = `inc-${Date.now().toString(36)}`;
    let incident: Incident;

    switch (type) {
      case 'process-crash':
        incident = {
          id,
          type,
          title: 'Process Unexpectedly Terminated',
          description: `The process for ${serviceName} crashed with SIGTERM. Irrigation and automation halted.`,
          affectedBuildingId: buildingId,
          affectedServiceName: serviceName,
          severity: 'high',
          resolved: false,
          detectedAt: Date.now(),
          productionPenaltyPercent: 50,
          remediationHint:
            'Inspect running processes with `ps`, then restart using `systemctl start <service>` or `./<service>`.',
          suggestedCommand: `systemctl restart ${serviceName}`,
        };
        break;

      case 'wrong-port':
        incident = {
          id,
          type,
          title: 'Port Mismatch / Connection Refused',
          description: `${serviceName} is listening on incorrect port. Farm reverse proxy cannot forward telemetry.`,
          affectedBuildingId: buildingId,
          affectedServiceName: serviceName,
          severity: 'medium',
          resolved: false,
          detectedAt: Date.now(),
          productionPenaltyPercent: 30,
          remediationHint:
            'Check listening sockets using `netstat -tlpn` or `curl localhost:<port>`.',
          suggestedCommand: 'curl -I http://localhost:3000',
        };
        break;

      case 'high-cpu':
        incident = {
          id,
          type,
          title: 'CPU Saturation Detected',
          description: `${serviceName} is pegging compute cores above 95%. Latency spikes across irrigation nodes.`,
          affectedBuildingId: buildingId,
          affectedServiceName: serviceName,
          severity: 'medium',
          resolved: false,
          detectedAt: Date.now(),
          productionPenaltyPercent: 25,
          remediationHint: 'Identify busy processes with `top` or `ps aux`.',
          suggestedCommand: 'top',
        };
        break;

      case 'memory-leak':
        incident = {
          id,
          type,
          title: 'Memory Leak Alert (OOM Danger)',
          description: `${serviceName} memory allocation exceeded 90% threshold. Crash imminent without garbage collection/restart.`,
          affectedBuildingId: buildingId,
          affectedServiceName: serviceName,
          severity: 'high',
          resolved: false,
          detectedAt: Date.now(),
          productionPenaltyPercent: 40,
          remediationHint: 'Check memory footprint with `free -m` or `ps aux --sort=-%mem`.',
          suggestedCommand: `systemctl restart ${serviceName}`,
        };
        break;

      case 'disk-full':
        incident = {
          id,
          type,
          title: 'Storage Volume 98% Full',
          description:
            'Log partition exhausted disk space. Crop harvest recordings failing to persist.',
          affectedBuildingId: buildingId,
          affectedServiceName: serviceName,
          severity: 'critical',
          resolved: false,
          detectedAt: Date.now(),
          productionPenaltyPercent: 60,
          remediationHint:
            'Inspect disk usage with `df -h` and clean rotated logs with `rm -rf /var/log/old/`.',
          suggestedCommand: 'df -h',
        };
        break;
    }

    this.activeIncidents.set(id, incident);
    return incident;
  }

  resolveIncident(id: string): boolean {
    const inc = this.activeIncidents.get(id);
    if (inc) {
      inc.resolved = true;
      inc.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  resolveIncidentsForService(serviceName: string): Incident[] {
    const resolved: Incident[] = [];
    for (const inc of this.activeIncidents.values()) {
      if (!inc.resolved && inc.affectedServiceName === serviceName) {
        inc.resolved = true;
        inc.resolvedAt = Date.now();
        resolved.push(inc);
      }
    }
    return resolved;
  }

  getActiveIncidents(): Incident[] {
    return Array.from(this.activeIncidents.values()).filter((i) => !i.resolved);
  }

  getAllIncidents(): Incident[] {
    return Array.from(this.activeIncidents.values());
  }
}
