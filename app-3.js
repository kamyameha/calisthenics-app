function showConfirmPanel({ title, message, actionLabel, onConfirm }) {
  const panel = document.getElementById('confirmPanel');
  const titleEl = document.getElementById('confirmTitle');
  const messageEl = document.getElementById('confirmMessage');
  const actionBtn = document.getElementById('confirmActionBtn');
  if (!panel || !titleEl || !messageEl || !actionBtn) return;

  lastFocusedElement = document.activeElement;
  pendingConfirmAction = onConfirm;
  titleEl.textContent = title;
  messageEl.textContent = message;
  actionBtn.textContent = actionLabel;
  panel.classList.remove('hidden');
  renderModule.focusFirstInteractive(panel);
}

function closeConfirmPanel() {
  const panel = document.getElementById('confirmPanel');
  if (panel) {
    panel.classList.add('hidden');
    panel.classList.remove('workout-completion-panel', 'auto-complete');
  }
  document.getElementById('confirmActionBtn')?.classList.remove('hidden');
  document.getElementById('confirmCancelBtn')?.classList.remove('hidden');
  pendingConfirmAction = null;
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function showExerciseHelp(exerciseName) {
  const help = getExerciseHelp(exerciseName);
  const panel = document.getElementById('exerciseHelpPanel');
  if (!help || !panel) return;

  lastFocusedElement = document.activeElement;
  document.getElementById('exerciseHelpTitle').textContent = exerciseName;
  document.getElementById('exerciseHelpPurpose').textContent = help.purpose || '';
  const cues = document.getElementById('exerciseHelpCues');
  if (cues) {
    cues.innerHTML = '';
    (help.cues || []).forEach(cue => {
      const item = document.createElement('li');
      item.textContent = cue;
      cues.appendChild(item);
    });
  }
  document.getElementById('exerciseHelpSafety').textContent = help.safety ? `Safety: ${help.safety}` : '';
  panel.classList.remove('hidden');
  renderModule.focusFirstInteractive(panel);
}

function closeExerciseHelp() {
  document.getElementById('exerciseHelpPanel')?.classList.add('hidden');
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function formatTimerDuration(seconds) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function getTimedExerciseSeconds(exercise) {
  if (!exercise?.prescription) return null;
  const text = `${exercise.prescription} ${exercise.basePrescription || ''}`.toLowerCase();
  const eachMatch = text.match(/(\d+)\s*s\s+each/);
  if (eachMatch) return Number(eachMatch[1]);

  const secondsMatch = text.match(/×\s*(\d+)\s*s\b/);
  if (secondsMatch) return Number(secondsMatch[1]);

  const minutesMatch = text.match(/×\s*(\d+)\s*min\b/) || text.match(/^(\d+)\s*min\b/) || text.match(/\b(\d+)\s*min\b/);
  if (minutesMatch) return Number(minutesMatch[1]) * 60;

  return null;
}

function markWorkoutSetDone(trackKey, setIndex, done = true) {
  if (!state.current || !trackKey || !Number.isFinite(Number(setIndex))) return;
  if (!state.current.sets) state.current.sets = {};
  if (!state.current.sets[trackKey]) {
    const exercise = findCurrentExercise(trackKey);
    state.current.sets[trackKey] = Array.from({ length: exercise?.setCount || 1 }, () => false);
  }
  const index = Number(setIndex);
  state.current.sets[trackKey][index] = Boolean(done);
  const exercise = findCurrentExercise(trackKey);
  if (exercise && isExerciseComplete(exercise)) {
    openNextIncompleteExercise(trackKey);
  } else {
    openExerciseTrackKey = trackKey;
  }
  saveState();
  renderExercises();
}

function renderWorkoutTimer() {
  if (!activeTimer) return;
  const title = document.getElementById('timerTitle');
  const count = document.getElementById('timerCount');

  if (title) title.textContent = activeTimer.title || 'Timer';
  if (count) {
    if (activeTimer.phase === 'prep') {
      count.textContent = activeTimer.prepSeconds;
    } else if (activeTimer.remainingSeconds <= 0) {
      count.textContent = '0';
    } else {
      count.textContent = String(activeTimer.remainingSeconds);
    }
  }
}

function tickWorkoutTimer() {
  if (!activeTimer) return;
  if (activeTimer.phase === 'prep') {
    activeTimer.prepSeconds -= 1;
    if (activeTimer.prepSeconds <= 0) {
      activeTimer.phase = 'active';
    }
    renderWorkoutTimer();
    return;
  }

  activeTimer.remainingSeconds -= 1;
  if (activeTimer.remainingSeconds <= 0) {
    activeTimer.remainingSeconds = 0;
    window.navigator?.vibrate?.(120);
    clearInterval(timerInterval);
    timerInterval = null;
    if (activeTimer.completeOnFinish && activeTimer.trackKey) {
      markWorkoutSetDone(activeTimer.trackKey, activeTimer.setIndex, true);
    }
    if (timerAutoClose) clearTimeout(timerAutoClose);
    timerAutoClose = window.setTimeout(() => closeWorkoutTimer(false), 2500);
  }
  renderWorkoutTimer();
}

function showWorkoutTimer({ title, subtitle, seconds, prepSeconds = 0, trackKey = null, setIndex = null, completeOnFinish = false }) {
  const panel = document.getElementById('timerPanel');
  if (!panel || !seconds) return;

  closeWorkoutTimer(false);
  lastFocusedElement = document.activeElement;
  activeTimer = {
    title,
    subtitle,
    remainingSeconds: seconds,
    prepSeconds,
    phase: prepSeconds ? 'prep' : 'active',
    trackKey,
    setIndex,
    completeOnFinish
  };
  panel.classList.remove('hidden');
  renderWorkoutTimer();
  renderModule.focusFirstInteractive(panel);
  timerInterval = setInterval(tickWorkoutTimer, 1000);
}

function closeWorkoutTimer(restoreFocus = true) {
  if (timerInterval) clearInterval(timerInterval);
  if (timerAutoClose) clearTimeout(timerAutoClose);
  timerInterval = null;
  timerAutoClose = null;
  activeTimer = null;
  document.getElementById('timerPanel')?.classList.add('hidden');
  if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
  if (restoreFocus) lastFocusedElement = null;
}

function hasRemainingWorkoutSets() {
  if (!state.current?.exercises || !state.current?.sets) return false;
  return state.current.exercises.some(exercise => {
    if (exercise.isAddOn) return false;
    const sets = state.current.sets[exercise.trackKey] || [];
    return sets.some(done => !done);
  });
}

function findCurrentExercise(trackKey) {
  return (state.current?.exercises || []).find(exercise => exercise.trackKey === trackKey) || null;
}

function isWorkoutFullyComplete() {
  if (!state.current) return false;
  const exercises = state.current.exercises || [];
  const allSetsDone = exercises.every(exercise => areExerciseSetsComplete(exercise));
  const rateableExercises = exercises.filter(exercise => !exercise.isAddOn);
  const allRated = rateableExercises.every(exercise => state.current.ratings?.[exercise.trackKey]);
  return allSetsDone && allRated;
}

function completeWorkout(skipMissingRatingConfirm = false) {
  if (!state.current) return;
  if (!skipMissingRatingConfirm && !isWorkoutFullyComplete()) {
    showCompletionScreen({
      title: 'Almost there!',
      message: 'Some items are unfinished and won’t be counted. Save this progress or go back to finish more.',
      actionLabel: 'Save progress',
      cancelLabel: 'Go back',
      onConfirm: () => completeWorkoutNow(false)
    });
    return;
  }

  completeWorkoutNow();
}

function showCompletionScreen({ title, message, actionLabel = '', cancelLabel = '', onConfirm = null, autoClose = false }) {
  const panel = document.getElementById('confirmPanel');
  const titleEl = document.getElementById('confirmTitle');
  const messageEl = document.getElementById('confirmMessage');
  const actionBtn = document.getElementById('confirmActionBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');
  if (!panel || !titleEl || !messageEl || !actionBtn || !cancelBtn) return;

  lastFocusedElement = document.activeElement;
  pendingConfirmAction = onConfirm;
  titleEl.textContent = title;
  messageEl.textContent = message;
  actionBtn.textContent = actionLabel;
  cancelBtn.textContent = cancelLabel;
  panel.classList.add('workout-completion-panel');
  panel.classList.toggle('auto-complete', Boolean(autoClose));
  actionBtn.classList.toggle('hidden', autoClose || !actionLabel);
  cancelBtn.classList.toggle('hidden', autoClose || !cancelLabel);
  panel.classList.remove('hidden');

  if (autoClose) {
    window.setTimeout(() => {
      closeConfirmPanel();
      renderToday();
    }, 2500);
  } else {
    renderModule.focusFirstInteractive(panel);
  }
}

function completeWorkoutNow(showFullConfirmation = true) {
  if (!state.current) return;
  (state.current.exercises || []).forEach(exercise => {
    const rating = state.current.ratings?.[exercise.trackKey];
    const progressionTrackKey = exercise.progressionTrackKey || exercise.trackKey;
    if (rating && state.levels[progressionTrackKey]) applyRating(progressionTrackKey, rating);
  });
  state.history.push({ date: new Date().toISOString(), workout: state.current.workoutName, mode: state.current.mode, exercises: state.current.exercises.map(ex => ({ name: ex.name, prescription: ex.prescription, trackKey: ex.trackKey, progressionTrackKey: ex.progressionTrackKey || null, isAddOn: Boolean(ex.isAddOn) })) });
  state.rotationIndex = (state.rotationIndex + 1) % getRotation().length;
  state.current = null;
  state.selectedEnergy = null;
  state.generated = null;
  openExerciseTrackKey = null;
  saveState();
  renderToday();
  renderProgress();
  renderActivity();
  renderAccount();
  if (showFullConfirmation) {
    showCompletionScreen({
      title: 'Well done!',
      message: 'You showed up and that counts. Your progress is saved.',
      autoClose: true
    });
  }
  updateUpdateBanner();
}

function showWorkoutStatus(titleText = 'Well done for today.', messageText = 'You showed up, and that counts. Your progress is saved.') {
  const card = document.getElementById('workoutStatusCard');
  if (!card) return;
  const title = card.querySelector('h2');
  const message = card.querySelector('p');
  if (title) title.textContent = titleText;
  if (message) message.textContent = messageText;
  card.classList.remove('hidden');
  renderModule.focusFirstInteractive(card);
}

function dismissWorkoutStatus() {
  document.getElementById('workoutStatusCard')?.classList.add('hidden');
}
