(() => {
  'use strict';
  const { clean, merge } = window.NoahSaveData;
  const keys = ['noah-remember-v1', 'noah-remember-backup-v1'];
  const subscribers = new Set();
  let data = readLocal();
  let status = '進行はこの端末に保存されます';

  function readLocal() {
    let record = {};
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value) record = merge(record, JSON.parse(value));
      } catch {
        // The other copy may still be readable.
      }
    }
    return clean(record);
  }

  function read() {
    return structuredClone(data);
  }

  function emit() {
    for (const subscriber of subscribers) subscriber(read());
  }

  function save() {
    const record = JSON.stringify(data);
    let saved = false;
    for (const key of [...keys].reverse()) {
      try {
        localStorage.setItem(key, record);
        saved = true;
      } catch {
        // Another storage key may still be writable.
      }
    }
    status = saved ? 'この端末に記録を保存しました' : 'このブラウザでは記録を保存できません';
    for (const node of document.querySelectorAll('[data-save-status]')) node.textContent = status;
    return saved;
  }

  function commit(value) {
    const local = merge(readLocal(), data);
    if (local.resetAt > data.resetAt) {
      data = local;
      emit();
      return read();
    }
    data = merge(local, {
      ...value,
      resetAt: local.resetAt,
      updatedAt: Math.max(Date.now(), local.updatedAt + 1)
    });
    save();
    return read();
  }

  function reset({ preferences = data.preferences, storyRevision = data.storyRevision } = {}) {
    const current = merge(readLocal(), data);
    const stamp = Math.max(Date.now(), current.resetAt + 1, current.updatedAt + 1, current.checkpointAt + 1);
    data = clean({ preferences, storyRevision, resetAt: stamp, checkpointAt: stamp, updatedAt: stamp });
    save();
    emit();
    return read();
  }

  function refresh() {
    const merged = merge(readLocal(), data);
    if (JSON.stringify(merged) === JSON.stringify(data)) return;
    data = merged;
    emit();
  }

  window.addEventListener('storage', event => {
    if (event.key === null || keys.includes(event.key)) refresh();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) refresh();
  });
  window.NoahPersistence = Object.freeze({
    ready: Promise.resolve(read()),
    read,
    commit,
    reset,
    flush: () => Promise.resolve(save()),
    subscribe(listener) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    status: () => status
  });
})();
