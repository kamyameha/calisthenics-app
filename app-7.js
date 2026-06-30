document.addEventListener('mousedown', event => {
  if (event.target.closest('[data-toggle-password]')) event.preventDefault();
});

document.addEventListener('touchend', event => {
  const toggle = event.target.closest('[data-toggle-password]');
  if (!toggle) return;
  event.preventDefault();
  togglePasswordVisibility(toggle);
}, { passive: false });

document.addEventListener('keydown', event => {
  const timerPanel = document.getElementById('timerPanel');
  if (timerPanel && !timerPanel.classList.contains('hidden')) {
    if (event.key === 'Escape') closeWorkoutTimer();
    renderModule.trapTabKey(event, timerPanel);
    return;
  }

  const confirmPanel = document.getElementById('confirmPanel');
  if (confirmPanel && !confirmPanel.classList.contains('hidden')) {
    if (event.key === 'Escape') closeConfirmPanel();
    renderModule.trapTabKey(event, confirmPanel);
    return;
  }

  const exerciseHelpPanel = document.getElementById('exerciseHelpPanel');
  if (exerciseHelpPanel && !exerciseHelpPanel.classList.contains('hidden')) {
    if (event.key === 'Escape') closeExerciseHelp();
    renderModule.trapTabKey(event, exerciseHelpPanel);
    return;
  }

  const accountPanel = document.getElementById('accountPanel');
  if (accountPanel?.classList.contains('account-open')) {
    if (event.key === 'Escape') closeAccountModal();
    renderModule.trapTabKey(event, accountPanel);
  }
});

