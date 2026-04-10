// ---------------------------------------------------------------------------
// Seq CLEF stream — pino DestinationStream that batches ndjson log lines
// and POSTs them to Seq's /api/events/raw?clef endpoint.
//
// Implemented as a plain DestinationStream (write(msg: string) interface)
// which is what pino.multistream actually calls, avoiding any Node.js
// WritableStream backpressure / _write routing issues.
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
      const line = msg.trim();
      if (!line) return;

      buffer.push(line);

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

