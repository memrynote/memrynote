#!/bin/bash
# Test Device B - Second device (fresh install)
# This simulates a new device signing in to get synced data

export MEMRY_USER_DATA_DIR="$HOME/.memry-test-device-b"
export MEMRY_KEYCHAIN_SUFFIX="device-b"
export SYNC_SERVER_URL="http://localhost:8787"

echo "Starting Device B..."
echo "  User Data: $MEMRY_USER_DATA_DIR"
echo "  Keychain:  memry-device-b"
echo "  Server:    $SYNC_SERVER_URL"
echo ""

pnpm dev
