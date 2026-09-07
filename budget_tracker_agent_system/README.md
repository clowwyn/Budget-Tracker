# Budget Tracker — Agent Engineering System

A local-first personal budget tracker designed as a small but serious software-engineering project for autonomous coding agents.

## Product

The app manages:
- Bank accounts
- E-wallets
- Cash
- Debit/credit cards
- Income
- Expenses
- Transfers
- Categories

Primary requirement: the app must work fully offline using SQLite.

## Agent Architecture

The project is organized around a **Main Orchestrator** plus focused subagents:

```text
Main Orchestrator
├── Planner
├── Builder
├── Database Agent
├── UI Agent
├── QA Agent
└── Reviewer
```

The orchestrator owns the feature queue, delegates work, collects results, runs verification, and decides whether a feature is complete.

## Engineering Loop

```text
Understand
  ↓
Plan
  ↓
Delegate
  ↓
Implement
  ↓
Build / Test
  ↓
Observe
  ↓
Fix
  ↓
Review
  ↓
Verify
  ↓
Commit
```

The goal is not maximum autonomy. The goal is **reliable autonomy with objective feedback**.

## Suggested first implementation

1. Create the mobile project.
2. Add SQLite persistence.
3. Implement accounts CRUD.
4. Implement transactions CRUD.
5. Derive balances from transactions.
6. Build dashboard.
7. Add categories.
8. Add transfers.
9. Add backup/export.
10. Add tests and polish.

Do not build cloud sync in v1.
