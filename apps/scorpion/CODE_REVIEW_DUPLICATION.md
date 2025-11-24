# Code Review: Duplication Detection Template

## Purpose
Use this template when reviewing pull requests to systematically identify and address code duplication.

---

## Review Checklist

### 🔍 Step 1: Scan for obvious copy-paste

#### Visual inspection:
- [ ] Look for similar-looking code blocks
- [ ] Check for repeated error handling patterns
- [ ] Look for identical validation logic
- [ ] Search for duplicated stream formatting

#### Common patterns to watch for:
```typescript
// ⚠️ RED FLAG: Try-catch blocks with identical error handling
try { /* ... */ } catch (error: any) {
  console.error('[Component] Error:', error?.message);
  send({ type: 'error', data: { error: error?.message || 'Unknown' } });
}

// ⚠️ RED FLAG: Repeated null checks
if (!data) throw new Error('Missing data');
if (!data.field) throw new Error('Missing field');

// ⚠️ RED FLAG: Identical stream event emission
send({ type: 'progress', data: { message: 'Processing...' } });

// ⚠️ RED FLAG: Repeated data extraction
const value = obj?.field?.nested?.value ?? defaultValue;
```

---

### 📊 Step 2: Quantify duplication

Run automated detection:
```bash
# In the PR branch
pnpm exec jscpd --min-lines 5 --min-tokens 50 apps/scorpion/path/to/changed/files

# Compare against main branch
git diff main...HEAD --stat
```

**Severity levels:**

| Lines Duplicated | Severity | Action Required |
|-----------------|----------|-----------------|
| 0-10 lines      | 🟢 Low   | Note for future refactoring |
| 11-30 lines     | 🟡 Medium | Request extraction before merge |
| 31+ lines       | 🔴 High  | Block merge until fixed |

---

### 🧠 Step 3: Evaluate abstraction quality

For each duplicated block, ask:

#### Is this duplication or just similarity?

**True duplication** (must extract):
```typescript
// File A
function processUserData(user: User) {
  if (!user) throw new Error('User required');
  if (!user.email) throw new Error('Email required');
  if (!user.name) throw new Error('Name required');
  return normalizeUser(user);
}

// File B
function processAdminData(admin: Admin) {
  if (!admin) throw new Error('Admin required');
  if (!admin.email) throw new Error('Email required');
  if (!admin.name) throw new Error('Name required');
  return normalizeAdmin(admin);
}
```
→ **Extract:** `validateRequiredFields()`

**Similar but not duplicate** (acceptable):
```typescript
// File A - User login
function loginUser(credentials: UserCredentials) {
  const user = await findUser(credentials.email);
  if (!user) throw new UnauthorizedError('User not found');
  return createSession(user);
}

// File B - Admin login
function loginAdmin(credentials: AdminCredentials) {
  const admin = await findAdmin(credentials.token);
  if (!admin) throw new ForbiddenError('Admin not found');
  return createAdminSession(admin);
}
```
→ **Different enough:** Error types differ, lookup methods differ, session creation differs

#### Does the proposed abstraction make sense?

**Good abstraction:**
- ✅ Clear, single responsibility
- ✅ Reusable in 3+ places
- ✅ No hidden coupling
- ✅ Easy to understand at call site

**Bad abstraction (request changes):**
- ❌ Conditional type flags (`if (type === 'pdf')`)
- ❌ Boolean parameters that change behavior drastically
- ❌ Too generic (`handleData()`, `processStuff()`)
- ❌ Creates more coupling than duplication removed

---

### 🚩 Step 4: Identify anti-patterns

#### Anti-pattern 1: Conditional type abstraction

```typescript
// ❌ REJECT: Conditional-based "abstraction"
function printDocument(doc: Document, type: 'pdf' | 'word' | 'excel') {
  if (type === 'pdf') {
    // PDF logic
  } else if (type === 'word') {
    // Word logic
  } else if (type === 'excel') {
    // Excel logic
  }
}
```

