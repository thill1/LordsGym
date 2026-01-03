import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import CartDrawer from './CartDrawer';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath, onNavigate }) => {
  const { settings, openCart, cartCount } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCheckout = () => {
    onNavigate('/checkout');
    // Drawer closes automatically via routing logic in most setups, but explicit close handled in context
  };

  // Logic for header text color visibility
  const isTransparent = !isScrolled && !isMobileMenuOpen;
  const headerTextColor = isTransparent ? 'text-white' : 'text-brand-charcoal dark:text-white';

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <CartDrawer onCheckout={handleCheckout} />

      {/* Dynamic Announcement Bar */}
      {settings.announcementBar.enabled && (
        <div
          className="bg-brand-red text-white text-xs font-bold uppercase tracking-widest py-2 text-center cursor-pointer hover:bg-brand-redHover transition-colors relative z-[60]"
          onClick={() => settings.announcementBar.link && handleNavClick(settings.announcementBar.link)}
        >
          {settings.announcementBar.message}
        </div>
      )}

      {/* Sticky Header */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/95 dark:bg-neutral-900/95 shadow-lg py-3 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50'
            : 'bg-transparent py-5 lg:py-6'
        } ${settings.announcementBar.enabled && !isScrolled ? 'top-8' : 'top-0'} ${headerTextColor}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="cursor-pointer relative z-50" onClick={() => handleNavClick('/')}>
            <Logo variant="nav" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`text-sm uppercase tracking-widest font-bold hover:text-brand-red transition-colors relative group py-2 ${
                  currentPath === item.path
                    ? 'text-brand-red'
                    : 'text-current'
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-brand-red transition-all duration-300 ease-out ${
                    currentPath === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-5">
            <ThemeToggle />
            {/* Cart Icon */}
            <button
              className="relative p-2 text-current hover:text-brand-red transition-colors"
              aria-label="Cart"
              onClick={openCart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-red rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <Button size="sm" variant="brand" onClick={() => handleNavClick('/membership')}>Join Now</Button>
          </div>

          {/* Mobile Menu Controls */}
          <div className="lg:hidden flex items-center gap-4 relative z-50">
            <button
              className="relative p-2 text-current hover:text-brand-red transition-colors"
              aria-label="Cart"
              onClick={openCart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-red rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-current focus:outline-none"
              aria-label="Toggle Menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                <span className={`block h-0.5 w-6 bg-current transform transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-6 bg-current transform transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out flex flex-col justify-center items-center ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex flex-col space-y-6 text-center w-full px-8 max-w-sm">
          {NAV_ITEMS.map((item, idx) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`text-2xl uppercase font-display font-bold tracking-wider transition-all duration-300 transform hover:text-brand-red focus:text-brand-red ${
                isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              } ${currentPath === item.path ? 'text-brand-red' : 'text-black'}`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {item.label}
            </button>
          ))}
          <div className={`pt-8 space-y-4 w-full transition-all duration-500 delay-300 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Button fullWidth variant="brand" size="lg" onClick={() => handleNavClick('/membership')}>Join Now</Button>
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={() => handleNavClick('/shop')}
              className="!border-brand-charcoal !text-brand-charcoal hover:!bg-brand-charcoal hover:!text-white"
            >
              Shop Merch
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white pt-20 pb-10 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="space-y-6">
              <Logo variant="footer" className="text-white scale-90 origin-left" />
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                Building Strength, Inside and Out. A mission-driven gym dedicated to character, fitness, and community in Auburn, CA.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-display font-bold mb-6 text-white tracking-widest uppercase">Explore</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className="hover:text-white hover:translate-x-1 transition-all duration-300"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-display font-bold mb-6 text-white tracking-widest uppercase">Contact</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li className="flex items-start">
                  <span className="mr-3 text-brand-red mt-0.5">📍</span>
                  <span>{settings.address.split(',')[0]}<br />{settings.address.split(',').slice(1).join(',')}</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-brand-red">📞</span>
                  {settings.contactPhone}
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-brand-red">✉️</span>
                  {settings.contactEmail}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-display font-bold mb-6 text-white tracking-widest uppercase">Hours</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li className="flex items-center text-brand-red font-bold tracking-wider">
                  <span className="w-2 h-2 bg-brand-red rounded-full mr-2 animate-pulse"></span>
                  OPEN 24 HOURS / 7 DAYS
                </li>
                <li>
                  <span className="block text-white font-bold mb-1">Staffed Hours</span>
                  <span>Seven days a week, 7am - 7pm</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-neutral-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500">
            <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <button onClick={() => handleNavClick('/admin')} className="hover:text-white transition-colors">Admin</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
