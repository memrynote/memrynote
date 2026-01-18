#!/bin/bash
# Clear test device data for fresh testing
# WARNING: This will delete all test data

echo "Clearing test device data..."

# Clear user data directories
rm -rf "$HOME/.memry-test-device-a"
rm -rf "$HOME/.memry-test-device-b"

# Clear keychain entries (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Clearing keychain entries..."
  security delete-generic-password -s "memry-device-a" 2>/dev/null || true
  security delete-generic-password -s "memry-device-b" 2>/dev/null || true
  # Note: keytar stores multiple entries, this clears the service
fi

echo "Done! Test devices cleared."
