function renderAll() {
  renderAccount();
  renderOnboarding();
  if (!passwordRecoveryMode && currentUser && hasCompletedProfile()) {
    renderToday();
    renderProgress();
    renderActivity();
  }
  enforceScreenSeparation();
  updateWelcomeGate();
  updateUpdateBanner();
}

function renderAccount() {
  const panel = document.getElementById('accountPanel');
  const loggedOut = document.getElementById('loggedOutAccount');
  const loggedIn = document.getElementById('loggedInAccount');
  const email = document.getElementById('accountEmail');
  const accountBtn = document.getElementById('accountBtn');
  const bottomNav = document.querySelector('.bottom-nav');
  const screens = document.querySelectorAll('.screen');

  document.body.classList.toggle('logged-out', !currentUser);

  if (!panel || !loggedOut || !loggedIn) return;

  panel.classList.toggle('account-modal', Boolean(currentUser));

  if (!SUPABASE_READY) {
    panel.classList.remove('hidden');
    panel.classList.remove('account-modal');
    loggedOut.classList.remove('hidden');
    loggedIn.classList.add('hidden');
    screens.forEach(screen => screen.classList.add('auth-locked'));
    if (bottomNav) bottomNav.classList.add('hidden');
    if (accountBtn) accountBtn.classList.add('hidden');
    const muted = loggedOut.querySelector('.muted');
    if (muted) muted.textContent = 'Account connection is not configured yet.';
    return;
  }

  if (passwordRecoveryMode) {
    panel.classList.remove('hidden');
    panel.classList.remove('account-modal', 'account-open');
    loggedOut.classList.remove('hidden');
    loggedIn.classList.add('hidden');
    setAuthMode('reset');
    screens.forEach(screen => screen.classList.add('auth-locked'));
    if (bottomNav) bottomNav.classList.add('hidden');
    if (accountBtn) accountBtn.classList.add('hidden');
    return;
  }

  if (currentUser) {
    setAuthMessage('');
    loggedOut.classList.add('hidden');
    loggedIn.classList.remove('hidden');
    const profileDone = hasCompletedProfile();
    screens.forEach(screen => screen.classList.toggle('auth-locked', !profileDone));
    if (bottomNav) bottomNav.classList.toggle('hidden', !profileDone);
    if (accountBtn) {
      accountBtn.classList.remove('hidden');
      accountBtn.textContent = 'Account';
    }
    if (email) email.textContent = currentUser.email;
    renderAccountMainSummary();
    if (!panel.classList.contains('account-open')) panel.classList.add('hidden');
  } else {
    panel.classList.remove('hidden');
    panel.classList.remove('account-modal', 'account-open');
    loggedOut.classList.remove('hidden');
    loggedIn.classList.add('hidden');
    screens.forEach(screen => screen.classList.add('auth-locked'));
    if (bottomNav) bottomNav.classList.add('hidden');
    if (accountBtn) accountBtn.classList.add('hidden');
  }
}

function openAccountModal() {
  const panel = document.getElementById('accountPanel');
  if (!panel || !currentUser) return;
  panel.classList.add('account-modal', 'account-open');
  panel.classList.remove('hidden');
  showAccountView('main');
  renderModule.focusFirstInteractive(panel);
}

function closeAccountModal() {
  const panel = document.getElementById('accountPanel');
  if (!panel) return;
  panel.classList.remove('account-open', 'account-main-mode', 'account-submenu-mode');
  panel.classList.add('hidden');
  showAccountView('main');
  updateUpdateBanner();
}

function showAccountView(view) {
  if (view === 'password' && !canChangePassword()) view = 'main';
  document.querySelectorAll('#loggedInAccount .account-view').forEach(item => item.classList.add('hidden'));
  const target = document.getElementById(`account${view[0].toUpperCase()}${view.slice(1)}View`);
  if (target) target.classList.remove('hidden');
  const title = document.getElementById('accountModalTitle');
  if (title) title.textContent = 'somthingreat';
  const closeBtn = document.getElementById('closeAccountModalBtn');
  if (closeBtn) closeBtn.classList.remove('hidden');
  const panel = document.getElementById('accountPanel');
  const content = document.getElementById('loggedInAccount');
  const submenuViews = ['goal', 'equipment', 'password', 'support', 'admin'];
  if (panel) panel.classList.remove('account-password-mode');
  if (panel) panel.classList.toggle('account-main-mode', view === 'main');
  if (panel) panel.classList.toggle('account-submenu-mode', submenuViews.includes(view));
  if (panel) panel.scrollTop = 0;
  if (content) content.scrollTop = 0;
  if (view === 'goal') populateAccountGoal();
  if (view === 'equipment') populateAccountEquipment();
  if (view === 'support') resetSupportForm();
  if (view === 'admin') renderAdminDashboard();
  setPanelMessage('accountGoalMessage', '');
  setPanelMessage('accountEquipmentMessage', '');
  setPanelMessage('supportMessage', '');
}

