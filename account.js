(function () {
  function workoutItemsForMonth(history = [], date = new Date()) {
    const month = date.getMonth();
    const year = date.getFullYear();
    return history
      .map(item => ({ ...item, parsedDate: new Date(item.date) }))
      .filter(item => item.parsedDate.getMonth() === month && item.parsedDate.getFullYear() === year);
  }

  function workoutCountForMonth(history = [], date = new Date()) {
    return workoutItemsForMonth(history, date).length;
  }

  function groupItemsByDay(items = []) {
    const byDay = new Map();
    items.forEach(item => {
      const day = item.parsedDate.getDate();
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(item);
    });
    return byDay;
  }

  function renderHistoryCalendar(calendar, monthDate, monthItems) {
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();
    const byDay = groupItemsByDay(monthItems);
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mondayOffset = (firstDay.getDay() + 6) % 7;

    calendar.innerHTML = '';
    for (let i = 0; i < mondayOffset; i += 1) {
      const empty = document.createElement('div');
      empty.className = 'history-day history-empty';
      calendar.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const cell = document.createElement('div');
      const workouts = byDay.get(day) || [];
      cell.className = `history-day${workouts.length ? ' has-workout' : ''}`;
      cell.innerHTML = `<span>${day}</span>`;
      calendar.appendChild(cell);
    }
  }

  function renderHistoryList(list, monthItems, energyOptions) {
    list.innerHTML = monthItems.length
      ? monthItems.map(item => `<div class="history-item"><strong>${item.parsedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</strong><span>${item.workout || 'Workout'} · ${energyOptions[item.mode]?.title || item.mode || 'Done'}</span></div>`).join('')
      : '<p class="muted">No workouts completed this month yet.</p>';
  }

  window.SomthingreatAccount = {
    workoutItemsForMonth,
    workoutCountForMonth,
    renderHistoryCalendar,
    renderHistoryList
  };
})();
