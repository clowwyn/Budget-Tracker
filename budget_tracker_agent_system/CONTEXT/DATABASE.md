# SQLite Database Design

## Tables

### accounts

```text
id              INTEGER PRIMARY KEY
name            TEXT NOT NULL
type            TEXT NOT NULL
currency        TEXT NOT NULL DEFAULT 'PHP'
initial_balance INTEGER/DECIMAL NOT NULL DEFAULT 0
created_at      DATETIME NOT NULL
updated_at      DATETIME NOT NULL
```

### categories

```text
id              INTEGER PRIMARY KEY
name            TEXT NOT NULL UNIQUE
type            TEXT NOT NULL
created_at      DATETIME NOT NULL
```

### transactions

```text
id              INTEGER PRIMARY KEY
account_id      INTEGER NOT NULL
type            TEXT NOT NULL
amount          INTEGER/DECIMAL NOT NULL
category_id     INTEGER
note            TEXT
transaction_date DATETIME NOT NULL
created_at      DATETIME NOT NULL
updated_at      DATETIME NOT NULL

FOREIGN KEY(account_id) REFERENCES accounts(id)
FOREIGN KEY(category_id) REFERENCES categories(id)
```

## Money representation

Avoid binary floating-point for money.

Prefer the smallest currency unit where practical, e.g.:

```text
₱100.50 → 10050 centavos
```

The exact implementation depends on the selected mobile framework/database library.

## Integrity

- amounts must be greater than zero for transactions;
- transaction type must be from an allowed set;
- foreign keys must be enabled;
- destructive operations require confirmation;
- migrations must be versioned.

## Balance calculation

Do not let individual UI screens invent balance logic.

Use one domain/repository calculation path.

## Backup

A future backup/export feature should operate from the database/repository layer rather than copying arbitrary UI state.
