import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { CalendarProvider } from './context/CalendarContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { usePageViewTracker } from './lib/page-view-tracker';
import Home from './pages/Home';
const Membership = React.lazy(() => import('./pages/Membership'));
const Shop = React.lazy(() => import('./pages/Shop'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Training = React.lazy(() => import('./pages/Training'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Programs = React.lazy(() => import('./pages/Programs'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation'));
const Outreach = React.lazy(() => import('./pages/Outreach'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));

const PUBLIC_PATHS = [
  '/membership',
  '/outreach',
  '/calendar',
  '/training',
  '/programs',
  '/shop',
  '/checkout',
  '/order-confirmation',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
] as const;

const App: React.FC = () => {
  // Simple Hash Router Implementation
  // Support both /#/admin (hash) and /admin (pathname) for admin access
  const getPath = () => {
    const raw = window.location.hash.slice(1);
    const path = raw ? raw.split('?')[0] : '';
    if (path) return path;
    // Support direct routes such as /membership as well as GitHub Pages-style
    // /LordsGym/membership paths. Hash navigation remains the canonical client route.
    const p = window.location.pathname.replace(/\/$/, '') || '/';
    if (p === '/admin' || p.endsWith('/admin')) return '/admin';
    const directPublicPath = PUBLIC_PATHS.find((candidate) => p === candidate || p.endsWith(candidate));
    if (directPublicPath) return directPublicPath;
    return '/';
  };
  const [currentPath, setCurrentPath] = useState(getPath());

  // Track page views for analytics (excludes /admin)
  usePageViewTracker(currentPath);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(getPath());
    const handlePopState = () => setCurrentPath(getPath());
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // When visiting /admin via pathname, fix URL to /#/admin for consistency
  useEffect(() => {
    const p = window.location.pathname;
    // IMPORTANT: If we are landing from an OAuth callback, the URL will contain
    // query params (e.g. ?code=...), and Supabase needs them to complete login.
    // Only normalize to hash routing when there are no query params.
    if ((p === '/admin' || p.endsWith('/admin') || p.endsWith('/admin/')) && !window.location.hash && !window.location.search) {
      const base = import.meta.env.BASE_URL || '/';
      window.history.replaceState(null, '', base + '#/admin');
    }
  }, []);

  // Ensure page scrolls to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home onNavigate={navigate} />;
      case '/membership':
        return <Membership />;
      case '/outreach':
        return <Outreach />;
      case '/calendar':
        return <Calendar />;
      case '/training':
        return <Training />;
      case '/programs':
        return <Programs />;
      case '/shop':
        return <Shop />;
      case '/checkout':
        return <Checkout onSuccess={() => navigate('/order-confirmation')} onNavigate={navigate} />;
      case '/order-confirmation':
        return <OrderConfirmation />;
      case '/about':
        return <About />;
      case '/contact':
        return <Contact />;
      case '/privacy':
        return <Privacy />;
      case '/terms':
        return <Terms />;
      case '/admin':
        return <Admin />;
      
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  const page = (
    <React.Suspense fallback={<main className="min-h-[60vh] pt-32 text-center" aria-live="polite">Loading page…</main>}>
      {renderPage()}
    </React.Suspense>
  );

  // If Admin, don't show the standard Layout (Admin has its own sidebar)
  if (currentPath === '/admin') {
     return (
       <ErrorBoundary>
         <ToastProvider>
          <AuthProvider>
            <StoreProvider>
              <CalendarProvider>
                <div className="fade-in">{page}</div>
              </CalendarProvider>
            </StoreProvider>
          </AuthProvider>
         </ToastProvider>
       </ErrorBoundary>
     );
  }

  if (currentPath === '/calendar') {
    return (
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <StoreProvider>
              <CalendarProvider>
                <Layout currentPath={currentPath} onNavigate={navigate}>
                  {page}
                </Layout>
              </CalendarProvider>
            </StoreProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <StoreProvider>
          <Layout currentPath={currentPath} onNavigate={navigate}>
            {page}
          </Layout>
        </StoreProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
