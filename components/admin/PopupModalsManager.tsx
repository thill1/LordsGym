import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { PopupModalConfig, PopupTargetPage } from '../../types';
import { normalizePopupPath } from '../../utils/popupPaths';
import { logActivity } from '../../lib/activity-logger';

const TARGET_PAGE_OPTIONS: { value: PopupTargetPage; label: string }[] = [
  { value: 'all', label: 'All pages (site-wide)' },
  { value: '/', label: 'Home' },
  { value: '/membership', label: 'Membership' },
  { value: '/outreach', label: 'Outreach' },
  { value: '/training', label: '1-on-1 Training' },
  { value: '/shop', label: 'Shop' },
  { value: '/contact', label: 'Contact' },
  { value: '/calendar', label: 'Calendar' }
];

const DEFAULT_POPUP: Omit<PopupModalConfig, 'id'> = {
  enabled: true,
  title: '',
  body: '',
  ctaText: '',
  ctaLink: '',
  targetPage: 'all',
  showAfterDelayMs: 1500,
  showOncePerSession: true
};

function nextId(list: PopupModalConfig[]): string {
  const max = list.reduce((m, p) => {
    const n = /^popup-(\d+)$/.exec(p.id)?.[1];
    return n ? Math.max(m, parseInt(n, 10)) : m;
  }, 0);
  return `popup-${max + 1}`;
}

const PopupModalsManager: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const popups = settings?.popupModals ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PopupModalConfig>(() => ({
    ...DEFAULT_POPUP,
    id: nextId(popups)
  }));

  const handleAdd = () => {
    setForm({
      ...DEFAULT_POPUP,
      id: nextId(popups)
    });
    setEditingId('new');
  };

  const handleEdit = (p: PopupModalConfig) => {
    setForm({ ...p });
    setEditingId(p.id);
  };

  const handleSave = () => {
    const list = [...popups];
    const idx = list.findIndex((x) => x.id === form.id);
    const item: PopupModalConfig = {
      ...form,
      id: form.id || nextId(list),
      ctaLink: form.ctaLink?.trim() ? normalizePopupPath(form.ctaLink) : undefined
    };
    const isCreate = editingId === 'new' || idx < 0;
    if (isCreate) {
      list.push(item);
    } else {
      list[idx] = item;
    }
    updateSettings({ ...settings, popupModals: list });
    logActivity({
      action_type: isCreate ? 'create' : 'update',
      entity_type: 'settings',
      entity_id: item.id,
      description: `${isCreate ? 'create' : 'update'} popup: ${item.title || '(Untitled)'}`
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Remove this popup? This cannot be undone.')) return;
    const popup = popups.find((p) => p.id === id);
    updateSettings({
      ...settings,
      popupModals: popups.filter((p) => p.id !== id)
    });
    logActivity({
      action_type: 'delete',
      entity_type: 'settings',
      entity_id: id,
      description: `delete popup: ${popup?.title || id}`
    });
    if (editingId === id) setEditingId(null);
  };

  const handleCancel = () => setEditingId(null);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Popup Modals</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Show promotional or informational popups when visitors land on specific pages or site-wide.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 transition-colors"
        >
          <span aria-hidden>+</span>
          Add popup
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {popups.length === 0 && !editingId ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            <p>No popups yet.</p>
            <p className="text-sm mt-1">Create one to show on landing, membership, outreach, 1-on-1 training, or any page.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 text-brand-red font-bold hover:underline"
            >
              Add your first popup
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {popups.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-charcoal dark:text-white truncate">
                      {p.title || '(No title)'}
                    </span>
                    {!p.enabled && (
                      <span className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">Disabled</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {TARGET_PAGE_OPTIONS.find((o) => o.value === p.targetPage)?.label ?? p.targetPage} · delay {p.showAfterDelayMs}ms
                    {p.showOncePerSession ? ' · once per session' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1.5 text-sm font-bold rounded border border-neutral-300 dark:border-neutral-600 text-brand-charcoal dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1.5 text-sm font-bold rounded border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit form */}
      {editingId && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h2 className="text-xl font-bold dark:text-white">
            {editingId === 'new' ? 'New popup' : 'Edit popup'}
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="popup-enabled"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="rounded border-neutral-300 dark:border-neutral-600"
            />
            <label htmlFor="popup-enabled" className="text-sm font-bold dark:text-white">Enabled</label>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Show on</label>
            <select
              value={form.targetPage}
              onChange={(e) => setForm({ ...form, targetPage: e.target.value as PopupTargetPage })}
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
            >
              {TARGET_PAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              placeholder="e.g. First Month $10"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Message / body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              placeholder="Short description or offer details."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Button text (optional)</label>
              <input
                type="text"
                value={form.ctaText ?? ''}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value || undefined })}
                className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                placeholder="e.g. Join now"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Button link (optional)</label>
              <input
                type="text"
                value={form.ctaLink ?? ''}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value || undefined })}
                className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                placeholder="/membership"
              />
              <p className="text-xs text-neutral-500 mt-1">
                In-app path (e.g. /membership, /outreach, /training, /). Leave empty for informational-only; closing then sends users to home.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Delay before showing (ms)</label>
              <input
                type="number"
                min={0}
                step={500}
                value={form.showAfterDelayMs}
                onChange={(e) => setForm({ ...form, showAfterDelayMs: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              />
              <p className="text-xs text-neutral-500 mt-1">e.g. 1500 = 1.5 seconds after page load</p>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="popup-once"
                checked={form.showOncePerSession}
                onChange={(e) => setForm({ ...form, showOncePerSession: e.target.checked })}
                className="rounded border-neutral-300 dark:border-neutral-600"
              />
              <label htmlFor="popup-once" className="text-sm font-bold dark:text-white">Show once per session</label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg font-bold text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
            >
              {editingId === 'new' ? 'Create' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg font-bold text-brand-charcoal dark:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupModalsManager;
