function getTrackLevel(trackKey) {
  return state.levels[trackKey]?.level || 0;
}

function getGoalTrackKey(goal) {
  return goal === 'handstand' ? 'handstand' : goal === 'lsit' ? 'lsit' : goal === 'muscleup' ? 'muscleup' : 'pullup';
}

function getGoalJourneyTitle(goal) {
  return {
    pullup: 'Pull-up journey',
    muscleup: 'Muscle-up journey',
    handstand: 'Handstand journey',
    lsit: 'L-sit journey',
    general: 'General fitness path'
  }[goal] || 'Goal journey';
}

function renderGeneralGoalProgress() {
  const total = state.history.length;
  const percent = Math.min(100, Math.round((Math.min(total, 12) / 12) * 100));
  const progress = document.getElementById('pullupProgressBar');
  if (progress) progress.style.width = `${percent}%`;
}

function renderProgress() {
  const profile = getProfile();
  const goal = profile?.goal || 'pullup';
  const goalTrackKey = getGoalTrackKey(goal);
  const tracks = getTracks();
  const track = tracks[goalTrackKey]?.length ? tracks[goalTrackKey] : tracks.pullup?.length ? tracks.pullup : baseTracks.pullup;
  if (!Array.isArray(track) || !track.length) return;
  const level = Math.max(0, Math.min(getTrackLevel(goalTrackKey), track.length - 1));
  const percent = Math.round(((level + 1) / track.length) * 100);

  const heroTitle = document.getElementById('goalHeroTitle');
  if (heroTitle) heroTitle.textContent = goalLabels[goal] || 'First pull-up';
  const progress = document.getElementById('pullupProgressBar');
  if (progress) progress.style.width = `${percent}%`;
  if (goal === 'general') renderGeneralGoalProgress();

  const levels = document.getElementById('levelsList');
  if (!levels) return;
  levels.innerHTML = '';
  const labels = {
    pullup: 'Pull-up',
    pushup: 'Push-up',
    dip: 'Dip',
    legs: 'Legs',
    core: 'Core',
    crow: 'Crow pose',
    rope: 'Jump rope',
    handstand: 'Handstand',
    lsit: 'L-sit',
    muscleup: 'Muscle-up'
  };

  Object.keys(labels).forEach(key => {
    const item = state.levels[key];
    if (!item) return;
    const exerciseTrack = getTracks()[key] || baseTracks[key];
    if (!Array.isArray(exerciseTrack) || !exerciseTrack.length) return;
    const exercise = exerciseTrack[Math.min(item.level, exerciseTrack.length - 1)];
    if (!exercise) return;
    const row = document.createElement('div');
    row.className = 'level-row';
    row.innerHTML = `<strong>${labels[key]}</strong><span>Level ${item.level + 1}/${exerciseTrack.length}</span>`;
    levels.appendChild(row);
  });
}

function monthWeekKey(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (start.getDay() + 6) % 7;
  return Math.floor((date.getDate() + offset - 1) / 7);
}

function workoutItemsForMonth(date = new Date()) {
  return accountModule.workoutItemsForMonth(state.history, date);
}

function workoutCountForMonth(date = new Date()) {
  return accountModule.workoutCountForMonth(state.history, date);
}

function workoutItemsForYear(date = new Date()) {
  const year = date.getFullYear();
  return state.history
    .map(item => ({ ...item, parsedDate: new Date(item.date) }))
    .filter(item => item.parsedDate.getFullYear() === year);
}

function elapsedWeeksInMonth(date = new Date()) {
  const weeks = new Set();
  for (let day = 1; day <= date.getDate(); day += 1) {
    weeks.add(monthWeekKey(new Date(date.getFullYear(), date.getMonth(), day)));
  }
  return weeks.size || 1;
}

function renderConsistency(monthlyCount, now = new Date()) {
  const title = document.getElementById('consistencyTitle');
  const message = document.getElementById('consistencyMessage');
  if (!title || !message) return;

  const activeWeeks = new Set(
    state.history
      .map(item => new Date(item.date))
      .filter(date => date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear())
      .map(date => monthWeekKey(date))
  ).size;
  const elapsedWeeks = elapsedWeeksInMonth(now);

  if (!monthlyCount) {
    title.textContent = 'Your rhythm starts here.';
    message.textContent = state.history.length ? 'A quiet month is not a reset. Come back with one easy session.' : 'Start light. The first win is simply showing up.';
    return;
  }

  if (activeWeeks >= elapsedWeeks) {
    title.textContent = 'You showed up every week this month.';
    message.textContent = 'That is the identity we are building: someone who comes back.';
    return;
  }

  if (monthlyCount === 1) {
    if (state.history.length <= 1) {
      title.textContent = 'First workout logged.';
      message.textContent = 'This is the start: one honest session, saved and ready to build on.';
    } else {
      title.textContent = 'You came back this month.';
      message.textContent = 'One workout is still proof: the door is open again.';
    }
    return;
  }

  title.textContent = `You showed up in ${activeWeeks} week${activeWeeks === 1 ? '' : 's'} this month.`;
  message.textContent = 'Keep it repeatable. Consistency is built by returning, not by being perfect.';
}

