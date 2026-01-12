import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';

interface Version {
  id: string;
  page_id: string;
  content: any;
  created_at: string;
  created_by: string | null;
}

interface VersionHistoryProps {
  pageId: string;
  onRestore?: (version: Version) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ pageId, onRestore }) => {
  const { showSuccess, showError } = useToast();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pageId && isSupabaseConfigured()) {
      loadVersions();
    } else {
      setIsLoading(false);
    }
  }, [pageId]);

  const loadVersions = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      setIsLoading(true);
      // Note: This assumes a page_versions table exists
      // For now, we'll use a simplified approach with localStorage as fallback
      const storedVersions = localStorage.getItem(`page_versions_${pageId}`);
      if (storedVersions) {
        setVersions(JSON.parse(storedVersions));
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (version: Version) => {
    if (onRestore) {
      onRestore(version);
      showSuccess('Version restored successfully!');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto mb-4"></div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading version history...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No version history available</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
          Version history will be saved automatically when you make changes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version, index) => (
        <div
          key={version.id}
          className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <p className="text-sm font-bold dark:text-white">
                Version {versions.length - index}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {new Date(version.created_at).toLocaleString()}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRestore(version)}
            >
              Restore
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VersionHistory;
