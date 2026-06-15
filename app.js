const STORAGE_KEY = 'camille-calisthenics-v4';
const LEGACY_STORAGE_KEY = 'camille-calisthenics-v2';
const OLDER_LEGACY_STORAGE_KEY = 'camille-calisthenics-v1';

const SUPABASE_READY = Boolean(
  window.supabase &&
  window.SUPABASE_URL &&
  window.SUPABASE_ANON_KEY &&
  !window.SUPABASE_URL.includes('PASTE_') &&
  !window.SUPABASE_ANON_KEY.includes('PASTE_')
);

const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
window.appSupabaseClient = supabaseClient;

let currentUser = null;
let syncTimer = null;

const tracks = {
  pushup: [
    { name: 'Incline push-up', prescription: '3 × 5' },
    { name: 'Incline push-up', prescription: '3 × 8' },
    { name: 'Incline push-up', prescription: '3 × 10' },
    { name: 'Lower incline push-up', prescription: '3 × 5' },
    { name: 'Lower incline push-up', prescription: '3 × 8' },
    { name: 'Knee push-up', prescription: '3 × 5' },
    { name: 'Knee push-up', prescription: '3 × 8' },
    { name: 'Full push-up', prescription: '3 × 3' },
    { name: 'Full push-up', prescription: '3 × 5' },
    { name: 'Full push-up', prescription: '3 × 8' }
  ],
  pullup: [
    { name: 'Dead hang + negative pull-up', prescription: '3 × 20s + 3 × 1' },
    { name: 'Dead hang + negative pull-up', prescription: '3 × 30s + 3 × 2' },
    { name: 'Dead hang + negative pull-up', prescription: '3 × 40s + 3 × 3' },
    { name: 'Scapular pull-up', prescription: '3 × 5' },
    { name: 'Scapular pull-up', prescription: '3 × 8' },
    { name: 'Assisted pull-up', prescription: '3 × 3' },
    { name: 'First pull-up attempt', prescription: '5 attempts' }
  ],
  dip: [
    { name: 'Negative dip', prescription: '3 × 2' },
    { name: 'Negative dip', prescription: '3 × 4' },
    { name: 'Dip', prescription: '3 × 1' },
    { name: 'Dip', prescription: '3 × 2' },
    { name: 'Dip', prescription: '3 × 3' },
    { name: 'Dip', prescription: '3 × 5' }
  ],
  legs: [
    { name: 'Bodyweight squat', prescription: '3 × 10' },
    { name: 'Bodyweight squat', prescription: '3 × 15' },
    { name: 'Reverse lunge', prescription: '3 × 8/side' },
    { name: 'Reverse lunge', prescription: '3 × 10/side' },
    { name: 'Kettlebell deadlift', prescription: '3 × 10' },
    { name: 'Goblet squat', prescription: '3 × 8' }
  ],
  core: [
    { name: 'Plank', prescription: '3 × 20s' },
    { name: 'Plank', prescription: '3 × 30s' },
    { name: 'Plank', prescription: '3 × 45s' },
    { name: 'Hollow hold', prescription: '3 × 15s' },
    { name: 'Hollow hold', prescription: '3 × 30s' },
    { name: 'Hanging knee raise', prescription: '3 × 5' },
    { name: 'Hanging knee raise', prescription: '3 × 10' }
  ],
  crow: [
    { name: 'Crow weight shift', prescription: '5 × 10s' },
    { name: 'Crow one-foot lift', prescription: '5 attempts/side' },
    { name: 'Crow hold', prescription: '5 × 3s' },
    { name: 'Crow hold', prescription: '5 × 5s' },
    { name: 'Crow hold', prescription: '5 × 10s' },
    { name: 'Crow hold', prescription: '3 × 20s' }
  ],
  lsit: [
    { name: 'Tuck sit', prescription: '5 × 10s' },
    { name: 'Tuck sit', prescription: '5 × 20s' },
    { name: 'Extended tuck', prescription: '5 × 10s' },
    { name: 'Extended tuck', prescription: '5 × 20s' },
    { name: 'One-leg L-sit', prescription: '5 × 10s/side' },
    { name: 'L-sit', prescription: '5 attempts' }
  ],
  rope: [
    { name: 'Jump rope', prescription: '3 × 30s' },
    { name: 'Jump rope', prescription: '3 × 45s' },
    { name: 'Jump rope', prescription: '3 × 60s' },
    { name: 'Jump rope', prescription: '5 min easy' }
  ]
};