function renderAccountMainSummary() {
  const profile = getProfile() || {};
  const goalSummary = document.getElementById('accountGoalSummary');
  const equipmentSummary = document.getElementById('accountEquipmentSummary');
  const adminSection = document.getElementById('adminAccountSection');
  const passwordSection = document.getElementById('passwordAccountSection');
  if (adminSection) adminSection.classList.toggle('hidden', !isAdminUser());
  if (passwordSection) passwordSection.classList.toggle('hidden', !canChangePassword());
  if (goalSummary) goalSummary.textContent = goalLabels[profile.goal] || 'Not set';
  if (equipmentSummary) {
    const equipment = profile.equipment || [];
    equipmentSummary.textContent = equipment.length ? equipment.map(item => equipmentLabels[item] || item).join(', ') : 'Not set';
  }
}

function populateAccountGoal() {
  const goal = getProfile()?.goal || 'pullup';
  const input = document.querySelector(`input[name="accountGoal"][value="${goal}"]`);
  if (input) input.checked = true;
}

function populateAccountEquipment() {
  const equipment = getProfile()?.equipment || ['none'];
  document.querySelectorAll('input[name="accountEquipment"]').forEach(input => {
    input.checked = equipment.includes(input.value);
  });
}

async function saveAccountGoal() {
  const goal = document.querySelector('input[name="accountGoal"]:checked')?.value;
  if (!goal) return setPanelMessage('accountGoalMessage', 'Choose a goal first.', 'error');
  setPanelMessage('accountGoalMessage', 'Saving goal...', 'info');
  state.profile = { ...(state.profile || {}), goal, updatedAt: new Date().toISOString() };
  state.current = null;
  state.generated = null;
  state.selectedEnergy = null;
  saveState();
  renderAll();
  openAccountModal();
  showAccountView('main');
}

async function saveAccountEquipment() {
  const equipment = Array.from(document.querySelectorAll('input[name="accountEquipment"]:checked')).map(input => input.value);
  if (equipment.length === 0) return setPanelMessage('accountEquipmentMessage', 'Choose at least one equipment option.', 'error');
  setPanelMessage('accountEquipmentMessage', 'Saving equipment...', 'info');
  state.profile = { ...(state.profile || {}), equipment, updatedAt: new Date().toISOString() };
  state.current = null;
  state.generated = null;
  state.selectedEnergy = null;
  saveState();
  renderAll();
  openAccountModal();
  showAccountView('main');
}

async function changePasswordFromAccount() {
  return withButtonLoading('saveAccountPasswordBtn', 'Sending...', async () => {
    if (!supabaseClient || !currentUser) return;
    const message = document.getElementById('accountPasswordMessage');
    const email = currentUser.email || document.getElementById('accountEmail')?.textContent.trim();
    renderModule.setMessage(message, '', 'info');
    if (!email) {
      renderModule.setMessage(message, 'Log in again before changing your password.', 'error');
      return;
    }
    renderModule.setMessage(message, 'Sending reset link...', 'info');
    const { error } = await sendPasswordResetToEmail(email);
    if (error) {
      renderModule.setMessage(message, friendlyAuthError(error.message), 'error');
      return;
    }
    renderModule.setMessage(message, 'Password reset link sent. Check your email.', 'success');
  });
}

function resetSupportForm() {
  setPanelMessage('supportMessage', '');
}

async function sendSupportMessage() {
  return withButtonLoading('sendSupportBtn', 'Submitting...', async () => {
    const subjectInput = document.getElementById('supportSubjectInput');
    const messageInput = document.getElementById('supportMessageInput');
    const message = document.getElementById('supportMessage');
    const subject = subjectInput?.value.trim() || '';
    const body = messageInput?.value.trim() || '';

    if (!subject || !body) {
      renderModule.setMessage(message, 'Add a subject and message first.', 'error');
      return;
    }
    if (!supabaseClient || !currentUser) {
      renderModule.setMessage(message, 'Log in again before sending support.', 'error');
      return;
    }

    renderModule.setMessage(message, 'Sending...', 'info');
    const { error } = await supabaseClient.functions.invoke('support-email', {
      body: {
        subject,
        message: body,
        email: currentUser.email || ''
      }
    });

    if (error) {
      renderModule.setMessage(message, 'Could not send it yet. Try again in a moment.', 'error');
      return;
    }

    if (subjectInput) subjectInput.value = '';
    if (messageInput) messageInput.value = '';
    renderModule.setMessage(message, 'Message sent. We’ll get back to you soon.', 'success');
  });
}
