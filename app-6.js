function renderActivity() {
  const yearSummary = document.getElementById('historyYearSummary');
  const monthSummary = document.getElementById('historyMonthSummary');
  const yearTitle = document.getElementById('historyYearTitle');
  const title = document.getElementById('historyMonthTitle');
  const calendar = document.getElementById('historyCalendar');
  const list = document.getElementById('historyList');
  if (!yearSummary || !monthSummary || !yearTitle || !title || !calendar || !list) return;

  const month = accountHistoryMonth.getMonth();
  const year = accountHistoryMonth.getFullYear();
  const now = new Date();
  const yearItems = workoutItemsForYear(accountHistoryMonth);
  const yearCount = yearItems.length;
  const monthItems = workoutItemsForMonth(accountHistoryMonth).sort((a, b) => a.parsedDate - b.parsedDate);
  const monthCount = monthItems.length;
  yearSummary.textContent = `This year: ${yearCount} workout${yearCount === 1 ? '' : 's'}`;
  monthSummary.textContent = `This month: ${monthCount} workout${monthCount === 1 ? '' : 's'}`;
  yearTitle.textContent = String(year);
  title.textContent = accountHistoryMonth.toLocaleDateString(undefined, { month: 'long' });

  const byDay = new Map();
  monthItems.forEach(item => {
    const day = item.parsedDate.getDate();
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(item);
  });

  const selectedWorkoutDay = accountHistorySelectedDay && byDay.has(accountHistorySelectedDay)
    ? accountHistorySelectedDay
    : monthItems[0]?.parsedDate.getDate() || null;
  accountHistorySelectedDay = selectedWorkoutDay;

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  document.querySelectorAll('#activity .history-weekdays span').forEach((item, index) => {
    item.classList.toggle('is-today-weekday', isCurrentMonth && index === ((now.getDay() + 6) % 7));
  });
  calendar.innerHTML = '';
  for (let i = 0; i < mondayOffset; i += 1) {
    const empty = document.createElement('div');
    empty.className = 'history-day history-empty';
    calendar.appendChild(empty);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const hasWorkout = byDay.has(day);
    const isToday = date.toDateString() === now.toDateString();
    const isSelected = selectedWorkoutDay === day;
    const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.historyDay = String(day);
    button.className = [
      'history-day',
      hasWorkout ? 'has-workout' : '',
      isPast && !hasWorkout ? 'past-empty' : '',
      !isPast && !isToday && !hasWorkout ? 'future-empty' : '',
      isToday ? 'is-today' : '',
      isSelected ? 'is-selected' : ''
    ].filter(Boolean).join(' ');
    button.disabled = !hasWorkout && !isToday;
    button.innerHTML = `<span>${day}</span>`;
    calendar.appendChild(button);
  }

  const selectedItems = selectedWorkoutDay ? byDay.get(selectedWorkoutDay) || [] : [];
  list.innerHTML = selectedItems.length
    ? selectedItems.map(item => {
      const dateLabel = item.parsedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
      const label = item.type === 'custom'
        ? `${item.workout || 'Custom checklist'} - Custom`
        : `${item.workout || 'Workout'} - ${energyOptions[item.mode]?.title || item.mode || 'Done'}`;
      return `<div class="history-item"><strong>${escapeHTML(dateLabel)}</strong><span>${escapeHTML(label)}</span></div>`;
    }).join('')
    : '';
}

