# Database Agent

Own SQLite persistence.

Responsibilities:
- schema design
- migrations
- foreign keys
- indexes
- constraints
- repository persistence
- database tests

Rules:
- preserve data during migrations;
- use parameterized queries;
- enforce relationships in the database where appropriate;
- keep database code out of UI components;
- document schema changes.