const rotation = [
  { name: 'Push', tracks: ['pushup', 'dip', 'core'] },
  { name: 'Pull', tracks: ['pullup', 'core', 'rope'] },
  { name: 'Legs + Core', tracks: ['legs', 'core', 'rope'] },
  { name: 'Skills', tracks: ['crow', 'lsit', 'pullup'] }
];

const energyOptions = {
  great: { label: '😊 Great', mode: 'normal', title: 'Great', description: 'Standard workout · estimated duration 20 min.' },
  normal: { label: '🙂 Normal', mode: 'normal', title: 'Normal', description: 'Standard workout · estimated duration 20 min.' },
  tired: { label: '😴 Tired', mode: 'reduced', title: 'Tired', description: 'Reduced volume · estimated duration 15 min.' },
  exhausted: { label: '🤒 Exhausted', mode: 'minimum', title: 'Exhausted', description: 'Minimum workout suggested · estimated duration 10 min.' }
};

function defaultState() {
  const levels = {};
  Object.keys(tracks).forEach(key => levels[key] = { level: 0, points: 0 });
  return { rotationIndex: 0, levels, history: [], current: null, selectedEnergy: null, generated: null };
}

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem(OLDER_LEGACY_STORAGE_KEY);
  if (!saved) return defaultState();
  try {
    return { ...defaultState(), ...JSON.parse(saved) };
  } catch {
    return defaultState();
  }
}


function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueCloudSave();
}

function publicState() {
  return {
    rotationIndex: state.rotationIndex,
    levels: state.levels,
    history: state.history,
    current: state.current,
    selectedEnergy: state.selectedEnergy,
    generated: state.generated
  };
}

function queueCloudSave() {
  if (!supabaseClient || !currentUser) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(saveCloudState, 500);
}

async function saveCloudState() {
  if (!supabaseClient || !currentUser) return;
  setSyncStatus('Saving...');
  const { error } = await supabaseClient
    .from('workout_states')
    .upsert({ user_id: currentUser.id, state: publicState(), updated_at: new Date().toISOString() });
  setSyncStatus(error ? 'Cloud save failed. Local progress is still saved.' : 'Cloud sync up to date.');
}

