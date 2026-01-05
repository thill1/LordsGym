import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import CartDrawer from "./CartDrawer";
import { NAV_ITEMS } from "../constants";

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { settings, cartCount, openCart } = useStore();

  const handleCheckout = () => {
    onNavigate('/checkout');
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const joinNowBtnRef = React.useRef<HTMLButtonElement>(null);
  const joinNowMobileBtnRef = React.useRef<HTMLButtonElement>(null);

  // Force red background on mount and whenever component updates
  useEffect(() => {
    if (joinNowBtnRef.current) {
      joinNowBtnRef.current.style.backgroundColor = '#dc2626';
      joinNowBtnRef.current.style.borderColor = '#dc2626';
      joinNowBtnRef.current.style.color = '#ffffff';
    }
    if (joinNowMobileBtnRef.current) {
      joinNowMobileBtnRef.current.style.backgroundColor = '#dc2626';
      joinNowMobileBtnRef.current.style.borderColor = '#dc2626';
      joinNowMobileBtnRef.current.style.color = '#ffffff';
    }
  });

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine header text color based on scroll state
  const headerTextColor = isScrolled || isMobileMenuOpen 
    ? 'text-brand-charcoal dark:text-white' 
    : 'text-white';

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(path);
  };

  const announceEnabled = !!settings?.announcementBar?.enabled;
  const announceMessage = settings?.announcementBar?.message || "";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      {/* Announcement Bar */}
      {announceEnabled && announceMessage.trim() && (
        <div className="w-full bg-brand-charcoal text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center justify-center">
            {announceMessage}
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <header 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/70 dark:bg-neutral-900/70 shadow-lg py-3 backdrop-blur-xl border-b border-neutral-200/30 dark:border-neutral-800/30' 
            : 'bg-transparent dark:bg-transparent py-5 lg:py-6'
        } ${settings.announcementBar.enabled && !isScrolled ? 'top-8' : 'top-0'} ${headerTextColor}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
          <div className="cursor-pointer relative z-50 border-0" onClick={() => handleNavClick('/')}>
            <Logo variant="full" tone={isScrolled || isMobileMenuOpen ? "dark" : "light"} />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8 -mt-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`text-base font-graffiti tracking-wide hover:text-brand-red transition-colors relative group py-0 ${
                  currentPath === item.path 
                    ? 'text-brand-red' 
                    : 'text-current'
                }`}
              >
                {item.label}
                {/* Red drip/underline effect on hover */}
                <span className={`absolute bottom-0 left-0 h-1 rounded-full bg-brand-red transition-all duration-300 ease-out ${currentPath === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
            <button
              ref={joinNowBtnRef}
              onClick={() => handleNavClick('/membership')}
              className="join-now-btn inline-flex items-center justify-center font-bold tracking-wider uppercase text-xs px-4 py-2 border shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red active:scale-95"
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.borderColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
            >
              Join Now
            </button>
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

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-0 z-40 bg-white dark:bg-neutral-900 shadow-lg border-b border-neutral-200 dark:border-neutral-800 mt-[73px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <nav className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`block w-full text-left py-3 px-4 text-lg font-graffiti transition-colors ${
                    currentPath === item.path
                      ? 'text-brand-red border-l-4 border-brand-red'
                      : 'text-brand-charcoal dark:text-white hover:text-brand-red'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleNavClick('/membership')}
                className="join-now-btn w-full mt-4 inline-flex items-center justify-center font-bold tracking-wider uppercase text-sm px-6 py-3 border shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red active:scale-95"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.borderColor = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                ref={joinNowMobileBtnRef}
              >
                Join Now
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer onCheckout={handleCheckout} />

      {/* Main */}
      <main className={`flex-1 ${isScrolled || settings.announcementBar.enabled ? 'pt-[73px]' : 'pt-0'}`}>{children}</main>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Logo variant="footer" tone="light" className="mb-4" />
            <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
              Founded in Faith. Forged in Iron. Train your body, strengthen your spirit, and build a community that shows up.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.slice(0, 8).map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className="text-left text-xs text-neutral-300 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase mb-4">Contact</h3>
            <div className="space-y-2 text-xs text-neutral-300">
              {settings?.address && <div>{settings.address}</div>}
              {settings?.contactPhone && <div>{settings.contactPhone}</div>}
              {settings?.contactEmail && <div>{settings.contactEmail}</div>}
              <button
                type="button"
                onClick={() => handleNavClick("/contact")}
                className="inline-flex mt-3 items-center gap-2 text-xs font-bold text-white hover:text-brand-red"
              >
                Book a Tour
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
            <div>© {new Date().getFullYear()} Lord&apos;s Gym Auburn, CA. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => handleNavClick("/privacy")} className="hover:text-white">
                Privacy
              </button>
              <button type="button" onClick={() => handleNavClick("/terms")} className="hover:text-white">
                Terms
              </button>
              <button type="button" onClick={() => handleNavClick("/admin")} className="hover:text-white">
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
