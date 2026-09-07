# Orchestration Workflow

## Phase 0 — Understand

Read:
- `AGENTS.md`
- `CONTEXT/PRODUCT.md`
- `CONTEXT/ARCHITECTURE.md`
- `CONTEXT/DATABASE.md`
- `CONTEXT/UX.md`
- `TASKS.md`

## Phase 1 — Plan

Produce:
- goal
- affected components
- acceptance criteria
- validation commands
- rollback considerations

## Phase 2 — Implement

Delegate only when the task benefits from specialization.

## Phase 3 — Verify

Minimum loop:

```text
lint/typecheck
→ unit tests
→ build
→ relevant integration/UI verification
```

## Phase 4 — QA

QA checks user-visible behavior against acceptance criteria.

## Phase 5 — Review

Reviewer checks:
- architecture
- data integrity
- error handling
- simplicity
- regressions

## Phase 6 — Record

Update:
- `TASKS.md`
- `CONTEXT/DECISIONS.md` if a meaningful architectural decision was made

## Git policy

Prefer one focused commit per completed vertical slice.

Do not commit generated secrets, local databases containing personal data, or environment files with credentials.
