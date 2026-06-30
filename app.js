const INITIAL_AUTH_SEARCH = window.location.search || '';
const INITIAL_AUTH_HASH = window.location.hash || '';
const APP_VERSION = 'v8-51-progress-activity-split-pull';
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
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null;
window.appSupabaseClient = supabaseClient;

const recoveryAuthClient = SUPABASE_READY
  ? window.SomthingreatAuth?.createRecoveryClient(window.supabase, window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
  : null;

let currentUser = null;
let currentProfileId = null;
let syncTimer = null;
let welcomeDismissed = false;
let waitingServiceWorker = null;
let updateBannerReady = false;
let applyingUpdate = false;
let versionUpdateReady = false;
let versionCheckInProgress = false;
let activeRecoveryClient = null;
let authSessionCheckInProgress = false;
let pendingConfirmAction = null;
let lastFocusedElement = null;
let timerInterval = null;
let timerAutoClose = null;
let activeTimer = null;
let openExerciseTrackKey = null;
let onboardingStep = 1;
let onboardingConfirmationReady = false;

function clearLegacyPasswordSession() {
  try {
    localStorage.removeItem('somthingreat-password-session');
    localStorage.removeItem('somthingreat-password-session-code-verifier');
  } catch (error) {}
}
clearLegacyPasswordSession();

function clearRecoveryAuthSession() {
  try {
    localStorage.removeItem('somthingreat-recovery-session');
  } catch (error) {}
}

function hasRecoveryBootFlag() {
  return Boolean(window.__SOMTHINGREAT_RECOVERY_BOOT || document.documentElement.classList.contains('recovery-boot'));
}

function clearRecoveryBootFlag() {
  try { sessionStorage.removeItem('somthingreat-recovery-boot'); } catch (error) {}
  document.documentElement.classList.remove('recovery-boot');
  window.__SOMTHINGREAT_RECOVERY_BOOT = false;
}

function hasPendingRecoveryMarker() {
  try {
    const ts = Number(localStorage.getItem('somthingreat-password-reset-requested-at') || 0);
    return ts && Date.now() - ts < 1000 * 60 * 60;
  } catch (error) {
    return false;
  }
}

function isPasswordRecoveryUrl() {
  // Use the original URL captured before Supabase can consume/clean auth params.
  // A password-reset redirect can look like:
  //   ?reset-password=1#access_token=...&type=recovery
  //   ?reset-password=1&code=...
  // Google OAuth also returns ?code=..., so code/access_token alone must not
  // be treated as password recovery.
  const current = `${window.location.search.replace(/^\?/, '')}&${window.location.hash.replace(/^#/, '')}`;
  const initial = `${INITIAL_AUTH_SEARCH.replace(/^\?/, '')}&${INITIAL_AUTH_HASH.replace(/^#/, '')}`;
  const params = new URLSearchParams(`${initial}&${current}`);
  return (
    hasRecoveryBootFlag() ||
    params.get('reset-password') === '1' ||
    params.get('type') === 'recovery' ||
    params.get('event') === 'PASSWORD_RECOVERY' ||
    window.location.pathname.includes('reset-password')
  );
}

function clearAuthUrlParams() {
  if (!window.location.hash && !window.location.search) return;
  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);
}

function getAuthUrlParams() {
  if (window.SomthingreatAuth?.authUrlParams) {
    return window.SomthingreatAuth.authUrlParams(INITIAL_AUTH_SEARCH, INITIAL_AUTH_HASH);
  }
  const combined = `${INITIAL_AUTH_SEARCH.replace(/^\?/, '')}&${INITIAL_AUTH_HASH.replace(/^#/, '')}&${window.location.search.replace(/^\?/, '')}&${window.location.hash.replace(/^#/, '')}`;
  return new URLSearchParams(combined);
}

async function getExistingAuthSession(client) {
  if (window.SomthingreatAuth?.getExistingSession) return await window.SomthingreatAuth.getExistingSession(client);
  if (!client?.auth?.getSession) return null;
  const { data } = await client.auth.getSession();
  return data?.session?.user ? data.session : null;
}

async function signOutClient(client, options) {
  if (!client?.auth?.signOut) return;
  try {
    await client.auth.signOut(options);
  } catch (error) {
    try { await client.auth.signOut(); } catch (_) {}
  }
}

