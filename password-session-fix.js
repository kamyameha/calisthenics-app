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

  function activeClient() {
    return resetClient;
  }

  function resetLinkMessage() {
    return 'This reset link was not recognised. Please request a new reset link and open it directly from your email.';
  }

  function showAuthMessage(message, type = 'info') {
    if (typeof setAuthMessage === 'function') {
      setAuthMessage(message, type);
      return;
    }
    const el = document.getElementById('authMessage');
    if (el) {
      el.textContent = message || '';
      el.dataset.type = type;
    }
  }

  function authParams() {
    const initialSearch = typeof INITIAL_AUTH_SEARCH !== 'undefined' ? INITIAL_AUTH_SEARCH : '';
    const initialHash = typeof INITIAL_AUTH_HASH !== 'undefined' ? INITIAL_AUTH_HASH : '';
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
    const client = activeClient();
    const existing = await getExistingSession(client);
    if (existing) return { client, session: existing };

    if (window.appSupabaseClient) {
      const primarySession = await getExistingSession(window.appSupabaseClient);
      if (primarySession) return { client: window.appSupabaseClient, session: primarySession };
    }

    const params = authParams();
    if (params.get('error') || params.get('error_code')) return { client, session: null };

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const code = params.get('code');

    if (accessToken && refreshToken) {
      const { data, error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (!error && data?.session?.user) return { client, session: data.session };
    }

    if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) return { client, session: data.session };

      if (window.appSupabaseClient) {
        const primarySession = await getExistingSession(window.appSupabaseClient);
        if (primarySession) return { client: window.appSupabaseClient, session: primarySession };
      }
    }

    const session = await waitForSession(client);
    return { client, session };
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

  friendlyAuthError = function (message = '') {
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
  };

  sendPasswordReset = async function () {
    const email = document.getElementById('loginEmailInput')?.value.trim();
    if (!email) return showAuthMessage('Enter your email first, then tap Forgot password.', 'error');

    const redirectUrl = new URL(window.location.origin + window.location.pathname);
    redirectUrl.searchParams.set('reset-password', '1');

    try {
      localStorage.setItem('somthingreat-password-reset-requested-at', String(Date.now()));
    } catch (error) {}

    showAuthMessage('Sending reset link...', 'info');
    const { error } = await resetClient.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl.toString() });
    if (error) return showAuthMessage(friendlyAuthError(error.message), 'error');
    showAuthMessage('Password reset link sent. Check your email.', 'success');
  };

  updatePasswordFromRecovery = async function () {
    if (typeof passwordRecoveryMode !== 'undefined') passwordRecoveryMode = true;

    const { client, session } = await ensurePasswordSession();
    if (!session?.user) return showAuthMessage(resetLinkMessage(), 'error');
    if (typeof currentUser !== 'undefined') currentUser = session.user;

    const password = document.getElementById('resetPasswordInput')?.value;
    const confirmPassword = document.getElementById('resetConfirmPasswordInput')?.value;
    if (!password || !confirmPassword) return showAuthMessage('Enter and confirm your new password.', 'error');
    if (password.length < 6) return showAuthMessage('Password must be at least 6 characters.', 'error');
    if (password !== confirmPassword) return showAuthMessage('Passwords do not match.', 'error');

    showAuthMessage('Updating password...', 'info');
    const { error } = await client.auth.updateUser({ password });
    if (error) return showAuthMessage(friendlyAuthError(error.message), 'error');

    if (typeof passwordRecoveryMode !== 'undefined') passwordRecoveryMode = false;
    if (typeof clearRecoveryBootFlag === 'function') clearRecoveryBootFlag();
    try { localStorage.removeItem('somthingreat-password-reset-requested-at'); } catch (error) {}
    if (typeof clearAuthUrlParams === 'function') clearAuthUrlParams();
    if (typeof currentProfileId !== 'undefined') currentProfileId = null;
    if (typeof currentUser !== 'undefined' && currentUser && typeof loadCloudState === 'function') await loadCloudState();
    await syncPrimarySession(client);
    if (typeof clearAuthFields === 'function') clearAuthFields();
    showAuthMessage('Password updated. You are logged in.', 'success');
    if (typeof renderAll === 'function') renderAll();
  };

  changePasswordFromAccount = async function () {
    if (typeof currentUser === 'undefined' || !currentUser) return;

    const client = activeClient();
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
        const { error } = await client.auth.updateUser({
          password: pendingAccountPasswordChange.password,
          nonce
        });
        if (error) {
          if (message) message.textContent = friendlyAuthError(error.message);
          return;
        }

        await syncPrimarySession(client);
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

    const email = currentUser.email;
    if (!email) {
      if (message) message.textContent = 'Log in again before changing your password.';
      return;
    }

    if (message) message.textContent = 'Checking current password...';
    const { error: signInError } = await client.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) {
      if (message) message.textContent = 'Current password is incorrect.';
      return;
    }

    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData?.session?.user) {
      if (message) message.textContent = 'Log in again before changing your password.';
      return;
    }

    currentUser = sessionData.session.user;
    const { error: reauthError } = await client.auth.reauthenticate();
    if (reauthError) {
      if (message) message.textContent = friendlyAuthError(reauthError.message);
      return;
    }

    pendingAccountPasswordChange = { email, password, requestedAt: Date.now() };
    const codeInput = ensureAccountNonceInput();
    if (codeInput) codeInput.value = '';
    if (message) message.textContent = 'Current password verified. Check your email for the verification code, enter it here, then tap Update password again.';
  };

  if (typeof isPasswordRecoveryUrl === 'function' && isPasswordRecoveryUrl()) {
    if (typeof passwordRecoveryMode !== 'undefined') passwordRecoveryMode = true;
    if (typeof setAuthMode === 'function') setAuthMode('reset');
    ensurePasswordSession().then(({ session }) => {
      if (session?.user && typeof currentUser !== 'undefined') currentUser = session.user;
      if (typeof renderAll === 'function') renderAll();
    });
  }

  if (typeof renderAll === 'function') {
    renderAll = function () {
      if (typeof renderAccount === 'function') renderAccount();
      if (typeof renderOnboarding === 'function') renderOnboarding();
      if (
        typeof passwordRecoveryMode !== 'undefined' &&
        !passwordRecoveryMode &&
        typeof currentUser !== 'undefined' &&
        currentUser &&
        typeof hasCompletedProfile === 'function' &&
        hasCompletedProfile()
      ) {
        if (typeof renderToday === 'function') renderToday();
        if (typeof renderGoals === 'function') renderGoals();
        if (typeof renderProgress === 'function') renderProgress();
      }
      if (typeof enforceScreenSeparation === 'function') enforceScreenSeparation();
      if (typeof updateWelcomeGate === 'function') updateWelcomeGate();
    };
  }
})();