import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Membership from './pages/Membership';
import Programs from './pages/Programs';
import Community from './pages/Community';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';

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

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home onNavigate={navigate} />;
      case '/membership':
        return <Membership />;
      case '/programs':
        return <Programs />;
      case '/community':
        return <Community />;
      case '/shop':
        return <Shop />;
      case '/about':
        return <About />;
      case '/contact':
        return <Contact />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <Layout currentPath={currentPath} onNavigate={navigate}>
      <div className="fade-in">
        {renderPage()}
      </div>
    </Layout>
  );
};

export default App;