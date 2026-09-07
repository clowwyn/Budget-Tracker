# Budget Tracker — System Design

## 1. Overview

A mobile-first, local-first personal finance tracker.

The system is deliberately simple:

```text
Mobile UI
   ↓
Application State
   ↓
Domain Rules
   ↓
Repositories
   ↓
SQLite
```

No server is required for core functionality.

## 2. Functional Components

### Account Management

CRUD for:
- bank accounts
- e-wallets
- cash
- cards

### Transaction Management

CRUD for:
- income
- expenses
- transfers

### Dashboard

Aggregates:
- total assets/balances
- per-account balances
- income
- expenses
- recent activity

### Category Management

Stores reusable categories such as:
- Food
- Transport
- Bills
- Shopping
- Salary
- Other

## 3. Data Flow

### Create expense

```text
User
 ↓
Expense Form
 ↓
ViewModel / Controller
 ↓
Transaction Service
 ↓
Transaction Repository
 ↓
SQLite
 ↓
State refresh
 ↓
Dashboard
```

### Read balance

```text
SQLite
 ↓
Transaction Repository
 ↓
Balance calculation
 ↓
ViewModel
 ↓
Account screen
```

## 4. Data Model

```text
ACCOUNT
  1
  │
  │ has many
  ▼
TRANSACTION
  │
  └──── belongs to ──── CATEGORY
```

For transfers:

```text
SOURCE ACCOUNT
      │
      └──── TRANSFER ────► DESTINATION ACCOUNT
```

Transfers should eventually be represented atomically so money cannot disappear between accounts.

## 5. Offline Design

The app should not depend on:
- network availability
- remote authentication
- API responses
- cloud configuration

Startup:

```text
Launch
 ↓
Open SQLite
 ↓
Run migrations
 ↓
Load local state
 ↓
Render UI
```

## 6. Error Handling

Database errors should become domain/application errors rather than raw SQL errors reaching the UI.

Example:

```text
SQLite constraint error
       ↓
Repository error
       ↓
Application error
       ↓
User-friendly message
```

## 7. Security and Privacy

Because this is personal financial data:
- keep data local by default;
- do not log transaction details;
- do not store secrets in source control;
- validate all database inputs;
- consider OS-level secure storage for future app secrets;
- make backup/export explicit.

## 8. Future Cloud Sync

Not part of v1.

Possible future design:

```text
              ┌──────────────┐
              │ Sync Service │
              └──────┬───────┘
                     │
Mobile UI → SQLite ←→ Sync API → Cloud DB
```

The sync engine should use IDs, timestamps, and conflict rules rather than blindly replacing the local database.

## 9. Testing Strategy

### Unit
- balance calculations
- validation
- transaction rules

### Database
- migrations
- CRUD
- foreign keys
- persistence

### Integration
- repository → SQLite
- service → repository

### UI
- account creation
- transaction entry
- editing/deletion
- dashboard refresh

### Acceptance
- complete user scenarios in `VERIFICATION/ACCEPTANCE_TESTS.md`

## 10. Non-functional Requirements

- Offline-first
- Fast startup
- Deterministic calculations
- Minimal dependencies
- Maintainable architecture
- Safe data handling
- Easy future migration to cloud sync
