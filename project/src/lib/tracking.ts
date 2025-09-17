import { trackPageView, trackEvent } from './analytics';
import toast from 'react-hot-toast';

let sessionId: string;
let sessionStart: number;
let lastInteraction: number;

export function initializeTracking() {
  // Generate or retrieve session ID
  sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
  sessionStorage.setItem('sessionId', sessionId);
  
  // Record session start time
  sessionStart = Date.now();
  lastInteraction = sessionStart;
  sessionStorage.setItem('sessionStart', sessionStart.toString());

  // Track initial page view
  trackInitialPageView();

  // Set up tracking
  setupNavigationTracking();
  setupErrorTracking();
  setupInteractionTracking();
  setupIdleTracking();
}

function trackInitialPageView() {
  trackPageView({
    page: window.location.pathname,
    session_id: sessionId,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    device_type: getDeviceType()
  });
}

function setupNavigationTracking() {
  // Track history changes
  const originalPushState = history.pushState;
  history.pushState = function(...args: [data: unknown, unused: string, url?: string | URL | null | undefined]) {
    originalPushState.apply(this, args);
    handleNavigation();
  };

  window.addEventListener('popstate', handleNavigation);
  window.addEventListener('beforeunload', handleBeforeUnload);
}

function setupErrorTracking() {
  window.addEventListener('error', (event) => {
    trackEvent({
      event_type: 'error',
      event_data: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      },
      session_id: sessionId,
      page_url: window.location.href
    });

    // Only show toast in development
    if (import.meta.env.MODE === 'development') {
      toast.error('An error occurred. Check console for details.');
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackEvent({
      event_type: 'unhandled_rejection',
      event_data: {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      },
      session_id: sessionId,
      page_url: window.location.href
    });
  });
}

function setupInteractionTracking() {
  const interactionEvents = ['click', 'scroll', 'keypress', 'mousemove', 'touchstart'];
  
  interactionEvents.forEach(eventType => {
    window.addEventListener(eventType, () => {
      lastInteraction = Date.now();
    }, { passive: true });
  });
}

function setupIdleTracking() {
  // Check for idle time every minute
  setInterval(() => {
    const idleTime = Date.now() - lastInteraction;
    if (idleTime > 5 * 60 * 1000) { // 5 minutes
      trackEvent({
        event_type: 'user_idle',
        event_data: {
          idle_duration_ms: idleTime
        },
        session_id: sessionId,
        page_url: window.location.href
      });
    }
  }, 60 * 1000);
}

function handleNavigation() {
  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  trackPageView({
    page: window.location.pathname,
    session_id: sessionId,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    device_type: getDeviceType()
  });

  // Track navigation event
  trackEvent({
    event_type: 'navigation',
    event_data: {
      from: document.referrer,
      to: window.location.pathname
    },
    session_id: sessionId,
    page_url: window.location.href
  });
}

function handleBeforeUnload() {
  const duration = Date.now() - sessionStart;
  
  trackPageView({
    page: 'exit',
    session_id: sessionId,
    referrer: window.location.pathname,
    duration_ms: duration,
    user_agent: navigator.userAgent,
    device_type: getDeviceType()
  });

  // Clear session data
  sessionStorage.removeItem('sessionId');
  sessionStorage.removeItem('sessionStart');
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function getSessionId() {
  return sessionId;
}