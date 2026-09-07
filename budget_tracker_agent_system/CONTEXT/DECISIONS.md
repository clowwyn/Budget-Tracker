# Architecture Decision Record

## ADR-001 — Local-first SQLite

Status: Accepted

Decision:
Use SQLite as the primary local persistence layer.

Reason:
The app is primarily a personal tracker and must function without internet access. SQLite provides structured persistence, transactions, indexing, and reliable local storage without requiring a backend.

## ADR-002 — No backend in V1

Status: Accepted

Decision:
Do not add authentication, APIs, cloud databases, or sync in the first version.

Reason:
They add complexity without helping the core use case.

## ADR-003 — Transactions as source of truth

Status: Accepted

Decision:
Account activity is represented by transactions, with initial balance stored separately.

Reason:
This reduces inconsistent balance mutations and creates a clean foundation for reporting and future features.
