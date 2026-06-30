function renderToday() {
  document.body.classList.remove('workout-active');
  document.querySelector('.topbar')?.classList.remove('hidden');
  document.getElementById('exerciseList').innerHTML = '';
  document.getElementById('completeBtn').classList.add('hidden');
  hideCustomChecklistViews();

  if (state.customChecklist) {
    document.getElementById('energyCard').classList.remove('hidden');
    document.getElementById('customChecklistCard')?.classList.remove('hidden');
    document.getElementById('customChecklistForm')?.classList.remove('hidden');
    document.getElementById('selectedEnergyCard').classList.add('hidden');
    document.getElementById('generatedWorkoutCard').classList.add('hidden');
    document.getElementById('exercisePreview').classList.add('hidden');
    renderCustomChecklist();
    return;
  }

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
    document.getElementById('selectedEnergyCard').classList.remove('hidden');
    document.getElementById('generatedWorkoutCard').classList.remove('hidden');
    document.getElementById('exercisePreview').classList.add('hidden');
    renderGeneratedWorkout();
    return;
  }

  if (state.selectedEnergy) {
    renderSelectedEnergy();
    return;
  }

  document.getElementById('energyCard').classList.remove('hidden');
  document.getElementById('customChecklistCard')?.classList.remove('hidden');
  document.getElementById('customChecklistForm')?.classList.remove('hidden');
  document.getElementById('selectedEnergyCard').classList.add('hidden');
  document.getElementById('generatedWorkoutCard').classList.add('hidden');
  document.getElementById('exercisePreview').classList.add('hidden');

  const emptyState = document.getElementById('todayEmptyState');
  if (emptyState) {
    const shouldShowEmptyState = state.history.length === 0 && !state.todayEmptyStateDismissed;
    emptyState.classList.toggle('hidden', !shouldShowEmptyState);
  }
}

function hideCustomChecklistViews() {
  document.getElementById('customChecklistCard')?.classList.add('hidden');
  document.getElementById('customChecklistForm')?.classList.add('hidden');
  document.getElementById('customChecklistActive')?.classList.add('hidden');
  document.getElementById('customChecklistEdit')?.classList.add('hidden');
}

