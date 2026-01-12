import React, { useState, useRef, useEffect } from 'react';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  notifications?: number;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSearch, notifications = 0, searchInputRef }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = searchInputRef || internalRef;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between sticky top-0 z-10">
      {/* Search Bar */}
      {onSearch && (
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin... (Ctrl+K)"
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-2.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      )}

      {/* Notifications */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-red rounded-full">
              {notifications}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;
