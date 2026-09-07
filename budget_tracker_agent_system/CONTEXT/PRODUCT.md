# Product Context

## Vision

A fast personal budget tracker that lets a user understand where their money is without requiring an internet connection.

## Core entities

### Account

Represents where money is stored or tracked.

Examples:
- BDO
- GCash
- Maya
- Cash
- Credit Card

Fields:
- id
- name
- type
- currency
- created_at
- updated_at

### Transaction

Represents a change or movement of money.

Types:
- income
- expense
- transfer

Fields:
- id
- account_id
- amount
- type
- category_id
- note
- transaction_date
- created_at
- updated_at

Transfers may later use source and destination account relationships.

## V1

- Accounts CRUD
- Transactions CRUD
- Categories
- Dashboard
- Balance calculation
- Offline persistence
- Basic validation

## Explicitly out of scope for V1

- Bank API integrations
- Automatic bank imports
- Cloud synchronization
- Authentication
- Social features
- AI financial advice
- Investment tracking

## Product principle

The user owns the data and should be able to use the app without an account or internet connection.
