(() => {
  'use strict';
  const key = 'pochi-touch-talk:bonus:v1';
  let unlocked = false;

  window.readOrSavePochiBonus = async ({ method = 'GET' } = {}) => {
    try {
      if (method === 'POST') {
        unlocked = true;
        localStorage.setItem(key, 'true');
      }
      unlocked = unlocked || localStorage.getItem(key) === 'true';
      return { ok: true, json: async () => ({ bonusUnlocked: unlocked }) };
    } catch {
      return { ok: false, json: async () => ({ bonusUnlocked: unlocked }) };
    }
  };
})();
