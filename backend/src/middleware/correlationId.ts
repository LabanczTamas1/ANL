// ---------------------------------------------------------------------------
// Correlation-ID middleware — AsyncLocalStorage per-request UUID
// ---------------------------------------------------------------------------

import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export const correlationStore = new AsyncLocalStorage<string>();

/**
 * Attach a unique correlation ID to every request.
 * Uses the incoming `X-Request-Id` header if present, otherwise generates one.
 * The ID is stored in AsyncLocalStorage so any code in the call chain can read it.
 */
export function correlationId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.correlationId = id;
  res.setHeader('X-Request-Id', id);

  correlationStore.run(id, () => next());
}

/** Retrieve the current correlation ID (if running inside a request). */
export function getCorrelationId(): string | undefined {
  return correlationStore.getStore();
}
