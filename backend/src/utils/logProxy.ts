// ---------------------------------------------------------------------------
// Proxy-based auto-logging for controller / service classes
// ---------------------------------------------------------------------------

import { createLogger } from './logger.js';

type LogLayer = 'controller' | 'service' | 'repository';

/**
 * Wrap an object so that every method call is automatically logged at
 * entry, exit and error — zero boilerplate inside the business code.
 */
export function withLayerLogging<T extends object>(
  target: T,
  domain: string,
  layer: LogLayer,
): T {
  const log = createLogger(domain, layer);

  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (typeof value !== 'function') return value;

      return async function (this: unknown, ...args: unknown[]) {
        const method = String(prop);
        log.debug({ method, argsCount: args.length }, `→ ${method}`);
        const start = performance.now();

        try {
          const result = await (value as Function).apply(this ?? obj, args);
          const ms = (performance.now() - start).toFixed(1);
          log.debug({ method, ms }, `← ${method} (${ms} ms)`);
          return result;
        } catch (err) {
          const ms = (performance.now() - start).toFixed(1);
          log.error({ method, ms, err }, `✗ ${method} failed`);
          throw err;
        }
      };
    },
  });
}

/**
 * Convenience helper for controller modules exported as singletons.
 *
 * ```ts
 * export default tracedControllerModule(new BookingController(), 'booking');
 * ```
 */
export function tracedControllerModule<T extends object>(
  instance: T,
  domain: string,
): T {
  return withLayerLogging(instance, domain, 'controller');
}