async function loadCloudState() {
  if (!supabaseClient || !currentUser) return;
  setSyncStatus('Loading cloud progress...');
  const { data, error } = await supabaseClient
    .from('workout_states')
    .select('state')
    .eq('user_id', currentUser.id)
    .maybeSingle();

  if (error) {
    setSyncStatus('Could not load cloud progress. Local progress is still available.');
    return;
  }

  if (data?.state) {
    state = { ...defaultState(), ...data.state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
    setSyncStatus('Cloud progress loaded.');
  } else {
    await saveCloudState();
    setSyncStatus('New cloud profile created from this device.');
  }
}

function setSyncStatus(message) {
  const el = document.getElementById('syncStatus');
  if (el) el.textContent = message;
}


function setAuthMessage(message, type = 'info') {
  const el = document.getElementById('authMessage');
  if (!el) return;
  el.textContent = message || '';
  el.dataset.type = type;
}

function friendlyAuthError(message = '') {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Email or password is incorrect.';
  if (lower.includes('already registered') || lower.includes('already exists')) return 'An account already exists with this email. Try logging in instead.';
  if (lower.includes('password') && lower.includes('characters')) return 'Password is too short. Use at least 6 characters.';
  if (lower.includes('email')) return 'Please enter a valid email address.';
  if (lower.includes('rate limit')) return 'Too many attempts. Wait a minute and try again.';
  return message || 'Something went wrong. Please try again.';
}

function togglePasswordVisibility() {
  const input = document.getElementById('passwordInput');
  const btn = document.getElementById('togglePasswordBtn');
  if (!input || !btn) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? 'Hide' : 'Show';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}


function getExercise(trackKey) {
  const trackState = state.levels[trackKey];
  const track = tracks[trackKey];
  return { trackKey, ...track[Math.min(trackState.level, track.length - 1)], level: trackState.level + 1 };
}

function getTodayWorkout(mode = 'normal') {
  const workout = rotation[state.rotationIndex];
  const count = mode === 'minimum' ? 2 : workout.tracks.length;
  return {
    mode,
    workoutName: workout.name,
    exercises: workout.tracks.slice(0, count).map(getExercise)
  };
}

function modeLabel(mode) {
  if (mode === 'minimum') return '10 min · Minimum Mode';
  if (mode === 'reduced') return '15 min · Reduced Mode';
  return '20 min · Standard Mode';
}

function renderToday() {
  document.getElementById('exerciseList').innerHTML = '';
  document.getElementById('completeBtn').classList.add('hidden');

  if (state.current) {
    document.getElementById('energyCard').classList.add('hidden');
    document.getElementById('selectedEnergyCard').classList.add('hidden');
    document.getElementById('generatedWorkoutCard').classList.add('hidden');
    document.getElementById('exercisePreview').classList.add('hidden');
    renderExercises();
    return;
  }

  if (state.generated) {
    document.getElementById('energyCard').classList.add('hidden');
    document.getElementById('selectedEnergyCard').classList.add('hidden');
    document.getElementById('generatedWorkoutCard').classList.remove('hidden');
    document.getElementById('exercisePreview').classList.remove('hidden');
    renderGeneratedWorkout();
    return;
  }

  if (state.selectedEnergy) {
    renderSelectedEnergy();
    return;
  }

  document.getElementById('energyCard').classList.remove('hidden');
  document.getElementById('selectedEnergyCard').classList.add('hidden');
  document.getElementById('generatedWorkoutCard').classList.add('hidden');
  document.getElementById('exercisePreview').classList.add('hidden');
}

function selectEnergy(feel) {
  state.selectedEnergy = feel;
  state.generated = null;
  saveState();
  renderSelectedEnergy();
}

function renderSelectedEnergy() {
  const option = energyOptions[state.selectedEnergy || 'normal'];
  document.getElementById('energyCard').classList.add('hidden');
  document.getElementById('selectedEnergyCard').classList.remove('hidden');
  document.getElementById('generatedWorkoutCard').classList.add('hidden');
  document.getElementById('exercisePreview').classList.add('hidden');
  document.getElementById('selectedEnergyTitle').textContent = option.label;
  document.getElementById('selectedEnergyDescription').textContent = option.description;
}

function generateWorkout() {
  const option = energyOptions[state.selectedEnergy || 'normal'];
  state.generated = getTodayWorkout(option.mode);
  saveState();
  renderGeneratedWorkout();
}

function renderGeneratedWorkout() {
  const generated = state.generated || getTodayWorkout('normal');
  document.getElementById('generatedWorkoutCard').classList.remove('hidden');
  document.getElementById('exercisePreview').classList.remove('hidden');
  document.getElementById('workoutName').textContent = generated.workoutName;
  document.getElementById('workoutMeta').textContent = modeLabel(generated.mode);

  const preview = document.getElementById('previewList');
  preview.innerHTML = '';
  generated.exercises.forEach(exercise => {
    const row = document.createElement('div');
    row.className = 'preview-row';
    row.innerHTML = `<strong>${exercise.name}</strong><span>${exercise.prescription}</span>`;
    preview.appendChild(row);
  });
}

function startWorkout() {
  if (!state.generated) generateWorkout();
  state.current = { ...state.generated, ratings: {} };
  state.generated = null;
  saveState();
  renderExercises();
}

function renderExercises() {
  document.getElementById('energyCard').classList.add('hidden');
  document.getElementById('selectedEnergyCard').classList.add('hidden');
  document.getElementById('generatedWorkoutCard').classList.add('hidden');
  document.getElementById('exercisePreview').classList.add('hidden');

  const list = document.getElementById('exerciseList');
  list.innerHTML = '';

  const titleCard = document.createElement('div');
  titleCard.className = 'hero-card';
  titleCard.innerHTML = `<p class="muted-light">Today's workout</p><h2>${state.current.workoutName}</h2><p>${modeLabel(state.current.mode)}</p>`;
  list.appendChild(titleCard);

  state.current.exercises.forEach((exercise) => {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    const selectedRating = state.current.ratings[exercise.trackKey];
    card.innerHTML = `
      <h3>${exercise.name}<span>L${exercise.level}</span></h3>
      <p class="prescription">${exercise.prescription}</p>
      <div class="set-row"><span>Set 1</span><input type="checkbox"></div>
      <div class="set-row"><span>Set 2</span><input type="checkbox"></div>
      <div class="set-row"><span>Set 3</span><input type="checkbox"></div>
      <p class="rating-label">How was it?</p>
      <div class="rating-row" data-track="${exercise.trackKey}">
        <button data-rating="easy" class="${selectedRating === 'easy' ? 'selected' : ''}">Easy</button>
        <button data-rating="good" class="${selectedRating === 'good' ? 'selected' : ''}">Good</button>
        <button data-rating="hard" class="${selectedRating === 'hard' ? 'selected' : ''}">Hard</button>
        <button data-rating="failed" class="${selectedRating === 'failed' ? 'selected' : ''}">Failed</button>
      </div>
    `;
    list.appendChild(card);
  });
  document.getElementById('completeBtn').classList.remove('hidden');
}

function applyRating(trackKey, rating) {
  const trackState = state.levels[trackKey];
  const delta = { easy: 2, good: 1, hard: 0, failed: -1 }[rating];
  trackState.points += delta;

  if (trackState.points >= 3) {
    trackState.level = Math.min(trackState.level + 1, tracks[trackKey].length - 1);
    trackState.points = 0;
  }
  if (trackState.points <= -2) {
    trackState.level = Math.max(trackState.level - 1, 0);
    trackState.points = 0;
  }
}

function completeWorkout() {
  if (!state.current) return;
  const ratedCount = Object.keys(state.current.ratings).length;
  if (ratedCount < state.current.exercises.length) {
    const ok = confirm('Some exercises are not rated yet. Complete workout anyway?');
    if (!ok) return;
  }

  Object.entries(state.current.ratings).forEach(([trackKey, rating]) => applyRating(trackKey, rating));
  state.history.push({ date: new Date().toISOString(), workout: state.current.workoutName, mode: state.current.mode });
  state.rotationIndex = (state.rotationIndex + 1) % rotation.length;
  state.current = null;
  state.selectedEnergy = null;
  state.generated = null;
  saveState();
  alert('Workout complete. See you next time.');
  renderToday();
  renderGoals();
  renderProgress();
}

function getTrackLevel(trackKey) {
  return state.levels[trackKey]?.level || 0;
}

function renderGoals() {
  const pullLevel = getTrackLevel('pullup');
  const pullTrack = tracks.pullup;
  const current = pullTrack[Math.min(pullLevel, pullTrack.length - 1)];
  const next = pullTrack[Math.min(pullLevel + 1, pullTrack.length - 1)];
  const percent = Math.round(((pullLevel + 1) / pullTrack.length) * 100);

  document.getElementById('pullupStage').textContent = `Current stage: ${current.name}`;
  document.getElementById('pullupProgressBar').style.width = `${percent}%`;
  document.getElementById('pullupNext').textContent = pullLevel >= pullTrack.length - 1
    ? 'Milestone reached: First Pull-Up attempt unlocked'
    : `Next milestone: ${next.name}`;

  const journey = document.getElementById('pullupJourney');
  journey.innerHTML = '';
  pullTrack.forEach((step, index) => {
    const item = document.createElement('div');
    item.className = `journey-item ${index < pullLevel ? 'done' : index === pullLevel ? 'current' : ''}`;
    const icon = index < pullLevel ? '✅' : index === pullLevel ? '●' : '⬜';
    item.innerHTML = `<span>${icon}</span><div><strong>${step.name}</strong><p>${step.prescription}</p></div>`;
    journey.appendChild(item);
  });

  const skills = [
    { key: 'crow', label: 'Crow Pose' },
    { key: 'lsit', label: 'L-Sit' }
  ];
  const skillList = document.getElementById('skillList');
  skillList.innerHTML = '';
  skills.forEach(skill => {
    const level = getTrackLevel(skill.key);
    const track = tracks[skill.key];
    const currentSkill = track[Math.min(level, track.length - 1)];
    const row = document.createElement('div');
    row.className = 'skill-row';
    row.innerHTML = `<div><strong>${skill.label}</strong><p>${currentSkill.name} · ${currentSkill.prescription}</p></div><span>Level ${level + 1}/${track.length}</span>`;
    skillList.appendChild(row);
  });
}

function renderProgress() {
  const now = new Date();
  const monthly = state.history.filter(item => {
    const d = new Date(item.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('monthlyCount').textContent = monthly;

  const levels = document.getElementById('levelsList');
  levels.innerHTML = '';
  const labels = {
    pushup: 'Push-Up',
    pullup: 'Pull-Up',
    dip: 'Dip',
    legs: 'Legs',
    core: 'Core',
    crow: 'Crow Pose',
    lsit: 'L-Sit',
    rope: 'Jump Rope'
  };

  Object.keys(labels).forEach(key => {
    const item = state.levels[key];
    const exercise = tracks[key][item.level];
    const row = document.createElement('div');
    row.className = 'level-row';
    row.innerHTML = `<div><strong>${labels[key]}</strong><p>${exercise.name} · ${exercise.prescription}</p></div><span>L${item.level + 1}</span>`;
    levels.appendChild(row);
  });
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calisthenics-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = { ...defaultState(), ...JSON.parse(reader.result) };
      saveState();
      renderToday();
      renderProgress();
      alert('Progress imported.');
    } catch {
      alert('Could not import this file.');
    }
  };
  reader.readAsText(file);
}


function renderAll() {
  renderToday();
  renderGoals();
  renderProgress();
  renderAccount();
}

function renderAccount() {
  const panel = document.getElementById('accountPanel');
  const loggedOut = document.getElementById('loggedOutAccount');
  const loggedIn = document.getElementById('loggedInAccount');
  const email = document.getElementById('accountEmail');
  const accountBtn = document.getElementById('accountBtn');
  const bottomNav = document.querySelector('.bottom-nav');
  const screens = document.querySelectorAll('.screen');

  if (!panel || !loggedOut || !loggedIn) return;

  if (!SUPABASE_READY) {
    panel.classList.remove('hidden');
    loggedOut.classList.remove('hidden');
    loggedIn.classList.add('hidden');
    screens.forEach(screen => screen.classList.add('auth-locked'));
    if (bottomNav) bottomNav.classList.add('hidden');
    if (accountBtn) accountBtn.classList.add('hidden');
    const muted = loggedOut.querySelector('.muted');
    if (muted) muted.textContent = 'Cloud sync is not configured yet. Add your Supabase URL and anon key in supabase-config.js.';
    return;
  }

  if (currentUser) {
    setAuthMessage('');
    panel.classList.add('hidden');
    loggedOut.classList.add('hidden');
    loggedIn.classList.remove('hidden');
    screens.forEach(screen => screen.classList.remove('auth-locked'));
    if (bottomNav) bottomNav.classList.remove('hidden');
    if (accountBtn) {
      accountBtn.classList.remove('hidden');
      accountBtn.textContent = 'Account';
    }
    if (email) email.textContent = currentUser.email;
  } else {
    panel.classList.remove('hidden');
    loggedOut.classList.remove('hidden');
    loggedIn.classList.add('hidden');
    screens.forEach(screen => screen.classList.add('auth-locked'));
    if (bottomNav) bottomNav.classList.add('hidden');
    if (accountBtn) accountBtn.classList.add('hidden');
  }
}

async function initCloudSync() {
  if (!supabaseClient) {
    renderAccount();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session?.user || null;
  renderAccount();
  if (currentUser) await loadCloudState();

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    renderAccount();
    if (currentUser) await loadCloudState();
  });
}

async function signUp() {
  if (!supabaseClient) return setAuthMessage('Cloud sync is not configured yet.', 'error');
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  if (!email || !password) return setAuthMessage('Enter your email and password.', 'error');
  if (password.length < 6) return setAuthMessage('Password must be at least 6 characters.', 'error');
  setAuthMessage('Creating your account...', 'info');
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) return setAuthMessage(friendlyAuthError(error.message), 'error');
  setAuthMessage('Account created. You are logged in.', 'success');
}

