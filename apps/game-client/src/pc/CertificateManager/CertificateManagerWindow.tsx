import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Key,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const CertificateManagerWindow: React.FC = () => {
  const serviceManager = useGameStore((s) => s.serviceManager);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);
  const checkMilestones = useGameStore((s) => s.checkMilestones);

  const [isIssuing, setIsIssuing] = useState(false);
  const [acmeLogs, setAcmeLogs] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('*.solar-grove.local');

  const certificates = serviceManager.getCertificates ? serviceManager.getCertificates() : [];
  const validCert = certificates.find((c) => c.status === 'VALID');

  const handleIssueCertificate = () => {
    setIsIssuing(true);
    setAcmeLogs([
      'Initiating ACME v2 certificate request...',
      'Account registered at https://acme-v02.api.letsencrypt.org/directory',
      `Performing HTTP-01 challenge for ${selectedDomain} on 10.0.0.10:80...`,
    ]);

    setTimeout(() => {
      setAcmeLogs((prev) => [
        ...prev,
        'Waiting for DNS and HTTP-01 challenge propagation...',
        'Challenge valid! Let\'s Encrypt CA verified ownership.',
      ]);
    }, 800);

    setTimeout(() => {
      const res = serviceManager.requestCertificate(selectedDomain);
      setAcmeLogs(res.logs);
      setIsIssuing(false);
      checkMilestones();
    }, 1800);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0a1410',
        color: '#e2e8f0',
        fontFamily: 'var(--font-display)',
        overflowY: 'auto',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#07100d',
          borderBottom: '1px solid rgba(72,187,120,0.35)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56,161,105,0.2)',
              border: '1px solid rgba(72,187,120,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={24} color="#68d391" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fff4' }}>
              CERTIFICATE MANAGER — TLS & ACME INGRESS
            </h1>
            <span style={{ fontSize: '12px', color: '#a0aec0', fontFamily: 'var(--font-mono)' }}>
              Let's Encrypt ACME v2 Client • Edge TLS Terminator (Nginx) • Automated 90-Day Renewal
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-solarpunk"
            onClick={() => setActiveWindow('network')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Network Console
          </button>
          <button
            type="button"
            className="btn-solarpunk btn-gold"
            onClick={handleIssueCertificate}
            disabled={isIssuing}
            style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isIssuing ? 'animate-spin' : ''} />
            {isIssuing ? 'Issuing Certificate...' : 'Request ACME Certificate'}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Certificate Health Overview Banner */}
        {validCert ? (
          <div
            style={{
              backgroundColor: 'rgba(72,187,120,0.12)',
              border: '1px solid #48bb78',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ShieldCheck size={28} color="#68d391" />
              <div>
                <div style={{ fontWeight: 800, color: '#f0fff4', fontSize: '14px' }}>
                  TLS Ingress Fully Operational
                </div>
                <div style={{ fontSize: '12px', color: '#c6f6d5', marginTop: '2px' }}>
                  Wildcard certificate <code style={{ color: '#ecc94b' }}>{validCert.domain}</code> is installed on Helio Relay. HTTPS browser traffic is encrypted and trusted.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-solarpunk btn-gold"
              onClick={() => {
                setBrowserUrl('https://greenhouse.solar-grove.local');
                setActiveWindow('browser');
              }}
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={14} /> Test in Browser
            </button>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'rgba(229,62,62,0.12)',
              border: '1px solid #e53e3e',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ShieldAlert size={28} color="#fc8181" />
              <div>
                <div style={{ fontWeight: 800, color: '#fed7d7', fontSize: '14px' }}>
                  TLS Certificate Missing / Untrusted
                </div>
                <div style={{ fontSize: '12px', color: '#feb2b2', marginTop: '2px' }}>
                  Browsers visiting <code style={{ color: '#ecc94b' }}>https://greenhouse.solar-grove.local</code> will trigger NET::ERR_CERT_COMMON_NAME_INVALID privacy warnings.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-solarpunk btn-gold"
              onClick={handleIssueCertificate}
              disabled={isIssuing}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Issue Automated Certificate
            </button>
          </div>
        )}

        {/* Certificates Table */}
        <div
          style={{
            backgroundColor: '#07100d',
            borderRadius: '8px',
            border: '1px solid rgba(72,187,120,0.3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(72,187,120,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '14px', color: '#f0fff4', fontWeight: 700 }}>
              Installed Edge TLS Certificates
            </h3>
            <span style={{ fontSize: '11px', color: '#a0aec0' }}>Storage: /etc/letsencrypt/live/</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(56,161,105,0.15)', color: '#68d391', borderBottom: '1px solid rgba(72,187,120,0.3)' }}>
                <th style={{ padding: '12px 16px' }}>Domain Name</th>
                <th style={{ padding: '12px 16px' }}>Certificate Authority</th>
                <th style={{ padding: '12px 16px' }}>Key Type</th>
                <th style={{ padding: '12px 16px' }}>Expires In</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => {
                const isValid = cert.status === 'VALID';

                return (
                  <tr key={cert.id} style={{ borderBottom: '1px solid rgba(72,187,120,0.15)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f0fff4', fontFamily: 'var(--font-mono)' }}>
                      {cert.domain}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#cbd5e0' }}>{cert.issuer}</td>
                    <td style={{ padding: '14px 16px', color: '#a0aec0', fontFamily: 'var(--font-mono)' }}>
                      {cert.keyType}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#cbd5e0' }}>
                      {isValid ? '89 days (Auto-renew)' : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {isValid ? (
                        <span
                          style={{
                            backgroundColor: 'rgba(72,187,120,0.2)',
                            color: '#68d391',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          VALID (TRUSTED)
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: 'rgba(229,62,62,0.2)',
                            color: '#fc8181',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          MISSING / UNCONFIGURED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-solarpunk"
                        onClick={handleIssueCertificate}
                        disabled={isIssuing}
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        {isValid ? 'Renew Certificate' : 'Issue ACME'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ACME Issuance Console Log */}
        {acmeLogs.length > 0 && (
          <div
            style={{
              backgroundColor: '#07100d',
              borderRadius: '8px',
              border: '1px solid rgba(72,187,120,0.3)',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ecc94b',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              <Terminal size={14} /> ACME Automation Logs (certbot / letsencrypt)
            </div>
            <div
              style={{
                backgroundColor: '#040907',
                padding: '12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#68d391',
                lineHeight: 1.6,
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {acmeLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Micro-Architecture Box */}
        <div
          style={{
            backgroundColor: '#0c1a15',
            borderRadius: '8px',
            border: '1px solid rgba(214,158,46,0.3)',
            padding: '20px',
          }}
        >
          <div style={{ color: '#ecc94b', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
            🔒 HOW TLS WORKS IN PRODUCTION
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e0', lineHeight: 1.7 }}>
            When clients connect to <code style={{ color: '#68d391' }}>https://greenhouse.solar-grove.local</code> on port 443, the Helio Relay terminates the TLS connection. It presents an X.509 certificate signed by a Certificate Authority (CA) like Let's Encrypt. Once the cryptographic handshake succeeds, HTTP requests are securely decrypted and proxied upstream over private subnets.
          </div>
        </div>
      </div>
    </div>
  );
};
