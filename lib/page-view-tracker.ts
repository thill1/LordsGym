// Page view tracking for self-hosted analytics (like Google Analytics)
import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

const SESSION_ID_KEY = 'lg_session_id';
const BOT_PATTERNS = /bot|crawler|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i;

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

function isLikelyBot(): boolean {
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent || '';
  return BOT_PATTERNS.test(ua);
}

async function recordPageView(path: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (path === '/admin') return;
  if (isLikelyBot()) return;

  try {
    await supabase.from('page_views').insert({
      path,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      session_id: getSessionId(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent || null : null
    });
  } catch (error) {
    console.warn('[PageView] Failed to record:', error);
  }
}

export function usePageViewTracker(currentPath: string): void {
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentPath === '/admin') return;
    if (lastPathRef.current === currentPath) return;
    lastPathRef.current = currentPath;
    recordPageView(currentPath);
  }, [currentPath]);
}
