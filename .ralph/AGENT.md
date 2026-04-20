# Agent Commands — Build In Social

## Package Manager
pnpm (not npm, not yarn)

## Install
```bash
pnpm install
```

## Dev Server
```bash
pnpm dev
# Runs on http://localhost:3000
# Set NEXT_PUBLIC_DEV_AUTH=1 in .env.local to bypass Clerk auth during development
```

## Build
```bash
pnpm build
```

## Type Check
```bash
pnpm typecheck
# Must pass with 0 errors before EXIT_SIGNAL
```

## Tests
```bash
pnpm test
# Runs vitest in run mode (CI)
# Must pass with 0 failures before EXIT_SIGNAL
```

## Lint
```bash
pnpm lint
# Must pass with 0 errors before EXIT_SIGNAL
```

## Quality Gate (run all three before EXIT_SIGNAL)
```bash
pnpm typecheck && pnpm test && pnpm lint
```

## Environment
Copy `.env.example` to `.env.local`. Services auto-switch to real implementations
when API keys are present (see lib/services/ and lib/mock/ pattern).