document.addEventListener('click', event => {
  if (event.target.id === 'welcomeNextBtn') {
    welcomeDismissed = true;
    updateWelcomeGate();
    // Re-apply auth/onboarding visibility after the welcome screen is dismissed.
    // Without this, the hidden app shell can reappear with the active Today screen
    // still mounted behind the logged-out auth form.
    renderAccount();
    renderOnboarding();
    return;
  }

  if (event.target.id === 'welcomeLoginBtn') {
    welcomeDismissed = true;
    setAuthMode('login');
    updateWelcomeGate();
    renderAccount();
    renderOnboarding();
    return;
  }

  if (event.target.id === 'applyUpdateBtn') applyWaitingUpdate();
  if (event.target.id === 'confirmCancelBtn') closeConfirmPanel();
  if (event.target.id === 'confirmActionBtn') {
    const action = pendingConfirmAction;
    closeConfirmPanel();
    if (typeof action === 'function') action();
  }
  if (event.target.id === 'skipTimerBtn' || event.target.id === 'timerPanel') closeWorkoutTimer();
  if (event.target.id === 'closeExerciseHelpBtn' || event.target.id === 'exerciseHelpPanel') closeExerciseHelp();
  const exerciseHelpButton = event.target.closest('.exercise-help-btn');
  if (exerciseHelpButton) showExerciseHelp(exerciseHelpButton.dataset.exerciseName);

  const exerciseToggle = event.target.closest('.exercise-chip-toggle');
  if (exerciseToggle) {
    const trackKey = exerciseToggle.dataset.track;
    openExerciseTrackKey = openExerciseTrackKey === trackKey ? null : trackKey;
    renderExercises();
    return;
  }

  const setControl = event.target.closest('.set-control');
  if (setControl) {
    const trackKey = setControl.dataset.track;
    const setIndex = Number(setControl.dataset.setIndex);
    const currentDone = Boolean(state.current?.sets?.[trackKey]?.[setIndex]);
    if (setControl.dataset.timerSeconds && !currentDone) {
      const seconds = Number(setControl.dataset.timerSeconds);
      const exerciseName = setControl.dataset.exerciseName || 'Exercise';
      const setLabel = setControl.dataset.setLabel || 'Round';
      openExerciseTrackKey = trackKey;
      saveState();
      renderExercises();
      showWorkoutTimer({
        title: exerciseName,
        subtitle: setLabel,
        seconds,
        prepSeconds: 3,
        trackKey,
        setIndex,
        completeOnFinish: true
      });
      return;
    }
    const exercise = findCurrentExercise(trackKey);
    markWorkoutSetDone(trackKey, setIndex, !currentDone);
    if (!currentDone && state.current?.includeRestTimer && !exercise?.isAddOn && hasRemainingWorkoutSets()) {
      showWorkoutTimer({
        title: 'Rest',
        subtitle: 'Rest',
        seconds: 60
      });
    }
    return;
  }

  const exerciseTimerButton = event.target.closest('.set-timer-btn');
  if (exerciseTimerButton) {
    const seconds = Number(exerciseTimerButton.dataset.timerSeconds);
    const exerciseName = exerciseTimerButton.dataset.exerciseName || 'Exercise';
    const setLabel = exerciseTimerButton.dataset.setLabel || 'Set';
    showWorkoutTimer({
      title: exerciseName,
      subtitle: `${setLabel} starts after a short countdown.`,
      seconds,
      prepSeconds: 3
    });
  }

  const feelButton = event.target.closest('.feel-btn');
  if (feelButton) selectEnergy(feelButton.dataset.feel);
  if (event.target.id === 'dismissTodayEmptyState') dismissTodayEmptyState();
  if (event.target.id === 'dismissWorkoutStatusBtn') dismissWorkoutStatus();
  if (event.target.id === 'openCustomChecklistBtn') openCustomChecklistForm();
  if (event.target.id === 'cancelCustomChecklistFormBtn') {
    resetCustomChecklistForm();
    renderToday();
  }
  if (event.target.id === 'createCustomChecklistBtn') createCustomChecklist();
  if (event.target.id === 'cancelCustomChecklistBtn') cancelCustomChecklist();
  if (event.target.id === 'completeCustomChecklistBtn') completeCustomChecklist();
  if (event.target.id === 'editCustomChecklistBtn') openCustomChecklistEdit();
  if (event.target.id === 'closeCustomChecklistEditBtn' || event.target.id === 'cancelEditCustomChecklistBtn') closeCustomChecklistEdit();
  if (event.target.id === 'confirmEditCustomChecklistBtn') confirmCustomChecklistEdit();

  if (event.target.matches('input[type="checkbox"][data-custom-check-index]')) {
    if (!state.customChecklist) return;
    const index = Number(event.target.dataset.customCheckIndex);
    state.customChecklist.items[index] = event.target.checked;
    saveState();
    renderCustomChecklist();
  }

  if (event.target.id === 'changeEnergyBtn') {
    state.selectedEnergy = null;
    state.generated = null;
    saveState();
    renderToday();
  }

  if (['includeWarmup', 'includeStretch', 'includeExerciseTimer', 'includeRestTimer'].includes(event.target.id)) {
    state.includeWarmup = Boolean(document.getElementById('includeWarmup')?.checked);
    state.includeStretch = Boolean(document.getElementById('includeStretch')?.checked);
    state.includeExerciseTimer = Boolean(document.getElementById('includeExerciseTimer')?.checked);
    state.includeRestTimer = Boolean(document.getElementById('includeRestTimer')?.checked);
    state.restTimerSeconds = 60;
    saveState();
    renderSelectedEnergy();
    updateAddOnSummary();
  }

  if (event.target.matches('input[name="restTimerSeconds"]')) {
    state.restTimerSeconds = 60;
    saveState();
    updateAddOnSummary();
  }

  if (event.target.id === 'generateWorkoutBtn') generateWorkout();
  if (event.target.id === 'regenerateWorkoutBtn') {
    state.generated = null;
    saveState();
    renderSelectedEnergy();
  }
  if (event.target.id === 'startWorkoutBtn') startWorkout();

  if (event.target.matches('input[type="checkbox"][data-set-index]')) {
    if (!state.current) return;
    const trackKey = event.target.dataset.track;
    const setIndex = Number(event.target.dataset.setIndex);
    if (!state.current.sets) state.current.sets = {};
    if (!state.current.sets[trackKey]) state.current.sets[trackKey] = [false, false, false];
    state.current.sets[trackKey][setIndex] = event.target.checked;
    saveState();
    const exercise = findCurrentExercise(trackKey);
    if (event.target.checked && state.current.includeRestTimer && !exercise?.isAddOn && hasRemainingWorkoutSets()) {
      const restSeconds = 60;
      showWorkoutTimer({
        title: 'Rest',
        subtitle: `Take ${restSeconds}s before the next set.`,
        seconds: restSeconds
      });
    }
  }

  if (event.target.matches('.rating-row button')) {
    const row = event.target.closest('.rating-row');
    row.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    state.current.ratings[row.dataset.track] = event.target.dataset.rating;
    const exercise = findCurrentExercise(row.dataset.track);
    if (exercise && isExerciseComplete(exercise)) {
      openNextIncompleteExercise(row.dataset.track);
    }
    saveState();
    renderExercises();
  }

  if (event.target.id === 'completeBtn') completeWorkout();

  if (event.target.id === 'accountBtn' && currentUser) openAccountModal();
  if (event.target.id === 'closeAccountModalBtn') closeAccountModal();
  if (event.target.id === 'accountPanel' && event.target.classList.contains('account-modal')) closeAccountModal();
  const accountViewButton = event.target.closest('[data-account-view]');
  if (accountViewButton) showAccountView(accountViewButton.dataset.accountView);
  if (event.target.id === 'saveAccountGoalBtn') saveAccountGoal();
  if (event.target.id === 'saveAccountEquipmentBtn') saveAccountEquipment();
  if (event.target.id === 'saveAccountPasswordBtn') changePasswordFromAccount();
  if (event.target.id === 'sendSupportBtn') sendSupportMessage();
  if (event.target.id === 'historyPrevMonthBtn') {
    accountHistoryMonth = new Date(accountHistoryMonth.getFullYear(), accountHistoryMonth.getMonth() - 1, 1);
    accountHistorySelectedDay = null;
    renderActivity();
  }
  if (event.target.id === 'historyNextMonthBtn') {
    accountHistoryMonth = new Date(accountHistoryMonth.getFullYear(), accountHistoryMonth.getMonth() + 1, 1);
    accountHistorySelectedDay = null;
    renderActivity();
  }
  if (event.target.id === 'toggleAdminUsersBtn') {
    const list = document.getElementById('adminDashboardList');
    const isOpen = !list?.classList.contains('hidden');
    list?.classList.toggle('hidden', isOpen);
    event.target.classList.toggle('is-open', !isOpen);
    event.target.setAttribute('aria-expanded', String(!isOpen));
  }
  const historyDayButton = event.target.closest('[data-history-day]');
  if (historyDayButton && !historyDayButton.disabled) {
    accountHistorySelectedDay = Number(historyDayButton.dataset.historyDay);
    renderActivity();
  }
  if (event.target.id === 'refreshAdminDashboardBtn') renderAdminDashboard();
  const googleAuthButton = event.target.closest('[data-google-auth]');
  if (event.target.id === 'showLoginBtn') setAuthMode('login');
  if (event.target.id === 'backToAuthWelcomeFromLogin') setAuthMode('welcome');
  if (['signupBtn', 'loginBtn', 'forgotPasswordBtn', 'resetPasswordBtn'].includes(event.target.id) || googleAuthButton) {
    blurActiveAuthField();
  }
  if (event.target.id === 'signupBtn') signUp();
  if (event.target.id === 'loginBtn') login();
  if (googleAuthButton) loginWithGoogle();
  if (event.target.id === 'forgotPasswordBtn') sendPasswordReset();
  if (event.target.id === 'resetPasswordBtn') updatePasswordFromRecovery();
  if (event.target.id === 'logoutBtn') logout();
  const passwordToggle = event.target.closest('[data-toggle-password]');
  if (passwordToggle) togglePasswordVisibility(passwordToggle);
  if (event.target.id === 'onboardingNextBtn') showOnboardingStepTwo();
  if (event.target.id === 'saveProfileBtn') saveProfileFromOnboarding();
  if (event.target.id === 'startOnboardingPlanBtn') finishOnboarding();

  if (event.target.matches('.nav-btn')) {
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.remove('active');
      b.removeAttribute('aria-current');
    });
    event.target.classList.add('active');
    event.target.setAttribute('aria-current', 'page');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(event.target.dataset.screen).classList.add('active');
    if (event.target.dataset.screen === 'today') {
      renderToday();
    } else {
      document.body.classList.remove('workout-active');
      document.querySelector('.topbar')?.classList.remove('hidden');
      document.querySelector('.bottom-nav')?.classList.remove('hidden');
    }
    const title = document.getElementById('screenTitle');
    if (title) title.textContent = event.target.textContent;
    renderProgress();
    renderActivity();
  }
});

