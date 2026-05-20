import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  logError,
  logResourceError,
  logUnhandledRejection,
  logWeb3FormsRateLimit,
  logWeb3FormsError,
  logWeb3FormsSuccess,
} from './errorLogging';

describe('errorLogging', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    logSpy.mockRestore();
  });

  describe('logError', () => {
    it('logs error with message and type', () => {
      const error = new Error('Something went wrong');
      logError(error, 'runtime');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.message).toBe('Something went wrong');
      expect(logged.type).toBe('runtime');
      expect(logged.timestamp).toBeDefined();
    });

    it('defaults to render type', () => {
      const error = new Error('Test error');
      logError(error);

      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.type).toBe('render');
    });

    it('includes stack trace when available', () => {
      const error = new Error('Test error');
      logError(error, 'runtime');

      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.stack).toBeDefined();
    });

    it('includes componentStack when info provided', () => {
      const error = new Error('Test error');
      const info = { componentStack: 'at Component (line 10)' };
      logError(error, 'render', info);

      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.componentStack).toBe('at Component (line 10)');
    });
  });

  describe('logResourceError', () => {
    it('logs script resource error', () => {
      const event = new Event('error') as Event & { target: HTMLScriptElement };
      Object.defineProperty(event, 'target', {
        value: document.createElement('script'),
        writable: true,
      });
      (event.target as HTMLScriptElement).src = 'https://example.com/bundle.js';

      logResourceError(event);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.message).toContain('bundle.js');
      expect(logged.type).toBe('resource');
    });

    it('logs link resource error', () => {
      const event = new Event('error') as Event & { target: HTMLLinkElement };
      Object.defineProperty(event, 'target', {
        value: document.createElement('link'),
        writable: true,
      });
      (event.target as HTMLLinkElement).href = 'https://example.com/style.css';

      logResourceError(event);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.message).toContain('style.css');
    });

    it('logs image resource error', () => {
      const event = new Event('error') as Event & { target: HTMLImageElement };
      Object.defineProperty(event, 'target', {
        value: document.createElement('img'),
        writable: true,
      });
      (event.target as HTMLImageElement).src = 'https://example.com/logo.png';

      logResourceError(event);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.message).toContain('logo.png');
    });
  });

  describe('logUnhandledRejection', () => {
    it('logs promise rejection with error message', () => {
      const reason = new Error('Promise rejected');
      const event = { reason } as PromiseRejectionEvent;

      logUnhandledRejection(event);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.message).toBe('Promise rejected');
      expect(logged.type).toBe('promise');
    });

    it('logs promise rejection without error object', () => {
      const event = { reason: 'Something went wrong' } as PromiseRejectionEvent;

      logUnhandledRejection(event);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.message).toBe('Something went wrong');
    });
  });

  describe('logWeb3FormsRateLimit', () => {
    it('logs rate limit event with order details', () => {
      logWeb3FormsRateLimit('order-123', 2, 3);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(warnSpy.mock.calls[0][1]);
      expect(logged.orderId).toBe('order-123');
      expect(logged.attempt).toBe(2);
      expect(logged.maxRetries).toBe(3);
      expect(logged.errorType).toBe('rate_limit');
    });
  });

  describe('logWeb3FormsError', () => {
    it('logs error with order ID and error type', () => {
      logWeb3FormsError('order-456', 'network_error', 'Connection timeout', 1);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.orderId).toBe('order-456');
      expect(logged.errorType).toBe('network_error');
      expect(logged.message).toBe('Connection timeout');
      expect(logged.attempt).toBe(1);
    });

    it('logs unauthorized error type', () => {
      logWeb3FormsError('order-789', 'unauthorized', 'Invalid API key');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(errorSpy.mock.calls[0][1]);
      expect(logged.errorType).toBe('unauthorized');
    });
  });

  describe('logWeb3FormsSuccess', () => {
    it('logs success event with order ID', () => {
      logWeb3FormsSuccess('order-abc');

      expect(logSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(logSpy.mock.calls[0][1]);
      expect(logged.orderId).toBe('order-abc');
      expect(logged.message).toBe('Web3Forms submission successful');
    });
  });
});
