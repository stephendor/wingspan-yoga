# Task Completion: Auth Test Refactor & Noise Reduction

## ✅ Status: COMPLETED

### 🎯 Scope

Refactor and enhance authentication-related test suite for login, register, and logout routes to:

- Consolidate Prisma mocking via a shared utility.
- Introduce a DRY dynamic import helper for route POST handlers.
- Reduce console noise (Prisma warnings, expected error logs) while preserving meaningful failures.

### 🔧 Key Changes Implemented

1. Shared Prisma Mock
   - Added/standardized `prismaMock` & `resetPrismaMock` usage across `login`, `register`, `logout` tests.
   - Eliminated ad-hoc monkey-patching and inline Jest prisma factories.

2. Dynamic Route Import Helper
   - Created `tests/utils/importPost.ts` to safely import `POST` handlers after mocks are registered.
   - Replaced repetitive inline `await import()` patterns with a reusable helper.

3. Test Refactors
   - `tests/auth/login.test.ts`: Migrated to `importPost` helper; removed inline dynamic import duplication; tightened JWT mock typing; added scoped console error suppression for the missing secret test.
   - `tests/auth/register.test.ts`: Rewritten to use shared prisma mock and helper instead of overwriting the real client instance.
   - `tests/auth/logout.test.ts`: Switched to shared prisma mock; added targeted suppression for expected warning/error scenarios.

4. Warning / Noise Suppression
   - Enhanced global warning filter in `jest.setup.js` to ignore `prisma:warn` lines (case-insensitive).
   - Scoped suppression (jest spies) only where an expected error/warn is intentionally triggered.

### 🧪 Quality & Verification

- Full test suite: **37 tests passing**.
- Codacy (ESLint, Semgrep, Trivy) clean for modified test files.
- Removed all implicit `any` in new/edited code (except intentionally broad typed generic utility default).
- Maintained explicit assertions for response status & payloads; no logic coverage regressions.

### 📁 Files Added / Updated

- Added: `tests/utils/importPost.ts` (dynamic POST import helper)
- Updated: `tests/auth/login.test.ts`, `tests/auth/register.test.ts`, `tests/auth/logout.test.ts`, `jest.setup.js`

### ✨ Benefits

- Consistency: Unified mocking strategy lowers cognitive load.
- Maintainability: Single helper for POST imports; easier future route test additions.
- Signal-to-Noise: Cleaner test output; failures are more visible.
- Type Safety: Replaced loose any usage with structured types & casts.

### 🧩 Potential Follow-ups (Deferred)

- Introduce a `buildJsonRequest` helper for repeated NextRequest construction patterns.
- Add coverage for session persistence edge cases (e.g., multiple active sessions cleanup semantics).
- Evaluate moving console suppression into a focused util if pattern expands.

---
**Result:** Refactor objectives fully achieved; suite is cleaner, DRY, and stable.
