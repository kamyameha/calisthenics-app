(function () {
  const baseTracks = {
    pushup: [
      { name: 'Incline push-up', prescription: '3 × 5' },
      { name: 'Incline push-up', prescription: '3 × 8' },
      { name: 'Incline push-up', prescription: '3 × 10' },
      { name: 'Lower incline push-up', prescription: '3 × 5' },
      { name: 'Lower incline push-up', prescription: '3 × 8' },
      { name: 'Knee push-up', prescription: '3 × 5' },
      { name: 'Knee push-up', prescription: '3 × 8' },
      { name: 'Full push-up', prescription: '3 × 3' },
      { name: 'Full push-up', prescription: '3 × 5' },
      { name: 'Full push-up', prescription: '3 × 8' }
    ],
    pullup: [
      { name: 'Dead hang + negative pull-up', prescription: '3 × 20s + 3 × 1' },
      { name: 'Dead hang + negative pull-up', prescription: '3 × 30s + 3 × 2' },
      { name: 'Dead hang + negative pull-up', prescription: '3 × 40s + 3 × 3' },
      { name: 'Scapular pull-up', prescription: '3 × 5' },
      { name: 'Scapular pull-up', prescription: '3 × 8' },
      { name: 'Assisted pull-up', prescription: '3 × 3' },
      { name: 'First pull-up attempt', prescription: '5 attempts' }
    ],
    dip: [
      { name: 'Negative dip', prescription: '3 × 2' },
      { name: 'Negative dip', prescription: '3 × 4' },
      { name: 'Dip', prescription: '3 × 1' },
      { name: 'Dip', prescription: '3 × 2' },
      { name: 'Dip', prescription: '3 × 3' },
      { name: 'Dip', prescription: '3 × 5' }
    ],
    legs: [
      { name: 'Bodyweight squat', prescription: '3 × 10' },
      { name: 'Bodyweight squat', prescription: '3 × 15' },
      { name: 'Reverse lunge', prescription: '3 × 8/side' },
      { name: 'Reverse lunge', prescription: '3 × 10/side' },
      { name: 'Kettlebell deadlift', prescription: '3 × 10' },
      { name: 'Goblet squat', prescription: '3 × 8' }
    ],
    core: [
      { name: 'Plank', prescription: '3 × 20s' },
      { name: 'Plank', prescription: '3 × 30s' },
      { name: 'Plank', prescription: '3 × 45s' },
      { name: 'Hollow hold', prescription: '3 × 15s' },
      { name: 'Hollow hold', prescription: '3 × 30s' },
      { name: 'Hanging knee raise', prescription: '3 × 5' },
      { name: 'Hanging knee raise', prescription: '3 × 10' }
    ],
    crow: [
      { name: 'Crow weight shift', prescription: '5 × 10s' },
      { name: 'Crow one-foot lift', prescription: '5 attempts/side' },
      { name: 'Crow hold', prescription: '5 × 3s' },
      { name: 'Crow hold', prescription: '5 × 5s' },
      { name: 'Crow hold', prescription: '5 × 10s' },
      { name: 'Crow hold', prescription: '3 × 20s' }
    ],
    lsit: [
      { name: 'Tuck sit', prescription: '5 × 10s' },
      { name: 'Tuck sit', prescription: '5 × 20s' },
      { name: 'Extended tuck', prescription: '5 × 10s' },
      { name: 'Extended tuck', prescription: '5 × 20s' },
      { name: 'One-leg L-sit', prescription: '5 × 10s/side' },
      { name: 'L-sit', prescription: '5 attempts' }
    ],
    handstand: [
      { name: 'Wall plank hold', prescription: '3 × 20s' },
      { name: 'Pike hold', prescription: '3 × 20s' },
      { name: 'Wall walk', prescription: '3 × 3' },
      { name: 'Chest-to-wall handstand', prescription: '3 × 20s' },
      { name: 'Handstand kick-up practice', prescription: '5 min' }
    ],
    muscleup: [
      { name: 'Explosive row / pull practice', prescription: '3 × 5' },
      { name: 'Negative pull-up', prescription: '3 × 3' },
      { name: 'High pull-up practice', prescription: '3 × 3' },
      { name: 'Transition drill', prescription: '5 attempts' },
      { name: 'Muscle-up attempt', prescription: '5 attempts' }
    ],
    rope: [
      { name: 'Jump rope', prescription: '3 × 30s' },
      { name: 'Jump rope', prescription: '3 × 45s' },
      { name: 'Jump rope', prescription: '3 × 60s' },
      { name: 'Jump rope', prescription: '5 min easy' }
    ]
  };

  const energyOptions = {
    great: {
      label: 'Great',
      mode: 'great',
      title: 'Great',
      description: 'Full session · 4 exercises · full sets and reps.',
      exerciseCount: 4,
      setMultiplier: 1,
      repMultiplier: 1,
      levelShift: 0,
      icon: 'Assets/Energy/great-icon.png'
    },
    normal: {
      label: 'Normal',
      mode: 'normal',
      title: 'Normal',
      description: 'Standard session · 4 exercises · slightly reduced sets and reps.',
      exerciseCount: 4,
      setMultiplier: 0.8,
      repMultiplier: 0.85,
      levelShift: 0,
      icon: 'Assets/Energy/normal-icon.png'
    },
    tired: {
      label: 'Tired',
      mode: 'tired',
      title: 'Tired',
      description: 'Shorter session · 3 exercises · reduced volume.',
      exerciseCount: 3,
      setMultiplier: 0.8,
      repMultiplier: 0.85,
      levelShift: 0,
      icon: 'Assets/Energy/tired-icon.png'
    },
    exhausted: {
      label: 'Exhausted',
      mode: 'exhausted',
      title: 'Exhausted',
      description: 'Minimum session · 3 easier exercises · low sets and reps.',
      exerciseCount: 3,
      setMultiplier: 0.55,
      repMultiplier: 0.65,
      levelShift: -1,
      icon: 'Assets/Energy/exhaustive-icon.png'
    }
  };

  const workoutAddOns = {
    warmup: {
      trackKey: 'warmup',
      name: '2-min full-body warm-up',
      prescription: '2 min · 30s each',
      setCount: 4,
      isAddOn: true,
      addOnType: 'warmup',
      setLabels: ['March in place', 'Arm circles', 'Hip circles', 'Bodyweight squats']
    },
    stretch: {
      trackKey: 'stretch',
      name: '2-min full-body stretch',
      prescription: '2 min · 30s each',
      setCount: 4,
      isAddOn: true,
      addOnType: 'stretch',
      setLabels: ['Hamstring stretch', 'Quad stretch', 'Chest opener', "Child's pose"]
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createDefaultLevels() {
    const levels = {};
    Object.keys(baseTracks).forEach(key => levels[key] = { level: 0, points: 0 });
    return levels;
  }

  function getTracks(profile = null) {
    const equipment = profile?.equipment || [];
    const hasPullupBar = equipment.includes('pullupBar');
    const hasDipBars = equipment.includes('dipBars');
    const hasBands = equipment.includes('bands');
    const hasJumpRope = equipment.includes('jumpRope');
    const tracks = clone(baseTracks);

    if (!hasPullupBar) {
      tracks.pullup = [
        { name: 'Prone Y raise', prescription: '3 × 8' },
        { name: 'Superman hold', prescription: '3 × 20s' },
        { name: 'Reverse snow angel', prescription: '3 × 8' },
        { name: 'Table row', prescription: '3 × 5' },
        { name: 'Table row', prescription: '3 × 8' },
        { name: 'Pull-up bar recommended', prescription: 'Keep building pulling strength' }
      ];
    } else if (hasBands) {
      tracks.pullup[5] = { name: 'Band-assisted pull-up', prescription: '3 × 3' };
    }

    if (!hasDipBars) {
      tracks.dip = [
        { name: 'Bench dip prep', prescription: '3 × 5' },
        { name: 'Bench dip', prescription: '3 × 8' },
        { name: 'Bench dip', prescription: '3 × 10' },
        { name: 'Close-grip push-up', prescription: '3 × 5' },
        { name: 'Dip bars recommended', prescription: 'Keep building pushing strength' }
      ];
    }

    tracks.legs = [
      { name: 'Bodyweight squat', prescription: '3 × 10' },
      { name: 'Bodyweight squat', prescription: '3 × 15' },
      { name: 'Reverse lunge', prescription: '3 × 8/side' },
      { name: 'Reverse lunge', prescription: '3 × 10/side' },
      { name: 'Split squat', prescription: '3 × 6/side' },
      { name: 'Split squat', prescription: '3 × 8/side' }
    ];

    if (!hasPullupBar) {
      tracks.muscleup = [];
      tracks.core = [
        { name: 'Plank', prescription: '3 × 20s' },
        { name: 'Plank', prescription: '3 × 30s' },
        { name: 'Plank', prescription: '3 × 45s' },
        { name: 'Hollow hold', prescription: '3 × 15s' },
        { name: 'Hollow hold', prescription: '3 × 30s' },
        { name: 'Reverse crunch', prescription: '3 × 8' },
        { name: 'Reverse crunch', prescription: '3 × 12' }
      ];
    }

    if (!hasJumpRope) tracks.rope = [];

    return tracks;
  }

  function getRotation(profile = null) {
    const goal = profile?.goal || 'pullup';
    const equipment = profile?.equipment || [];
    const hasPullupBar = equipment.includes('pullupBar');
    const skillTrack = goal === 'handstand'
      ? 'handstand'
      : goal === 'lsit'
        ? 'lsit'
        : goal === 'muscleup' && hasPullupBar
          ? 'muscleup'
          : goal === 'general'
            ? 'crow'
            : 'pullup';
    return [
      { name: 'Push', tracks: ['pushup', 'dip', 'core'] },
      { name: 'Pull', tracks: ['pullup', 'core'] },
      { name: 'Legs + Core', tracks: ['legs', 'core'] },
      { name: 'Skills', tracks: [skillTrack, 'lsit', 'core'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3) }
    ];
  }

  function getEnergyConfig(mode = 'normal') {
    return Object.values(energyOptions).find(option => option.mode === mode) || energyOptions.normal;
  }

  function isTrackAvailable(trackKey, tracks) {
    return Array.isArray(tracks?.[trackKey]) && tracks[trackKey].length > 0;
  }

  function getSetCount(prescription = '') {
    const setMatch = prescription.match(/(\d+)\s*×/);
    if (setMatch) return Math.max(1, Number(setMatch[1]));
    const attemptMatch = prescription.match(/(\d+)\s+attempts/);
    if (attemptMatch) return Math.max(1, Number(attemptMatch[1]));
    return 1;
  }

  function adaptPrescription(prescription, config = energyOptions.great) {
    const setMultiplier = config.setMultiplier ?? 1;
    const repMultiplier = config.repMultiplier ?? 1;

    let adapted = prescription.replace(/(\d+)\s*×\s*(\d+)(s?)(\/side)?/g, (_, sets, reps, seconds, side = '') => {
      const nextSets = Math.max(1, Math.round(Number(sets) * setMultiplier));
      const nextReps = Math.max(1, Math.round(Number(reps) * repMultiplier));
      return `${nextSets} × ${nextReps}${seconds || ''}${side || ''}`;
    });

    adapted = adapted.replace(/(\d+)\s+attempts(\/side)?/g, (_, attempts, side = '') => {
      const nextAttempts = Math.max(1, Math.round(Number(attempts) * repMultiplier));
      return `${nextAttempts} attempts${side || ''}`;
    });

    adapted = adapted.replace(/(\d+)\s+min/g, (_, minutes) => {
      const nextMinutes = Math.max(1, Math.round(Number(minutes) * repMultiplier));
      return `${nextMinutes} min`;
    });

    return adapted;
  }

  function normalizeExercise(exercise) {
    if (!exercise || typeof exercise !== 'object') return null;
    if (!exercise.name || !exercise.prescription) return null;
    const normalized = { ...exercise };
    normalized.trackKey = normalized.trackKey || `exercise-${normalized.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    normalized.setCount = normalized.setCount || getSetCount(normalized.prescription);
    return normalized;
  }

  function sanitizeWorkout(workout) {
    if (!workout || typeof workout !== 'object') return null;
    if (!Array.isArray(workout.exercises)) return null;

    const exercises = workout.exercises.map(normalizeExercise).filter(Boolean);
    if (!exercises.length) return null;

    return {
      ...workout,
      ratings: workout.ratings || {},
      sets: workout.sets || {},
      exercises
    };
  }

  function getExercise(trackKey, config, state, profile = null) {
    const tracks = getTracks(profile);
    const safeTrackKey = isTrackAvailable(trackKey, tracks) ? trackKey : 'core';
    const track = tracks[safeTrackKey] || tracks.core || baseTracks.core;
    const trackState = state?.levels?.[safeTrackKey] || { level: 0, points: 0 };
    const baseLevel = Math.min(trackState.level || 0, track.length - 1);
    const adjustedLevel = Math.max(0, Math.min(baseLevel + (config.levelShift || 0), track.length - 1));
    const baseExercise = track[adjustedLevel];
    const prescription = adaptPrescription(baseExercise.prescription, config);

    return {
      trackKey: safeTrackKey,
      ...baseExercise,
      prescription,
      basePrescription: baseExercise.prescription,
      level: adjustedLevel + 1,
      originalLevel: baseLevel + 1,
      setCount: getSetCount(prescription)
    };
  }

  function buildWorkoutTracks(workout, desiredCount, profile = null) {
    const availableTracks = getTracks(profile);
    const fillByWorkout = {
      Push: ['pushup', 'dip', 'core', 'legs', 'rope'],
      Pull: ['pullup', 'core', 'rope', 'legs', 'pushup'],
      'Legs + Core': ['legs', 'core', 'rope', 'pushup', 'pullup'],
      Skills: ['core', 'lsit', 'crow', 'handstand', 'pullup', 'rope']
    };
    const tracks = [...workout.tracks].filter(trackKey => isTrackAvailable(trackKey, availableTracks));
    const fillers = (fillByWorkout[workout.name] || ['core', 'legs', 'pushup', 'pullup', 'rope'])
      .filter(trackKey => isTrackAvailable(trackKey, availableTracks));

    fillers.forEach(trackKey => {
      if (tracks.length < desiredCount && !tracks.includes(trackKey)) tracks.push(trackKey);
    });

    return tracks.slice(0, desiredCount);
  }

  function getTodayWorkout({ mode = 'normal', state = {}, profile = null } = {}) {
    const rotation = getRotation(profile);
    const workout = rotation[(state.rotationIndex || 0) % rotation.length];
    const config = getEnergyConfig(mode);
    const tracks = buildWorkoutTracks(workout, config.exerciseCount, profile);

    return {
      mode: config.mode,
      workoutName: workout.name,
      energyTitle: config.title,
      energyDescription: config.description,
      exercises: tracks.map(trackKey => getExercise(trackKey, config, state, profile))
    };
  }

  function getExtraSessionMinutes(addOns = {}) {
    return (addOns.warmup ? 2 : 0) + (addOns.stretch ? 2 : 0);
  }

  function applyWorkoutAddOns(workout, addOns = {}) {
    const exercises = [...(workout.exercises || [])];
    if (addOns.warmup) exercises.unshift(clone(workoutAddOns.warmup));
    if (addOns.stretch) exercises.push(clone(workoutAddOns.stretch));
    return {
      ...workout,
      includeWarmup: Boolean(addOns.warmup),
      includeStretch: Boolean(addOns.stretch),
      extraMinutes: getExtraSessionMinutes(addOns),
      exercises
    };
  }

  function sessionTotalLabel(workout) {
    const extra = workout?.extraMinutes || 0;
    if (!extra) return 'Workout only';
    return `+ ${extra} min add-ons`;
  }

  function modeLabel(mode) {
    if (mode === 'great') return 'Great · 4 exercises · Full volume';
    if (mode === 'normal') return 'Normal · 4 exercises · Reduced volume';
    if (mode === 'tired' || mode === 'reduced') return 'Tired · 3 exercises · Reduced volume';
    if (mode === 'exhausted' || mode === 'minimum') return 'Exhausted · 3 easier exercises · Minimum volume';
    return 'Workout';
  }

  function applyRating(levels, trackKey, rating, profile = null) {
    const trackState = levels?.[trackKey];
    const delta = { easy: 2, good: 1, hard: 0, failed: -1 }[rating];
    if (!trackState || delta === undefined) return;

    trackState.points = (trackState.points || 0) + delta;
    const track = getTracks(profile)[trackKey] || baseTracks[trackKey] || [];
    const maxLevel = Math.max(0, track.length - 1);

    if (trackState.points >= 3) {
      trackState.level = Math.min((trackState.level || 0) + 1, maxLevel);
      trackState.points = 0;
    }
    if (trackState.points <= -2) {
      trackState.level = Math.max((trackState.level || 0) - 1, 0);
      trackState.points = 0;
    }
  }

  window.SomthingreatWorkouts = {
    baseTracks,
    energyOptions,
    workoutAddOns,
    createDefaultLevels,
    getTracks,
    getRotation,
    getTodayWorkout,
    getExtraSessionMinutes,
    applyWorkoutAddOns,
    sessionTotalLabel,
    sanitizeWorkout,
    modeLabel,
    applyRating
  };
})();