**Why reject:**
- Violates Open/Closed Principle
- Will require modification for every new type
- Testing complexity grows exponentially

**Request instead:**
```typescript
// ✅ APPROVE: Composition-based design
interface Printable {
  print(): void;
}

class PdfDocument implements Printable {
  print() { /* PDF-specific */ }
}

class WordDocument implements Printable {
  print() { /* Word-specific */ }
}
```

#### Anti-pattern 2: Boolean flag parameters

```typescript
// ❌ REJECT: Boolean parameters that drastically change behavior
function executeOperation(data: Data, isAdmin: boolean, skipValidation: boolean) {
  if (isAdmin && skipValidation) {
    return fastPath(data);
  } else if (isAdmin) {
    return adminPath(data);
  } else {
    return userPath(data);
  }
}
```

**Why reject:**
- Hard to understand at call site
- Creates hidden complexity
- Difficult to test all combinations

**Request instead:**
```typescript
// ✅ APPROVE: Separate functions with clear names
function executeAdminOperation(data: Data) { /* ... */ }
function executeUserOperation(data: Data) { /* ... */ }
function executeAdminOperationFast(data: Data) { /* ... */ }
```

#### Anti-pattern 3: Over-parameterization

```typescript
// ❌ REJECT: Too many parameters to avoid duplication
function handleRequest(
  data: Data,
  validator: Validator,
  executor: Executor,
  formatter: Formatter,
  errorHandler: ErrorHandler,
  logger: Logger
) {
  // "Generic" logic
}
```

**Why reject:**
- Call sites become unreadable
- False sense of reusability
- Better to accept some duplication

**Request instead:**
```typescript
// ✅ APPROVE: Context objects with sensible defaults
interface RequestContext {
  validator?: Validator;
  executor?: Executor;
  // defaults provided internally
}

function handleRequest(data: Data, context: RequestContext = {}) {
  const validator = context.validator ?? defaultValidator;
  // ...
}
```

---

## Review Comments Template

### For blocking duplication:

```markdown
## 🔴 Blocking: Code Duplication

**Location:** [file:line]

**Issue:**
This logic is duplicated in:
- [file1:line1]
- [file2:line2]
- [file3:line3]

**Impact:**
- Bug fixes will require updating 3+ locations
- Increases risk of missed updates
- Violates DRY principle

**Requested changes:**
Please extract this logic to a helper function in `helpers/[appropriateName].ts`

**Suggested signature:**
```typescript
export function suggestedName(
  param1: Type1,
  param2: Type2
): ReturnType {
  // extracted logic
}
```

**Rationale:**
Duplication makes maintenance harder and increases bug propagation risk. This extraction will make the codebase more maintainable and reduce cognitive load.

**References:**
- [REFACTORING_DUPLICATION.md](./REFACTORING_DUPLICATION.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md#law-2-avoid-code-duplication)
```

### For wrong abstraction:

```markdown
## 🔴 Blocking: Wrong Abstraction

**Location:** [file:line]

**Issue:**
This abstraction uses conditional type flags, which violates the Open/Closed Principle.

**Current code:**
```typescript
function handleDocument(doc: Document, type: 'pdf' | 'word') {
  if (type === 'pdf') { /* ... */ }
  else if (type === 'word') { /* ... */ }
}
```

**Why this is problematic:**
- Adding new document types requires modifying this function
- Testing complexity grows with each type
- Difficult to extend without risking regressions

**Requested changes:**
Please refactor to use composition instead:

```typescript
interface DocumentProcessor {
  process(): void;
}

class PdfProcessor implements DocumentProcessor {
  process() { /* PDF-specific */ }
}

