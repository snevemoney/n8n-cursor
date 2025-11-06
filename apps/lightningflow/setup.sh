#!/bin/bash
set -euo pipefail

# Install and test the web package
pushd web >/dev/null
npm install --legacy-peer-deps
npm test
popd >/dev/null

# Install and test the lightning-ui package
pushd lightning-ui >/dev/null
npm install --legacy-peer-deps
npm test
popd >/dev/null

echo 'Environment setup complete.'
