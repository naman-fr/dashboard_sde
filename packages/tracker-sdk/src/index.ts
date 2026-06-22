import { AnalyticsEvent, PageViewEvent, ClickEvent } from '@analytics/shared-types';
import { getOrCreateSessionId } from './session';
import { EventQueue } from './queue';

interface InitOptions {
  apiUrl: string;
  projectId?: string;
}

class AnalyticsTracker {
  private sessionId: string | null = null;
  private queue: EventQueue | null = null;
  private initialized = false;
  private lastPageUrl = '';

  public init(options: InitOptions) {
    if (this.initialized) {
      console.warn('[Analytics] Already initialized');
      return;
    }

    this.sessionId = getOrCreateSessionId();
    this.queue = new EventQueue(options.apiUrl);
    this.initialized = true;

    this.trackPageView();
    this.setupClickTracking();
    this.setupHistoryTracking();
    
    console.log('[Analytics] Initialized with session:', this.sessionId);
  }

  private setupHistoryTracking() {
    // Monkey patch pushState and replaceState to detect SPA navigations
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.trackPageView();
    };

    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  }

  private trackPageView() {
    const currentUrl = window.location.href;
    if (this.lastPageUrl === currentUrl) return; // Prevent duplicate page views
    
    this.lastPageUrl = currentUrl;

    const event: PageViewEvent = {
      sessionId: this.sessionId!,
      eventType: 'page_view',
      pageUrl: currentUrl,
      timestamp: Date.now(),
      metadata: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
    };

    this.queue?.add(event);
  }

  private setupClickTracking() {
    document.addEventListener('click', (e) => {
      const event: ClickEvent = {
        sessionId: this.sessionId!,
        eventType: 'click',
        pageUrl: window.location.href,
        timestamp: Date.now(),
        metadata: {
          x: e.clientX,
          y: e.clientY,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        },
      };

      this.queue?.add(event);
    }, { passive: true });
  }

  public trackCustom(eventName: string, metadata: any = {}) {
    // Simplified: our current schema only supports page_view and click.
    // In a real app we would extend the schema.
    console.warn('[Analytics] Custom events not supported in current schema yet.');
  }
}

// Export a singleton
const Analytics = new AnalyticsTracker();
export default Analytics;
