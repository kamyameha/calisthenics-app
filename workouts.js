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

  const exerciseHelp = {
    'Incline push-up': {
      purpose: 'A push-up variation that builds pressing strength with less bodyweight.',
      cues: ['Keep your body in one straight line.', 'Lower your chest toward the surface.', 'Keep elbows controlled, not flared wide.'],
      safety: 'Use a stable surface that will not slide.'
    },
    'Lower incline push-up': {
      purpose: 'A harder incline push-up as you move closer to the floor.',
      cues: ['Brace your core before each rep.', 'Move slowly down and press smoothly up.', 'Stop before your lower back drops.'],
      safety: 'Use a stable surface and reduce reps if form breaks.'
    },
    'Knee push-up': {
      purpose: 'A floor push-up variation that builds strength before full push-ups.',
      cues: ['Keep shoulders, hips, and knees aligned.', 'Lower your chest, not your head.', 'Press the floor away.'],
      safety: 'Add padding under your knees if needed.'
    },
    'Full push-up': {
      purpose: 'A full-body pressing movement for chest, shoulders, triceps, and core.',
      cues: ['Keep your body straight.', 'Lower under control.', 'Press up without letting hips sag.'],
      safety: 'Stop the set when your line breaks.'
    },
    'Dead hang + negative pull-up': {
      purpose: 'Builds grip, shoulder control, and the lowering strength needed for pull-ups.',
      cues: ['Start from a calm hang.', 'Lower from the top as slowly as you can.', 'Keep shoulders active, not shrugged into your ears.'],
      safety: 'Step down if grip or shoulder control feels unsafe.'
    },
    'Scapular pull-up': {
      purpose: 'Teaches shoulder-blade control for stronger, cleaner pull-ups.',
      cues: ['Hang with straight arms.', 'Pull shoulders down away from ears.', 'Keep the movement small and controlled.'],
      safety: 'Do not bend the elbows or swing.'
    },
    'Assisted pull-up': {
      purpose: 'Practices the pull-up pattern with help from a band, chair, or foot support.',
      cues: ['Use just enough help to move smoothly.', 'Pull chest toward the bar.', 'Lower with control.'],
      safety: 'Make sure the support is stable before starting.'
    },
    'Band-assisted pull-up': {
      purpose: 'Practices pull-ups with band support so you can build full-range strength.',
      cues: ['Set the band securely.', 'Control the bottom position.', 'Avoid bouncing out of the band.'],
      safety: 'Check the band for wear and keep your face away from the band path.'
    },
    'First pull-up attempt': {
      purpose: 'A skill check to practice pulling with full intent.',
      cues: ['Start from a still hang.', 'Pull hard while keeping your body quiet.', 'Rest between attempts.'],
      safety: 'Stop before form turns into swinging or shoulder discomfort.'
    },
    'Negative dip': {
      purpose: 'Builds dip strength by controlling the lowering phase.',
      cues: ['Start tall with shoulders down.', 'Lower slowly.', 'Keep elbows tracking behind you.'],
      safety: 'Avoid sinking deep if shoulders feel pinched.'
    },
    'Dip': {
      purpose: 'Builds strong pushing strength for chest, shoulders, and triceps.',
      cues: ['Keep shoulders down.', 'Lower under control.', 'Press back to a tall support.'],
      safety: 'Use stable bars and avoid painful shoulder depth.'
    },
    'Chair dip prep': {
      purpose: 'Prepares dip strength with a simple home setup.',
      cues: ['Use a sturdy chair.', 'Keep hips close to the chair.', 'Bend elbows slowly and press back up.'],
      safety: 'Do not use a chair that can slide or tip.'
    },
    'Chair dip': {
      purpose: 'Builds triceps and pushing strength without dip bars.',
      cues: ['Keep hands planted on the chair edge.', 'Lower with control.', 'Use your legs to adjust difficulty.'],
      safety: 'Stop if your shoulders feel pinched.'
    },
    'Close-grip push-up': {
      purpose: 'Builds triceps and dip-support strength on the floor.',
      cues: ['Place hands closer than a normal push-up.', 'Keep elbows close to your body.', 'Move as one straight line.'],
      safety: 'Widen hands slightly if wrists feel uncomfortable.'
    },
    'Bodyweight squat': {
      purpose: 'Builds leg strength and basic lower-body control.',
      cues: ['Stand tall, feet comfortable.', 'Sit hips down and back.', 'Keep knees tracking over toes.'],
      safety: 'Use a smaller range if knees or hips feel irritated.'
    },
    'Reverse lunge': {
      purpose: 'Builds single-leg strength and balance.',
      cues: ['Step back softly.', 'Keep front foot planted.', 'Push through the front leg to stand.'],
      safety: 'Hold a wall or chair if balance is shaky.'
    },
    'Split squat': {
      purpose: 'Builds single-leg strength with a fixed stance.',
      cues: ['Keep feet planted in a long stance.', 'Lower straight down.', 'Drive through the front foot.'],
      safety: 'Use support for balance and keep range comfortable.'
    },
    'Kettlebell deadlift': {
      purpose: 'Builds hip-hinge strength for glutes, hamstrings, and back control.',
      cues: ['Push hips back.', 'Keep the weight close.', 'Stand tall by squeezing glutes.'],
      safety: 'Keep your back neutral and use a light weight first.'
    },
    'Goblet squat': {
      purpose: 'Builds squat strength while holding a weight in front.',
      cues: ['Hold the weight close to your chest.', 'Stay tall through the torso.', 'Press knees gently out.'],
      safety: 'Use a weight you can control without rounding forward.'
    },
    'Plank': {
      purpose: 'Builds core tension for stronger body lines.',
      cues: ['Elbows under shoulders.', 'Squeeze glutes lightly.', 'Breathe without letting hips drop.'],
      safety: 'Stop if your lower back starts to take over.'
    },
    'Hollow hold': {
      purpose: 'Builds core strength for calisthenics body control.',
      cues: ['Press lower back toward the floor.', 'Keep ribs down.', 'Make it easier by bending knees.'],
      safety: 'If your lower back lifts, choose an easier shape.'
    },
    'Hanging knee raise': {
      purpose: 'Builds hanging core strength and grip.',
      cues: ['Start from a quiet hang.', 'Lift knees without swinging.', 'Lower slowly.'],
      safety: 'Stop if grip or shoulders feel unsafe.'
    },
    'Reverse crunch': {
      purpose: 'Builds lower-ab control without needing a bar.',
      cues: ['Curl hips slightly off the floor.', 'Move slowly.', 'Keep neck relaxed.'],
      safety: 'Avoid using momentum.'
    },
    'Crow weight shift': {
      purpose: 'Introduces balance and wrist loading for crow pose.',
      cues: ['Hands spread wide.', 'Lean forward slowly.', 'Keep toes light.'],
      safety: 'Place a cushion in front of you if you are nervous.'
    },
    'Crow one-foot lift': {
      purpose: 'Builds confidence for balancing in crow pose.',
      cues: ['Lean forward first.', 'Lift one foot only when stable.', 'Keep breathing.'],
      safety: 'Stay low and use a soft surface.'
    },
    'Crow hold': {
      purpose: 'Practices the full crow balance.',
      cues: ['Grip the floor with fingers.', 'Look slightly forward.', 'Keep knees high on arms.'],
      safety: 'Stop if wrists feel sharp pain.'
    },
    'Tuck sit': {
      purpose: 'Builds compression and support strength for the L-sit.',
      cues: ['Press hands down.', 'Lift knees toward chest.', 'Keep shoulders away from ears.'],
      safety: 'Use blocks or sturdy handles if wrists dislike the floor.'
    },
    'Extended tuck': {
      purpose: 'A harder L-sit step with legs farther from the body.',
      cues: ['Press down strongly.', 'Extend only as far as you can hold.', 'Keep chest proud.'],
      safety: 'Return to tuck if hips drop.'
    },
    'One-leg L-sit': {
      purpose: 'Bridges the gap between tuck sit and full L-sit.',
      cues: ['Keep one knee tucked.', 'Straighten the other leg with control.', 'Press the floor away.'],
      safety: 'Keep holds short and clean.'
    },
    'L-sit': {
      purpose: 'A full support hold for core, hip flexors, and shoulders.',
      cues: ['Press hands down.', 'Keep legs straight.', 'Lift chest and breathe.'],
      safety: 'Stop before wrists or hip flexors cramp.'
    },
    'Wall plank hold': {
      purpose: 'Builds shoulder strength for handstand progressions.',
      cues: ['Hands under shoulders.', 'Feet on wall.', 'Push the floor away.'],
      safety: 'Stay far enough from the wall to control the position.'
    },
    'Pike hold': {
      purpose: 'Builds overhead shoulder strength with feet on the floor.',
      cues: ['Hips high.', 'Arms straight.', 'Push head gently between arms.'],
      safety: 'Keep weight comfortable on wrists.'
    },
    'Wall walk': {
      purpose: 'Builds strength and confidence going upside down.',
      cues: ['Move one hand or foot at a time.', 'Keep core tight.', 'Only go as high as you can control.'],
      safety: 'Leave enough space to come down safely.'
    },
    'Chest-to-wall handstand': {
      purpose: 'Practices a straighter handstand line with wall support.',
      cues: ['Face the wall.', 'Push tall through shoulders.', 'Squeeze legs together.'],
      safety: 'Come down before fatigue makes you arch or panic.'
    },
    'Handstand kick-up practice': {
      purpose: 'Builds timing and confidence for entering a handstand.',
      cues: ['Kick gently.', 'Use the wall as a target.', 'Rest between attempts.'],
      safety: 'Practice where you have space around you.'
    },
    'Explosive row / pull practice': {
      purpose: 'Builds pulling power for harder pull skills.',
      cues: ['Pull fast with control.', 'Keep shoulders active.', 'Lower smoothly.'],
      safety: 'Use a stable setup and avoid jerky reps.'
    },
    'Negative pull-up': {
      purpose: 'Builds the lowering strength needed for stronger pull-ups.',
      cues: ['Start at the top with control.', 'Lower as slowly as you can.', 'Keep shoulders active.'],
      safety: 'Step down safely before grip fails.'
    },
    'High pull-up practice': {
      purpose: 'Builds the higher pull needed before muscle-up work.',
      cues: ['Pull chest higher than usual.', 'Keep body quiet.', 'Rest fully between reps.'],
      safety: 'Only practice if regular pull-ups feel solid.'
    },
    'Transition drill': {
      purpose: 'Practices the turnover part of a muscle-up.',
      cues: ['Move slowly through the transition.', 'Keep elbows close.', 'Use assistance as needed.'],
      safety: 'Avoid forcing shoulder positions.'
    },
    'Muscle-up attempt': {
      purpose: 'A skill attempt for combining pull and transition.',
      cues: ['Start fresh.', 'Pull high.', 'Stop after clean attempts.'],
      safety: 'Do not grind tired reps.'
    },
    'Jump rope': {
      purpose: 'Builds light conditioning and foot rhythm.',
      cues: ['Stay tall.', 'Use small jumps.', 'Turn the rope from wrists.'],
      safety: 'Start easy if calves or ankles feel tight.'
    },
    'Prone Y raise': {
      purpose: 'Builds upper-back and shoulder control without a pull-up bar.',
      cues: ['Lie face down with arms in a Y shape.', 'Lift arms gently, thumbs up.', 'Keep neck relaxed.'],
      safety: 'Move slowly and stop if shoulders pinch.'
    },
    'Superman hold': {
      purpose: 'Builds back-body strength for posture and pulling prep.',
      cues: ['Lie face down.', 'Lift chest and legs gently.', 'Keep the neck long.'],
      safety: 'Keep the lift small if lower back feels strained.'
    },
    'Reverse snow angel': {
      purpose: 'Builds shoulder mobility and upper-back control.',
      cues: ['Lie face down.', 'Sweep arms slowly by your sides.', 'Keep shoulders away from ears.'],
      safety: 'Use a pain-free range only.'
    },
    'Table row': {
      purpose: 'Builds pulling strength when you do not have a bar.',
      cues: ['Use a very stable table.', 'Keep body straight.', 'Pull chest toward the edge.'],
      safety: 'Only use furniture that cannot tip or slide.'
    },
    '2-min full-body warm-up': {
      purpose: 'Raises temperature and prepares joints before training.',
      cues: ['Move lightly.', 'Breathe steadily.', 'Treat it as preparation, not a test.'],
      safety: 'Keep it easy and pain-free.'
    },
    '2-min full-body stretch': {
      purpose: 'Helps you cool down and leave the session calmly.',
      cues: ['Ease into each position.', 'Breathe slowly.', 'Do not force range.'],
      safety: 'Stretch should feel gentle, not sharp.'
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
        { name: 'Chair dip prep', prescription: '3 × 5' },
        { name: 'Chair dip', prescription: '3 × 8' },
        { name: 'Chair dip', prescription: '3 × 10' },
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

  function getExerciseHelp(name = '') {
    return exerciseHelp[name] || null;
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
    getExerciseHelp,
    modeLabel,
    applyRating
  };
})();
