import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { crashReporter } from '@services/analytics/CrashReporter';
import { analyticsService } from '@services/analytics/AnalyticsService';
import { isProduction } from '@/config/performance';
import './index.css';

crashReporter.install();
analyticsService.track('app_boot');

const App = lazy(() => import('./App'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const app = (
  <Suspense fallback={<div className="app-loading">Loading…</div>}>
    <App />
  </Suspense>
);

createRoot(rootElement).render(
  isProduction ? app : <StrictMode>{app}</StrictMode>,
);
