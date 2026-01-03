
import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
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

const App: React.FC = () => {
  // Simple Hash Router Implementation
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.slice(1) || '/';
      setCurrentPath(path);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
       <StoreProvider>
         <div className="fade-in">{renderPage()}</div>
       </StoreProvider>
     );
  }

  return (
    <StoreProvider>
      <Layout currentPath={currentPath} onNavigate={navigate}>
        <div className="fade-in">
          {renderPage()}
        </div>
      </Layout>
    </StoreProvider>
  );
};

export default App;
