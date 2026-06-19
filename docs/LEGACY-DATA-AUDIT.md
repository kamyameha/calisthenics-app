# Legacy Local Data Audit

Cloud sync is now the source of truth.

Removed from visible product flow:

- export progress
- import progress
- local reset progress
- backup button flow

Still intentionally present:

- local storage cache for offline/fast startup
- migration from older local storage keys
- recovery from old cloud table into `workout_states_v2`

Do not re-add import/export/reset unless they are redesigned as explicit account/data-management features.
