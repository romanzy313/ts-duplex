# Getting started

clone the repo and detach from 
```bash
git clone https://github.com/romanzy-1612/modern-ts-lib-starter.git PROJECTNAME
cd PROJECTNAME
rm -rf ./.git
```

customize this template
```bash
node init-template.js
```

install dependencies and run tests
```bash
pnpm install
pnpm test
```

# Whats included

- Vite/tsc bundling
- Vitest unit testing
- Playwright e2e testing
- Minimal eslint and prettier configuration
- Easy templating for customized npm publishable repo
- Working ? github actions for testing

# Create another example

Create new vite project and install your library

```bash
pnpm create vite example2
cd example2
pnpm install ts-duplex
```

Use your library as folloing:


```typescript
import { DummyClass } from 'ts-duplex/src';
console.log(DummyClass);
```

# TODOS

[] Cache playwright deps (https://playwrightsolutions.com/playwright-github-action-to-cache-the-browser-binaries/)

_delete above here to start writing your README_

# ts-duplex

description

# Features

# Installation

npm
```bash
npm install ts-duplex
```

yarn
```bash
yarn add ts-duplex
```

pnpm
```bash
pnpm install ts-duplex
```

# Usage

# Examples

See more examples [here](example)
