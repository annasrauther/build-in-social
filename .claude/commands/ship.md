Pre-ship checklist. Run this before marking any task done or opening a PR.

## Step 1 — Quality gates
Run all three in sequence. Stop and fix any failures before continuing.

```
npm run lint && npm run typecheck && npm test
```

Report the output of each command. If any fails, fix it before proceeding.

## Step 2 — Visual check
Start the dev server (`npm run dev`) and take a screenshot of:
1. The landing page (`/`)
2. The dashboard (`/dashboard`)
3. The most relevant page for the change you made

Report any visual regressions, broken layouts, or missing data.

## Step 3 — Security spot check
For any API routes or server actions touched:
- Confirm auth check (`auth()` from Clerk) is present
- Confirm no `MOCK_USER_ID_EXPORT` in production code paths
- Confirm user input is validated before use

## Step 4 — Sign off
Only say "ready to ship" if:
- [ ] lint passes
- [ ] typecheck passes
- [ ] all tests pass
- [ ] screenshots look correct
- [ ] security spot check is clean

If anything is yellow or red, fix it first.
