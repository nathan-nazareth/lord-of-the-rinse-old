# Quickstart: Fix Blank White Screen Issue

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern code editor (VS Code recommended)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:5173` (default Vite port)

## Reproduce the Issue

1. Open browser developer tools (F12)
2. Navigate to the application URL
3. Observe if content loads or if blank screen appears
4. Check Console tab for errors
5. Check Network tab for failed resource requests

## Testing the Fix

### Cross-Browser Testing

Test in these browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Error Scenarios to Test

1. **CDN Failure Simulation**:
   - Block CDN domains in browser or network proxy
   - Verify fallback UI appears
   - Check console for error logging

2. **Component Error Simulation**:
   - Temporarily add error-throwing code to components
   - Verify ErrorBoundary catches error
   - Verify fallback UI displays

3. **Loading State**:
   - Throttle network to "Slow 3G" in dev tools
   - Verify loading spinner appears
   - Verify content loads within timeout period

## Development Workflow

### Running Locally

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Checking for Errors

1. **Browser Console**: Open dev tools → Console
2. **Terminal Output**: Watch for TypeScript errors
3. **Network Tab**: Verify all resources load successfully

## Files Modified

- `src/index.tsx` - Added ErrorBoundary wrapper, LoadingState wrapper, global error handlers, removed React.StrictMode
- `src/components/ErrorBoundary.tsx` - New component with getDerivedStateFromError and componentDidCatch
- `src/components/LoadingState.tsx` - New component with loading spinner and timeout fallback
- `src/components/FallbackUI.tsx` - New component for error display with retry button
- `src/utils/errorLogging.ts` - New utilities for structured error logging
- `index.html` - Added inline critical CSS as Tailwind CDN fallback

## Verification Checklist

- [ ] Application loads without blank screen in all browsers
- [ ] Console errors are logged with meaningful messages
- [ ] Loading spinner appears during resource loading
- [ ] Error fallback UI displays when errors occur
- [ ] Performance meets FCP < 1.5s, TTI < 3s targets
