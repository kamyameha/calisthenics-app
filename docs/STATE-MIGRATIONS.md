# State Migration Process

Somthingreat saves workout state with `schemaVersion`.

Current version: `1`

When saved state changes shape:

1. Increase `STATE_SCHEMA_VERSION` in `state.js`.
2. Add the migration inside `migrateState()` in `state.js`.
3. Keep migration tolerant of missing or invalid old fields.
4. Add or update a unit test in `tests/unit/workouts-state.test.js`.
5. Bump the release version in `index.html` and `service-worker.js`.

Rule of thumb: old profile data should be repaired or reset gracefully, never allowed to break rendering.
