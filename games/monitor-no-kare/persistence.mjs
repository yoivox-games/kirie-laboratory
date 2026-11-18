import { restoreState, STORAGE_KEY } from './story.mjs';

// Commit before the reset animation: closing the page cannot undo the reset.
// Only this game's key is touched; accessibility preferences are retained.
export function eraseProgress(previous, storage) {
  const state = restoreState(null);
  state.gentle = previous?.gentle === true;
  let persisted = false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    persisted = true;
  } catch {
    try { storage.removeItem(STORAGE_KEY); persisted = true; } catch { /* In-memory play remains available. */ }
  }
  return { state, persisted };
}
