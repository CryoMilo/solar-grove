import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Droplets,
  Gauge,
  Globe,
  Lock,
  Pause,
  Play,
  RefreshCw,
  Search,
  Terminal,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const BrowserWindow: React.FC = () => {
  const browserUrl = useGameStore((s) => s.browserUrl);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);
  const [inputUrl, setInputUrl] = useState(browserUrl);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const serviceManager = useGameStore((s) => s.serviceManager);
  const dispatchHttp = useGameStore((s) => s.dispatchHttp);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const farmState = useGameStore((s) => s.farmState);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = inputUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `http://${formatted}`;
    }
    setBrowserUrl(formatted);
    setInputUrl(formatted);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const loadBookmark = (url: string) => {
    setInputUrl(url);
    setBrowserUrl(url);
  };

  // Inspect simulated target via HTTP dispatcher (PRD §16)
  const httpResponse = dispatchHttp(browserUrl);
  const isErrConnectionRefused =
    httpResponse.error?.includes('ERR_CONNECTION_REFUSED') || httpResponse.statusCode === 0;

  const isIrrigationUrl =
    browserUrl.includes('irrigation.local') ||
    browserUrl.includes(':8080') ||
    browserUrl.includes(':3000');
  const isGreenhouseUrl = browserUrl.includes('greenhouse.local') || browserUrl.includes(':4000');
  const isDocsUrl = browserUrl.includes('docs.local');

  const telemetry = serviceManager.getIrrigationTelemetry();
  const isPumping = serviceManager.isIrrigationActivelyPumping();
  const isIrrRunning = !isErrConnectionRefused && isIrrigationUrl;
  const isGhRunning = !isErrConnectionRefused && isGreenhouseUrl;

  const handleToggleIrrigation = (start: boolean) => {
    const endpoint = start
      ? 'http://irrigation.local:8080/api/irrigation/start'
      : 'http://irrigation.local:8080/api/irrigation/stop';
    dispatchHttp(endpoint, { method: 'POST' });
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 200);
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
      }}
    >
      {/* Browser Chrome Toolbar */}
      <div
        style={{
          backgroundColor: '#07100d',
          borderBottom: '1px solid rgba(214,158,46,0.3)',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Navigation & Address Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="btn-solarpunk"
              style={{ padding: '5px', opacity: 0.6 }}
              disabled
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              className="btn-solarpunk"
              style={{ padding: '5px', opacity: 0.6 }}
              disabled
            >
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="btn-solarpunk"
              onClick={handleRefresh}
              style={{ padding: '5px' }}
              title="Reload Page"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* URL Input Form */}
          <form
            onSubmit={handleNavigate}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#0a1813',
              border: '1px solid rgba(72,187,120,0.35)',
              borderRadius: '6px',
              padding: '4px 12px',
              gap: '8px',
            }}
          >
            <Lock size={12} color="#68d391" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                outline: 'none',
                width: '100%',
              }}
            />
            <button
              type="submit"
              className="btn-solarpunk"
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              Go
            </button>
          </form>
        </div>

        {/* Bookmarks Bar */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
          <span style={{ color: '#718096', padding: '2px 4px' }}>BOOKMARKS:</span>
          <button
            type="button"
            className="btn-solarpunk"
            onClick={() => loadBookmark('http://irrigation.local:8080')}
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            💧 irrigation.local:8080
          </button>
          <button
            type="button"
            className="btn-solarpunk"
            onClick={() => loadBookmark('http://greenhouse.local:4000')}
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            🌿 greenhouse.local:4000
          </button>
          <button
            type="button"
            className="btn-solarpunk"
            onClick={() => loadBookmark('http://docs.local')}
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            📖 docs.local
          </button>
        </div>
      </div>

      {/* Rendered Web Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#0e1e17',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {/* SCENARIO 1: Irrigation Controller Web Page */}
        {isIrrigationUrl &&
          (isIrrRunning ? (
            <div
              className="glass-panel frame-solarpunk"
              style={{
                width: '100%',
                maxWidth: '750px',
                padding: '28px',
                position: 'relative',
              }}
            >
              <div className="rivet rivet-tl" />
              <div className="rivet rivet-tr" />
              <div className="rivet rivet-bl" />
              <div className="rivet rivet-br" />

              {/* Application Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(214,158,46,0.3)',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '22px',
                      color: '#ecc94b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Droplets size={24} color="#63b3ed" />
                    <span>IRRIGATION CONTROLLER</span>
                  </h1>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#cbd5e0',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Host: irrigation.local:8080 • Version: 1.4.2
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(72,187,120,0.2)',
                    border: '1px solid #48bb78',
                    color: '#68d391',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Real-time Telemetry Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#07100d',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(72,187,120,0.25)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#a0aec0',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    RESERVOIR CAPACITY
                  </div>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#4299e1',
                    }}
                  >
                    {Math.round((farmState.water / farmState.maxWater) * 100)}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>
                    {farmState.water} L / {farmState.maxWater} L
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#07100d',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(72,187,120,0.25)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#a0aec0',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    SOIL MOISTURE
                  </div>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: isPumping ? '#48bb78' : '#ecc94b',
                    }}
                  >
                    {isPumping ? '88%' : `${telemetry.soilMoisturePct}%`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>Optimal range: 70–95%</div>
                </div>

                <div
                  style={{
                    backgroundColor: '#07100d',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(72,187,120,0.25)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#a0aec0',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    ACTIVE ZONES
                  </div>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#ecc94b',
                    }}
                  >
                    {isPumping ? `${telemetry.activeZones} / ${telemetry.maxZones}` : '0 / 5'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>Furrow manifolds online</div>
                </div>
              </div>

              {/* Interactive Controller Actions (PRD Section 15 & 70) */}
              <div
                style={{
                  backgroundColor: '#07100d',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(214,158,46,0.3)',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '15px',
                        color: '#f0fff4',
                      }}
                    >
                      Aquifer Valve Actuation
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#a0aec0',
                      }}
                    >
                      Actuate solar submersible pumps to irrigate farm plots automatically.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {isPumping ? (
                      <button
                        type="button"
                        className="btn-solarpunk"
                        onClick={() => handleToggleIrrigation(false)}
                        style={{
                          background: 'rgba(229,62,62,0.25)',
                          borderColor: '#e53e3e',
                          color: '#fc8181',
                          padding: '8px 16px',
                          fontSize: '13px',
                        }}
                      >
                        <Pause size={15} /> Stop Irrigation
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-solarpunk btn-gold"
                        onClick={() => handleToggleIrrigation(true)}
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        <Play size={15} /> Start Irrigation
                      </button>
                    )}
                  </div>
                </div>

                {isPumping && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(72,187,120,0.15)',
                      borderRadius: '4px',
                      color: '#9ae6b4',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={14} color="#48bb78" />
                    <span>
                      Automatic irrigation active: Crops hydrating continuously (+4%/s). Fast-growth
                      multiplier engaged (+50%).
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* SCENARIO 1B: Connection Refused Error Screen (PRD §17 & §71) */
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                textAlign: 'left',
                backgroundColor: '#07100d',
                padding: '36px',
                borderRadius: '10px',
                border: '1px solid rgba(229,62,62,0.4)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <AlertTriangle size={36} color="#fc8181" />
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      color: '#fed7d7',
                    }}
                  >
                    This site can’t be reached
                  </h2>
                  <span
                    style={{
                      color: '#feb2b2',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    irrigation.local refused to connect.
                  </span>
                </div>
              </div>

              <p style={{ color: '#cbd5e0', fontSize: '13px', lineHeight: 1.6 }}>
                The web server at{' '}
                <strong style={{ color: '#ecc94b' }}>irrigation.local:8080</strong> is not accepting
                connections. The service process has stopped or crashed with an unexpected error.
              </p>

              <div
                style={{
                  backgroundColor: '#0a1813',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(214,158,46,0.25)',
                  margin: '20px 0',
                }}
              >
                <div
                  style={{
                    color: '#ecc94b',
                    fontWeight: 700,
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  DIAGNOSTIC HINTS (PRD §21 & §71):
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '12px',
                    color: '#cbd5e0',
                    lineHeight: 1.8,
                  }}
                >
                  <li>
                    Check running processes: <code style={{ color: '#68d391' }}>ps</code> or{' '}
                    <code style={{ color: '#68d391' }}>systemctl status irrigation-controller</code>
                  </li>
                  <li>
                    Inspect failure crash logs:{' '}
                    <code style={{ color: '#68d391' }}>journalctl -u irrigation-controller</code>
                  </li>
                  <li>
                    Restart the service:{' '}
                    <code style={{ color: '#68d391' }}>
                      systemctl restart irrigation-controller
                    </code>
                  </li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-solarpunk btn-gold"
                  onClick={() => setActiveWindow('terminal')}
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  <Terminal size={15} /> Troubleshoot in Terminal
                </button>
                <button
                  type="button"
                  className="btn-solarpunk"
                  onClick={handleRefresh}
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  fontSize: '11px',
                  color: '#718096',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ERR_CONNECTION_REFUSED
              </div>
            </div>
          ))}

        {/* SCENARIO 2: Greenhouse Controller API Web Page */}
        {isGreenhouseUrl &&
          (isGhRunning ? (
            <div
              className="glass-panel frame-solarpunk"
              style={{ width: '100%', maxWidth: '750px', padding: '28px' }}
            >
              <div className="rivet rivet-tl" />
              <div className="rivet rivet-tr" />
              <div className="rivet rivet-bl" />
              <div className="rivet rivet-br" />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(214,158,46,0.3)',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '22px',
                      color: '#ecc94b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Zap size={24} color="#48bb78" />
                    <span>VERDANT GLASSHOUSE API</span>
                  </h1>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#cbd5e0',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Host: greenhouse.local:4000 • Container: solar-grove/greenhouse-controller:v1.2
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(72,187,120,0.2)',
                    border: '1px solid #48bb78',
                    color: '#68d391',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  CONTAINER ACTIVE
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#07100d',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#a0aec0', fontSize: '11px', fontWeight: 700 }}>
                    TEMPERATURE
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#f6ad55' }}>24.5 °C</div>
                </div>
                <div
                  style={{
                    backgroundColor: '#07100d',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#a0aec0', fontSize: '11px', fontWeight: 700 }}>
                    HUMIDITY
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#4fd1c5' }}>68 %</div>
                </div>
                <div
                  style={{
                    backgroundColor: '#07100d',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#a0aec0', fontSize: '11px', fontWeight: 700 }}>
                    YIELD BONUS
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#68d391' }}>+40 %</div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#07100d',
                padding: '36px',
                borderRadius: '10px',
                border: '1px solid rgba(229,62,62,0.4)',
              }}
            >
              <h2 style={{ color: '#fed7d7', margin: '0 0 8px 0' }}>
                greenhouse.local refused to connect
              </h2>
              <p style={{ color: '#cbd5e0', fontSize: '13px' }}>
                The greenhouse container is not listening on port 4000. Start it in the terminal
                using{' '}
                <code style={{ color: '#68d391' }}>
                  docker run -p 4000:4000 solar-grove/greenhouse-controller
                </code>
                .
              </p>
              <button
                type="button"
                className="btn-solarpunk btn-gold"
                onClick={() => setActiveWindow('terminal')}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <Terminal size={15} /> Open Terminal
              </button>
            </div>
          ))}

        {/* SCENARIO 3: Technical Docs Manual */}
        {isDocsUrl && (
          <div
            className="glass-panel frame-solarpunk"
            style={{ width: '100%', maxWidth: '750px', padding: '28px' }}
          >
            <div className="rivet rivet-tl" />
            <div className="rivet rivet-tr" />
            <div className="rivet rivet-bl" />
            <div className="rivet rivet-br" />

            <h1 style={{ color: '#ecc94b', fontSize: '22px', margin: '0 0 16px 0' }}>
              📖 Solarpunk Infrastructure Field Manual
            </h1>
            <p style={{ color: '#cbd5e0', fontSize: '13px', lineHeight: 1.6 }}>
              In Solar Grove, every agricultural building represents physical hardware powered by
              backend software daemons and containers.
            </p>

            <div
              style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ backgroundColor: '#07100d', padding: '12px', borderRadius: '6px' }}>
                <strong style={{ color: '#68d391' }}>1. Linux Daemons & Systemd:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>
                  Manage background system units with <code>systemctl status &lt;svc&gt;</code> and{' '}
                  <code>systemctl restart &lt;svc&gt;</code>.
                </p>
              </div>

              <div style={{ backgroundColor: '#07100d', padding: '12px', borderRadius: '6px' }}>
                <strong style={{ color: '#4fd1c5' }}>2. Port Mapping & Networking:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>
                  Verify open ports using <code>ss -tulpn</code> or{' '}
                  <code>curl http://localhost:&lt;port&gt;</code>.
                </p>
              </div>

              <div style={{ backgroundColor: '#07100d', padding: '12px', borderRadius: '6px' }}>
                <strong style={{ color: '#ecc94b' }}>3. Containers & Isolation:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>
                  Containers run packaged microservices. Use <code>docker ps</code> and{' '}
                  <code>docker logs</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 4: NXDOMAIN Unknown URL */}
        {!isIrrigationUrl && !isGreenhouseUrl && !isDocsUrl && (
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#07100d',
              padding: '30px',
              borderRadius: '8px',
              border: '1px solid rgba(229,62,62,0.3)',
              textAlign: 'center',
            }}
          >
            <Globe size={40} color="#fc8181" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ color: '#fed7d7', margin: '0 0 6px 0' }}>Could not resolve host</h3>
            <p style={{ color: '#a0aec0', fontSize: '12px' }}>
              The domain <strong style={{ color: '#fff' }}>{browserUrl}</strong> is not configured
              in simulated DNS (/etc/hosts). Try visiting <code>http://irrigation.local:8080</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