async function login() {
  if (!supabaseClient) return setAuthMessage('Cloud sync is not configured yet.', 'error');
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  if (!email || !password) return setAuthMessage('Enter your email and password.', 'error');
  setAuthMessage('Logging in...', 'info');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return setAuthMessage(friendlyAuthError(error.message), 'error');
  setAuthMessage('Logged in. Loading your progress...', 'success');
}

async function logout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  currentUser = null;
  renderAccount();
}


document.addEventListener('click', event => {
  if (event.target.matches('.feel-btn')) selectEnergy(event.target.dataset.feel);

  if (event.target.id === 'changeEnergyBtn') {
    state.selectedEnergy = null;
    state.generated = null;
    saveState();
    renderToday();
  }

  if (event.target.id === 'generateWorkoutBtn') generateWorkout();
  if (event.target.id === 'startWorkoutBtn') startWorkout();

  if (event.target.matches('.rating-row button')) {
    const row = event.target.closest('.rating-row');
    row.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    state.current.ratings[row.dataset.track] = event.target.dataset.rating;
    saveState();
  }

  if (event.target.id === 'completeBtn') completeWorkout();

  if (event.target.id === 'accountBtn' && currentUser) document.getElementById('accountPanel').classList.toggle('hidden');
  if (event.target.id === 'signupBtn') signUp();
  if (event.target.id === 'loginBtn') login();
  if (event.target.id === 'logoutBtn') logout();
  if (event.target.id === 'togglePasswordBtn') togglePasswordVisibility();
  if (event.target.id === 'exportBtn' || event.target.id === 'backupBtn') exportProgress();

  if (event.target.id === 'resetBtn' && confirm('Reset all progress?')) {
    state = defaultState();
    saveState();
    renderToday();
    renderGoals();
    renderProgress();
  }

  if (event.target.matches('.nav-btn')) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(event.target.dataset.screen).classList.add('active');
    document.getElementById('screenTitle').textContent = event.target.textContent;
    renderGoals();
    renderProgress();
  }
});

const importInput = document.getElementById('importInput');
if (importInput) {
  importInput.addEventListener('change', event => {
    if (event.target.files[0]) importProgress(event.target.files[0]);
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}

renderAll();
initCloudSync();
