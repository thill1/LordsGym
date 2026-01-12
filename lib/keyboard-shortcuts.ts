// Keyboard shortcuts for admin panel

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const registerKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
      }
    });
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
};

export const ADMIN_SHORTCUTS: Record<string, string> = {
  'Ctrl+S': 'Save current changes',
  'Ctrl+K': 'Open search',
  'Ctrl+/': 'Show keyboard shortcuts',
  'Escape': 'Close modal/dialog',
  'Ctrl+Z': 'Undo (where supported)',
  'Ctrl+Shift+Z': 'Redo (where supported)'
};

// Global undo/redo handlers (can be set by components)
let globalUndoHandler: (() => void) | null = null;
let globalRedoHandler: (() => void) | null = null;

export const setGlobalUndoRedoHandlers = (undo: () => void, redo: () => void) => {
  globalUndoHandler = undo;
  globalRedoHandler = redo;
};

export const getGlobalUndoRedoHandlers = () => ({
  undo: globalUndoHandler,
  redo: globalRedoHandler
});
