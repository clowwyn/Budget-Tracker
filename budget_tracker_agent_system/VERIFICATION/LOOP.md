# Verification Loop

Use this after every meaningful implementation step.

```text
CHANGE
  ↓
FORMAT / LINT
  ↓
TYPECHECK
  ↓
UNIT TESTS
  ↓
BUILD
  ↓
RUN / UI CHECK
  ↓
QA SCENARIOS
  ↓
REVIEW
  ↓
PASS → COMMIT
  │
  └── FAIL → FIX → LOOP
```

## Evidence rule

Every completed task should record enough evidence to answer:

- What changed?
- What command/check was run?
- Did it pass?
- What user behavior was verified?
- Were there known limitations?

## Anti-patterns

Do not:
- skip tests because the change is "small";
- rely only on compilation;
- suppress errors;
- rewrite large sections to fix a local bug;
- mark tasks complete based on intent rather than observed behavior.
