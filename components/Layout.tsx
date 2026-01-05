import React, { useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";

type NavItem = { label: string; path: string };

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { settings } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ GitHub Pages-safe public asset URLs (NO new URL(..., BASE_URL) runtime crash)
  const LOGO_WHITE = `${import.meta.env.BASE_URL}media/lords-gym/lords-gym-logo-white.png`;
  const LOGO_TRANSPARENT = `${import.meta.env.BASE_URL}media/lords-gym/lords-gym-logo-transparent.png`;

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Home", path: "/" },
      { label: "Membership", path: "/membership" },
      { label: "Training", path: "/training" },
      { label: "Programs", path: "/programs" },
      { label: "Outreach", path: "/outreach" },
      { label: "Shop", path: "/shop" },
      { label: "About", path: "/about" },
      { label: "Contact", path: "/contact" },
      { label: "Calendar", path: "/calendar" },
    ],
    []
  );

  const isActive = (path: string) => currentPath === path;

  const go = (path: string) => {
    setMobileOpen(false);
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-charcoal/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <button
            type="button"
            onClick={() => go("/")}
            className="flex items-center gap-3 text-left"
            aria-label="Go to Home"
          >
            {/* Light mode (if you ever use light header): transparent */}
            <img
              src={LOGO_TRANSPARENT}
              alt="Lord's Gym"
              className="h-14 w-auto object-contain hidden"
              loading="eager"
            />
            {/* Dark header: white logo */}
            <img
              src={LOGO_WHITE}
              alt="Lord's Gym"
              className="h-14 w-auto object-contain"
              loading="eager"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className={[
                  "px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-colors",
                  isActive(item.path)
                    ? "bg-white/10 text-white"
                    : "text-neutral-300 hover:text-white hover:bg-white/10",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-white/10 text-white"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-brand-charcoal">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => go(item.path)}
                  className={[
                    "px-3 py-3 rounded-md text-sm font-bold tracking-wide transition-colors text-left",
                    isActive(item.path)
                      ? "bg-white/10 text-white"
                      : "text-neutral-300 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go("/admin")}
                className="col-span-2 px-3 py-3 rounded-md text-sm font-bold tracking-wide transition-colors text-left text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10"
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <img
              src={LOGO_WHITE}
              alt="Lord's Gym"
              className="h-16 w-auto object-contain mb-4"
              loading="lazy"
            />
            <p className="text-sm text-neutral-300 leading-relaxed max-w-md">
              Founded in Faith. Forged in Iron. Train your body, strengthen your spirit, and build a community that shows up.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {navItems.slice(0, 8).map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => go(item.path)}
                  className="text-left text-sm text-neutral-300 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-neutral-300">
              {settings?.address && <div>{settings.address}</div>}
              {settings?.contactPhone && <div>{settings.contactPhone}</div>}
              {settings?.contactEmail && <div>{settings.contactEmail}</div>}
              <button
                type="button"
                onClick={() => go("/contact")}
                className="inline-flex mt-3 items-center gap-2 text-sm font-bold text-white hover:text-brand-red"
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
              <button type="button" onClick={() => go("/privacy")} className="hover:text-white">
                Privacy
              </button>
              <button type="button" onClick={() => go("/terms")} className="hover:text-white">
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
