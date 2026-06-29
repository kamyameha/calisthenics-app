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

  function getLastWorkoutDate(savedState) {
    if (!Array.isArray(savedState?.history)) return null;
    return savedState.history.reduce((latest, item) => {
      const date = new Date(item?.date);
      if (Number.isNaN(date.getTime())) return latest;
      return !latest || date > latest ? date : latest;
    }, null);
  }

  function isRecentlyActive(savedState, now = new Date(), activeWindowDays = 14) {
    const lastWorkoutDate = getLastWorkoutDate(savedState);
    if (!lastWorkoutDate) return false;
    const activeWindowMs = activeWindowDays * 24 * 60 * 60 * 1000;
    return now.getTime() - lastWorkoutDate.getTime() <= activeWindowMs;
  }

  function formatAdminGoal(savedState, goalLabels = {}) {
    const goal = savedState?.profile?.goal;
    return goalLabels[goal] || goal || 'Not set';
  }

  function formatAdminActive(profile, savedState, now = new Date()) {
    if (profile?.deleted_at) return 'N';
    return isRecentlyActive(savedState, now) ? 'Y' : 'N';
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
    getLastWorkoutDate,
    isRecentlyActive,
    formatAdminGoal,
    formatAdminActive,
    escapeHTML
  };
})();
