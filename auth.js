(function () {
  function createRecoveryClient(supabase, url, anonKey) {
    if (!supabase || !url || !anonKey) return null;
    return supabase.createClient(url, anonKey, {
      auth: {
        storageKey: 'somthingreat-recovery-session',
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
    createRecoveryClient,
    friendlyAuthError,
    getExistingSession,
    resetLinkMessage,
    resetRedirectUrl,
    waitForSession
  };
})();
