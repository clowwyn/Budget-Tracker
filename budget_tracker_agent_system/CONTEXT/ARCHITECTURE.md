# System Architecture

## Architectural style

Local-first mobile application.

```text
┌─────────────────────────────────────────────┐
│                 Presentation                │
│ Screens / Components / Navigation           │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│               State / ViewModel              │
│ UI state, validation state, commands         │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│                 Domain Layer                 │
│ Balance rules / transaction rules / models   │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│                Repository Layer              │
│ AccountRepository / TransactionRepository    │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│                    SQLite                    │
│ accounts / transactions / categories        │
└─────────────────────────────────────────────┘
```

## Dependency direction

Presentation → State → Domain → Repository → SQLite

Lower layers must not depend on UI.

## Source of truth

Transactions are the source of truth for account activity.

For a simple account:

```text
current balance
= initial balance
+ income
- expenses
+ incoming transfers
- outgoing transfers
```

Avoid scattered balance mutations.

## Offline behavior

All core operations work locally:
- create
- read
- update
- delete
- calculate
- search/filter

No network is required.

## Future sync

Cloud sync is intentionally deferred.

If introduced later:

```text
                 ┌──────────────┐
                 │ Cloud Backend │
                 └──────▲───────┘
                        │
                  Sync Engine
                        │
┌─────────────┐    ┌────▼─────┐
│ Mobile UI   │ →  │ SQLite   │
└─────────────┘    └──────────┘
```

The local database remains usable during network outages.
