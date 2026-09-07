# Acceptance Tests

## Account persistence

1. Create GCash with ₱5,000.
2. Save.
3. Close the application.
4. Reopen it.
5. GCash must still exist with the same initial balance.

## Expense calculation

1. Create GCash with ₱5,000.
2. Add ₱500 food expense.
3. Balance must be ₱4,500.
4. Edit expense to ₱700.
5. Balance must be ₱4,300.
6. Delete expense.
7. Balance must return to ₱5,000.

## Income calculation

1. Start with ₱5,000.
2. Add ₱2,000 income.
3. Balance must become ₱7,000.

## Multiple accounts

1. Create BDO ₱25,000.
2. Create GCash ₱8,500.
3. Create Cash ₱9,000.
4. Dashboard total must equal ₱42,500 before transactions.

## Validation

Reject:
- missing account name;
- missing transaction amount;
- zero amount;
- negative amount;
- invalid transaction type.

## Delete safety

Deleting an account must not silently destroy unrelated data.

If account deletion also deletes transactions, the behavior must be explicit, intentional, tested, and confirmed by the user.

## Offline

All tests above must work with network disabled.
