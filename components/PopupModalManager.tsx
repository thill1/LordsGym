import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { PopupModalConfig, PopupTargetPage } from '../types';
import { normalizePopupPath } from '../utils/popupPaths';
import PopupModal from './PopupModal';

const SESSION_KEY = 'lordsgym_popup_dismissed';

function matchesTarget(targetPage: PopupTargetPage, currentPath: string): boolean {
  if (targetPage === 'all') return true;
  const path = currentPath || '/';
  return targetPage === path;
}

function selectActivePopup(popups: PopupModalConfig[], currentPath: string): PopupModalConfig | null {
  const enabled = popups.filter((p) => p.enabled && (p.title?.trim() || p.body?.trim()));
  const exact = enabled.find((p) => matchesTarget(p.targetPage, currentPath) && p.targetPage !== 'all');
  if (exact) return exact;
  return enabled.find((p) => p.targetPage === 'all') ?? null;
}

function wasDismissedThisSession(id: string): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const set = raw ? (JSON.parse(raw) as string[]) : [];
    return set.includes(id);
  } catch {
    return false;
  }
}

function markDismissedThisSession(id: string): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const set = raw ? (JSON.parse(raw) as string[]) : [];
    if (!set.includes(id)) {
      set.push(id);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(set));
    }
  } catch {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([id]));
  }
}

interface PopupModalManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

/**
 * Renders the appropriate admin-configured popup for the current page.
 * Respects target page, delay, and “show once per session”.
 */
const PopupModalManager: React.FC<PopupModalManagerProps> = ({ currentPath, onNavigate }) => {
  const { settings } = useStore();
  const popups = settings?.popupModals ?? [];
  const active = selectActivePopup(popups, currentPath);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    if (active.showOncePerSession && wasDismissedThisSession(active.id)) {
      return;
    }
    const delay = Math.max(0, active.showAfterDelayMs ?? 1000);
    const t = window.setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [active?.id, active?.showAfterDelayMs, active?.showOncePerSession]);

  const handleClose = () => {
    setVisible(false);
    if (active?.showOncePerSession && active?.id) {
      markDismissedThisSession(active.id);
    }
  };

  if (!active || !visible) return null;

  return (
    <PopupModal
      isOpen={true}
      onClose={handleClose}
      title={active.title}
      body={active.body}
      ctaText={active.ctaText}
      ctaLink={active.ctaLink}
      onCtaNavigate={(link) => onNavigate(normalizePopupPath(link))}
      onDismissNavigate={() => onNavigate('/')}
    />
  );
};

export default PopupModalManager;
