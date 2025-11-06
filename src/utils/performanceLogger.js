// Performance logging utility
// Set to false in production to disable logs
const ENABLE_PERF_LOGS = process.env.NODE_ENV === 'development';

class PerformanceLogger {
  constructor() {
    this.timers = new Map();
  }

  // Start a timer
  start(label, context = {}) {
    if (!ENABLE_PERF_LOGS) return;

    const startTime = performance.now();
    this.timers.set(label, { startTime, context });

    console.log(`⏱️  [PERF] Starting: ${label}`, context);
  }

  // End a timer and log the duration
  end(label, additionalContext = {}) {
    if (!ENABLE_PERF_LOGS) return;

    const timer = this.timers.get(label);
    if (!timer) {
      console.warn(`⚠️  [PERF] No timer found for: ${label}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    const color = this.getColorForDuration(duration);

    console.log(
      `%c✓ [PERF] ${label}: ${duration.toFixed(2)}ms`,
      `color: ${color}; font-weight: bold`,
      { ...timer.context, ...additionalContext }
    );

    this.timers.delete(label);
    return duration;
  }

  // Log a query with its duration
  logQuery(queryName, duration, rowCount = null, error = null) {
    if (!ENABLE_PERF_LOGS) return;

    const color = this.getColorForDuration(duration);
    const status = error ? '❌' : '✓';
    const rows = rowCount !== null ? ` (${rowCount} rows)` : '';

    console.log(
      `%c${status} [QUERY] ${queryName}: ${duration.toFixed(2)}ms${rows}`,
      `color: ${color}; font-weight: bold`,
      error || ''
    );
  }

  // Measure a Supabase query
  async measureQuery(queryName, queryPromise) {
    if (!ENABLE_PERF_LOGS) {
      return await queryPromise;
    }

    const startTime = performance.now();

    try {
      const result = await queryPromise;
      const duration = performance.now() - startTime;
      const rowCount = Array.isArray(result.data) ? result.data.length : null;

      this.logQuery(queryName, duration, rowCount, result.error);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.logQuery(queryName, duration, null, error);
      throw error;
    }
  }

  // Log component render time
  logRender(componentName, renderTime) {
    if (!ENABLE_PERF_LOGS) return;

    const color = this.getColorForDuration(renderTime);
    console.log(
      `%c🎨 [RENDER] ${componentName}: ${renderTime.toFixed(2)}ms`,
      `color: ${color}; font-weight: bold`
    );
  }

  // Get color based on duration (green = fast, yellow = medium, red = slow)
  getColorForDuration(duration) {
    if (duration < 100) return '#22c55e'; // green
    if (duration < 500) return '#eab308'; // yellow
    if (duration < 1000) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  // Log a summary of all pending timers (useful for debugging)
  logPendingTimers() {
    if (!ENABLE_PERF_LOGS) return;

    if (this.timers.size === 0) {
      console.log('✓ [PERF] No pending timers');
      return;
    }

    console.group('⚠️  [PERF] Pending timers:');
    this.timers.forEach((timer, label) => {
      const elapsed = performance.now() - timer.startTime;
      console.log(`- ${label}: ${elapsed.toFixed(2)}ms (still running)`, timer.context);
    });
    console.groupEnd();
  }

  // Measure page load time
  measurePageLoad(pageName) {
    if (!ENABLE_PERF_LOGS) return;

    // Use Navigation Timing API
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

        console.group(`📄 [PAGE] ${pageName} Load Metrics`);
        console.log(`Total page load: ${pageLoadTime}ms`);
        console.log(`DOM ready: ${domReadyTime}ms`);
        console.log(`DNS lookup: ${perfData.domainLookupEnd - perfData.domainLookupStart}ms`);
        console.log(`TCP connection: ${perfData.connectEnd - perfData.connectStart}ms`);
        console.log(`Request time: ${perfData.responseEnd - perfData.requestStart}ms`);
        console.log(`DOM processing: ${perfData.domComplete - perfData.domLoading}ms`);
        console.groupEnd();
      }, 0);
    });
  }
}

// Create singleton instance
const perfLogger = new PerformanceLogger();

export default perfLogger;
