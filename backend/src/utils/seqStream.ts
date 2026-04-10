// ---------------------------------------------------------------------------
// Seq CLEF stream — in-process Writable stream that batches pino ndjson
// log lines and POSTs them to Seq's /api/events/raw?clef endpoint.
//
// Using this instead of a pino worker-thread transport avoids ESM resolution
// issues inside Docker and keeps the transport fully synchronous.
// ---------------------------------------------------------------------------

import { Writable } from 'stream';
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

export function createSeqStream(opts: SeqStreamOptions): Writable {
  const { serverUrl, apiKey, batchSize = 10, flushIntervalMs = 500 } = opts;

  const parsedUrl = new URL('/api/events/raw?clef', serverUrl);
  const isHttps = parsedUrl.protocol === 'https:';
  const agent = isHttps ? https : http;

  let buffer: string[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    if (buffer.length === 0) return;

    const payload = buffer.join('\n');
    buffer = [];

    const options: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
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

  return new Writable({
    write(chunk: Buffer, _encoding: BufferEncoding, callback: () => void) {
      const line = chunk.toString().trim();
      if (line) buffer.push(line);

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

      callback();
    },

    final(callback: () => void) {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      flush();
      callback();
    },
  });
}