function renderOnboarding() {
  const onboarding = document.getElementById('onboarding');
  if (!onboarding) return;

  // During password recovery, Supabase creates a temporary logged-in session.
  // Do not show onboarding while the user is only here to set a new password.
  if (passwordRecoveryMode || !currentUser || hasCompletedProfile()) {
    onboarding.classList.add('hidden');
    document.body.classList.remove('onboarding-active');
    return;
  }

  onboarding.classList.remove('hidden');
  document.body.classList.add('onboarding-active');
  renderOnboardingStep();
}

function renderOnboardingStep() {
  const stepOne = document.getElementById('onboardingStepOne');
  const stepTwo = document.getElementById('onboardingStepTwo');
  const confirmation = document.getElementById('onboardingConfirmation');
  if (!stepOne || !stepTwo || !confirmation) return;

  stepOne.classList.toggle('hidden', onboardingStep !== 1 || onboardingConfirmationReady);
  stepTwo.classList.toggle('hidden', onboardingStep !== 2 || onboardingConfirmationReady);
  confirmation.classList.toggle('hidden', !onboardingConfirmationReady);
}

function showOnboardingStepTwo() {
  const goal = document.querySelector('input[name="goal"]:checked')?.value;
  const equipment = Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(input => input.value);

  if (!goal || equipment.length === 0) {
    setPanelMessage('onboardingMessage', 'Choose a focus and equipment to continue.', 'error');
    return;
  }

  setPanelMessage('onboardingMessage', '');
  onboardingStep = 2;
  renderOnboardingStep();
  document.getElementById('onboarding')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function finishOnboarding() {
  onboardingConfirmationReady = false;
  onboardingStep = 1;
  document.body.classList.remove('onboarding-active');
  renderAll();
}

function saveProfileFromOnboarding() {
  const goal = document.querySelector('input[name="goal"]:checked')?.value;
  const equipment = Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(input => input.value);
  const pushups = document.querySelector('input[name="pushups"]:checked')?.value;
  const squats = document.querySelector('input[name="squats"]:checked')?.value;
  const deadHang = equipment.includes('pullupBar') ? document.querySelector('input[name="deadHang"]:checked')?.value : null;
  const negativePullup = equipment.includes('pullupBar') ? document.querySelector('input[name="negativePullup"]:checked')?.value : null;
  const dip = equipment.includes('dipBars') ? document.querySelector('input[name="dip"]:checked')?.value : null;

  if (!goal || !pushups || !squats || equipment.length === 0) {
    setPanelMessage('onboardingMessage', 'Choose a goal, equipment, push-up level, and squat level to continue.', 'error');
    return;
  }
  if (equipment.includes('pullupBar') && (!deadHang || !negativePullup)) {
    setPanelMessage('onboardingMessage', 'Answer the pull-up bar questions to continue.', 'error');
    return;
  }
  if (equipment.includes('dipBars') && !dip) {
    setPanelMessage('onboardingMessage', 'Answer the dip bars question to continue.', 'error');
    return;
  }

  setPanelMessage('onboardingMessage', 'Building your plan...', 'info');
  state.profile = { goal, equipment, pushups, squats, deadHang, negativePullup, dip, createdAt: new Date().toISOString() };
  state.levels = initialLevelsFromProfile(state.profile, state.levels);
  state.rotationIndex = 0;
  state.current = null;
  state.generated = null;
  state.selectedEnergy = null;
  saveState();
  setPanelMessage('onboardingMessage', '');
  onboardingConfirmationReady = true;
  renderOnboardingStep();
  document.getElementById('onboarding')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function initialLevelsFromProfile(profile, existingLevels) {
  const levels = { ...defaultState().levels, ...(existingLevels || {}) };
  const pushMap = { zero: 0, oneFive: 0, sixTen: 5, tenPlus: 7 };
  const squatMap = { zeroFive: 0, sixTen: 0, tenPlus: 1 };
  levels.pushup = { level: pushMap[profile.pushups] ?? 0, points: 0 };
  levels.legs = { level: squatMap[profile.squats] ?? 0, points: 0 };
  if (profile.equipment.includes('pullupBar')) {
    levels.pullup = { level: profile.negativePullup === 'yes' ? 1 : profile.deadHang === 'yes' ? 0 : 0, points: 0 };
  } else {
    levels.pullup = { level: 0, points: 0 };
  }
  if (profile.equipment.includes('dipBars')) {
    levels.dip = { level: profile.dip === 'yes' ? 2 : 0, points: 0 };
  } else {
    levels.dip = { level: 0, points: 0 };
  }
  return levels;
}

function updateConditionalQuestions() {
  const equipment = Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(input => input.value);
  document.getElementById('pullupAssessment')?.classList.toggle('hidden', !equipment.includes('pullupBar'));
  document.getElementById('dipAssessment')?.classList.toggle('hidden', !equipment.includes('dipBars'));
}

function isSafeToShowUpdateBanner() {
  const accountPanel = document.getElementById('accountPanel');
  const onboarding = document.getElementById('onboarding');
  return Boolean(
    updateBannerReady &&
    !passwordRecoveryMode &&
    !state.current &&
    !state.selectedEnergy &&
    !state.generated &&
    !document.body.classList.contains('logged-out') &&
    !accountPanel?.classList.contains('account-open') &&
    onboarding?.classList.contains('hidden')
  );
}

function updateUpdateBanner() {
  const banner = document.getElementById('updateBanner');
  if (!banner) return;
  banner.classList.toggle('hidden', !isSafeToShowUpdateBanner());
}

function markUpdateReady(worker) {
  waitingServiceWorker = worker || waitingServiceWorker;
  updateBannerReady = Boolean(waitingServiceWorker) || versionUpdateReady;
  updateUpdateBanner();
}

function markVersionUpdateReady() {
  versionUpdateReady = true;
  updateBannerReady = true;
  updateUpdateBanner();
}

function applyWaitingUpdate() {
  if (applyingUpdate) return;
  applyingUpdate = true;
  if (waitingServiceWorker) {
    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    return;
  }
  window.location.reload();
}

async function checkLiveVersion() {
  if (versionCheckInProgress || document.hidden) return;
  versionCheckInProgress = true;
  try {
    const response = await fetch(`./version.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    if (data?.version && data.version !== APP_VERSION) {
      markVersionUpdateReady();
    }
  } catch (error) {
    // Version polling is only a helper; service-worker update checks still run.
  } finally {
    versionCheckInProgress = false;
  }
}


function enforceScreenSeparation() {
  const panel = document.getElementById('accountPanel');
  const loggedOut = document.getElementById('loggedOutAccount');
  const loggedIn = document.getElementById('loggedInAccount');
  const onboarding = document.getElementById('onboarding');
  const screens = document.querySelectorAll('.screen');
  const bottomNav = document.querySelector('.bottom-nav');
  const accountBtn = document.getElementById('accountBtn');

  if (passwordRecoveryMode) {
    document.body.classList.add('logged-out');
    document.documentElement.classList.add('recovery-boot');
    setWelcomeVisible(false);
    panel?.classList.remove('hidden', 'account-modal', 'account-open');
    loggedOut?.classList.remove('hidden');
    loggedIn?.classList.add('hidden');
    setAuthMode('reset');
    onboarding?.classList.add('hidden');
    screens.forEach(screen => screen.classList.add('auth-locked'));
    bottomNav?.classList.add('hidden');
    accountBtn?.classList.add('hidden');
    return;
  }

  document.documentElement.classList.remove('recovery-boot');

  if (!currentUser) {
    panel?.classList.remove('hidden', 'account-modal', 'account-open');
    loggedOut?.classList.remove('hidden');
    loggedIn?.classList.add('hidden');
    onboarding?.classList.add('hidden');
    screens.forEach(screen => screen.classList.add('auth-locked'));
    bottomNav?.classList.add('hidden');
    accountBtn?.classList.add('hidden');
    return;
  }

  const profileDone = hasCompletedProfile();
  screens.forEach(screen => screen.classList.toggle('auth-locked', !profileDone));
  bottomNav?.classList.toggle('hidden', !profileDone);
  accountBtn?.classList.toggle('hidden', !profileDone && !currentUser);
}
