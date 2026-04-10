// ---------------------------------------------------------------------------
// Seq CLEF stream — pino DestinationStream that batches ndjson log lines,
// converts them from pino format → CLEF, and POSTs to Seq's ingestion API.
//
// Pino: { level, time, pid, hostname, msg, ...rest }
// CLEF: { @t, @l, @mt, @p (pid), ...rest }
// ---------------------------------------------------------------------------

import http from 'http';
import https from 'https';

interface SeqStreamOptions {
  serverUrl: string;
  apiKey?: string;
  /** How many lines to buffer before flushing (default: 10) */
  batchSize?: number;
  /** Max ms to wait before flushing a partial batch (default: 500) */
  flushIntervalMs?: number;
}

/** pino DestinationStream compatible interface */
export interface SeqDestinationStream {
  write(msg: string): void;
}

const PINO_TO_CLEF_LEVEL: Record<number, string> = {
  10: 'Verbose',
  20: 'Debug',
  30: 'Information',
  40: 'Warning',
  50: 'Error',
  60: 'Fatal',
};

/** Convert a pino ndjson line to a CLEF object */
function pinoToClef(line: string): string | null {
  try {
    const parsed = JSON.parse(line);

    // Extract and remove pino-specific fields
    const { level, time, pid, hostname, msg, ...rest } = parsed;

    const clef: Record<string, unknown> = {
      '@t': typeof time === 'string' ? time : new Date(time).toISOString(),
      '@mt': msg ?? '',
      '@l': PINO_TO_CLEF_LEVEL[level as number] ?? 'Information',
    };

    if (pid !== undefined) clef['pid'] = pid;
    if (hostname !== undefined) clef['hostname'] = hostname;

    // Merge remaining structured fields
    Object.assign(clef, rest);

    return JSON.stringify(clef);
  } catch {
    return null;
  }
}

export function createSeqStream(opts: SeqStreamOptions): SeqDestinationStream {
  const { serverUrl, apiKey, batchSize = 10, flushIntervalMs = 500 } = opts;

  const parsedUrl = new URL('/api/events/raw?clef', serverUrl);
  const isHttps = parsedUrl.protocol === 'https:';
  const agent = isHttps ? https : http;
  const port = parsedUrl.port || (isHttps ? '443' : '80');

  let buffer: string[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    if (buffer.length === 0) return;

    const payload = buffer.join('\n');
    buffer = [];

    const options: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.serilog.clef',
        'Content-Length': Buffer.byteLength(payload),
        ...(apiKey ? { 'X-Seq-ApiKey': apiKey } : {}),
      },
    };

    const req = agent.request(options, (res) => {
      res.resume(); // drain and discard response body
    });

    req.on('error', () => {
      // Non-fatal — never crash the app because a log destination is down
    });

    req.write(payload);
    req.end();
  }

  return {
    write(msg: string) {
      const clef = pinoToClef(msg.trim());
      if (!clef) return;

      buffer.push(clef);

      if (buffer.length >= batchSize) {
        if (flushTimer) {
          clearTimeout(flushTimer);
          flushTimer = null;
        }
        flush();
      } else if (!flushTimer) {
        flushTimer = setTimeout(() => {
          flush();
          flushTimer = null;
        }, flushIntervalMs);
      }
    },
  };
}


