(() => {
  'use strict';
  function initialize() {
  const persistence = window.NoahPersistence;
  const { scenes, arts, endings, revision = 1, updatedScenes = [] } = window.NoahStory;
  const conversations = window.NoahConversations;
  const movies = (window.NoahMovies || []).filter(movie => typeof movie.src === 'string' && movie.src.length > 0);
  const bonusStories = (window.NoahBonusStories || []).filter(story => Array.isArray(story.chapters) && story.chapters.length > 0 && story.chapters.every(chapter => Array.isArray(chapter.pages) && chapter.pages.length > 0 && typeof chapter.art === 'string'));
  const $ = id => document.getElementById(id);
  const storageKey = 'noah-remember-v1';
  const defaults = { sound: true, volume: 0.42, speed: 32, motion: !matchMedia('(prefers-reduced-motion: reduce)').matches };
  let stored = {};
  try { stored = persistence ? persistence.read() : JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { stored = {}; }
  const preferences = { ...defaults, ...(stored.preferences || {}) };
  preferences.speed = [0, 18, 32, 52].includes(preferences.speed) ? preferences.speed : 32;
  preferences.volume = Math.max(0, Math.min(0.8, Number(preferences.volume) || 0));
  const conversationUsage = conversations.cleanUsage(stored.conversationUsage);
  if (stored.storyRevision >= 2 && Array.isArray(stored.seen)) {
    for (const id of stored.seen) {
      const name = String(id).split(/[:@]/)[0];
      const record = conversationUsage[name];
      if (record && stored.storyRevision < conversations.introduced[name]) {
        record.counts.original = Math.max(1, record.counts.original); record.last = 'original';
      }
    }
  }
  const progress = {
    endings: Array.isArray(stored.endings) ? stored.endings.filter(key => endings[key]) : [],
    arts: Array.isArray(stored.arts) ? stored.arts.filter(key => arts[key]) : [],
    seen: Array.isArray(stored.seen) ? (stored.storyRevision >= 3 && stored.storyRevision <= revision ? stored.seen :
      stored.storyRevision === 2 ? stored.seen.filter(id => typeof id === 'string').map(id => id.replace(':', '@original:')) : []) : []
  };
  let saved = isValidSave(stored.save) ? stored.save : null;
  let checkpointAt = Number(stored.checkpointAt) || 0;
  let resetAt = Number(stored.resetAt) || 0;
  let saveAdjusted = false;
  if (saved && saved.storyRevision !== revision) {
    if ((saved.storyRevision || 1) < 2 && updatedScenes.includes(saved.scene)) {
      saved.index = 0;
      saved.lastLogged = null;
      saveAdjusted = true;
    }
    saved.conversations = conversations.upgradeChoices(saved.conversations, saved.storyRevision || 1);
    if (typeof saved.lastLogged === 'string' && !saved.lastLogged.includes('@')) {
      saved.lastLogged = saved.lastLogged.replace(':', '@original:');
    }
    saved.storyRevision = revision;
  }
  if (saved) saved.history = conversations.correctHistory(saved.history);
  let state = null;
  let screen = 'title';
  let typingTimer;
  let autoTimer;
  let typeText = '';
  let typing = false;
  let auto = false;
  let skip = false;
  let wasRead = false;
  let advancing = false;
  let artToken = 0;
  let activeArt = 'warm-wake';
  let activeImage = 0;
  let requestedArt = 'warm-wake';
  let modalKind = '';
  let activeMovie = null;
  let activeShortStory = null;
  let restoreMovieMusic = false;
  let previousFocus;
  let toastTimer;
  const imageCache = new Map();
  const sound = new window.NoahSound();
  sound.enabled = preferences.sound;
  sound.volume = preferences.volume;

  function isValidSave(value) {
    return value && typeof value.scene === 'string' && scenes[value.scene] && Number.isInteger(value.index) && value.index >= 0 && value.index < conversations.resolve(value).steps.length && Number.isFinite(value.memory) && Array.isArray(value.history);
  }
  function persist(immediate = false) {
    const value = { preferences, ...progress, conversationUsage, storyRevision: revision, save: saved, checkpointAt, resetAt };
    if (persistence) {
      const merged = persistence.commit(value, { immediate });
      for (const key of ['endings', 'arts', 'seen']) progress[key] = merged[key];
      return;
    }
    try { localStorage.setItem(storageKey, JSON.stringify(value)); }
    catch { showToast('保存領域を利用できません。この画面を閉じると進行が失われます。'); }
  }
  function saveGame() {
    if (screen === 'play' && state) {
      saved = structuredClone(state);
      checkpointAt = Math.max(Date.now(), checkpointAt + 1, (persistence?.read().checkpointAt || 0) + 1);
    }
    persist();
  }
  function showToast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4200);
  }
  function word(text) { return text.replaceAll('{call}', state?.gender === 'male' ? 'お兄さん' : 'お姉さん'); }
  function currentStep() { return state ? conversations.resolve(state).steps[state.index] : null; }
  function loadImage(key) {
    if (imageCache.has(key)) return imageCache.get(key);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = `assets/${arts[key].file}`;
    });
    imageCache.set(key, promise);
    return promise;
  }
  async function setArt(key) {
    if (!key || key === requestedArt) return;
    requestedArt = key;
    const token = ++artToken;
    if (key === 'black') {
      $('game').classList.add('black-scene');
      activeArt = key;
      return;
    }
    try {
      await loadImage(key);
      if (token !== artToken) return;
      const images = [$('art-a'), $('art-b')];
      const nextImage = 1 - activeImage;
      images[nextImage].src = `assets/${arts[key].file}`;
      images[nextImage].alt = arts[key].title;
      images[nextImage].classList.add('visible');
      images[activeImage].classList.remove('visible');
      activeImage = nextImage;
      activeArt = key;
      $('game').classList.remove('black-scene');
    } catch {
      if (token === artToken) requestedArt = activeArt;
    }
  }
  function stopTimers() {
    clearTimeout(typingTimer);
    clearTimeout(autoTimer);
    typing = false;
    $('game').classList.remove('typing');
  }
  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (screen !== 'play' || modalKind || !$('art-viewer').hidden || document.hidden || $('game').classList.contains('clean-view')) return;
    if (currentStep()?.type !== 'line') return;
    if (skip && wasRead) autoTimer = setTimeout(advance, 220);
    else if (auto && !typing) autoTimer = setTimeout(advance, Math.max(1700, typeText.length * 48));
  }
  function completeText() {
    clearTimeout(typingTimer);
    $('text').textContent = typeText;
    typing = false;
    $('game').classList.remove('typing');
    scheduleAuto();
  }
  function typeLine(text) {
    typeText = text;
    $('text').textContent = '';
    if (!preferences.speed || (skip && wasRead)) { completeText(); return; }
    typing = true;
    $('game').classList.add('typing');
    const characters = Array.from(text);
    let index = 0;
    const tick = () => {
      $('text').textContent += characters[index++];
      if (index >= characters.length) { completeText(); return; }
      const pause = /[。！？…]/.test(characters[index - 1]) ? 120 : 0;
      typingTimer = setTimeout(tick, preferences.speed + pause);
    };
    tick();
  }
  function applyEffect(effect, restoring) {
    $('scene-effect').className = 'scene-effect';
    $('game').classList.remove('near');
    if (!effect || restoring) return;
    if (effect === 'wake') {
      $('game').classList.add('awakening');
      setTimeout(() => $('game').classList.remove('awakening'), 3600);
    } else if (effect === 'near') $('game').classList.add('near');
    else {
      void $('scene-effect').offsetWidth;
      $('scene-effect').classList.add(effect);
    }
  }
  function enterScene(name) {
    state.scene = name;
    state.index = 0;
    render();
  }
  function render(restoring = false) {
    stopTimers();
    conversations.ensure(state, conversationUsage);
    const chapter = conversations.resolve(state);
    const step = currentStep();
    if (step.type === 'end') { finish(step.key); return; }
    const id = conversations.readKey(state);
    wasRead = progress.seen.includes(id);
    if (skip && !wasRead) { skip = false; updatePlaybackButtons(); }
    if (!wasRead) progress.seen.push(id);
    if (step.art && arts[step.art] && !progress.arts.includes(step.art)) progress.arts.push(step.art);
    setArt(step.art);
    $('game').classList.toggle('memory-fragment', !!step.fragment);
    applyEffect(step.effect, restoring);
    if (step.sfx && !restoring && !(skip && wasRead)) sound.effect(step.sfx);
    $('chapter').textContent = chapter.title;
    $('game').classList.toggle('narration', !step.speaker);
    $('game').classList.toggle('memory-voice', !!step.memoryVoice);
    $('speaker').textContent = step.speaker || ' ';
    $('choices').replaceChildren();
    $('choices').hidden = step.type !== 'choice';
    $('next-marker').hidden = step.type === 'choice';
    $('tap-hint').hidden = !(state.scene === 'opening' && state.index < 4);
    if (step.type === 'choice') {
      skip = false;
      updatePlaybackButtons();
      typeText = word(step.text);
      $('text').textContent = typeText;
      step.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'choice';
        const mark = document.createElement('span');
        mark.className = 'choice-mark';
        mark.textContent = '◇';
        mark.setAttribute('aria-hidden', 'true');
        button.append(mark, document.createTextNode(word(option.label)));
        button.addEventListener('click', event => {
          event.stopPropagation();
          if (currentStep() !== step || advancing) return;
          advancing = true;
          sound.effect('select');
          if (option.gender) state.gender = option.gender;
          if (option.score) state.memory += option.score;
          if (option.clue && !state.clues.includes(option.clue)) state.clues.push(option.clue);
          state.history.push({ speaker: 'あなた', text: word(option.label), selected: true });
          enterScene(option.next);
          setTimeout(() => { advancing = false; }, 160);
        });
        $('choices').append(button);
      });
    } else {
      const text = word(step.text);
      if (state.lastLogged !== id) {
        state.history.push({ speaker: step.speaker, text });
        state.lastLogged = id;
      }
      typeLine(text);
    }
    saveGame();
    scheduleAuto();
  }
  function advance() {
    if (screen !== 'play' || modalKind || !$('art-viewer').hidden || advancing) return;
    if ($('game').classList.contains('clean-view')) { toggleUI(); return; }
    if (currentStep()?.type !== 'line') return;
    if (typing) { completeText(); return; }
    state.index++;
    if (state.index >= conversations.resolve(state).steps.length) {
      const next = conversations.resolve(state).next;
      enterScene(typeof next === 'function' ? next(state) : next);
    } else render();
  }
  function startGame() {
    window.NoahFullscreen?.enter(false);
    closeModal();
    state = { scene: 'opening', index: 0, gender: null, memory: 0, clues: [], history: [], lastLogged: null, storyRevision: revision, conversations: {} };
    beginPlay();
    render();
  }
  function beginPlay() {
    screen = 'play';
    auto = false;
    skip = false;
    $('game').classList.remove('is-title', 'clean-view');
    $('title-screen').hidden = true;
    $('ending-screen').hidden = true;
    $('play-screen').hidden = false;
    $('chapter').hidden = false;
    $('restore-ui').hidden = true;
    $('skip-button').hidden = !progress.endings.length;
    updatePlaybackButtons();
    sound.start().catch(() => {});
  }
  function continueGame() {
    if (!saved) return;
    window.NoahFullscreen?.enter(false);
    state = structuredClone(saved);
    state.clues ||= [];
    beginPlay();
    render(true);
    if (saveAdjusted) {
      showToast('お話が増えました。保存していた場面の始めから再開しています。');
      saveAdjusted = false;
    }
  }
  function showTitle() {
    stopTimers();
    closeModal();
    screen = 'title';
    auto = false;
    skip = false;
    $('game').className = `game is-title${preferences.motion ? '' : ' reduced-motion'}`;
    $('scene-effect').className = 'scene-effect';
    $('play-screen').hidden = true;
    $('ending-screen').hidden = true;
    $('title-screen').hidden = false;
    $('chapter').hidden = true;
    setArt('warm-wake');
    $('continue').disabled = !saved;
    $('continue-chapter').textContent = saved ? scenes[saved.scene].title : '';
    updateBonusButtons();
  }
  function finish(key) {
    stopTimers();
    const ending = endings[key];
    screen = 'ending';
    auto = false;
    skip = false;
    if (!progress.endings.includes(key)) progress.endings.push(key);
    saved = null;
    checkpointAt = Math.max(Date.now(), checkpointAt + 1, (persistence?.read().checkpointAt || 0) + 1);
    persist(true);
    $('game').classList.remove('near', 'narration', 'memory-fragment', 'memory-voice');
    $('scene-effect').className = 'scene-effect';
    setArt(ending.art);
    $('play-screen').hidden = true;
    $('ending-screen').hidden = false;
    $('chapter').hidden = true;
    $('ending-number').textContent = `ENDING ${ending.number}`;
    $('ending-title').textContent = ending.title;
    $('ending-line').textContent = ending.line;
    $('completion').hidden = progress.endings.length !== 3;
    updateBonusButtons();
  }
  function updatePlaybackButtons() {
    $('auto-button').setAttribute('aria-pressed', auto);
    $('auto-button').querySelector('span').textContent = auto ? 'ON' : 'OFF';
    $('skip-button').setAttribute('aria-pressed', skip);
  }
  function toggleUI() {
    const hidden = $('game').classList.toggle('clean-view');
    $('restore-ui').hidden = !hidden;
    if (hidden) clearTimeout(autoTimer);
    else scheduleAuto();
  }
  function openModal(kind, title, kicker = 'NOAH') {
    clearTimeout(autoTimer);
    stopMovie();
    stopShortStory();
    if (!modalKind) previousFocus = document.activeElement;
    modalKind = kind;
    $('modal-title').textContent = title;
    $('modal-kicker').textContent = kicker;
    const bonusChild = ['short-story', 'gallery', 'movie'].includes(kind);
    $('modal-close').textContent = bonusChild ? 'もどる' : '×';
    $('modal-close').setAttribute('aria-label', bonusChild ? 'オマケに戻る' : '閉じる');
    $('modal-close').classList.toggle('is-back', bonusChild);
    $('modal-content').replaceChildren();
    $('modal-content').scrollTop = 0;
    $('modal').hidden = false;
    $('modal-close').focus();
  }
  function closeModal() {
    stopMovie();
    stopShortStory();
    $('modal').hidden = true;
    modalKind = '';
    if (previousFocus?.isConnected) previousFocus.focus();
    scheduleAuto();
  }
  function leaveModal() {
    if (['short-story', 'gallery', 'movie'].includes(modalKind)) openBonus();
    else closeModal();
  }
  function openConfirm(title, text, label, action, cancel = closeModal) {
    openModal('confirm', title);
    const message = document.createElement('p');
    message.className = 'confirm-copy';
    message.textContent = text;
    const buttons = document.createElement('div');
    buttons.className = 'confirm-actions';
    const yes = document.createElement('button');
    yes.className = 'primary';
    yes.textContent = label;
    yes.onclick = action;
    const no = document.createElement('button');
    no.className = 'text-button';
    no.textContent = '戻る';
    no.onclick = cancel;
    buttons.append(yes, no);
    $('modal-content').append(message, buttons);
  }
  function openLog() {
    openModal('log', '会話の記録', 'OUR CONVERSATION');
    for (const entry of state?.history || []) {
      const block = document.createElement('div');
      block.className = `log-entry${entry.selected ? ' selected' : ''}`;
      const name = document.createElement('p');
      name.className = 'log-name';
      name.textContent = entry.speaker || '—';
      const text = document.createElement('p');
      text.textContent = entry.text;
      block.append(name, text);
      $('modal-content').append(block);
    }
    $('modal-content').scrollTop = $('modal-content').scrollHeight;
  }
  function openGallery() {
    if (!bonusUnlocked()) return;
    openModal('gallery', '記憶の余白', 'THE SPACE BETWEEN');
    const heading = document.createElement('h3');
    heading.textContent = `たどり着いた結末　${progress.endings.length} / 3`;
    $('modal-content').append(heading);
    for (const [key, ending] of Object.entries(endings)) {
      const unlocked = progress.endings.includes(key);
      const card = document.createElement('div');
      card.className = 'ending-card';
      const visual = document.createElement(unlocked ? 'img' : 'span');
      if (unlocked) { visual.src = `assets/${arts[ending.art].file}`; visual.alt = ''; }
      else { visual.className = 'locked-art'; visual.textContent = '◇'; }
      const copy = document.createElement('div');
      const number = document.createElement('span');
      number.className = 'number';
      number.textContent = `ENDING ${ending.number}`;
      const title = document.createElement('strong');
      title.textContent = unlocked ? ending.title : 'まだ、空白。';
      copy.append(number, title);
      if (unlocked) {
        const line = document.createElement('small');
        line.textContent = ending.line.replace('\n', ' ');
        copy.append(line);
      }
      card.append(visual, copy);
      $('modal-content').append(card);
    }
    const artHeading = document.createElement('h3');
    const entries = Object.entries(arts).filter(([, art]) => !art.background);
    artHeading.textContent = `あのときの表情　${entries.filter(([key]) => progress.arts.includes(key)).length} / ${entries.length}`;
    const grid = document.createElement('div');
    grid.className = 'art-grid';
    for (const [key, art] of entries) {
      const tile = document.createElement('button');
      tile.className = 'art-tile';
      const unlocked = progress.arts.includes(key);
      const visual = document.createElement(unlocked ? 'img' : 'span');
      if (unlocked) { visual.src = `assets/${art.file}`; visual.alt = art.title; visual.loading = 'lazy'; }
      else { visual.className = 'unseen'; visual.textContent = '？'; }
      const title = document.createElement('p');
      title.textContent = unlocked ? art.title : 'まだ見ぬ表情';
      tile.append(visual, title);
      tile.disabled = !unlocked;
      if (unlocked) tile.onclick = () => openArtwork(key);
      grid.append(tile);
    }
    const note = document.createElement('p');
    note.className = 'gallery-note';
    note.textContent = '出会った表情を、もう一度。イラストをタップすると大きく表示できます。';
    $('modal-content').append(artHeading, grid, note);
  }
  function bonusUnlocked() {
    return progress.endings.length > 0;
  }
  function updateBonusButtons() {
    $('bonus').hidden = $('ending-bonus').hidden = !bonusUnlocked();
  }
  function noahNote(text) {
    const note = document.createElement('div');
    note.className = 'noah-note';
    const copy = document.createElement('p');
    copy.textContent = text;
    const signature = document.createElement('span');
    signature.textContent = 'ノアより';
    note.append(copy, signature);
    return note;
  }
  function openBonus() {
    if (!bonusUnlocked()) return;
    openModal('bonus', 'ノアのオマケ', 'A LITTLE GIFT FROM NOAH');
    $('modal-content').append(noahNote('最後まで遊んでくれて、ありがと！\n特別に、僕のお気に入りを見せてあげるね！'));
    const memories = document.createElement('button');
    memories.className = 'movie-card memory-card';
    memories.setAttribute('aria-label', '記憶の余白をひらく');
    const memoryPreview = document.createElement('div');
    memoryPreview.className = 'movie-preview';
    const memoryPortrait = document.createElement('img');
    memoryPortrait.src = 'assets/warm-laugh.webp';
    memoryPortrait.alt = '';
    memoryPortrait.loading = 'lazy';
    memoryPreview.append(memoryPortrait);
    const memoryTitle = document.createElement('strong');
    memoryTitle.textContent = '記憶の余白';
    const memoryCount = document.createElement('span');
    memoryCount.className = 'movie-number';
    memoryCount.textContent = `MEMORIES · ${progress.endings.length} / 3`;
    const memoryComment = document.createElement('p');
    memoryComment.textContent = 'いろんな僕の顔、覚えてる？\n君が見つけてくれた思い出、ここに集めておいたよ！\n何度でも、会いにきてね！';
    const memorySignature = document.createElement('span');
    memorySignature.className = 'movie-signature';
    memorySignature.textContent = 'ノアより';
    memories.append(memoryPreview, memoryCount, memoryTitle, memoryComment, memorySignature);
    memories.onclick = openGallery;
    $('modal-content').append(memories);
    for (const story of bonusStories) {
      const card = document.createElement('button');
      card.className = 'movie-card short-story-card';
      card.setAttribute('aria-label', `${story.title}を読む`);
      const preview = document.createElement('div');
      preview.className = 'movie-preview';
      const cover = document.createElement('img');
      cover.src = story.cover || story.chapters[0].art;
      cover.alt = '';
      cover.loading = 'lazy';
      const mark = document.createElement('span');
      mark.className = 'short-story-mark';
      mark.textContent = '読む';
      preview.append(cover, mark);
      const number = document.createElement('span');
      number.className = 'movie-number';
      number.textContent = 'SHORT STORY · 全五幕';
      const title = document.createElement('strong');
      title.textContent = story.title;
      const copy = document.createElement('p');
      copy.textContent = story.description;
      const signature = document.createElement('span');
      signature.className = 'movie-signature';
      signature.textContent = 'ノアより';
      card.append(preview, number, title, copy, signature);
      card.onclick = () => openShortStory(story.id);
      $('modal-content').append(card);
    }
    movies.forEach((movie, index) => {
      const card = document.createElement('button');
      card.className = 'movie-card';
      card.setAttribute('aria-label', `${movie.title}を再生`);
      const preview = document.createElement('div');
      preview.className = 'movie-preview';
      if (movie.poster) {
        const poster = document.createElement('img');
        poster.src = movie.poster;
        poster.alt = '';
        poster.loading = 'lazy';
        preview.append(poster);
      }
      const play = document.createElement('span');
      play.className = 'movie-play-mark';
      play.textContent = '▷';
      play.setAttribute('aria-hidden', 'true');
      preview.append(play);
      const number = document.createElement('span');
      number.className = 'movie-number';
      number.textContent = `MOVIE ${String(index + 1).padStart(2, '0')}`;
      const title = document.createElement('strong');
      title.textContent = movie.title;
      const copy = document.createElement('p');
      copy.textContent = movie.description;
      const signature = document.createElement('span');
      signature.className = 'movie-signature';
      signature.textContent = 'ノアより';
      card.append(preview, number, title, copy, signature);
      card.onclick = () => openMovie(movie.id);
      $('modal-content').append(card);
    });
  }
  function openShortStory(id) {
    if (!bonusUnlocked()) return;
    const story = bonusStories.find(item => item.id === id);
    if (!story) return;
    openModal('short-story', story.title, 'NOAH’S LITTLE STORY');
    const pages = story.chapters.flatMap(chapter => chapter.pages.map(page => ({ ...page, art: page.art || chapter.art, alt: page.alt || chapter.alt, chapter: chapter.title })));
    const reader = document.createElement('div');
    reader.className = 'short-story-reader';
    const art = document.createElement('img');
    art.className = 'short-story-art';
    art.draggable = false;
    const shade = document.createElement('div');
    shade.className = 'short-story-shade';
    shade.setAttribute('aria-hidden', 'true');
    const chapter = document.createElement('p');
    chapter.className = 'short-story-chapter';
    const copy = document.createElement('div');
    copy.className = 'short-story-copy';
    copy.setAttribute('role', 'group');
    const speaker = document.createElement('span');
    speaker.className = 'short-story-speaker';
    const advance = document.createElement('button');
    advance.className = 'short-story-dialogue';
    advance.title = 'タップしてつぎへ';
    const text = document.createElement('span');
    text.className = 'short-story-text';
    text.setAttribute('aria-live', 'polite');
    text.setAttribute('aria-atomic', 'true');
    const marker = document.createElement('span');
    marker.className = 'short-story-marker';
    marker.textContent = '◇';
    marker.setAttribute('aria-hidden', 'true');
    advance.append(text, marker);
    copy.append(speaker, advance);
    advance.onclick = event => { event.stopPropagation(); moveShortStory(1); };
    reader.onclick = () => moveShortStory(1);
    reader.append(art, shade, chapter, copy);
    $('modal-content').append(reader);
    activeShortStory = { pages, index: 0, artKey: null, prefetched: new Set(),
      restoreMusic: screen !== 'title' || sound.context?.state === 'running',
      nodes: { reader, art, chapter, copy, speaker, text, advance } };
    $('modal').classList.add('is-short-story');
    renderShortStory();
    sound.start().catch(() => {});
  }
  function renderShortStory() {
    if (!activeShortStory) return;
    const { pages, index, nodes, prefetched } = activeShortStory;
    const page = pages[index];
    const gender = state?.gender || saved?.gender;
    const call = gender === 'male' ? 'お兄さん' : gender === 'female' ? 'お姉さん' : '君';
    if (activeShortStory.artKey !== page.art) {
      nodes.art.src = page.art;
      nodes.art.alt = page.alt || page.chapter;
      activeShortStory.artKey = page.art;
    }
    nodes.chapter.textContent = page.chapter;
    nodes.speaker.textContent = page.speaker || '—';
    nodes.text.textContent = (!gender && page.neutral ? page.neutral : page.text).replaceAll('{call}', call);
    nodes.reader.classList.toggle('is-narration', !page.speaker);
    nodes.copy.scrollTop = 0;
    nodes.copy.setAttribute('aria-label', `${pages.length}ページ中、${index + 1}ページ`);
    const finalPage = index === pages.length - 1;
    nodes.advance.title = finalPage ? 'タップしてオマケへ' : 'タップしてつぎへ';
    nodes.advance.setAttribute('aria-label', finalPage ? '読み終えてオマケに戻る' : 'つぎへ');
    // Preload just the next illustration, only after the reader has been opened.
    const nextArt = pages.slice(index + 1).find(item => item.art !== page.art)?.art;
    if (nextArt && !prefetched.has(nextArt)) {
      prefetched.add(nextArt);
      const image = new Image();
      image.src = nextArt;
    }
  }
  function moveShortStory(direction) {
    if (!activeShortStory) return;
    const next = activeShortStory.index + direction;
    if (next < 0) return;
    if (next >= activeShortStory.pages.length) { openBonus(); return; }
    activeShortStory.index = next;
    renderShortStory();
  }
  function stopShortStory() {
    $('modal').classList.remove('is-short-story');
    if (!activeShortStory) return;
    const restoreMusic = activeShortStory.restoreMusic;
    activeShortStory = null;
    if (!restoreMusic) sound.pause();
  }
  function openMovie(id) {
    if (!bonusUnlocked()) return;
    const movie = movies.find(item => item.id === id);
    if (!movie) return;
    openModal('movie', movie.title, 'NOAH’S MOVIE');
    const video = document.createElement('video');
    video.className = 'movie-player';
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('playsinline', '');
    video.setAttribute('controlsList', 'nodownload noremoteplayback');
    video.setAttribute('aria-label', movie.title);
    video.disablePictureInPicture = true;
    if (movie.width > 0 && movie.height > 0) video.style.aspectRatio = `${movie.width} / ${movie.height}`;
    if (movie.poster) video.poster = movie.poster;
    video.src = movie.src;
    const status = document.createElement('p');
    status.className = 'movie-status';
    status.setAttribute('role', 'status');
    status.textContent = '映像を読み込んでいます。';
    const startPlayback = () => {
      status.textContent = '映像を読み込んでいます。';
      const offerPlayButton = () => {
        if (activeMovie === video && !video.error) status.textContent = '再生ボタンを押すと、音声つきで始まります。';
      };
      try { video.play()?.catch(offerPlayButton); }
      catch { offerPlayButton(); }
    };
    const retry = document.createElement('button');
    retry.className = 'text-button';
    retry.textContent = '映像を再読み込み';
    retry.hidden = true;
    retry.onclick = () => { retry.hidden = true; video.load(); startPlayback(); };
    video.addEventListener('error', () => {
      status.textContent = '映像を読み込めませんでした。通信状態を確認して、もう一度お試しください。';
      retry.hidden = false;
    });
    video.addEventListener('playing', () => { status.textContent = ''; retry.hidden = true; });
    video.addEventListener('ended', () => { status.textContent = '「ね、もう一回見よっか！」 — ノア'; });
    $('modal-content').append(video, status, retry);
    restoreMovieMusic = screen !== 'title' || sound.context?.state === 'running';
    activeMovie = video;
    sound.pause();
    // The movie card is already a play gesture; start here rather than showing
    // the same poster and introduction followed by a second play button.
    startPlayback();
  }
  function stopMovie() {
    if (!activeMovie) return;
    const video = activeMovie;
    activeMovie = null;
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (restoreMovieMusic && !document.hidden) sound.start().catch(() => {});
    restoreMovieMusic = false;
  }
  function openArtwork(key) {
    $('viewer-image').src = `assets/${arts[key].file}`;
    $('viewer-image').alt = arts[key].title;
    $('viewer-caption').textContent = arts[key].title;
    $('art-viewer').hidden = false;
    $('viewer-close').focus();
  }
  function closeArtwork() {
    $('art-viewer').hidden = true;
    $('modal-close').focus();
  }
  function openSettings() {
    openModal('settings', 'お話の支度', 'MAKE YOURSELF COMFORTABLE');
    $('modal-content').innerHTML = `<div class="setting-row"><label for="setting-sound">音楽と部屋の音 <input id="setting-sound" type="checkbox"></label><small>小さな音で、耳を澄ませて。</small></div><div class="setting-row"><label for="volume">音の大きさ</label><input id="volume" type="range" min="0" max="80" step="1" aria-label="音の大きさ"></div><div class="setting-row"><label>文字の速さ</label><div id="speed-options" class="setting-options"></div></div><div class="setting-row"><label for="motion">光と視点のゆらぎ <input id="motion" type="checkbox"></label></div><p class="settings-note">画面をタップすると会話が進みます。<br>文字の表示中にタップすると、全文を表示します。<br>「会話ログ」で、これまでの言葉を読み返せます。<br>一度見た結末があると「既読送り」が使えます。</p>`;
    const saveStatus = document.createElement('p');
    saveStatus.className = 'settings-note';
    saveStatus.setAttribute('data-save-status', '');
    saveStatus.setAttribute('role', 'status');
    saveStatus.textContent = persistence?.status() || '進行はこの端末に保存されます';
    $('modal-content').append(saveStatus);
    const actions = document.createElement('nav');
    actions.className = 'settings-actions';
    actions.setAttribute('aria-label', 'ゲームの操作');
    const home = document.createElement('button');
    home.id = 'settings-home';
    home.textContent = 'トップに戻る';
    home.onclick = () => {
      if (screen === 'play') saveGame();
      showTitle();
      persistence?.flush();
    };
    const reset = document.createElement('button');
    reset.id = 'settings-reset';
    reset.textContent = 'リセット';
    reset.onclick = () => openConfirm('記録をリセット', '途中の進行、クリア記録、イラスト、既読とオマケの解放状態をすべて消して、トップに戻ります。音や文字速度の設定は残ります。この操作は取り消せません。', 'リセットする', resetGame, openSettings);
    actions.append(home, reset);
    $('modal-content').append(actions);
    $('setting-sound').checked = preferences.sound;
    $('setting-sound').onchange = event => setSound(event.target.checked);
    $('volume').value = preferences.volume * 100;
    $('volume').oninput = event => {
      preferences.volume = Number(event.target.value) / 100;
      sound.setVolume(preferences.volume);
      persist();
    };
    for (const [label, value] of [['ゆっくり', 52], ['ふつう', 32], ['はやい', 18], ['一括', 0]]) {
      const button = document.createElement('button');
      button.textContent = label;
      button.classList.toggle('active', value === preferences.speed);
      button.setAttribute('aria-pressed', value === preferences.speed);
      button.onclick = () => {
        preferences.speed = value;
        for (const sibling of $('speed-options').children) {
          sibling.classList.toggle('active', sibling === button);
          sibling.setAttribute('aria-pressed', sibling === button);
        }
        if (!value && typing) completeText();
        persist();
      };
      $('speed-options').append(button);
    }
    $('motion').checked = preferences.motion;
    $('motion').onchange = event => {
      preferences.motion = event.target.checked;
      $('game').classList.toggle('reduced-motion', !preferences.motion);
      persist();
    };
  }
  function applyReset(value) {
    stopTimers();
    resetAt = value.resetAt;
    checkpointAt = value.checkpointAt;
    saved = isValidSave(value.save) ? value.save : null;
    saveAdjusted = false;
    state = null;
    for (const key of ['endings', 'arts', 'seen']) progress[key] = value[key] || [];
    for (const key of Object.keys(conversationUsage)) delete conversationUsage[key];
    Object.assign(conversationUsage, conversations.cleanUsage(value.conversationUsage));
    showTitle();
  }
  function resetGame() {
    let value;
    if (persistence?.reset) value = persistence.reset({ preferences, storyRevision: revision });
    else {
      const stamp = Math.max(Date.now(), resetAt + 1, checkpointAt + 1);
      value = { preferences, storyRevision: revision, resetAt: stamp, checkpointAt: stamp, updatedAt: stamp,
        save: null, endings: [], arts: [], seen: [], conversationUsage: {} };
      let writes = 0;
      for (const key of ['noah-remember-backup-v1', storageKey]) {
        try { localStorage.setItem(key, JSON.stringify(value)); writes++; } catch { /* Keep trying the other copy. */ }
      }
      if (!writes) { showToast('記録を保存できません。接続とブラウザーの保存設定を確認してください。'); return; }
    }
    if (value.resetAt > resetAt) applyReset(value);
    showToast('記録をリセットしました。');
  }
  function setSound(enabled) {
    preferences.sound = enabled;
    sound.setEnabled(enabled);
    $('sound').setAttribute('aria-pressed', enabled);
    $('sound').setAttribute('aria-label', enabled ? '音を消す' : '音を鳴らす');
    if ($('setting-sound')) $('setting-sound').checked = enabled;
    persist();
  }
  $('start').onclick = () => {
    if (saved && (saved.scene !== 'opening' || saved.index > 0)) openConfirm('最初の声から', 'いま読んでいるお話を最初から始めます。集めた結末とイラストは残ります。', 'はじめから', startGame);
    else startGame();
  };
  $('continue').onclick = continueGame;
  $('bonus').onclick = openBonus;
  $('ending-bonus').onclick = openBonus;
  $('settings').onclick = openSettings;
  $('sound').onclick = () => setSound(!preferences.sound);
  $('dialogue').onclick = advance;
  $('stage').onclick = advance;
  $('home').onclick = () => {
    if (screen === 'play') openConfirm('少し、ひと休み', 'いまの場所まで保存されています。つづきは、いつでも。', 'タイトルに戻る', showTitle);
    else showTitle();
  };
  $('auto-button').onclick = () => { auto = !auto; skip = false; updatePlaybackButtons(); scheduleAuto(); };
  $('skip-button').onclick = () => { skip = !skip; auto = false; updatePlaybackButtons(); if (skip && wasRead && typing) completeText(); scheduleAuto(); };
  $('log-button').onclick = openLog;
  $('hide-button').onclick = toggleUI;
  $('restore-ui').onclick = toggleUI;
  $('modal-close').onclick = leaveModal;
  $('viewer-close').onclick = closeArtwork;
  $('ending-home').onclick = showTitle;
  $('modal').addEventListener('click', event => { if (event.target === $('modal')) leaveModal(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!$('art-viewer').hidden) closeArtwork();
      else if (modalKind) leaveModal();
      else if ($('game').classList.contains('clean-view')) toggleUI();
      else openSettings();
      return;
    }
    if (modalKind === 'short-story' && activeShortStory && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      if (!event.repeat) moveShortStory(event.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (event.key === 'Tab' && (modalKind || !$('art-viewer').hidden)) {
      const container = !$('art-viewer').hidden ? $('art-viewer') : $('modal');
      const elements = [...container.querySelectorAll('button:not(:disabled),input,video[controls]')];
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if ([' ', 'Enter', 'ArrowRight'].includes(event.key) && screen === 'play' && !modalKind && $('art-viewer').hidden && !event.repeat && !['BUTTON', 'INPUT'].includes(document.activeElement.tagName)) {
      event.preventDefault(); advance();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(autoTimer); sound.pause(); activeMovie?.pause(); }
    else { if ((screen !== 'title' || activeShortStory) && !activeMovie) sound.start().catch(() => {}); scheduleAuto(); }
  });
  window.addEventListener('pagehide', () => { activeMovie?.pause(); persistence?.flush(); });
  $('sound').setAttribute('aria-pressed', preferences.sound);
  $('game').classList.toggle('reduced-motion', !preferences.motion);
  $('start').disabled = false;
  if (persistence) persistence.subscribe(value => {
    if (value.resetAt > resetAt) { applyReset(value); return; }
    for (const key of ['endings', 'arts', 'seen']) progress[key] = [...new Set([...progress[key], ...value[key]])];
    if (screen === 'title') {
      if (value.checkpointAt >= checkpointAt) {
        saved = isValidSave(value.save) ? value.save : null;
        checkpointAt = value.checkpointAt;
      }
      // Do not close an open settings, gallery or movie when a save is acknowledged.
      $('continue').disabled = !saved;
      $('continue-chapter').textContent = saved ? scenes[saved.scene].title : '';
    }
    updateBonusButtons();
  });
  showTitle();
  // Warm subsequent images without delaying the opening screen.
  setTimeout(() => {
    for (const key of Object.keys(arts)) loadImage(key).catch(() => {});
  }, 1200);
  }
  if (window.NoahPersistence) window.NoahPersistence.ready.then(initialize);
  else initialize();
})();
