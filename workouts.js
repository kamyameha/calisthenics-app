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
      { name: 'Glute bridge', prescription: '3 × 12' },
      { name: 'Reverse lunge', prescription: '3 × 8/side' },
      { name: 'Step-up', prescription: '3 × 8/side' },
      { name: 'Wall sit', prescription: '3 × 30s' },
      { name: 'Calf raise', prescription: '3 × 15' },
      { name: 'Split squat', prescription: '3 × 8/side' },
      { name: 'Lateral lunge', prescription: '3 × 6/side' }
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
    warmups: [
      {
        trackKey: 'warmup',
        name: 'Warm-up',
        prescription: '2 min · 30s each',
        setCount: 4,
        isAddOn: true,
        addOnType: 'warmup',
        setLabels: ['March in place', 'Arm circles', 'Hip circles', 'Bodyweight squats']
      },
      {
        trackKey: 'warmup',
        name: 'Warm-up',
        prescription: '2 min · 30s each',
        setCount: 4,
        isAddOn: true,
        addOnType: 'warmup',
        setLabels: ['Step touch', 'Shoulder rolls', 'Good mornings', 'Ankle bounces']
      }
    ],
    stretches: [
      {
        trackKey: 'stretch',
        name: 'Stretch',
        prescription: '2 min · 30s each',
        setCount: 4,
        isAddOn: true,
        addOnType: 'stretch',
        setLabels: ['Hamstring stretch', 'Quad stretch', 'Chest opener', "Child\'s pose"]
      },
      {
        trackKey: 'stretch',
        name: 'Stretch',
        prescription: '2 min · 30s each',
        setCount: 4,
        isAddOn: true,
        addOnType: 'stretch',
        setLabels: ['Calf stretch', 'Hip flexor stretch', 'Shoulder stretch', 'Forward fold']
      }
    ]
  };

  const exerciseHelp = {
    'Incline push-up': {
      purpose: 'A push-up with your hands higher than your feet, so you train the push-up pattern with less bodyweight.',
      cues: ['Place your hands on a wall, kitchen counter, sturdy table, or stable chair.', 'Step your feet back until your body is in one straight line.', 'Lower your chest toward the surface, then press away.'],
      safety: 'Use a surface that cannot slide or tip. The higher the surface, the easier the rep.'
    },
    'Lower incline push-up': {
      purpose: 'The same incline push-up, but with your hands on a lower surface to make it harder.',
      cues: ['Use a stable chair seat, sofa edge, low table, or step.', 'Keep shoulders, hips, and ankles in one line.', 'Lower slowly and press up without letting your hips drop.'],
      safety: 'If the lower surface makes your form messy, return to a higher surface.'
    },
    'Knee push-up': {
      purpose: 'A floor push-up with knees down so you can practice pressing from the ground.',
      cues: ['Place knees on the floor and hands slightly wider than shoulders.', 'Keep shoulders, hips, and knees aligned.', 'Lower your chest between your hands, then press the floor away.'],
      safety: 'Add padding under your knees if needed.'
    },
    'Full push-up': {
      purpose: 'A full-body pressing movement for chest, shoulders, triceps, and core.',
      cues: ['Start in a high plank with hands under or slightly wider than shoulders.', 'Keep your body straight from head to heels.', 'Lower under control and press up without letting hips sag.'],
      safety: 'Stop the set when your line breaks.'
    },
    'Dead hang + negative pull-up': {
      purpose: 'Builds grip, shoulder control, and the lowering strength needed for pull-ups.',
      cues: ['Hang from a pull-up bar with a firm grip.', 'For the negative, step or jump to the top position with chin near the bar.', 'Lower as slowly as you can while keeping shoulders active.'],
      safety: 'Use a step or chair to reach the top safely. Step down if grip or shoulder control feels unsafe.'
    },
    'Dead hang': {
      purpose: 'Builds grip strength and active shoulder control for pull-ups.',
      cues: ['Hang from the pull-up bar with a firm grip.', 'Keep shoulders active and slightly pulled down.', 'Stay still and breathe steadily until the timer ends.'],
      safety: 'Step down if grip or shoulder control feels unsafe.'
    },
    'Scapular pull-up': {
      purpose: 'Teaches shoulder-blade control for stronger, cleaner pull-ups.',
      cues: ['Hang from a bar with straight arms.', 'Without bending your elbows, pull shoulders down away from ears.', 'Let your body rise slightly, then return to a relaxed hang.'],
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
      cues: ['Start on dip bars or two sturdy supports with arms straight.', 'Keep shoulders down and chest tall.', 'Lower slowly, then use your feet or a step to return to the top.'],
      safety: 'Avoid sinking deep if shoulders feel pinched. Keep the range comfortable.'
    },
    'Dip': {
      purpose: 'Builds strong pushing strength for chest, shoulders, and triceps.',
      cues: ['Use parallel bars or two very stable supports.', 'Start tall with arms straight and shoulders down.', 'Lower under control, then press back to the top.'],
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
      cues: ['Start in a push-up position with hands closer than normal.', 'Keep elbows close to your body as you lower.', 'Move as one straight line from head to heels.'],
      safety: 'Widen hands slightly if wrists feel uncomfortable.'
    },
    'Bodyweight squat': {
      purpose: 'Builds leg strength and basic lower-body control.',
      cues: ['Stand with feet about shoulder-width or slightly wider.', 'Sit hips down and back like you are sitting to a chair.', 'Keep knees tracking in the same direction as toes.'],
      safety: 'Use a smaller range if knees or hips feel irritated.'
    },
    'Reverse lunge': {
      purpose: 'Builds single-leg strength and balance.',
      cues: ['Step back softly.', 'Keep front foot planted.', 'Push through the front leg to stand.'],
      safety: 'Hold a wall or chair if balance is shaky.'
    },
    'Glute bridge': {
      purpose: 'Builds glute and posterior-chain strength without equipment.',
      cues: ['Lie on your back with knees bent and feet flat.', 'Press through your heels to lift hips.', 'Lower with control.'],
      safety: 'Use a smaller lift if your lower back takes over.'
    },
    'Step-up': {
      purpose: 'Builds single-leg strength using a step, stair, or sturdy low surface.',
      cues: ['Place one full foot on the step.', 'Push through that foot to stand tall.', 'Step down slowly.'],
      safety: 'Use a stable surface and keep the height comfortable.'
    },
    'Wall sit': {
      purpose: 'Builds leg endurance with a simple static hold.',
      cues: ['Lean your back on a wall.', 'Slide down only as far as comfortable.', 'Keep feet flat and breathe steadily.'],
      safety: 'Stand up if knees feel sharp pain.'
    },
    'Calf raise': {
      purpose: 'Strengthens calves and ankles with no equipment.',
      cues: ['Stand tall.', 'Rise onto the balls of your feet.', 'Lower slowly with control.'],
      safety: 'Hold a wall if balance is unsteady.'
    },
    'Lateral lunge': {
      purpose: 'Builds side-to-side leg strength and hip control.',
      cues: ['Step to the side and sit hips back.', 'Keep the other leg long.', 'Push back to center with control.'],
      safety: 'Keep the range small if hips or knees feel irritated.'
    },
    'Split squat': {
      purpose: 'Builds single-leg strength with a fixed stance.',
      cues: ['Place one foot forward and one foot back in a long stance.', 'Keep both feet planted and lower straight down.', 'Drive through the front foot to stand.'],
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
      cues: ['Place elbows under shoulders and feet back behind you.', 'Make a straight line from head to heels.', 'Squeeze glutes lightly and breathe without letting hips drop.'],
      safety: 'Stop if your lower back starts to take over.'
    },
    'Hollow hold': {
      purpose: 'Builds core strength for calisthenics body control.',
      cues: ['Lie on your back and press your lower back toward the floor.', 'Lift shoulders and legs only as far as you can keep control.', 'Make it easier by bending knees or keeping arms by your sides.'],
      safety: 'If your lower back lifts, choose an easier shape.'
    },
    'Hanging knee raise': {
      purpose: 'Builds hanging core strength and grip.',
      cues: ['Hang from a bar with shoulders active.', 'Lift knees toward your chest without swinging.', 'Lower slowly until your body is quiet again.'],
      safety: 'Stop if grip or shoulders feel unsafe.'
    },
    'Reverse crunch': {
      purpose: 'Builds lower-ab control without needing a bar.',
      cues: ['Lie on your back with knees bent.', 'Curl hips slightly off the floor using your abs.', 'Lower slowly and keep your neck relaxed.'],
      safety: 'Avoid using momentum.'
    },
    'Crow weight shift': {
      purpose: 'Introduces balance and wrist loading for crow pose.',
      cues: ['Place hands on the floor with fingers spread wide.', 'Rest knees near upper arms and lean forward slowly.', 'Keep toes light, but do not force them to lift.'],
      safety: 'Place a cushion in front of you if you are nervous.'
    },
    'Crow one-foot lift': {
      purpose: 'Builds confidence for balancing in crow pose.',
      cues: ['Set up like crow with knees on upper arms.', 'Lean forward first until weight is in your hands.', 'Lift one foot only when stable, then switch sides.'],
      safety: 'Stay low and use a soft surface.'
    },
    'Crow hold': {
      purpose: 'Practices the full crow balance.',
      cues: ['Place knees high on the upper arms.', 'Grip the floor with fingers and look slightly forward.', 'Lift both feet only when your weight feels balanced.'],
      safety: 'Stop if wrists feel sharp pain.'
    },
    'Tuck sit': {
      purpose: 'Builds compression and support strength for the L-sit.',
      cues: ['Sit on the floor or between sturdy blocks/handles.', 'Press hands down and lift hips if possible.', 'Pull knees toward chest and keep shoulders away from ears.'],
      safety: 'Use blocks or sturdy handles if wrists dislike the floor.'
    },
    'Extended tuck': {
      purpose: 'A harder L-sit step with legs farther from the body.',
      cues: ['Start from a tuck sit support.', 'Extend knees slightly away from your chest.', 'Keep chest proud and only extend as far as you can hold cleanly.'],
      safety: 'Return to tuck if hips drop.'
    },
    'One-leg L-sit': {
      purpose: 'Bridges the gap between tuck sit and full L-sit.',
      cues: ['Start supported on the floor, blocks, or handles.', 'Keep one knee tucked and straighten the other leg.', 'Press the floor away and keep hips lifted as much as possible.'],
      safety: 'Keep holds short and clean.'
    },
    'L-sit': {
      purpose: 'A full support hold for core, hip flexors, and shoulders.',
      cues: ['Support yourself on the floor, blocks, handles, or parallel bars.', 'Press hands down and keep legs straight in front of you.', 'Lift chest and breathe while keeping shoulders down.'],
      safety: 'Stop before wrists or hip flexors cramp.'
    },
    'Wall plank hold': {
      purpose: 'Builds shoulder strength for handstand progressions.',
      cues: ['Start in a plank with feet touching a wall.', 'Place hands under shoulders and walk feet slightly up the wall if comfortable.', 'Push the floor away and keep ribs tucked.'],
      safety: 'Stay far enough from the wall to control the position.'
    },
    'Pike hold': {
      purpose: 'Builds overhead shoulder strength with feet on the floor.',
      cues: ['Start with hands and feet on the floor, hips high like an upside-down V.', 'Keep arms straight and push the floor away.', 'Let your head sit gently between your arms.'],
      safety: 'Keep weight comfortable on wrists.'
    },
    'Wall walk': {
      purpose: 'Builds strength and confidence going upside down.',
      cues: ['Start in a plank with feet at the wall.', 'Walk feet up the wall and hands closer only as far as you control.', 'Come down one hand or foot at a time.'],
      safety: 'Leave enough space to come down safely.'
    },
    'Chest-to-wall handstand': {
      purpose: 'Practices a straighter handstand line with wall support.',
      cues: ['Walk up the wall until your chest faces the wall.', 'Push tall through shoulders and keep ribs tucked.', 'Squeeze legs together and keep the hold calm.'],
      safety: 'Come down before fatigue makes you arch or panic.'
    },
    'Handstand kick-up practice': {
      purpose: 'Builds timing and confidence for entering a handstand.',
      cues: ['Place hands on the floor a short distance from the wall.', 'Kick gently with one leg while the other follows.', 'Use the wall as a soft target, not something to crash into.'],
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
      cues: ['Use a low bar, band, or foot support if needed.', 'Move slowly from high pull position to dip support.', 'Keep elbows close and control the turnover.'],
      safety: 'Avoid forcing shoulder positions.'
    },
    'Muscle-up attempt': {
      purpose: 'A skill attempt for combining pull and transition.',
      cues: ['Start fresh.', 'Pull high.', 'Stop after clean attempts.'],
      safety: 'Do not grind tired reps.'
    },
    'Jump rope': {
      purpose: 'Builds light conditioning and foot rhythm.',
      cues: ['Hold the handles lightly and keep elbows near your sides.', 'Use small relaxed jumps.', 'Turn the rope from your wrists, not big arm circles.'],
      safety: 'Start easy if calves or ankles feel tight.'
    },
    'Prone Y raise': {
      purpose: 'Builds upper-back and shoulder control without a pull-up bar.',
      cues: ['Lie face down on the floor with arms overhead in a Y shape.', 'Point thumbs up and lift arms gently without shrugging.', 'Keep forehead low and neck relaxed.'],
      safety: 'Move slowly and stop if shoulders pinch.'
    },
    'Superman hold': {
      purpose: 'Builds back-body strength for posture and pulling prep.',
      cues: ['Lie face down with arms forward or by your sides.', 'Lift chest and legs gently from the floor.', 'Keep the neck long and avoid throwing the head back.'],
      safety: 'Keep the lift small if lower back feels strained.'
    },
    'Reverse snow angel': {
      purpose: 'Builds shoulder mobility and upper-back control.',
      cues: ['Lie face down with arms overhead or out to the side.', 'Lift hands slightly and sweep arms slowly toward your hips.', 'Keep shoulders away from ears and move without momentum.'],
      safety: 'Use a pain-free range only.'
    },
    'Table row': {
      purpose: 'Builds pulling strength when you do not have a bar.',
      cues: ['Lie under a very stable table and hold the edge with both hands.', 'Keep your body straight and feet on the floor.', 'Pull your chest toward the table edge, then lower slowly.'],
      safety: 'Only use furniture that cannot tip or slide.'
    },
    'Warm-up': {
      purpose: 'Raises temperature and prepares joints before training.',
      cues: ['Do each listed movement for about 30 seconds.', 'Move lightly and breathe steadily.', 'Treat it as preparation, not a test.'],
      safety: 'Keep it easy and pain-free.'
    },
    '2-min full-body stretch': {
      purpose: 'Helps you cool down and leave the session calmly.',
      cues: ['Do each listed stretch for about 30 seconds.', 'Ease into each position and breathe slowly.', 'Do not force range.'],
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
      { name: 'Glute bridge', prescription: '3 × 12' },
      { name: 'Reverse lunge', prescription: '3 × 8/side' },
      { name: 'Step-up', prescription: '3 × 8/side' },
      { name: 'Wall sit', prescription: '3 × 30s' },
      { name: 'Split squat', prescription: '3 × 6/side' },
      { name: 'Calf raise', prescription: '3 × 15' },
      { name: 'Lateral lunge', prescription: '3 × 6/side' }
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

  function splitCompoundExercise(exercise) {
    if (exercise?.name !== 'Dead hang + negative pull-up') return [exercise];

    const deadHangMatch = exercise.prescription.match(/(\d+)\s*×\s*(\d+)s/);
    const negativeMatch = exercise.prescription.match(/\+\s*(\d+)\s*×\s*(\d+)/);
    const deadHangPrescription = deadHangMatch ? `${deadHangMatch[1]} × ${deadHangMatch[2]}s` : '3 × 30s';
    const negativePrescription = negativeMatch ? `${negativeMatch[1]} × ${negativeMatch[2]}` : '3 × 2';

    return [
      {
        ...exercise,
        trackKey: `${exercise.trackKey}-dead-hang`,
        progressionTrackKey: exercise.trackKey,
        name: 'Dead hang',
        prescription: deadHangPrescription,
        basePrescription: deadHangPrescription,
        setCount: getSetCount(deadHangPrescription)
      },
      {
        ...exercise,
        trackKey: `${exercise.trackKey}-negative-pull-up`,
        progressionTrackKey: exercise.trackKey,
        name: 'Negative pull-up',
        prescription: negativePrescription,
        basePrescription: negativePrescription,
        setCount: getSetCount(negativePrescription)
      }
    ];
  }

  function getActiveRecovery(state = {}) {
    const recovery = state?.recovery;
    if (!recovery?.area) return null;
    if (recovery.until && !Number.isNaN(new Date(recovery.until).getTime()) && new Date(recovery.until).getTime() < Date.now()) return null;
    return recovery;
  }

  function recoveryAreaType(recovery) {
    const area = `${recovery?.area || ''}`.toLowerCase();
    if (area.includes('shoulder')) return 'shoulder';
    if (area.includes('knee')) return 'knee';
    if (area.includes('wrist')) return 'wrist';
    if (area.includes('ankle')) return 'ankle';
    return '';
  }

  function recoveryBlocksTrack(trackKey, recovery) {
    if (!recovery) return false;
    const area = recoveryAreaType(recovery);

    if (area === 'shoulder') return ['pullup', 'pushup', 'dip', 'handstand', 'muscleup'].includes(trackKey);
    if (area === 'wrist') return ['pushup', 'handstand', 'crow'].includes(trackKey);
    if (area === 'ankle') return trackKey === 'rope';
    if (area === 'knee') return false;
    return false;
  }

  function applyRecoveryToExercise(exercise, recovery) {
    if (!exercise || !recovery) return exercise;
    const area = recoveryAreaType(recovery);
    if (area === 'ankle' && /jump|rope|hop|plyo/i.test(exercise.name)) return null;
    if (area === 'knee' && /jump|rope|pistol/i.test(exercise.name)) return null;
    return exercise;
  }

  function buildWorkoutTracks(workout, desiredCount, profile = null, state = {}) {
    const availableTracks = getTracks(profile);
    const recovery = getActiveRecovery(state);
    const fillByWorkout = {
      Push: ['pushup', 'dip', 'core', 'legs', 'rope'],
      Pull: ['pullup', 'core', 'rope', 'legs', 'pushup'],
      'Legs + Core': ['legs', 'core', 'rope', 'pushup', 'pullup'],
      Skills: ['core', 'lsit', 'crow', 'handstand', 'pullup', 'rope']
    };
    const tracks = [...workout.tracks].filter(trackKey => isTrackAvailable(trackKey, availableTracks) && !recoveryBlocksTrack(trackKey, recovery));
    const fillers = (fillByWorkout[workout.name] || ['core', 'legs', 'pushup', 'pullup', 'rope'])
      .filter(trackKey => isTrackAvailable(trackKey, availableTracks) && !recoveryBlocksTrack(trackKey, recovery));

    fillers.forEach(trackKey => {
      if (tracks.length < desiredCount && !tracks.includes(trackKey)) tracks.push(trackKey);
    });

    return tracks.slice(0, desiredCount);
  }

  function getTodayWorkout({ mode = 'normal', state = {}, profile = null } = {}) {
    const rotation = getRotation(profile);
    const workout = rotation[(state.rotationIndex || 0) % rotation.length];
    const config = getEnergyConfig(mode);
    const tracks = buildWorkoutTracks(workout, config.exerciseCount, profile, state);
    const recovery = getActiveRecovery(state);

    return {
      mode: config.mode,
      workoutName: workout.name,
      energyTitle: config.title,
      energyDescription: config.description,
      exercises: tracks
        .flatMap(trackKey => splitCompoundExercise(getExercise(trackKey, config, state, profile)))
        .map(exercise => applyRecoveryToExercise(exercise, recovery))
        .filter(Boolean)
    };
  }

  function getExtraSessionMinutes(addOns = {}) {
    return (addOns.warmup ? 2 : 0) + (addOns.stretch ? 2 : 0);
  }

  function applyWorkoutAddOns(workout, addOns = {}) {
    const variantIndex = Math.floor(Date.now() / 86400000) % 2;
    const exercises = [...(workout.exercises || [])];
    if (addOns.warmup) exercises.unshift(clone(workoutAddOns.warmups[variantIndex]));
    if (addOns.stretch) exercises.push(clone(workoutAddOns.stretches[variantIndex]));
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
