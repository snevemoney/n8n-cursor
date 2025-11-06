#!/bin/bash
set -e
cd web
npm install --silent
npm install --silent next-auth @radix-ui/react-dropdown-menu
npm install --silent --save-dev vitest jsdom @testing-library/react
npx next dev 