import { analyticsService } from './AnalyticsService';

export interface CrashReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
}

/**
 * Global error boundary for uncaught errors — future: POST to crash ingestion endpoint.
 */
class CrashReporter {
  private installed = false;
  private reports: CrashReport[] = [];

  install(): void {
    if (this.installed || typeof window === 'undefined') return;
    this.installed = true;

    window.addEventListener('error', (event) => {
      this.capture(event.message, event.error?.stack);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      this.capture(message, stack);
    });
  }

  capture(message: string, stack?: string): void {
    const report: CrashReport = {
      message,
      stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
    this.reports.push(report);
    if (this.reports.length > 20) this.reports.shift();

    analyticsService.track('error', { message: message.slice(0, 200) });

    const endpoint = import.meta.env.VITE_CRASH_REPORT_ENDPOINT;
    if (endpoint) {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
        keepalive: true,
      });
    }

    if (import.meta.env.DEV) {
      console.error('[crash]', report);
    }
  }

  getReports(): readonly CrashReport[] {
    return this.reports;
  }
}

export const crashReporter = new CrashReporter();