async function checkCurrentAuthSession() {
  if (!supabaseClient || !currentUser || passwordRecoveryMode || authSessionCheckInProgress) return;
  authSessionCheckInProgress = true;
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data?.user) {
      currentUser = null;
      currentProfileId = null;
      await signOutClient(supabaseClient);
      renderAll();
      setAuthMessage('Session expired. Log in again.', 'info');
    }
  } catch (error) {
    // Network hiccups should not log the user out.
  } finally {
    authSessionCheckInProgress = false;
  }
}

async function waitForRecoverySession(client = recoveryAuthClient || supabaseClient) {
  const session = window.SomthingreatAuth?.waitForSession
    ? await window.SomthingreatAuth.waitForSession(client)
    : await getExistingAuthSession(client);
  if (session?.user) currentUser = session.user;
  return session;
}

async function ensureRecoverySession() {
  if (!supabaseClient || !passwordRecoveryMode) return null;

  for (const client of [recoveryAuthClient, supabaseClient].filter(Boolean)) {
    const existing = await getExistingAuthSession(client);
    if (existing?.user) {
      activeRecoveryClient = client;
      currentUser = existing.user;
      return existing;
    }
  }

  const params = getAuthUrlParams();
  if (params.get('error') || params.get('error_code')) return null;

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const code = params.get('code');

  if (accessToken && refreshToken) {
    const tokenClient = recoveryAuthClient || supabaseClient;
    try {
      const { data, error } = await tokenClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (error) throw error;
      activeRecoveryClient = tokenClient;
      currentUser = data?.session?.user || currentUser;
      return data?.session || null;
    } catch (error) {
      currentUser = null;
      setAuthMessage(resetSessionErrorMessage(error.message), 'error');
    }
  }

  if (code) {
    try {
      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
      if (error) throw error;
      activeRecoveryClient = supabaseClient;
      currentUser = data?.session?.user || currentUser;
      return data?.session || null;
    } catch (error) {
      currentUser = null;
    }
    setAuthMessage(resetSessionErrorMessage('Invalid recovery code'), 'error');
  }

  const waited = await waitForRecoverySession(recoveryAuthClient || supabaseClient);
  if (waited?.user) activeRecoveryClient = recoveryAuthClient || supabaseClient;
  return waited;
}

let passwordRecoveryMode = isPasswordRecoveryUrl() || hasRecoveryBootFlag();
let accountHistoryMonth = new Date();
let accountHistorySelectedDay = null;
const ADMIN_EMAILS = ['grascam@gmail.com'];
const accountModule = window.SomthingreatAccount;
const adminModule = window.SomthingreatAdmin;
const renderModule = window.SomthingreatRender;
if (!accountModule || !adminModule || !renderModule) throw new Error('Somthingreat UI modules missing.');

function setWelcomeVisible(visible) {
  const welcome = document.getElementById('welcomeScreen');
  const app = document.querySelector('.app');
  const bottomNav = document.querySelector('.bottom-nav');

  if (welcome) welcome.classList.toggle('hidden', !visible);
  if (app) app.classList.toggle('hidden', visible);
  // Only force-hide the bottom nav while the welcome screen is open.
  // When the welcome screen closes, renderAccount() decides if the nav should show.
  if (bottomNav && visible) bottomNav.classList.add('hidden');
}

function setupStarAnimation() {
  const star = document.getElementById('welcomeStar');
  if (!star) return;

  const frames = [
    'Assets/Animations/start1.png',
    'Assets/Animations/start2.png',
    'Assets/Animations/start3.png'
  ];

  let frame = 0;
  star.src = frames[frame];

  window.setInterval(() => {
    frame = (frame + 1) % frames.length;
    star.src = frames[frame];
  }, 600);
}

function updateWelcomeGate() {
  // Recovery links must bypass the animated welcome screen and go straight
  // to the password reset form. Otherwise the user lands on Welcome instead
  // of seeing the reset fields.
  setWelcomeVisible(!welcomeDismissed && !currentUser && !passwordRecoveryMode);
}


const workoutModule = window.SomthingreatWorkouts;
if (!workoutModule) throw new Error('Somthingreat workout module missing.');

const baseTracks = workoutModule.baseTracks;
const energyOptions = workoutModule.energyOptions;
const sanitizeWorkout = workoutModule.sanitizeWorkout;
const getExerciseHelp = workoutModule.getExerciseHelp;
const modeLabel = workoutModule.modeLabel;
const sessionTotalLabel = workoutModule.sessionTotalLabel;