async function renderAdminDashboard() {
  const summary = document.getElementById('adminDashboardSummary');
  const message = document.getElementById('adminDashboardMessage');
  const list = document.getElementById('adminDashboardList');
  const toggle = document.getElementById('toggleAdminUsersBtn');
  if (!summary || !message || !list) return;

  if (!isAdminUser()) {
    summary.textContent = 'Admin access only.';
    message.textContent = 'Admin access only.';
    list.innerHTML = '';
    return;
  }

  if (!supabaseClient) {
    summary.textContent = 'Supabase is not configured.';
    message.textContent = 'Supabase is not configured.';
    list.innerHTML = '';
    return;
  }

  summary.textContent = 'Loading dashboard...';
  message.textContent = 'Loading users...';
  list.innerHTML = '';
  if (toggle) toggle.classList.remove('is-open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  list.classList.add('hidden');

  const [{ data: profiles, error: profileError }, { data: savedStates, error: stateError }] = await Promise.all([
    supabaseClient
      .from('workout_profiles')
      .select('id,email,current_auth_user_id,deleted_at,updated_at')
      .order('updated_at', { ascending: false }),
    supabaseClient
      .from('workout_states_v2')
      .select('profile_id,state,updated_at')
  ]);

  if (profileError || stateError) {
    summary.textContent = 'Could not load dashboard.';
    message.textContent = 'Could not load admin dashboard. Check Supabase admin policies.';
    return;
  }

  const statesByProfile = new Map((savedStates || []).map(item => [item.profile_id, item]));
  const now = new Date();
  const rows = (profiles || []).filter(profile => !profile.deleted_at).map(profile => {
    const stateRow = statesByProfile.get(profile.id);
    const savedState = stateRow?.state || null;
    return {
      email: profile.email || 'Unknown',
      active: formatAdminActive(profile, savedState, now),
      goal: formatAdminGoal(savedState),
      completed: getCompletedWorkoutCount(savedState),
      updatedAt: stateRow?.updated_at || profile.updated_at
    };
  });

  const activeCount = rows.filter(row => row.active === 'Y').length;
  const goalCounts = rows.reduce((counts, row) => {
    counts[row.goal] = (counts[row.goal] || 0) + 1;
    return counts;
  }, {});
  const topGoal = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not set';
  summary.innerHTML = [
    `Total users: ${rows.length}`,
    `Active users: ${activeCount}`,
    `Most selected focus: ${escapeHTML(topGoal)}`
  ].join('<br>');
  message.textContent = '';
  list.innerHTML = rows.length
    ? rows.map(row => `
      <div class="admin-user-row">
        <span>${escapeHTML(row.email)}</span>
        <strong>${row.completed}</strong>
      </div>
    `).join('')
    : '<p class="muted">No active profiles found yet.</p>';
}

async function initCloudSync() {
  if (!supabaseClient) {
    renderAll();
    return;
  }

  passwordRecoveryMode = passwordRecoveryMode || isPasswordRecoveryUrl();

  if (passwordRecoveryMode) {
    welcomeDismissed = true;
    setWelcomeVisible(false);
    setAuthMode('reset');
    await ensureRecoverySession();
    setAuthMode('reset');
  } else {
    const { data } = await supabaseClient.auth.getSession();
    currentUser = data.session?.user || null;
    currentProfileId = null;
    if (currentUser) await loadCloudState();
  }

  renderAll();

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    currentUser = session?.user || null;
    currentProfileId = null;
    if (event === 'PASSWORD_RECOVERY') passwordRecoveryMode = true;
    if (hasRecoveryBootFlag()) passwordRecoveryMode = true;
    if (event === 'SIGNED_IN' && !passwordRecoveryMode) passwordRecoveryMode = false;
    if (event === 'SIGNED_OUT') passwordRecoveryMode = false;
    if (passwordRecoveryMode) {
      welcomeDismissed = true;
      setWelcomeVisible(false);
      setAuthMode('reset');
      if (!currentUser) await ensureRecoverySession();
    }

    // Do not block the UI on cloud sync. If Supabase profile/state loading is slow,
    // users must still leave the auth screen instead of staying on “Logging in...”.
    renderAll();
    if (currentUser && !passwordRecoveryMode) loadCloudStateInBackground();
  });
}

async function signUp() {
  return withButtonLoading('signupBtn', 'Creating...', async () => {
    passwordRecoveryMode = false;
    clearRecoveryBootFlag();
    if (!supabaseClient) return setAuthMessage('Account connection is not configured yet.', 'error');
    const email = document.getElementById('signupEmailInput')?.value.trim();
    const password = document.getElementById('signupPasswordInput')?.value;
    const confirmPassword = document.getElementById('signupConfirmPasswordInput')?.value;
    if (!email || !password || !confirmPassword) return setAuthMessage('Enter your email, password, and confirmation.', 'error');
    if (password.length < 6) return setAuthMessage('Password must be at least 6 characters.', 'error');
    if (password !== confirmPassword) return setAuthMessage('Passwords do not match.', 'error');
    setAuthMessage('Creating your account...', 'info');
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return setAuthMessage(friendlyAuthError(error.message), 'error');
    currentUser = data?.session?.user || data?.user || currentUser;
    currentProfileId = null;
    if (currentUser) await loadCloudState();
    setAuthMessage('Account created. Let’s build your plan.', 'success');
    renderAll();
  });
}

