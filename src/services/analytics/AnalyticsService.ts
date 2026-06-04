import { isAnalyticsEnabled, isProduction } from '@/config/performance';

export type AnalyticsEvent =
  | 'app_boot'
  | 'level_start'
  | 'level_complete'
  | 'level_fail'
  | 'save_auto'
  | 'save_manual'
  | 'scene_change'
  | 'error';

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | null | undefined;
}

interface QueuedEvent {
  name: AnalyticsEvent;
  payload: AnalyticsPayload;
  timestamp: number;
}

/**
 * Telemetry facade — queues events locally; plug CDN/analytics SDK at flush().
 */
class AnalyticsService {
  private queue: QueuedEvent[] = [];
  private sessionId = `sess-${Date.now()}`;

  track(name: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
    const event: QueuedEvent = {
      name,
      payload: { ...payload, sessionId: this.sessionId },
      timestamp: Date.now(),
    };

    if (!isProduction) {
      console.debug('[analytics]', event.name, event.payload);
    }

    if (!isAnalyticsEnabled) {
      this.queue.push(event);
      if (this.queue.length > 100) this.queue.shift();
      return;
    }

    void this.flush([event]);
  }

  async flush(events: QueuedEvent[] = this.queue): Promise<void> {
    if (events.length === 0) return;
    const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    if (!endpoint) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true,
      });
      this.queue = [];
    } catch {
      // Retain queue for a future retry
    }
  }

  getQueuedCount(): number {
    return this.queue.length;
  }
}

export const analyticsService = new AnalyticsService();
