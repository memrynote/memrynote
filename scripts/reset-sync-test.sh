#!/bin/bash
# Reset sync test environment for fresh testing
# Run this if you encounter signature verification errors after schema migration

echo "Resetting sync test environment..."

# 1. Clear sync server data (D1 + R2)
echo "Clearing sync server data..."
D1_DB="/Users/h4yfans/sideproject/memry/sync-server/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/06ec42019eb9b6b38a677842b15de766ffed3a845562ccbe525afef07098a2a5.sqlite"
if [ -f "$D1_DB" ]; then
  sqlite3 "$D1_DB" "DELETE FROM sync_items;"
  echo "  Cleared sync_items table"
fi

# 2. Clear test device data directories
echo "Clearing test device data..."
rm -rf "$HOME/.memry-test-device-a"
rm -rf "$HOME/.memry-test-device-b"
echo "  Cleared device data directories"

# 3. Clear test device keychain entries (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Clearing keychain entries..."
  # Delete all entries for both test devices
  for service in "memry-device-a" "memry-device-b"; do
    security delete-generic-password -s "$service" -a "master_key" 2>/dev/null
    security delete-generic-password -s "$service" -a "device_id" 2>/dev/null
    security delete-generic-password -s "$service" -a "user_id" 2>/dev/null
    security delete-generic-password -s "$service" -a "access_token" 2>/dev/null
    security delete-generic-password -s "$service" -a "refresh_token" 2>/dev/null
    security delete-generic-password -s "$service" -a "pending_signup" 2>/dev/null
  done
  echo "  Cleared keychain entries"
fi

echo ""
echo "Done! Now restart the sync server and run fresh tests:"
echo "  1. cd sync-server && pnpm dev"
echo "  2. ./scripts/test-device-a.sh"
echo "  3. Sign up with a new account, create some data"
echo "  4. ./scripts/test-device-b.sh"
echo "  5. Sign in with same account, verify data syncs"
