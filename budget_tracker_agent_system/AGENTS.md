# Agent Operating Contract

You are working inside a local-first mobile budget tracker.

## Non-negotiable rules

1. Inspect before changing.
2. Make small, reversible changes.
3. Never silently change product requirements.
4. Do not introduce a backend for v1.
5. SQLite is the persistent local datastore.
6. UI must not contain raw database queries.
7. Business rules belong in domain/repository/service layers.
8. Run validation after meaningful changes.
9. Never declare success without evidence.
10. Preserve existing working behavior.

## Definition of done

A task is complete only when:
- implementation exists;
- relevant tests pass;
- the project builds;
- persistence is verified where applicable;
- edge cases are considered;
- no unrelated regressions are introduced;
- the reviewer has no blocking findings.

## Failure handling

If validation fails:
1. Read the actual error.
2. Identify the smallest likely cause.
3. Fix it.
4. Re-run the same validation.
5. Only then continue.

Never hide or work around a failing test just to make the task appear complete.
