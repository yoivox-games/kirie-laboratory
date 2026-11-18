// Shared, deterministic save validation and merge rules (browser and Site server).
(() => {
  'use strict';
  const object = v => v && typeof v === 'object' && !Array.isArray(v);
  const integer = v => Number.isSafeInteger(v) && v >= 0 ? v : 0;
  const list = (v, limit = 5000) => Array.isArray(v) ? [...new Set(v.filter(x => typeof x === 'string' && x.length <= 180))].slice(0, limit) : [];
  function clean(value = {}) {
    if (!object(value)) value = {};
    const usage = {};
    if (object(value.conversationUsage)) for (const [scene, record] of Object.entries(value.conversationUsage).slice(0, 100)) {
      if (!/^[a-z_]+$/.test(scene) || !object(record)) continue;
      const counts = {};
      if (object(record.counts)) for (const [id, count] of Object.entries(record.counts).slice(0, 20)) {
        if (/^[a-z0-9_-]+$/.test(id)) counts[id] = Math.min(integer(count), 1000000);
      }
      usage[scene] = { counts, last: typeof record.last === 'string' && record.last.length < 80 ? record.last : null };
    }
    let save = null;
    if (object(value.save) && typeof value.save.scene === 'string' && /^[a-z_]+$/.test(value.save.scene)
      && Number.isSafeInteger(value.save.index) && value.save.index >= 0 && value.save.index < 1000
      && Number.isFinite(value.save.memory) && Array.isArray(value.save.history)) {
      const choices = {};
      if (object(value.save.conversations)) for (const [key, val] of Object.entries(value.save.conversations).slice(0, 100)) {
        if (/^[a-z_]+$/.test(key) && typeof val === 'string' && /^[a-z0-9_-]+$/.test(val)) choices[key] = val;
      }
      save = {
        scene: value.save.scene, index: value.save.index,
        gender: ['male', 'female'].includes(value.save.gender) ? value.save.gender : null,
        memory: Math.max(-1000, Math.min(1000, value.save.memory)), clues: list(value.save.clues, 100),
        history: value.save.history.filter(object).slice(-1000).map(line => ({
          speaker: typeof line.speaker === 'string' ? line.speaker.slice(0, 100) : '',
          text: typeof line.text === 'string' ? line.text.slice(0, 2000) : '',
          ...(line.selected ? { selected: true } : {})
        })),
        lastLogged: typeof value.save.lastLogged === 'string' ? value.save.lastLogged.slice(0, 180) : null,
        storyRevision: integer(value.save.storyRevision), conversations: choices
      };
    }
    return {
      endings: list(value.endings, 3).filter(key => ['one', 'two', 'three'].includes(key)),
      arts: list(value.arts, 100), seen: list(value.seen), conversationUsage: usage,
      storyRevision: integer(value.storyRevision), save,
      checkpointAt: integer(value.checkpointAt), updatedAt: integer(value.updatedAt), resetAt: integer(value.resetAt),
      preferences: object(value.preferences) ? {
        ...(typeof value.preferences.sound === 'boolean' ? { sound: value.preferences.sound } : {}),
        ...(typeof value.preferences.motion === 'boolean' ? { motion: value.preferences.motion } : {}),
        ...([0, 18, 32, 52].includes(value.preferences.speed) ? { speed: value.preferences.speed } : {}),
        ...(Number.isFinite(value.preferences.volume) ? { volume: Math.max(0, Math.min(.8, value.preferences.volume)) } : {})
      } : {}
    };
  }
  function merge(first, second) {
    const a = clean(first), b = clean(second);
    // A confirmed reset starts a new record. Older tabs and pending saves must
    // never union their unlocks or checkpoints back into that new record.
    if (a.resetAt !== b.resetAt) return a.resetAt > b.resetAt ? a : b;
    const newer = b.updatedAt >= a.updatedAt ? b : a;
    const checkpoint = b.checkpointAt > a.checkpointAt ? b : b.checkpointAt < a.checkpointAt ? a :
      (b.save || b.checkpointAt ? b : a);
    const result = { ...newer, preferences: { ...(newer === b ? a : b).preferences, ...newer.preferences }, save: checkpoint.save, checkpointAt: checkpoint.checkpointAt,
      storyRevision: Math.max(a.storyRevision, b.storyRevision), conversationUsage: {} };
    for (const field of ['endings', 'arts', 'seen']) result[field] = [...new Set([...a[field], ...b[field]])];
    for (const key of new Set([...Object.keys(a.conversationUsage), ...Object.keys(b.conversationUsage)])) {
      const ac = a.conversationUsage[key], bc = b.conversationUsage[key], counts = {};
      for (const id of new Set([...Object.keys(ac?.counts || {}), ...Object.keys(bc?.counts || {})])) counts[id] = Math.max(ac?.counts[id] || 0, bc?.counts[id] || 0);
      result.conversationUsage[key] = { counts, last: newer.conversationUsage[key]?.last ?? ac?.last ?? bc?.last ?? null };
    }
    return result;
  }
  globalThis.NoahSaveData = Object.freeze({ clean, merge });
})();