function setCustomChecklistMessage(message = '', type = 'info') {
  const el = document.getElementById('customChecklistMessage');
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function setEditCustomChecklistMessage(message = '', type = 'info') {
  const el = document.getElementById('editCustomChecklistMessage');
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function openCustomChecklistForm() {
  document.getElementById('energyCard')?.classList.add('hidden');
  document.getElementById('customChecklistCard')?.classList.add('hidden');
  document.getElementById('customChecklistForm')?.classList.remove('hidden');
  setCustomChecklistMessage('');
}

function resetCustomChecklistForm() {
  const name = document.getElementById('customChecklistNameInput');
  const target = document.getElementById('customChecklistTargetInput');
  const rounds = document.querySelector('input[name="customChecklistType"][value="rounds"]');
  if (name) name.value = '';
  if (target) target.value = '';
  if (rounds) rounds.checked = true;
  setCustomChecklistMessage('');
}

function customChecklistUnitLabel(type, target) {
  if (type === 'minutes') return `${target} minute${target === 1 ? '' : 's'}`;
  return `${target} round${target === 1 ? '' : 's'}`;
}

function customChecklistItemLabel(checklist, index) {
  if (checklist.type === 'minutes') {
    const start = index * 5;
    const end = Math.min(checklist.target, start + 5);
    return `${end} min`;
  }
  return `Round ${index + 1}`;
}

function createCustomChecklist() {
  const name = document.getElementById('customChecklistNameInput')?.value.trim() || 'Custom checklist';
  const type = document.querySelector('input[name="customChecklistType"]:checked')?.value || 'rounds';
  const target = Math.round(Number(document.getElementById('customChecklistTargetInput')?.value || 0));
  const max = type === 'minutes' ? 240 : 120;
  if (!target || target < 1) {
    setCustomChecklistMessage(type === 'minutes' ? 'Enter how many minutes to track.' : 'Enter how many rounds to track.', 'error');
    return;
  }
  if (target > max) {
    setCustomChecklistMessage(type === 'minutes' ? 'Keep it to 240 minutes or less.' : 'Keep it to 120 rounds or less.', 'error');
    return;
  }
  const itemCount = type === 'minutes' ? Math.ceil(target / 5) : target;
  state.customChecklist = {
    name: name.slice(0, 40),
    type,
    target,
    items: Array.from({ length: itemCount }, () => false)
  };
  resetCustomChecklistForm();
  saveState();
  renderToday();
}

function renderCustomChecklist() {
  const checklist = state.customChecklist;
  if (!checklist) return;
  const active = document.getElementById('customChecklistActive');
  const title = document.getElementById('customChecklistTitle');
  const meta = document.getElementById('customChecklistMeta');
  const items = document.getElementById('customChecklistItems');
  const complete = document.getElementById('completeCustomChecklistBtn');
  if (!active || !title || !meta || !items || !complete) return;

  active.classList.remove('hidden');
  title.textContent = `${checklist.name} - ${customChecklistUnitLabel(checklist.type, checklist.target)}`;
  meta.textContent = customChecklistUnitLabel(checklist.type, checklist.target);
  items.innerHTML = checklist.items.map((checked, index) => `
    <label class="set-row custom-checklist-row ${checked ? 'completed' : ''}">
      <span>${customChecklistItemLabel(checklist, index)}</span>
      <input type="checkbox" data-custom-check-index="${index}" ${checked ? 'checked' : ''}>
      <i aria-hidden="true"></i>
    </label>
  `).join('');
  complete.disabled = false;
}

function openCustomChecklistEdit() {
  const checklist = state.customChecklist;
  if (!checklist) return;
  const name = document.getElementById('editCustomChecklistNameInput');
  const target = document.getElementById('editCustomChecklistTargetInput');
  const type = document.querySelector(`input[name="editCustomChecklistType"][value="${checklist.type}"]`);
  if (name) name.value = checklist.name;
  if (target) target.value = checklist.target;
  if (type) type.checked = true;
  setEditCustomChecklistMessage('');
  document.getElementById('customChecklistActive')?.classList.add('hidden');
  document.getElementById('customChecklistEdit')?.classList.remove('hidden');
}

function closeCustomChecklistEdit() {
  document.getElementById('customChecklistEdit')?.classList.add('hidden');
  if (state.customChecklist) {
    document.getElementById('customChecklistActive')?.classList.remove('hidden');
  }
  setEditCustomChecklistMessage('');
}

function confirmCustomChecklistEdit() {
  const checklist = state.customChecklist;
  if (!checklist) return;
  const name = document.getElementById('editCustomChecklistNameInput')?.value.trim() || 'Custom checklist';
  const type = document.querySelector('input[name="editCustomChecklistType"]:checked')?.value || checklist.type;
  const target = Math.round(Number(document.getElementById('editCustomChecklistTargetInput')?.value || 0));
  const max = type === 'minutes' ? 240 : 120;
  if (!target || target < 1) {
    setEditCustomChecklistMessage(type === 'minutes' ? 'Enter how many minutes to track.' : 'Enter how many rounds to track.', 'error');
    return;
  }
  if (target > max) {
    setEditCustomChecklistMessage(type === 'minutes' ? 'Keep it to 240 minutes or less.' : 'Keep it to 120 rounds or less.', 'error');
    return;
  }
  const itemCount = type === 'minutes' ? Math.ceil(target / 5) : target;
  state.customChecklist = {
    name: name.slice(0, 40),
    type,
    target,
    items: Array.from({ length: itemCount }, (_, index) => Boolean(checklist.items[index]))
  };
  saveState();
  document.getElementById('customChecklistEdit')?.classList.add('hidden');
  renderCustomChecklist();
}

function cancelCustomChecklist() {
  state.customChecklist = null;
  saveState();
  renderToday();
}

function completeCustomChecklist(skipIncompleteConfirm = false) {
  const checklist = state.customChecklist;
  if (!checklist) return;
  if (!skipIncompleteConfirm && !checklist.items.every(Boolean)) {
    showCompletionScreen({
      title: 'Almost there!',
      message: 'Some items are unfinished and won’t be counted. Save this progress or go back to finish more.',
      actionLabel: 'Save progress',
      cancelLabel: 'Go back',
      onConfirm: () => completeCustomChecklist(true)
    });
    return;
  }
  const completedCount = checklist.items.filter(Boolean).length;
  const countedTarget = checklist.items.every(Boolean)
    ? checklist.target
    : checklist.type === 'minutes'
      ? Math.min(checklist.target, completedCount * 5)
      : completedCount;
  const prescription = customChecklistUnitLabel(checklist.type, countedTarget);
  state.history.push({
    type: 'custom',
    date: new Date().toISOString(),
    workout: checklist.name,
    mode: 'custom',
    customType: checklist.type,
    target: countedTarget,
    exercises: [{ name: checklist.name, prescription, trackKey: 'custom', isAddOn: false }]
  });
  state.customChecklist = null;
  saveState();
  renderToday();
  renderProgress();
  renderActivity();
  renderAccount();
  showWorkoutStatus('Checklist saved.', 'Your custom checklist is saved in your history.');
  updateUpdateBanner();
}

function dismissTodayEmptyState() {
  state.todayEmptyStateDismissed = true;
  saveState();
  renderToday();
}

function selectEnergy(feel) {
  state.selectedEnergy = feel;
  state.generated = null;
  state.includeWarmup = false;
  state.includeStretch = false;
  state.includeExerciseTimer = false;
  state.includeRestTimer = false;
  state.restTimerSeconds = 60;
  saveState();
  renderSelectedEnergy();
}

function renderSelectedEnergy() {
  const option = energyOptions[state.selectedEnergy || 'normal'];
  const previewWorkout = getTodayWorkout(option.mode);

  hideCustomChecklistViews();
  document.getElementById('energyCard').classList.add('hidden');
  document.getElementById('selectedEnergyCard').classList.remove('hidden');
  document.getElementById('generatedWorkoutCard').classList.add('hidden');
  document.getElementById('exercisePreview').classList.add('hidden');
  document.getElementById('selectedEnergyCard').dataset.energy = state.selectedEnergy || 'normal';

  const mascot = document.getElementById('selectedEnergyMascot');
  if (mascot) mascot.src = option.icon || 'Assets/Energy/normal-icon.png';

  const pill = document.getElementById('selectedEnergyPill');
  if (pill) pill.textContent = option.title;

  const starMap = { exhausted: 1, tired: 3, normal: 4, great: 5 };
  const stars = document.getElementById('selectedEnergyStars');
  const fullStars = starMap[state.selectedEnergy || 'normal'] || 4;
  if (stars) {
    stars.innerHTML = Array.from({ length: 5 }, (_, index) => (
      `<span class="energy-star ${index < fullStars ? 'filled' : ''}" aria-hidden="true">${index < fullStars ? '★' : '☆'}</span>`
    )).join('');
  }

  const workoutName = document.getElementById('selectedWorkoutName');
  if (workoutName) workoutName.textContent = previewWorkout.workoutName;

  const workoutMeta = document.getElementById('selectedWorkoutMeta');
  if (workoutMeta) {
    const volumeMap = {
      great: 'full volume',
      normal: 'reduced volume',
      tired: 'reduced volume',
      reduced: 'reduced volume',
      exhausted: 'minimum volume',
      minimum: 'minimum volume'
    };
    const volume = volumeMap[previewWorkout.mode] || 'standard volume';
    const count = (previewWorkout.exercises || []).filter(Boolean).length;
    workoutMeta.innerHTML = `${escapeHTML(previewWorkout.workoutName)}: ${escapeHTML(volume)}<br>${count} exercises`;
  }

  const warmupInput = document.getElementById('includeWarmup');
  const stretchInput = document.getElementById('includeStretch');
  const exerciseTimerInput = document.getElementById('includeExerciseTimer');
  const restTimerInput = document.getElementById('includeRestTimer');
  const restTimerOptions = document.getElementById('restTimerOptions');
  if (warmupInput) warmupInput.checked = Boolean(state.includeWarmup);
  if (stretchInput) stretchInput.checked = Boolean(state.includeStretch);
  if (exerciseTimerInput) exerciseTimerInput.checked = Boolean(state.includeExerciseTimer);
  if (restTimerInput) restTimerInput.checked = Boolean(state.includeRestTimer);
  if (restTimerOptions) restTimerOptions.classList.add('hidden');
  updateAddOnSummary();
}

function updateAddOnSummary() {
  const total = document.getElementById('sessionTotalPreview');
  const extra = getExtraSessionMinutes();
  if (!total) return;
  const extras = [];
  if (extra) extras.push(`${extra} min`);
  if (state.includeExerciseTimer) extras.push('exercise timers');
  if (state.includeRestTimer) extras.push(`${state.restTimerSeconds || 60}s rest`);
  total.textContent = extras.length ? `Workout + ${extras.join(' · ')}` : 'Workout only';
}

function workoutToolSummary(workout) {
  const base = sessionTotalLabel(workout);
  const timerParts = [];
  if (workout?.includeExerciseTimer) timerParts.push('exercise timers');
  if (workout?.includeRestTimer) timerParts.push(`${workout.restTimerSeconds || 60}s rest`);
  if (!timerParts.length) return base;
  if (base === 'Workout only') return timerParts.join(' · ');
  return `${base} · ${timerParts.join(' · ')}`;
}

function generateWorkout() {
  const option = energyOptions[state.selectedEnergy || 'normal'];
  const baseWorkout = getTodayWorkout(option.mode);
  state.generated = applyWorkoutAddOns(baseWorkout);
  state.generated.includeExerciseTimer = Boolean(state.includeExerciseTimer);
  state.generated.includeRestTimer = Boolean(state.includeRestTimer);
  state.generated.restTimerSeconds = 60;
  saveState();
  renderGeneratedWorkout();
}

function renderGeneratedWorkout() {
  const generated = state.generated || getTodayWorkout('normal');
  hideCustomChecklistViews();
  document.getElementById('energyCard').classList.add('hidden');
  document.getElementById('selectedEnergyCard').classList.remove('hidden');
  document.getElementById('generatedWorkoutCard').classList.remove('hidden');
  document.getElementById('exercisePreview').classList.add('hidden');
  document.getElementById('workoutName').textContent = generated.workoutName;
  document.getElementById('workoutMeta').textContent = generated.includeExerciseTimer ? 'Includes exercise timers' : 'Workout is ready';

  const preview = document.getElementById('previewList');
  preview.innerHTML = '';
  (generated.exercises || []).filter(Boolean).forEach(exercise => {
    const row = document.createElement('div');
    row.className = 'preview-row';
    row.innerHTML = `<strong>${exercise.name}</strong><span>${exercise.prescription}</span>`;
    preview.appendChild(row);
  });
}

function startWorkout() {
  if (!state.generated) generateWorkout();
  state.generated = sanitizeWorkout(state.generated);
  if (!state.generated) {
    state.selectedEnergy = null;
    saveState();
    renderToday();
    return;
  }
  state.current = {
    ...state.generated,
    includeExerciseTimer: Boolean(state.generated.includeExerciseTimer),
    includeRestTimer: Boolean(state.generated.includeRestTimer),
    restTimerSeconds: 60,
    ratings: {},
    sets: {}
  };
  state.current.exercises.forEach(exercise => {
    state.current.sets[exercise.trackKey] = Array.from({ length: exercise.setCount || 1 }, () => false);
  });
  openExerciseTrackKey = state.current.exercises[0]?.trackKey || null;
  state.generated = null;
  saveState();
  renderExercises();
}

function areExerciseSetsComplete(exercise) {
  if (!exercise || !state.current?.sets) return false;
  const sets = state.current.sets[exercise.trackKey] || [];
  return sets.length > 0 && sets.every(Boolean);
}

function isExerciseComplete(exercise) {
  if (!areExerciseSetsComplete(exercise)) return false;
  return Boolean(exercise.isAddOn || state.current?.ratings?.[exercise.trackKey]);
}

function firstIncompleteExerciseKey() {
  const exercises = state.current?.exercises || [];
  return exercises.find(exercise => !isExerciseComplete(exercise))?.trackKey || exercises[0]?.trackKey || null;
}

function openNextIncompleteExercise(afterTrackKey = null) {
  const exercises = state.current?.exercises || [];
  if (!exercises.length) {
    openExerciseTrackKey = null;
    return;
  }
  const startIndex = Math.max(0, exercises.findIndex(exercise => exercise.trackKey === afterTrackKey));
  const next = exercises.slice(startIndex + 1).find(exercise => !isExerciseComplete(exercise)) ||
    exercises.find(exercise => !isExerciseComplete(exercise));
  openExerciseTrackKey = next?.trackKey || null;
}

function exerciseChipPrescription(exercise) {
  const prescription = exercise?.prescription || '';
  if (exercise?.isAddOn) return prescription.split('·')[0].trim();
  return prescription.replace(/×/g, 'x');
}

function setControlMarkup(exercise, index, completed, timedSeconds) {
  const label = exercise.setLabels?.[index] || `Round ${index + 1}`;
  const iconClass = completed ? 'is-check' : timedSeconds ? 'is-timer' : 'is-square';
  const timerData = timedSeconds
    ? `data-timer-seconds="${timedSeconds}" data-exercise-name="${escapeHTML(exercise.name)}" data-track="${escapeHTML(exercise.trackKey)}" data-set-index="${index}" data-set-label="${escapeHTML(label)}"`
    : '';
  return `
    <div class="set-row ${timedSeconds ? 'timed-set-row' : ''} ${completed ? 'completed' : ''}">
      <span>${escapeHTML(label)}</span>
      <button class="set-control ${iconClass}" type="button" data-track="${escapeHTML(exercise.trackKey)}" data-set-index="${index}" ${timerData} aria-label="${completed ? 'Completed' : timedSeconds ? `Start ${label} timer` : `Complete ${label}`}"></button>
    </div>
  `;
}

function renderExercises() {
  hideCustomChecklistViews();
  document.getElementById('energyCard').classList.add('hidden');
  document.getElementById('selectedEnergyCard').classList.add('hidden');
  document.getElementById('generatedWorkoutCard').classList.add('hidden');
  document.getElementById('exercisePreview').classList.add('hidden');
  document.body.classList.add('workout-active');
  document.querySelector('.topbar')?.classList.add('hidden');
  document.querySelector('.bottom-nav')?.classList.add('hidden');

  const list = document.getElementById('exerciseList');
  list.innerHTML = '';

  const titleCard = document.createElement('div');
  titleCard.className = 'workout-started-title';
  titleCard.innerHTML = `<p>Today's workout</p>`;
  list.appendChild(titleCard);

  state.current = sanitizeWorkout(state.current);
  if (!state.current) { renderToday(); return; }
  if (!openExerciseTrackKey || !state.current.exercises.some(exercise => exercise.trackKey === openExerciseTrackKey)) {
    openExerciseTrackKey = firstIncompleteExerciseKey();
  }
  state.current.exercises.forEach((exercise) => {
    const isOpen = exercise.trackKey === openExerciseTrackKey;
    const isComplete = isExerciseComplete(exercise);
    const card = document.createElement('div');
    card.className = `exercise-card workout-accordion-card ${isOpen ? 'open' : ''} ${isComplete ? 'completed' : ''}`;
    card.dataset.track = exercise.trackKey;
    const selectedRating = state.current.ratings[exercise.trackKey];
    if (!state.current.sets) state.current.sets = {};
    if (!state.current.sets[exercise.trackKey]) state.current.sets[exercise.trackKey] = Array.from({ length: exercise.setCount || 1 }, () => false);
    const completedSets = state.current.sets[exercise.trackKey];
    const timedSeconds = state.current.includeExerciseTimer ? getTimedExerciseSeconds(exercise) : null;
    const setRows = Array.from({ length: exercise.setCount || completedSets.length || 1 }, (_, index) => {
      return setControlMarkup(exercise, index, Boolean(completedSets[index]), timedSeconds);
    }).join('');
    const help = getExerciseHelp(exercise.name);
    const helpButton = help ? `<button class="exercise-help-btn" type="button" data-exercise-name="${escapeHTML(exercise.name)}" aria-label="Help with ${escapeHTML(exercise.name)}">?</button>` : '';
    const ratingBlock = exercise.isAddOn ? '' : `
      <p class="rating-label">How was it?</p>
      <div class="rating-row" data-track="${exercise.trackKey}">
        <button data-rating="easy" class="${selectedRating === 'easy' ? 'selected' : ''}">Easy</button>
        <button data-rating="good" class="${selectedRating === 'good' ? 'selected' : ''}">Good</button>
        <button data-rating="hard" class="${selectedRating === 'hard' ? 'selected' : ''}">Hard</button>
        <button data-rating="failed" class="${selectedRating === 'failed' ? 'selected' : ''}">Failed</button>
      </div>`;
    card.innerHTML = `
      <button class="exercise-chip-toggle" type="button" data-track="${escapeHTML(exercise.trackKey)}">
        <span>${escapeHTML(exercise.name)}</span>
        <em>${escapeHTML(exerciseChipPrescription(exercise))}</em>
        <i aria-hidden="true"></i>
      </button>
      <div class="exercise-card-body">
        <div class="exercise-card-header">
          <h3>${escapeHTML(exercise.name)} - ${escapeHTML(exercise.prescription)}</h3>
          ${helpButton}
        </div>
        <div class="set-list">${setRows}</div>
        ${ratingBlock}
      </div>
    `;
    list.appendChild(card);
  });
  document.getElementById('completeBtn').classList.remove('hidden');
}
