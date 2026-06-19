(function () {
  function normaliseEmail(email = '') {
    return email.trim().toLowerCase();
  }

  function isAdminUser(user, adminEmails = []) {
    return Boolean(user?.email && adminEmails.includes(normaliseEmail(user.email)));
  }

  function getCompletedWorkoutCount(savedState) {
    return Array.isArray(savedState?.history) ? savedState.history.length : 0;
  }

  function formatAdminGoal(savedState, goalLabels = {}) {
    const goal = savedState?.profile?.goal;
    return goalLabels[goal] || goal || 'Not set';
  }

  function formatAdminActive(profile, savedState) {
    if (profile?.deleted_at) return 'N';
    if (profile?.current_auth_user_id) return 'Y';
    return savedState ? 'Y' : 'N';
  }

  function escapeHTML(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  window.SomthingreatAdmin = {
    normaliseEmail,
    isAdminUser,
    getCompletedWorkoutCount,
    formatAdminGoal,
    formatAdminActive,
    escapeHTML
  };
})();
