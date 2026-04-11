Debug mode. An error has occurred. Follow this process exactly:

1. **Read the error** — paste the full error message and stack trace. Do not guess.
2. **Trace to source** — find the exact file and line where the error originates. Use Grep and Read tools. Do NOT read files you don't need.
3. **Identify root cause** — explain in one sentence what is wrong and why.
4. **Propose minimal fix** — the smallest change that resolves the issue. Do NOT refactor surrounding code, add error handling for unrelated cases, or "improve" anything while you're here.
5. **Verify** — after applying the fix, run `npm run typecheck` and `npm test` to confirm nothing else broke.

Rules:
- Never leave broken code. If the fix creates a new problem, fix that too before stopping.
- If the root cause is unclear after reading 3 files, say so and ask the user for more context.
- Do not add logging or debug statements that you won't remove.