const goalLabels = {
  pullup: 'First pull-up',
  handstand: 'First handstand',
  lsit: 'First L-sit',
  muscleup: 'First muscle-up',
  general: 'General fitness'
};

const equipmentLabels = {
  none: 'No equipment',
  pullupBar: 'Pull-up bar',
  dipBars: 'Dip bars',
  bands: 'Resistance bands',
  jumpRope: 'Jump rope'
};

const stateStore = window.SomthingreatState?.create({
  workoutModule,
  baseTracks,
  energyOptions,
  sanitizeWorkout,
  goalLabels,
  equipmentLabels
});
if (!stateStore) throw new Error('Somthingreat state module missing.');

function getProfile() {
  return state?.profile || null;
}

function getTracks() {
  return workoutModule.getTracks(getProfile());
}

function getRotation() {
  return workoutModule.getRotation(getProfile());
}

function hasCompletedProfile() {
  return Boolean(state.profile?.goal && Array.isArray(state.profile?.equipment) && state.profile.equipment.length && state.profile?.pushups && state.profile?.squats);
}

function getSelectedAddOns() {
  return {
    warmup: Boolean(state.includeWarmup),
    stretch: Boolean(state.includeStretch)
  };
}

function getExtraSessionMinutes(addOns = getSelectedAddOns()) {
  return workoutModule.getExtraSessionMinutes(addOns);
}

function applyWorkoutAddOns(workout, addOns = getSelectedAddOns()) {
  return workoutModule.applyWorkoutAddOns(workout, addOns);
}

function getTodayWorkout(mode = 'normal') {
  return workoutModule.getTodayWorkout({ mode, state, profile: getProfile() });
}

function applyRating(trackKey, rating) {
  workoutModule.applyRating(state.levels, trackKey, rating, getProfile());
}

let state = stateStore.loadState();

function sanitizeState(nextState) {
  return stateStore.sanitizeState(nextState);
}

function defaultState() {
  return stateStore.defaultState();
}

function saveState() {
  state = stateStore.saveState(state);
  queueCloudSave();
}

function saveLocalStateOnly() {
  state = stateStore.writeLocalState(state);
}

function publicState() {
  return stateStore.publicState(state);
}

function queueCloudSave() {
  if (!supabaseClient || !currentUser || !currentProfileId) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(saveCloudState, 500);
}

function normaliseEmail(email = '') {
  return adminModule.normaliseEmail(email);
}
function isAdminUser() {
  return adminModule.isAdminUser(currentUser, ADMIN_EMAILS);
}

function canChangePassword() {
  if (!currentUser) return false;
  const identities = Array.isArray(currentUser.identities) ? currentUser.identities : [];
  const identityProviders = identities.map(identity => identity?.provider).filter(Boolean);
  const appProviders = Array.isArray(currentUser.app_metadata?.providers)
    ? currentUser.app_metadata.providers
    : [currentUser.app_metadata?.provider].filter(Boolean);
  return [...identityProviders, ...appProviders].includes('email');
}

function getCompletedWorkoutCount(savedState) {
  return adminModule.getCompletedWorkoutCount(savedState);
}

function formatAdminGoal(savedState) {
  return adminModule.formatAdminGoal(savedState, goalLabels);
}

function formatAdminActive(profile, savedState, now = new Date()) {
  return adminModule.formatAdminActive(profile, savedState, now);
}

function escapeHTML(value = '') {
  return adminModule.escapeHTML(value);
}