class WordProcessor implements DocumentProcessor {
  process() { /* Word-specific */ }
}
```

**Benefits:**
- New types don't modify existing code
- Each processor can be tested independently
- Clearer separation of concerns

**References:**
- [REFACTORING_DUPLICATION.md](./REFACTORING_DUPLICATION.md#the-right-abstraction-composition-over-inheritance)
```

### For acceptable duplication:

```markdown
## 💬 Non-blocking: Minor duplication noted

**Location:** [file:line]

**Observation:**
Some similarity between this code and [other-file:line], but different enough that extraction may not be worth it.

**Recommendation:**
Keep an eye on this pattern. If a third occurrence appears, consider extracting at that point.

**Note for future refactoring:**
If this logic needs to change, consider consolidating all occurrences at that time.
```

### For good abstraction:

```markdown
## ✅ Well done: Clean abstraction

**Location:** [file:line]

**Positive feedback:**
Great job extracting this duplicated logic to a helper function!

**What works well:**
- Clear, descriptive function name
- Single responsibility
- Reusable without coupling
- Easy to understand at call site

**Additional suggestions:**
- Consider adding JSDoc comment explaining the purpose
- Add unit tests in `tests/helpers/[name].test.ts`
```

---

## Priority Matrix

Use this to prioritize duplication fixes:

| Duplication Type | Occurrences | Priority | Action |
|------------------|-------------|----------|--------|
| Error handling | 10+ | 🔴 Critical | Block merge |
| Validation logic | 10+ | 🔴 Critical | Block merge |
| Stream formatting | 10+ | 🔴 Critical | Block merge |
| Tool execution | 5-9 | 🟡 High | Request fix |
| Data extraction | 5-9 | 🟡 High | Request fix |
| Logging patterns | 3-4 | 🟢 Medium | Note for future |
| Configuration | 2-3 | 🟢 Low | Note for future |
| Single-line utils | 2-3 | ⚪ Acceptable | No action |

---

## Automated Checks

Add these to your PR review workflow:

```yaml
# .github/workflows/code-quality.yml
name: Code Quality Checks

on: [pull_request]

jobs:
  duplication:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for duplication
        run: |
          npx jscpd --min-lines 5 --min-tokens 50 apps/scorpion \
            --reporters json \
            --output ./reports
      - name: Analyze results
        run: |
          # Fail if duplication exceeds threshold
          node scripts/check-duplication-threshold.js
```

---

## Example Reviews

### Example 1: Clear duplication

**Before:**
```typescript
// File: toolHandler1.ts
try {
  const result = await executeTool();
} catch (error: any) {
  console.error('[Handler1] Error:', error?.message);
  send({ type: 'error', data: { error: error?.message || 'Unknown' } });
}

// File: toolHandler2.ts
try {
  const result = await executeTool();
} catch (error: any) {
  console.error('[Handler2] Error:', error?.message);
  send({ type: 'error', data: { error: error?.message || 'Unknown' } });
}
```

**Review comment:**
```markdown
🔴 **Blocking:** Extract error handling to helper

This pattern appears in both `toolHandler1.ts` and `toolHandler2.ts`.

Please extract to `helpers/errorHandler.ts`:

```typescript
export function handleStreamError(
  send: SendFunction,
  error: unknown,
  component: string
): void {
  const normalized = normalizeError(error);
  console.error(`[${component}] Error:`, normalized.message);
  send({ type: 'error', data: { error: normalized.message } });
}
```

Then use it:
```typescript
try {
  const result = await executeTool();
} catch (error) {
  handleStreamError(send, error, 'Handler1');
}
```
```

### Example 2: Similar but not duplicate

**Before:**
```typescript
// User authentication
function authenticateUser(credentials: UserCreds) {
  const user = await findUser(credentials.email);
  if (!user) throw new UnauthorizedError('User not found');
  if (!user.active) throw new ForbiddenError('User inactive');
  return user;
}

// Admin authentication
function authenticateAdmin(credentials: AdminCreds) {
  const admin = await findAdmin(credentials.token);
  if (!admin) throw new UnauthorizedError('Admin not found');
  if (!admin.hasRole('ADMIN')) throw new ForbiddenError('Not admin');
  return admin;
}
```

