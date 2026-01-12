import React from 'react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void | Promise<void>;
  onBackToSite: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
  userEmail?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  onBackToSite,
  userEmail
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'pages', label: 'Page Content', icon: '📄' },
    { id: 'store', label: 'Store / Merch', icon: '🛍️' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'media', label: 'Media Library', icon: '🖼️' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'activity', label: 'Activity Logs', icon: '📋' },
    { id: 'settings', label: 'Global Settings', icon: '⚙️' },
    { id: 'seo', label: 'SEO', icon: '🔍' }
  ];

  return (
    <>
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-brand-charcoal text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <h2 className="font-display font-bold tracking-widest">CMS ADMIN</h2>
        <div className="flex items-center gap-4 text-xs font-bold uppercase">
          <a
            href="#/"
            onClick={onBackToSite}
            className="text-neutral-400 hover:text-white"
          >
            Website
          </a>
          <button onClick={onLogout} className="text-brand-red hover:text-red-400">Logout</button>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <div className="w-64 bg-brand-charcoal text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-display font-bold text-xl tracking-widest">CMS ADMIN</h2>
          {userEmail && (
            <p className="text-xs text-neutral-400 mt-2 truncate" title={userEmail}>{userEmail}</p>
          )}
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left p-3 rounded transition-colors flex items-center gap-3 ${
                activeTab === tab.id 
                  ? 'bg-brand-red' 
                  : 'hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <a
            href="#/"
            onClick={onBackToSite}
            className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Website
          </a>
          <button 
            onClick={onLogout} 
            className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 transition-colors w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