async function ensureWorkoutProfile() {
  if (!supabaseClient || !currentUser?.email) return null;

  const email = normaliseEmail(currentUser.email);
  const payload = {
    email,
    current_auth_user_id: currentUser.id,
    deleted_at: null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseClient
    .from('workout_profiles')
    .upsert(payload, { onConflict: 'email' })
    .select('id')
    .single();

  if (error) {
    setSyncStatus('Could not connect your recovery profile. Local progress is still saved.');
    return null;
  }

  currentProfileId = data.id;
  return data.id;
}

async function saveCloudState() {
  if (!supabaseClient || !currentUser) return;
  const profileId = currentProfileId || await ensureWorkoutProfile();
  if (!profileId) return;

  setSyncStatus('Saving...');
  const { error } = await supabaseClient
    .from('workout_states_v2')
    .upsert({ profile_id: profileId, state: publicState(), updated_at: new Date().toISOString() }, { onConflict: 'profile_id' });
  setSyncStatus(error ? 'Save failed. Local progress is still saved.' : 'Progress saved.');
}

async function loadLegacyCloudState() {
  if (!supabaseClient || !currentUser) return null;

  const { data, error } = await supabaseClient
    .from('workout_states')
    .select('state')
    .eq('user_id', currentUser.id)
    .maybeSingle();

  if (error) return null;
  return data?.state || null;
}

async function loadCloudState() {
  if (!supabaseClient || !currentUser) return;
  setSyncStatus('Loading progress...');

  const profileId = await ensureWorkoutProfile();
  if (!profileId) return;

  const { data, error } = await supabaseClient
    .from('workout_states_v2')
    .select('state')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    setSyncStatus('Could not load progress. Local progress is still available.');
    return;
  }

  const legacyState = !data?.state ? await loadLegacyCloudState() : null;
  const cloudState = data?.state || legacyState;

  if (cloudState) {
    state = sanitizeState({ ...defaultState(), ...cloudState });
    saveLocalStateOnly();
    if (legacyState) await saveCloudState();
    renderAll();
    setSyncStatus(legacyState ? 'Progress recovered and upgraded.' : 'Progress loaded.');
  } else {
    state = defaultState();
    saveLocalStateOnly();
    await saveCloudState();
    renderAll();
    setSyncStatus('New account ready.');
  }
}

function setSyncStatus(message) {
  const el = document.getElementById('syncStatus');
  if (el) el.textContent = message;
}


function setAuthMessage(message, type = 'info') {
  const el = document.getElementById('authMessage');
  renderModule.setMessage(el, message, type);
}

function setPanelMessage(id, message, type = 'info') {
  renderModule.setMessage(document.getElementById(id), message, type);
}

async function withButtonLoading(buttonId, label, task) {
  const button = document.getElementById(buttonId);
  renderModule.setButtonLoading(button, true, label);
  try {
    return await task();
  } finally {
    renderModule.setButtonLoading(button, false);
  }
}

function blurActiveAuthField() {
  const active = document.activeElement;
  if (active && active.closest?.('#loggedOutAccount') && typeof active.blur === 'function') {
    active.blur();
  }
}

function friendlyAuthError(message = '') {
  if (window.SomthingreatAuth?.friendlyAuthError) return window.SomthingreatAuth.friendlyAuthError(message);
  const lower = message.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('security purposes') || lower.includes('too many')) return 'Too many attempts. Wait a minute and try again.';
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Email or password is incorrect.';
  if (lower.includes('already registered') || lower.includes('already exists')) return 'An account already exists with this email. Try logging in instead.';
  if (lower.includes('password') && lower.includes('characters')) return 'Password is too short. Use at least 6 characters.';
  if (lower.includes('auth session missing') || lower.includes('session missing')) return 'This reset link was not recognised. Please request a new reset link and open it directly from your email.';
  if (lower.includes('email')) return 'Please enter a valid email address.';
  return message || 'Something went wrong. Please try again.';
}

function resetSessionErrorMessage(message = '') {
  const lower = message.toLowerCase();
  if (
    lower.includes('code verifier') ||
    lower.includes('expired') ||
    lower.includes('invalid') ||
    lower.includes('session') ||
    lower.includes('auth')
  ) {
    return 'This reset link was not recognised. Please request a new reset link and open it directly from your email.';
  }
  return friendlyAuthError(message || 'Could not open this reset link. Please request a new one.');
}

function withTimeout(promise, ms = 12000, message = 'Request timed out. Check your connection and try again.') {
  return Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error(message)), ms))
  ]);
}

function resetRedirectUrl() {
  if (window.SomthingreatAuth?.resetRedirectUrl) return window.SomthingreatAuth.resetRedirectUrl();
  const redirectUrl = new URL(window.location.origin + window.location.pathname);
  redirectUrl.searchParams.set('reset-password', '1');
  return redirectUrl.toString();
}

async function sendPasswordResetToEmail(email) {
  if (!email) return { error: new Error('Please enter a valid email address.') };
  try {
    localStorage.setItem('somthingreat-password-reset-requested-at', String(Date.now()));
  } catch (error) {}
  const client = recoveryAuthClient || supabaseClient;
  return await client.auth.resetPasswordForEmail(email, { redirectTo: resetRedirectUrl() });
}

