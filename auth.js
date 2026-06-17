(function () {
  function createPasswordClient(supabase, url, anonKey) {
    if (!supabase || !url || !anonKey) return null;
    return supabase.createClient(url, anonKey, {
      auth: {
        storageKey: 'somthingreat-password-session',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      }
    });
  }

  function resetRedirectUrl() {
    const redirectUrl = new URL(window.location.origin + window.location.pathname);
    redirectUrl.searchParams.set('reset-password', '1');
    return redirectUrl.toString();
  }

  function authUrlParams(initialSearch = '', initialHash = '') {
    const combined = [
      initialSearch.replace(/^\?/, ''),
      initialHash.replace(/^#/, ''),
      window.location.search.replace(/^\?/, ''),
      window.location.hash.replace(/^#/, '')
    ].join('&');
    return new URLSearchParams(combined);
  }

  async function getExistingSession(client) {
    if (!client?.auth?.getSession) return null;
    const { data } = await client.auth.getSession();
    return data?.session?.user ? data.session : null;
  }

  async function waitForSession(client, attempts = 12, delayMs = 250) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const session = await getExistingSession(client);
      if (session) return session;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return null;
  }

  function resetLinkMessage() {
    return 'This reset link was not recognised. Please request a new reset link and open it directly from your email.';
  }

  function friendlyAuthError(message = '') {
    const lower = message.toLowerCase();
    if (lower.includes('rate limit') || lower.includes('security purposes') || lower.includes('too many')) {
      return 'Too many attempts. Wait a minute and try again.';
    }
    if (lower.includes('invalid login') || lower.includes('invalid credentials')) return 'Email or password is incorrect.';
    if (lower.includes('already registered') || lower.includes('already exists')) return 'An account already exists with this email. Try logging in instead.';
    if (lower.includes('password') && lower.includes('characters')) return 'Password is too short. Use at least 6 characters.';
    if (lower.includes('auth session missing') || lower.includes('session missing')) return resetLinkMessage();
    if (lower.includes('email')) return 'Please enter a valid email address.';
    return message || 'Something went wrong. Please try again.';
  }

  window.SomthingreatAuth = {
    authUrlParams,
    createPasswordClient,
    friendlyAuthError,
    getExistingSession,
    resetLinkMessage,
    resetRedirectUrl,
    waitForSession
  };

  const resetClient = createPasswordClient(window.supabase, window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  function appUser() {
    if (typeof currentUser !== 'undefined' && currentUser) return currentUser;
    return window.currentUser || null;
  }

  function setAppUser(user) {
    if (typeof currentUser !== 'undefined') currentUser = user;
    window.currentUser = user;
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

  function accountEmail() {
    const user = appUser();
    return user?.email || document.getElementById('accountEmail')?.textContent.trim() || '';
  }

  async function ensurePasswordSession() {
    if (!resetClient) return { client: window.appSupabaseClient || null, session: null };

    let session = await getExistingSession(resetClient);
    if (session) return { client: resetClient, session };

    if (window.appSupabaseClient) {
      session = await getExistingSession(window.appSupabaseClient);
      if (session) return { client: window.appSupabaseClient, session };
    }

    const params = authUrlParams(
      typeof INITIAL_AUTH_SEARCH !== 'undefined' ? INITIAL_AUTH_SEARCH : '',
      typeof INITIAL_AUTH_HASH !== 'undefined' ? INITIAL_AUTH_HASH : ''
    );
    if (params.get('error') || params.get('error_code')) return { client: resetClient, session: null };

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const code = params.get('code');

    if (accessToken && refreshToken) {
      const { data, error } = await resetClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (!error && data?.session?.user) return { client: resetClient, session: data.session };
    }

    if (code) {
      const clients = [resetClient, window.appSupabaseClient].filter(Boolean);
      for (const client of clients) {
        const { data, error } = await client.auth.exchangeCodeForSession(code);
        if (!error && data?.session?.user) return { client, session: data.session };
      }
    }

    session = await waitForSession(resetClient);
    return { client: resetClient, session };
  }

  async function sendPasswordResetToEmail(email) {
    if (!email || !resetClient) return { error: new Error('Please enter a valid email address.') };
    try { localStorage.setItem('somthingreat-password-reset-requested-at', String(Date.now())); } catch (error) {}
    return await resetClient.auth.resetPasswordForEmail(email, { redirectTo: resetRedirectUrl() });
  }

  async function sendPasswordResetFixed() {
    const email = document.getElementById('loginEmailInput')?.value.trim();
    if (!email) return showAuthMessage('Enter your email first, then tap Forgot password.', 'error');

    showAuthMessage('Sending reset link...', 'info');
    const { error } = await sendPasswordResetToEmail(email);
    if (error) return showAuthMessage(friendlyAuthError(error.message), 'error');
    showAuthMessage('Password reset link sent. Check your email.', 'success');
  }

  async function finishResetToLogin(client) {
    if (typeof passwordRecoveryMode !== 'undefined') passwordRecoveryMode = false;
    if (typeof clearRecoveryBootFlag === 'function') clearRecoveryBootFlag();
    try { localStorage.removeItem('somthingreat-password-reset-requested-at'); } catch (error) {}
    if (typeof clearAuthUrlParams === 'function') clearAuthUrlParams();
    if (typeof currentProfileId !== 'undefined') currentProfileId = null;
    setAppUser(null);

    try { await client?.auth?.signOut(); } catch (error) {}
    if (window.appSupabaseClient && client !== window.appSupabaseClient) {
      try { await window.appSupabaseClient.auth.signOut(); } catch (error) {}
    }
    if (resetClient && client !== resetClient) {
      try { await resetClient.auth.signOut(); } catch (error) {}
    }

    if (typeof clearAuthFields === 'function') clearAuthFields();
    if (typeof setAuthMode === 'function') setAuthMode('login');
    document.getElementById('accountPanel')?.classList.remove('hidden');
    document.getElementById('loggedOutAccount')?.classList.remove('hidden');
    document.getElementById('loggedInAccount')?.classList.add('hidden');
    document.querySelector('.bottom-nav')?.classList.add('hidden');
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('auth-locked'));
    showAuthMessage('Password reset. Log in with your new password.', 'success');
  }

  async function updatePasswordFromRecoveryFixed() {
    if (typeof passwordRecoveryMode !== 'undefined') passwordRecoveryMode = true;

    const { client, session } = await ensurePasswordSession();
    if (!session?.user) return showAuthMessage(resetLinkMessage(), 'error');
    setAppUser(session.user);

    const password = document.getElementById('resetPasswordInput')?.value;
    const confirmPassword = document.getElementById('resetConfirmPasswordInput')?.value;
    if (!password || !confirmPassword) return showAuthMessage('Enter and confirm your new password.', 'error');
    if (password.length < 6) return showAuthMessage('Password must be at least 6 characters.', 'error');
    if (password !== confirmPassword) return showAuthMessage('Passwords do not match.', 'error');

    showAuthMessage('Updating password...', 'info');
    const { error } = await client.auth.updateUser({ password });
    if (error) return showAuthMessage(friendlyAuthError(error.message), 'error');

    await finishResetToLogin(client);
  }

  async function changePasswordFromAccountFixed() {
    const message = document.getElementById('accountPasswordMessage');
    const email = accountEmail();
    if (message) message.textContent = '';
    if (!email) {
      if (message) message.textContent = 'Log in again before changing your password.';
      return;
    }

    if (message) message.textContent = 'Sending reset link...';
    const { error } = await sendPasswordResetToEmail(email);
    if (error) {
      if (message) message.textContent = friendlyAuthError(error.message);
      return;
    }
    if (message) message.textContent = 'Password reset link sent. Check your email.';
  }

  function wrapRender(name) {
    if (typeof window[name] !== 'function' || window[name].__authGuarded) return;
    const original = window[name];
    window[name] = function guardedRender(...args) {
      try {
        return original.apply(this, args);
      } catch (error) {
        console.error(error);
        return undefined;
      }
    };
    window[name].__authGuarded = true;
  }

  function installPasswordWorkflowAdapters() {
    window.friendlyAuthError = friendlyAuthError;
    window.sendPasswordResetToEmail = sendPasswordResetToEmail;
    window.sendPasswordReset = sendPasswordResetFixed;
    window.updatePasswordFromRecovery = updatePasswordFromRecoveryFixed;
    window.changePasswordFromAccount = changePasswordFromAccountFixed;
    wrapRender('renderGoals');
    wrapRender('renderProgress');
  }

  installPasswordWorkflowAdapters();
  document.addEventListener('DOMContentLoaded', installPasswordWorkflowAdapters);
  window.setTimeout(installPasswordWorkflowAdapters, 0);
})();
