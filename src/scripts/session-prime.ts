import { primeSessionCache } from './session-manager';

const defaults = (window as any).__KRAKEN_AUTH_DEFAULTS;
if (defaults?.apiBase) {
  primeSessionCache(defaults.apiBase);
}