async function finishResetToLogin(client = supabaseClient) {
  passwordRecoveryMode = false;
  clearRecoveryBootFlag();
  try { localStorage.removeItem('somthingreat-password-reset-requested-at'); } catch (error) {}
  clearAuthUrlParams();
  currentUser = null;
  currentProfileId = null;

  await signOutClient(client, { scope: 'global' });
  if (recoveryAuthClient && recoveryAuthClient !== client) {
    await signOutClient(recoveryAuthClient);
  }
  if (supabaseClient && supabaseClient !== client) {
    await signOutClient(supabaseClient);
  }
  clearLegacyPasswordSession();
  clearRecoveryAuthSession();
  activeRecoveryClient = null;

  clearAuthFields();
  setAuthMode('login');
  document.getElementById('accountPanel')?.classList.remove('hidden');
  document.getElementById('loggedOutAccount')?.classList.remove('hidden');
  document.getElementById('loggedInAccount')?.classList.add('hidden');
  document.getElementById('accountBtn')?.classList.remove('hidden');
  document.querySelector('.bottom-nav')?.classList.add('hidden');
  document.querySelectorAll('.screen').forEach(screen => screen.classList.add('auth-locked'));
  setAuthMessage('Password reset. Log in with your new password.', 'success');
}

async function loadCloudStateInBackground() {
  if (!currentUser || passwordRecoveryMode) return;
  try {
    await withTimeout(loadCloudState(), 12000, 'Cloud sync is taking too long. Local progress is still available.');
    renderAll();
  } catch (error) {
    setSyncStatus(error.message || 'Could not load progress. Local progress is still available.');
  }
}

function setAuthMode(mode = 'welcome') {
  blurActiveAuthField();
  const welcome = document.getElementById('authWelcome');
  const login = document.getElementById('authLoginForm');
  const reset = document.getElementById('authResetForm');
  if (!welcome || !login || !reset) return;

  const isReset = mode === 'reset';
  document.body.classList.toggle('password-recovery-mode', isReset);

  // Reset password is a standalone flow. It must never share the page with
  // onboarding or app screens, even though Supabase temporarily logs the user in.
  if (isReset) {
    document.body.classList.add('logged-out');
    document.documentElement.classList.add('recovery-boot');
    setWelcomeVisible(false);
    document.getElementById('accountPanel')?.classList.remove('hidden');
    document.getElementById('onboarding')?.classList.add('hidden');
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('auth-locked'));
    document.querySelector('.bottom-nav')?.classList.add('hidden');
    document.getElementById('accountBtn')?.classList.add('hidden');
  }

  welcome.classList.toggle('hidden', mode !== 'welcome');
  login.classList.toggle('hidden', mode !== 'login');
  reset.classList.toggle('hidden', !isReset);
  setAuthMessage('');
}

function clearAuthFields() {
  ['signupEmailInput', 'signupPasswordInput', 'signupConfirmPasswordInput', 'loginEmailInput', 'loginPasswordInput', 'resetPasswordInput', 'resetConfirmPasswordInput'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    const input = document.getElementById(button.dataset.togglePassword);
    if (input) input.type = 'password';
    button.textContent = '';
    button.classList.add('password-toggle-hidden');
    button.classList.remove('password-toggle-visible');
    button.setAttribute('aria-label', 'Show password');
  });
}

function togglePasswordVisibility(button) {
  const inputId = button?.dataset?.togglePassword;
  const input = inputId ? document.getElementById(inputId) : null;
  if (!input || !button) return;

  const cursorStart = input.selectionStart;
  const cursorEnd = input.selectionEnd;
  const isHidden = input.type === 'password';

  input.type = isHidden ? 'text' : 'password';
  button.textContent = '';
  button.classList.toggle('password-toggle-hidden', !isHidden);
  button.classList.toggle('password-toggle-visible', isHidden);
  button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');

  // Mobile browsers often drop focus when the input type changes.
  // Re-focus immediately so the keyboard stays open.
  window.requestAnimationFrame(() => {
    input.focus({ preventScroll: true });
    if (cursorStart !== null && cursorEnd !== null) {
      try { input.setSelectionRange(cursorStart, cursorEnd); } catch (_) {}
    }
  });
}

