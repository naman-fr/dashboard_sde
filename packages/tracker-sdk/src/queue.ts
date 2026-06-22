import { AnalyticsEvent } from '@analytics/shared-types';

export class EventQueue {
  private queue: AnalyticsEvent[] = [];
  private isProcessing: boolean = false;
  private apiUrl: string;
  private batchSize: number;

  constructor(apiUrl: string, batchSize: number = 10) {
    this.apiUrl = apiUrl;
    this.batchSize = batchSize;

    // Listen for unload to flush events
    window.addEventListener('beforeunload', () => this.flush(true));
  }

  public add(event: AnalyticsEvent) {
    this.queue.push(event);
    if (this.queue.length >= this.batchSize && !this.isProcessing) {
      this.flush();
    } else if (this.queue.length === 1 && !this.isProcessing) {
      // Setup a debounce for small amounts of events
      setTimeout(() => this.flush(), 2000);
    }
  }

  private async flush(isUnload = false) {
    if (this.queue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    const payload = JSON.stringify({ events: eventsToSend });

    if (isUnload && navigator.sendBeacon) {
      navigator.sendBeacon(`${this.apiUrl}/events`, payload);
      this.isProcessing = false;
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('[Analytics] Failed to send events, requeuing', error);
      // Re-queue events on failure
      this.queue = [...eventsToSend, ...this.queue];
    } finally {
      this.isProcessing = false;
    }
  }
}