document.addEventListener('change', event => {
  if (event.target.matches('input[name="equipment"]')) {
    const none = document.querySelector('input[name="equipment"][value="none"]');
    const others = Array.from(document.querySelectorAll('input[name="equipment"]:not([value="none"])'));
    if (event.target.value === 'none' && event.target.checked) others.forEach(input => input.checked = false);
    if (event.target.value !== 'none' && event.target.checked && none) none.checked = false;
    updateConditionalQuestions();
  }

  if (event.target.matches('input[name="accountEquipment"]')) {
    const none = document.querySelector('input[name="accountEquipment"][value="none"]');
    const others = Array.from(document.querySelectorAll('input[name="accountEquipment"]:not([value="none"])'));
    if (event.target.value === 'none' && event.target.checked) others.forEach(input => input.checked = false);
    if (event.target.value !== 'none' && event.target.checked && none) none.checked = false;
  }
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!applyingUpdate) return;
    window.location.reload();
  });

  navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).then(registration => {
    const checkForUpdate = () => {
      registration.update().catch(error => {
        console.warn('Service worker update check failed:', error);
      });
    };

    if (registration.waiting) {
      markUpdateReady(registration.waiting);
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          markUpdateReady(newWorker);
        }
      });
    });

    // Check quietly on app open, resume, focus, and periodically while open.
    // The new worker activates only after the user taps Refresh.
    checkForUpdate();
    checkLiveVersion();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkForUpdate();
        checkLiveVersion();
        checkCurrentAuthSession();
      }
    });
    window.addEventListener('focus', () => {
      checkForUpdate();
      checkLiveVersion();
      checkCurrentAuthSession();
    });
    window.setInterval(() => {
      if (!document.hidden) {
        checkForUpdate();
        checkLiveVersion();
      }
    }, 60 * 1000);
  }).catch(error => {
    console.warn('Service worker registration failed:', error);
  });
}

registerServiceWorker();

setupStarAnimation();
renderAll();
initCloudSync();
