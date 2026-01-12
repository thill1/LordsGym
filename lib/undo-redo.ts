// Undo/redo functionality for content edits

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export class UndoRedoManager<T> {
  private state: HistoryState<T>;
  private maxHistory: number;

  constructor(initialState: T, maxHistory: number = 50) {
    this.state = {
      past: [],
      present: initialState,
      future: []
    };
    this.maxHistory = maxHistory;
  }

  push(newState: T): void {
    this.state = {
      past: [...this.state.past, this.state.present].slice(-this.maxHistory),
      present: newState,
      future: []
    };
  }

  undo(): T | null {
    if (this.state.past.length === 0) {
      return null;
    }

    const previous = this.state.past[this.state.past.length - 1];
    const newPast = this.state.past.slice(0, -1);

    this.state = {
      past: newPast,
      present: previous,
      future: [this.state.present, ...this.state.future]
    };

    return previous;
  }

  redo(): T | null {
    if (this.state.future.length === 0) {
      return null;
    }

    const next = this.state.future[0];
    const newFuture = this.state.future.slice(1);

    this.state = {
      past: [...this.state.past, this.state.present],
      present: next,
      future: newFuture
    };

    return next;
  }

  canUndo(): boolean {
    return this.state.past.length > 0;
  }

  canRedo(): boolean {
    return this.state.future.length > 0;
  }

  getCurrent(): T {
    return this.state.present;
  }

  clear(): void {
    this.state = {
      past: [],
      present: this.state.present,
      future: []
    };
  }
}
