(() => {
  if (typeof defaultState !== 'function' || typeof renderAll !== 'function') return;

  const normalizeState = () => {
    const defaults = defaultState();
    state = {
      ...defaults,
      ...(state || {}),
      levels: {
        ...defaults.levels,
        ...(state?.levels || {})
      }
    };
  };

  renderAll = () => {
    normalizeState();
    renderAccount();
    renderOnboarding();
    renderToday();
    renderGoals();
    renderProgress();
  };

  renderAll();
})();
