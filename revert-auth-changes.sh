#!/bin/bash

# Revert Authentication Changes Script
# This script reverts the authentication changes back to the original state

echo "Reverting authentication changes..."

# Restore original auth-utils.ts
if [ -f "lib/auth-utils.backup.ts" ]; then
    cp lib/auth-utils.backup.ts lib/auth-utils.ts
    echo "✓ Restored lib/auth-utils.ts"
else
    echo "✗ Backup file lib/auth-utils.backup.ts not found"
fi

# Restore original transactions route
if [ -f "app/api/transactions/route.backup.ts" ]; then
    cp app/api/transactions/route.backup.ts app/api/transactions/route.ts
    echo "✓ Restored app/api/transactions/route.ts"
else
    echo "✗ Backup file app/api/transactions/route.backup.ts not found"
fi

# Remove backup files
rm -f lib/auth-utils.backup.ts
rm -f app/api/transactions/route.backup.ts

echo "Authentication changes reverted successfully!"
echo "You may need to restart your development server."