**Review comment:**
```markdown
💬 **Non-blocking:** Similar patterns but appropriately separate

These authentication functions share some structural similarity but have enough differences that extraction might create more complexity than it solves:

**Differences:**
- Different lookup methods (email vs token)
- Different validation rules (active vs hasRole)
- Different error messages

**Recommendation:**
Keep these separate for now. If a third authentication type emerges, consider extracting shared patterns at that point.
```

### Example 3: Wrong abstraction

**Before:**
```typescript
function processDocument(doc: Document, format: 'pdf' | 'word' | 'excel') {
  if (format === 'pdf') {
    return processPdf(doc);
  } else if (format === 'word') {
    return processWord(doc);
  } else if (format === 'excel') {
    return processExcel(doc);
  }
}
```

**Review comment:**
```markdown
🔴 **Blocking:** Wrong abstraction - please use composition

This conditional type pattern violates the Open/Closed Principle and will require modification for every new format.

**Requested refactor:**

```typescript
// Define interface
interface DocumentProcessor {
  process(doc: Document): ProcessedDocument;
}

// Implement per-type
class PdfProcessor implements DocumentProcessor {
  process(doc: Document) { return processPdf(doc); }
}

class WordProcessor implements DocumentProcessor {
  process(doc: Document) { return processWord(doc); }
}

// Use factory pattern
function getProcessor(format: DocumentFormat): DocumentProcessor {
  const processors = {
    pdf: new PdfProcessor(),
    word: new WordProcessor(),
    excel: new ExcelProcessor(),
  };
  return processors[format];
}
```

**Benefits:**
- New formats don't modify existing code
- Each processor can be tested independently
- Clearer separation of concerns

See [REFACTORING_DUPLICATION.md](./REFACTORING_DUPLICATION.md#the-right-abstraction-composition-over-inheritance)
```

---

## Quick Decision Tree

```
Found duplicate code?
├─ Yes
│  ├─ Is it 10+ lines?
│  │  ├─ Yes → 🔴 Block merge, request extraction
│  │  └─ No → Continue
│  ├─ Appears 3+ times?
│  │  ├─ Yes → 🔴 Block merge, request extraction
│  │  └─ No → Continue
│  ├─ Error handling / validation?
│  │  ├─ Yes → 🔴 Block merge, request extraction
│  │  └─ No → 🟡 Request extraction or note for future
│  └─ Single line utility?
│     ├─ Yes → ⚪ Acceptable
│     └─ No → 🟡 Request extraction
└─ No → ✅ Approve

Found abstraction?
├─ Uses conditional type flags?
│  └─ Yes → 🔴 Block, request composition pattern
├─ Uses boolean parameters?
│  └─ Yes → 🟡 Request separate functions
├─ Over-parameterized (5+ params)?
│  └─ Yes → 🟡 Request context object or simpler design
└─ Clear, single responsibility?
   └─ Yes → ✅ Approve
```

---

## Final Checklist

Before approving PR:
- [ ] No duplicated error handling
- [ ] No duplicated validation patterns
- [ ] No duplicated stream formatting
- [ ] No duplicated tool execution logic
- [ ] No conditional type abstractions
- [ ] No boolean flag parameters
- [ ] All extracted helpers have tests
- [ ] All extracted helpers have clear names
- [ ] File size limits respected (<500 lines)
- [ ] Function size limits respected (<40 lines)

---

## Additional Resources

- [REFACTORING_DUPLICATION.md](./REFACTORING_DUPLICATION.md) - Full duplication guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Readability guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Remember:** Your job as a reviewer is to protect the codebase from duplication before it spreads. Be firm but constructive. Every piece of duplicated code is a future bug waiting to happen.
