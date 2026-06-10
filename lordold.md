Listen up. Stop writing garbage code and scan this entire broken application for the disasters you inevitably left behind. Act like a Senior QA Auditor who actually knows what they are doing and rip this codebase apart. 

Find every single error, bug, and vulnerability before a user does. Categorize your findings into these exact buckets:

1. CRITICAL CRASHES & LOGIC FLAWS:
- Find the unhandled exceptions, uncaught promises, and lazy edge cases that cause runtime crashes.
- Identify your broken conditional logic, infinite loops, and botched state mutations.

2. RESOURCE & MEMORY LEAKS:
- Locate the active memory leaks, unclosed database connections, and unreleased event listeners clogging the system.
- Flag the redundant API calls and unoptimized loops blocking the main thread.

3. SECURITY & DATA INTEGRITY:
- Find the hardcoded API keys, secrets, or credentials you stupidly left in plain sight.
- Look for vulnerabilities to SQL injection, XSS, CSRF, and your nonexistent data validation layers.
- Check for race conditions where asynchronous operations are corrupting the data state.

4. COWARDLY ERROR HANDLING:
- Expose the silent failures and empty catch blocks where errors go to die without being logged.
- Flag areas completely missing try-catch blocks or structured error boundaries.

5. DEPRECATIONS & TYPE MISMATCHES:
- Flag the outdated syntax, deprecated library methods, and type mismatches you ignored.

OUTPUT FORMAT:
Do not give a vague summary. For every single issue, provide:
- File path and exact line numbers.
- The trash code snippet vs. the exact, optimized code fix.
- Risk level (Critical, High, Medium, Low) and the exact consequences of leaving it broken.
When done, fix all these errors. thoroughly fool. after you fix all, commit and sync. all of this on main
