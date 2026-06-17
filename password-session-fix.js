(function () {
  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return;

  const resetClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
    auth: {
      storageKey: 'somthingreat-password-session-fix',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit'
    }
  });
  let pendingAccountPasswordChange = null;

  function resetLinkMessage() {
    return 'This reset link was not recognised. Please request a new reset link and open it directly from your email.';
  }

  function showAuthMessage(message, type = 'info') {
    if (typeof window.setAuthMessage === 'function') {
      window.setAuthMessage(message, type);
      return;
    }
    const el = document.getElementById('authMessage');
    if (el) {
      el.textContent = message || '';
      el.dataset.type = type;
    }
  }

  function authParams() {
    const initialSearch = typeof window.INITIAL_AUTH_SEARCH !== 'undefined' ? window.INITIAL_AUTH_SEARCH : '';
    const initialHash = typeof window.INITIAL_AUTH_HASH !== 'undefined' ? window.INITIAL_AUTH_HASH : '';
    const combined = [
      initialSearch.replace(/^\?/, ''),
      initialHash.replace(/^#/, ''),
      window.location.search.replace(/^\?/, ''),
      window.location.hash.replace(/^#/, '')
    ].join('&');
    return new URLSearchParams(combined);
  }

  async function waitForSession(client, attempts = 12, delayMs = 250) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const { data } = await client.auth.getSession();
      if (data?.session?.user) return data.session;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return null;
  }

  async function getExistingSession(client) {
    if (!client?.auth?.getSession) return null;
    const { data } = await client.auth.getSession();
    return data?.session?.user ? data.session : null;
  }

  async function ensurePasswordSession() {
    let session = await getExistingSession(resetClient);
    if (session) return { client: resetClient, session };

    if (window.appSupabaseClient) {
      session = await getExistingSession(window.appSupabaseClient);
      if (session) return { client: window.appSupabaseClient, session };
    }

    const params = authParams();
    if (params.get('error') || params.get('error_code')) return { client: resetClient, session: null };

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const code = params.get('code');

    if (accessToken && refreshToken) {
      const { data, error } = await resetClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (!error && data?.session?.user) return { client: resetClient, session: data.session };
    }

    if (code) {
      const { data, error } = await resetClient.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) return { client: resetClient, session: data.session };

      if (window.appSupabaseClient) {
        session = await getExistingSession(window.appSupabaseClient);
        if (session) return { client: window.appSupabaseClient, session };
      }
    }

    session = await waitForSession(resetClient);
    return { client: resetClient, session };
  }

  function ensureAccountNonceInput() {
    let input = document.getElementById('accountPasswordNonceInput');
    if (input) return input;

    const confirmInput = document.getElementById('accountConfirmPasswordInput');
    if (!confirmInput) return null;

    const wrapper = document.createElement('div');
    wrapper.id = 'accountPasswordNonceField';
    wrapper.className = 'password-field';

    input = document.createElement('input');
    input.id = 'accountPasswordNonceInput';
    input.className = 'text-input';
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'one-time-code';
    input.placeholder = 'Email verification code';

    wrapper.appendChild(input);
    const confirmWrapper = confirmInput.closest('.password-field') || confirmInput;
    confirmWrapper.insertAdjacentElement('afterend', wrapper);
    return input;
  }

  function clearAccountNonceInput() {
    const field = document.getElementById('accountPasswordNonceField');
    if (field) field.remove();
  }

  async function syncPrimarySession(client) {
    if (!window.appSupabaseClient || client === window.appSupabaseClient) return;
    const latest = await client.auth.getSession();
    if (latest.data?.session?.access_token && latest.data?.session?.refresh_token) {
      await window.appSupabaseClient.auth.setSession({
        access_token: latest.data.session.access_token,
        refresh_token: latest.data.session.refresh_token
      });
    }
  }

  function friendlyAuthErrorOverride(message = '') {
    const lower = message.toLowerCase();
    if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Email or password is incorrect.';
    if (lower.includes('already registered') || lower.includes('already exists')) return 'An account already exists with this email. Try logging in instead.';
    if (lower.includes('password') && lower.includes('characters')) return 'Password is too short. Use at least 6 characters.';
    if (lower.includes('nonce') || lower.includes('otp')) return 'Enter the verification code from your email, then try again.';
    if (lower.includes('current password')) return 'Check your email for the verification code, enter it here, then try again.';
    if (lower.includes('auth session missing') || lower.includes('session missing')) return resetLinkMessage();
    if (lower.includes('email')) return 'Please enter a valid email address.';
    if (lower.includes('rate limit')) return 'Too many attempts. Wait a minute and try again.';
    return message || 'Something went wrong. Please try again.';
  }

  async function sendPasswordResetFixed() {
    const email = document.getElementById('loginEmailInput')?.value.trim();
    if (!email) return showAuthMessage('Enter your email first, then tap Forgot password.', 'error');

    const redirectUrl = new URL(window.location.origin + window.location.pathname);
    redirectUrl.searchParams.set('reset-password', '1');

    try {
      localStorage.setItem('somthingreat-password-reset-requested-at', String(Date.now()));
    } catch (error) {}

    showAuthMessage('Sending reset link...', 'info');
    const { error } = await resetClient.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl.toString() });
    if (error) return showAuthMessage(friendlyAuthErrorOverride(error.message), 'error');
    showAuthMessage('Password reset link sent. Check your email.', 'success');
  }

  async function updatePasswordFromRecoveryFixed() {
    if (typeof window.passwordRecoveryMode !== 'undefined') window.passwordRecoveryMode = true;

    const { client, session } = await ensurePasswordSession();
    if (!session?.user) return showAuthMessage(resetLinkMessage(), 'error');
    if (typeof window.currentUser !== 'undefined') window.currentUser = session.user;

    const password = document.getElementById('resetPasswordInput')?.value;
    const confirmPassword = document.getElementById('resetConfirmPasswordInput')?.value;
    if (!password || !confirmPassword) return showAuthMessage('Enter and confirm your new password.', 'error');
    if (password.length < 6) return showAuthMessage('Password must be at least 6 characters.', 'error');
    if (password !== confirmPassword) return showAuthMessage('Passwords do not match.', 'error');

    showAuthMessage('Updating password...', 'info');
    const { error } = await client.auth.updateUser({ password });
    if (error) return showAuthMessage(friendlyAuthErrorOverride(error.message), 'error');

    if (typeof window.passwordRecoveryMode !== 'undefined') window.passwordRecoveryMode = false;
    if (typeof window.clearRecoveryBootFlag === 'function') window.clearRecoveryBootFlag();
    try { localStorage.removeItem('somthingreat-password-reset-requested-at'); } catch (error) {}
    if (typeof window.clearAuthUrlParams === 'function') window.clearAuthUrlParams();
    if (typeof window.currentProfileId !== 'undefined') window.currentProfileId = null;
    if (typeof window.currentUser !== 'undefined' && window.currentUser && typeof window.loadCloudState === 'function') await window.loadCloudState();
    await syncPrimarySession(client);
    if (typeof window.clearAuthFields === 'function') window.clearAuthFields();
    showAuthMessage('Password updated. You are logged in.', 'success');
    if (typeof window.renderAll === 'function') window.renderAll();
  }

  async function changePasswordFromAccountFixed() {
    if (typeof window.currentUser === 'undefined' || !window.currentUser) return;

    const message = document.getElementById('accountPasswordMessage');
    const currentPasswordInput = document.getElementById('accountCurrentPasswordInput');
    const passwordInput = document.getElementById('accountNewPasswordInput');
    const confirmPasswordInput = document.getElementById('accountConfirmPasswordInput');
    const nonceInput = document.getElementById('accountPasswordNonceInput');
    const currentPassword = currentPasswordInput?.value;
    const password = passwordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;
    const nonce = nonceInput?.value.trim();
    if (message) message.textContent = '';

    if (pendingAccountPasswordChange) {
      if (password && pendingAccountPasswordChange.password !== password) {
        pendingAccountPasswordChange = null;
        clearAccountNonceInput();
      } else if (!nonce) {
        ensureAccountNonceInput();
        if (message) message.textContent = 'Enter the verification code from your email, then tap Update password again.';
        return;
      } else {
        if (message) message.textContent = 'Updating password...';
        const { error } = await resetClient.auth.updateUser({
          password: pendingAccountPasswordChange.password,
          nonce
        });
        if (error) {
          if (message) message.textContent = friendlyAuthErrorOverride(error.message);
          return;
        }

        await syncPrimarySession(resetClient);
        pendingAccountPasswordChange = null;
        clearAccountNonceInput();
        currentPasswordInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        if (message) message.textContent = 'Password updated.';
        return;
      }
    }

    if (!currentPassword || !password || !confirmPassword) {
      if (message) message.textContent = 'Enter your current password, then your new password twice.';
      return;
    }
    if (password.length < 6) {
      if (message) message.textContent = 'Password must be at least 6 characters.';
      return;
    }
    if (password !== confirmPassword) {
      if (message) message.textContent = 'Passwords do not match.';
      return;
    }

    const email = window.currentUser.email;
    if (!email) {
      if (message) message.textContent = 'Log in again before changing your password.';
      return;
    }

    if (message) message.textContent = 'Checking current password...';
    const { error: signInError } = await resetClient.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) {
      if (message) message.textContent = 'Current password is incorrect.';
      return;
    }

    const { data: sessionData } = await resetClient.auth.getSession();
    if (!sessionData?.session?.user) {
      if (message) message.textContent = 'Log in again before changing your password.';
      return;
    }

    window.currentUser = sessionData.session.user;
    const { error: reauthError } = await resetClient.auth.reauthenticate();
    if (reauthError) {
      if (message) message.textContent = friendlyAuthErrorOverride(reauthError.message);
      return;
    }

    pendingAccountPasswordChange = { email, password, requestedAt: Date.now() };
    const codeInput = ensureAccountNonceInput();
    if (codeInput) codeInput.value = '';
    if (message) message.textContent = 'Current password verified. Check your email for the verification code, enter it here, then tap Update password again.';
  }

  function bindButton(id, handler) {
    const button = document.getElementById(id);
    if (!button || button.dataset.passwordFixBound === '1') return;
    const freshButton = button.cloneNode(true);
    freshButton.dataset.passwordFixBound = '1';
    button.replaceWith(freshButton);
    freshButton.addEventListener('click', event => {
      event.preventDefault();
      handler();
    });
  }

  function bindPasswordHandlers() {
    bindButton('forgotPasswordBtn', sendPasswordResetFixed);
    bindButton('resetPasswordBtn', updatePasswordFromRecoveryFixed);
    bindButton('saveAccountPasswordBtn', changePasswordFromAccountFixed);
  }

  function safeRender(fn) {
    if (typeof fn !== 'function') return;
    try {
      fn();
    } catch (error) {
      console.error(error);
    }
  }

  window.friendlyAuthError = friendlyAuthErrorOverride;
  window.sendPasswordReset = sendPasswordResetFixed;
  window.updatePasswordFromRecovery = updatePasswordFromRecoveryFixed;
  window.changePasswordFromAccount = changePasswordFromAccountFixed;

  bindPasswordHandlers();
  document.addEventListener('DOMContentLoaded', bindPasswordHandlers);
  setTimeout(bindPasswordHandlers, 0);

  if (typeof window.isPasswordRecoveryUrl === 'function' && window.isPasswordRecoveryUrl()) {
    if (typeof window.passwordRecoveryMode !== 'undefined') window.passwordRecoveryMode = true;
    if (typeof window.setAuthMode === 'function') window.setAuthMode('reset');
    ensurePasswordSession().then(({ session }) => {
      if (session?.user && typeof window.currentUser !== 'undefined') window.currentUser = session.user;
      if (typeof window.renderAll === 'function') window.renderAll();
    });
  }

  if (typeof window.renderAll === 'function') {
    window.renderAll = function () {
      safeRender(window.renderAccount);
      safeRender(window.renderOnboarding);
      if (
        typeof window.passwordRecoveryMode !== 'undefined' &&
        !window.passwordRecoveryMode &&
        typeof window.currentUser !== 'undefined' &&
        window.currentUser &&
        typeof window.hasCompletedProfile === 'function' &&
        window.hasCompletedProfile()
      ) {
        safeRender(window.renderToday);
        safeRender(window.renderGoals);
        safeRender(window.renderProgress);
      }
      safeRender(window.enforceScreenSeparation);
      safeRender(window.updateWelcomeGate);
      bindPasswordHandlers();
    };
  }
})();