async function login() {
  return withButtonLoading('loginBtn', 'Logging in...', async () => {
    passwordRecoveryMode = false;
    clearRecoveryBootFlag();
    if (!supabaseClient) return setAuthMessage('Account connection is not configured yet.', 'error');
    const email = document.getElementById('loginEmailInput')?.value.trim();
    const password = document.getElementById('loginPasswordInput')?.value;
    if (!email || !password) return setAuthMessage('Enter your email and password.', 'error');

    setAuthMessage('Logging in...', 'info');

    try {
      const { data, error } = await withTimeout(
        supabaseClient.auth.signInWithPassword({ email, password }),
        12000,
        'Login is taking too long. Check your connection and try again.'
      );

      if (error) return setAuthMessage(friendlyAuthError(error.message), 'error');

      passwordRecoveryMode = false;
      currentUser = data?.session?.user || currentUser;
      currentProfileId = null;

      setAuthMessage('Logged in. Loading your progress...', 'success');
      renderAll();
      loadCloudStateInBackground();
    } catch (error) {
      setAuthMessage(error.message || 'Login failed. Please try again.', 'error');
    }
  });
}

async function loginWithGoogle() {
  passwordRecoveryMode = false;
  clearRecoveryBootFlag();
  if (!supabaseClient) return setAuthMessage('Google connection is not configured yet.', 'error');

  setAuthMessage('Opening Google...', 'info');
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo }
  });
  if (error) setAuthMessage(friendlyAuthError(error.message), 'error');
}

async function sendPasswordReset() {
  return withButtonLoading('forgotPasswordBtn', 'Sending...', async () => {
    if (!supabaseClient) return setAuthMessage('Account connection is not configured yet.', 'error');
    const email = document.getElementById('loginEmailInput')?.value.trim();
    if (!email) return setAuthMessage('Enter your email first, then tap Forgot password.', 'error');

    setAuthMessage('Sending reset link...', 'info');
    const { error } = await sendPasswordResetToEmail(email);
    if (error) return setAuthMessage(friendlyAuthError(error.message), 'error');
    setAuthMessage('Password reset link sent. Check your email.', 'success');
  });
}

async function updatePasswordFromRecovery() {
  return withButtonLoading('resetPasswordBtn', 'Updating...', async () => {
    if (!supabaseClient) return setAuthMessage('Account connection is not configured yet.', 'error');

    passwordRecoveryMode = true;
    const session = await ensureRecoverySession();
    if (!session?.user) return setAuthMessage('This reset link was not recognised. Please request a new reset link and open it directly from your email.', 'error');
    currentUser = session.user;

    const password = document.getElementById('resetPasswordInput')?.value;
    const confirmPassword = document.getElementById('resetConfirmPasswordInput')?.value;
    if (!password || !confirmPassword) return setAuthMessage('Enter and confirm your new password.', 'error');
    if (password.length < 6) return setAuthMessage('Password must be at least 6 characters.', 'error');
    if (password !== confirmPassword) return setAuthMessage('Passwords do not match.', 'error');

    setAuthMessage('Updating password...', 'info');
    const client = activeRecoveryClient || supabaseClient;
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      const lower = (error.message || '').toLowerCase();
      if (lower.includes('current password') || lower.includes('auth session missing') || lower.includes('session missing')) {
        return setAuthMessage('This reset session was not recognised. Please request a new reset link and open it directly from your email.', 'error');
      }
      return setAuthMessage(friendlyAuthError(error.message), 'error');
    }
    await finishResetToLogin(client);
  });
}

async function logout() {
  if (!supabaseClient) return;
  await signOutClient(supabaseClient);
  currentUser = null;
  currentProfileId = null;
  passwordRecoveryMode = false;
  clearAuthFields();
  welcomeDismissed = false;
  setAuthMode('welcome');
  renderAll();
}

