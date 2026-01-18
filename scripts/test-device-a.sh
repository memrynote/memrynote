#!/bin/bash
# Test Device A - First device with existing vault data
# This simulates a user with existing files who signs in

export MEMRY_USER_DATA_DIR="$HOME/.memry-test-device-a"
export MEMRY_KEYCHAIN_SUFFIX="device-a"
export SYNC_SERVER_URL="http://localhost:8787"

echo "Starting Device A..."
echo "  User Data: $MEMRY_USER_DATA_DIR"
echo "  Keychain:  memry-device-a"
echo "  Server:    $SYNC_SERVER_URL"
echo ""

pnpm dev
