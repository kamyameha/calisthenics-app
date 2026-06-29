const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const storage = new Map();

global.window = {};
global.document = {
  createElement() {
    return {
      className: '',
      innerHTML: '',
      children: [],
      appendChild(child) {
        this.children.push(child);
      }
    };
  }
};
global.localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
  removeItem(key) {
    storage.delete(key);
  }
};

function load(file) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  global.eval(source);
}

load('workouts.js');
load('state.js');
load('account.js');
load('admin.js');

const workoutModule = window.SomthingreatWorkouts;
const goalLabels = {
  pullup: 'First Pull-Up',
  handstand: 'First Handstand',
  lsit: 'First L-Sit',
  muscleup: 'First Muscle-Up',
  general: 'General Fitness'
};
const equipmentLabels = {
  none: 'No equipment',
  pullupBar: 'Pull-up bar',
  dipBars: 'Dip bars',
  bands: 'Resistance bands',
  jumpRope: 'Jump rope'
};

const stateStore = window.SomthingreatState.create({
  workoutModule,
  baseTracks: workoutModule.baseTracks,
  energyOptions: workoutModule.energyOptions,
  sanitizeWorkout: workoutModule.sanitizeWorkout,
  goalLabels,
  equipmentLabels
});

{
  const tracks = workoutModule.getTracks({ equipment: ['none'], goal: 'pullup' });
  assert(!tracks.dip.some(exercise => /bench/i.test(exercise.name)), 'no-equipment dip track should not mention bench');
  assert(tracks.dip.some(exercise => exercise.name === 'Chair dip'), 'no-equipment dip track should offer chair dips');
}

{
  const dirty = {
    schemaVersion: 0,
    profile: { goal: 'pullup', equipment: ['none', 'bands'], pushups: 'oneFive', squats: 'sixTen', deadHang: 'yes' },
    levels: { pushup: { level: 999, points: 999 } },
    history: [{ date: 'not a date' }, { date: '2026-06-19T10:00:00.000Z', workout: 'Push', mode: 'normal' }],
    selectedEnergy: 'impossible'
  };
  const clean = stateStore.sanitizeState(dirty);
  assert.strictEqual(clean.schemaVersion, 1);
  assert.deepStrictEqual(clean.profile.equipment, ['bands']);
  assert.strictEqual(clean.history.length, 1);
  assert.strictEqual(clean.selectedEnergy, null);
  assert(clean.levels.pushup.level < 10, 'level should be clamped to the available track');
}

{
  const history = [
    { date: '2026-06-01T10:00:00.000Z' },
    { date: '2026-06-19T10:00:00.000Z' },
    { date: '2026-05-19T10:00:00.000Z' }
  ];
  assert.strictEqual(window.SomthingreatAccount.workoutCountForMonth(history, new Date('2026-06-20T10:00:00.000Z')), 2);
}

{
  const escaped = window.SomthingreatAdmin.escapeHTML('<script>"x"</script>');
  assert(!escaped.includes('<script>'));
  assert(escaped.includes('&lt;script&gt;'));
}

{
  const now = new Date('2026-06-29T12:00:00.000Z');
  const recentWorkout = { history: [{ date: '2026-06-20T12:00:00.000Z' }] };
  const oldWorkout = { history: [{ date: '2026-06-01T12:00:00.000Z' }] };
  assert.strictEqual(window.SomthingreatAdmin.formatAdminActive({}, recentWorkout, now), 'Y');
  assert.strictEqual(window.SomthingreatAdmin.formatAdminActive({ current_auth_user_id: 'auth-1' }, oldWorkout, now), 'N');
  assert.strictEqual(window.SomthingreatAdmin.formatAdminActive({}, { history: [] }, now), 'N');
}

console.log('Unit tests passed.');
