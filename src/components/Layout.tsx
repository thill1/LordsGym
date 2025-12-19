import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 dark:bg-neutral-900/95 shadow-md py-2 backdrop-blur-sm' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => handleNavClick('/')}>
            <Logo variant="full" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`text-sm uppercase tracking-wide font-bold hover:text-black dark:hover:text-white transition-colors ${
                  currentPath === item.path 
                    ? 'text-black dark:text-white underline decoration-2 underline-offset-4' 
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button size="sm" onClick={() => handleNavClick('/membership')}>Join Now</Button>
            {/* Cart Icon */}
            <button className="relative p-2 text-current hover:text-black dark:hover:text-white transition-colors" aria-label="Cart" onClick={() => handleNavClick('/shop')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <ThemeToggle />
             <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-current"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-lg fade-in">
            <div className="flex flex-col p-4 space-y-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-lg uppercase font-bold text-left py-2 ${
                    currentPath === item.path ? 'text-black dark:text-white pl-2 border-l-4 border-black dark:border-white' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <hr className="border-neutral-200 dark:border-neutral-700" />
              <Button fullWidth onClick={() => handleNavClick('/membership')}>Join Now</Button>
              <Button variant="outline" fullWidth onClick={() => handleNavClick('/shop')}>Shop Merch</Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white pt-16 pb-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <Logo className="text-white" />
            <p className="text-neutral-400 text-sm leading-relaxed">
              Building Strength, Inside and Out. A mission-driven gym focused on faith, fitness, and community in Auburn, CA.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><button onClick={() => handleNavClick('/programs')} className="hover:text-white transition-colors">Classes</button></li>
              <li><button onClick={() => handleNavClick('/membership')} className="hover:text-white transition-colors">Membership</button></li>
              <li><button onClick={() => handleNavClick('/community')} className="hover:text-white transition-colors">Outreach</button></li>
              <li><button onClick={() => handleNavClick('/shop')} className="hover:text-white transition-colors">Merch Store</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Member Login (Mindbody)</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Contact</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-start">
                <span className="mr-2 text-white">📍</span>
                258 Elm Ave, Auburn, CA 95603
              </li>
              <li className="flex items-center">
                 <span className="mr-2 text-white">📞</span>
                 (530) 555-0123
              </li>
              <li className="flex items-center">
                 <span className="mr-2 text-white">✉️</span>
                 info@lordsgymauburn.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Hours</h4>
            <ul className="space-y-1 text-sm text-neutral-400">
              <li className="flex justify-between items-center text-white font-bold">
                <span>OPEN 24/7</span>
              </li>
              <li className="text-xs text-neutral-500 mt-2">
                Member Keycard Access 24 Hours / 365 Days
              </li>
            </ul>
            <div className="mt-6">
              <span className="text-xs uppercase tracking-widest text-neutral-500">Follow Us</span>
              <div className="flex space-x-4 mt-2">
                 <div className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors cursor-pointer">FB</div>
                 <div className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors cursor-pointer">IG</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-900 text-center text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Lord's Gym Auburn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;