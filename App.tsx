import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { CalendarProvider } from './context/CalendarContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { usePageViewTracker } from './lib/page-view-tracker';
import Home from './pages/Home';
import Membership from './pages/Membership';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Training from './pages/Training';
import Admin from './pages/Admin';
import Programs from './pages/Programs';
import Calendar from './pages/Calendar';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Outreach from './pages/Outreach';

const App: React.FC = () => {
  // Simple Hash Router Implementation
  // Support both /#/admin (hash) and /admin (pathname) for admin access
  const getPath = () => {
    const raw = window.location.hash.slice(1);
    const path = raw ? raw.split('?')[0] : '';
    if (path) return path;
    // Support /admin and /LordsGym/admin (GitHub Pages base path)
    const p = window.location.pathname;
    if (p === '/admin' || p.endsWith('/admin') || p.endsWith('/admin/')) return '/admin';
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
        return <Checkout onSuccess={() => navigate('/order-confirmation')} />;
      case '/order-confirmation':
        return <OrderConfirmation />;
      case '/about':
        return <About />;
      case '/contact':
        return <Contact />;
      case '/admin':
        return <Admin />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  // If Admin, don't show the standard Layout (Admin has its own sidebar)
  if (currentPath === '/admin') {
     return (
       <ErrorBoundary>
         <ToastProvider>
           <AuthProvider>
             <StoreProvider>
               <CalendarProvider>
                 <div className="fade-in">{renderPage()}</div>
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
        <AuthProvider>
          <StoreProvider>
            <CalendarProvider>
              <Layout currentPath={currentPath} onNavigate={navigate}>
                <div className="fade-in">
                  {renderPage()}
                </div>
              </Layout>
            </CalendarProvider>
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
