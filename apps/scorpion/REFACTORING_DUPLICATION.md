# Code Duplication Elimination Guide

## Core Principle: Duplication Is Nearly Always Bad

This guide provides a systematic approach to identifying, evaluating, and eliminating code duplication in the Scorpion codebase.

---

## Why Duplication Is Dangerous

### 1. Small-scale duplication looks harmless — but scales catastrophically

**Example: Two arrays, same logic**

```typescript
// Array A averaging
let sumA = 0;
for (let i = 0; i < 4; i++) {
  sumA += arrayA[i];
}
const avgA = sumA / 4;

// Array B averaging (duplicated)
let sumB = 0;
for (let i = 0; i < 4; i++) {
  sumB += arrayB[i];
}
const avgB = sumB / 4;
```

**Looks fine, right?** Wrong. Here's what happens when this pattern spreads:
- ❌ Logic appears in 15 different files
- ❌ Bug in averaging formula goes unnoticed
- ❌ Need to make arrays dynamic? Update 15 files
- ❌ Miss one update → subtle production bug
- ❌ 6 months later, nobody remembers all the locations

**Impact:**
```
2 duplicates  = 2× maintenance cost
5 duplicates  = 5× bug propagation risk
10 duplicates = 10× refactor complexity
```

### 2. The "Rule of Three" is arbitrary and misleading

**Common advice:** "Don't abstract until the third duplicate appears."

**Reality check:**
- ✗ Two duplicates have the same maintenance cost as three
- ✗ Waiting for a third example rarely adds clarity
- ✗ Delayed abstractions lead to rushed, low-quality designs
- ✗ The number "three" has no engineering justification

**Our standard:**
> If you copy-paste code more than once, extract it immediately.

---

## Real-World Example: Document Classes

### The Problem

```typescript
class PdfDocument {
  title: string;
  author: string;
  createdAt: Date;
  lastModified: Date;

  constructor(title: string, author: string, createdAt: Date, lastModified: Date) {
    this.title = title;
    this.author = author;
    this.createdAt = createdAt;
    this.lastModified = lastModified;
  }

  getTitle() { return this.title; }
  getAuthor() { return this.author; }
  getCreatedAt() { return this.createdAt; }
  getLastModified() { return this.lastModified; }

  setTitle(value: string) { this.title = value; }
  setAuthor(value: string) { this.author = value; }

  // Only this differs
  print() {
    console.log(`Printing PDF: ${this.title}`);
    // PDF-specific printing logic
  }
}

class WordDocument {
  title: string;
  author: string;
  createdAt: Date;
  lastModified: Date;

  constructor(title: string, author: string, createdAt: Date, lastModified: Date) {
    this.title = title;
    this.author = author;
    this.createdAt = createdAt;
    this.lastModified = lastModified;
  }

  getTitle() { return this.title; }
  getAuthor() { return this.author; }
  getCreatedAt() { return this.createdAt; }
  getLastModified() { return this.lastModified; }

  setTitle(value: string) { this.title = value; }
  setAuthor(value: string) { this.author = value; }

  // Only this differs
  print() {
    console.log(`Printing Word Doc: ${this.title}`);
    // Word-specific printing logic
  }
}
```

**Maintenance burden:**
- Need to add a `pageCount` field? Update both classes
- Bug in getter logic? Fix both places
- Change validation rules? Double the work
- Add a third document type? Triple duplication

---

## The Wrong Abstraction (and How to Avoid It)

### Anti-Pattern: Conditional Type Flags

```typescript
// ❌ WRONG: Conditional-based abstraction
class Document {
  type: "pdf" | "word";
  title: string;
  author: string;
  createdAt: Date;
  lastModified: Date;

  print() {
    if (this.type === "pdf") {
      console.log(`Printing PDF: ${this.title}`);
      // PDF-specific logic
    } else if (this.type === "word") {
      console.log(`Printing Word Doc: ${this.title}`);
      // Word-specific logic
    }
    // Add Excel? Modify this function AGAIN
  }
}
```

**Why this is wrong:**
- ❌ Violates Open/Closed Principle
- ❌ Violates Single Responsibility Principle
- ❌ Every new type requires modifying existing code
- ❌ Cannot scale beyond 3-4 types
- ❌ Testing becomes increasingly complex

---

## The Right Abstraction: Composition Over Inheritance

### Step 1: Identify the shared behavior

```typescript
// Shared properties and behavior
class DocumentProperties {
  title: string;
  author: string;
  createdAt: Date;
  lastModified: Date;

  constructor(title: string, author: string, createdAt: Date, lastModified: Date) {
    this.title = title;
    this.author = author;
    this.createdAt = createdAt;
    this.lastModified = lastModified;
  }

  getTitle() { return this.title; }
  getAuthor() { return this.author; }
  getCreatedAt() { return this.createdAt; }
  getLastModified() { return this.lastModified; }

  setTitle(value: string) { this.title = value; }
  setAuthor(value: string) { this.author = value; }

  updateMetadata(updates: Partial<DocumentProperties>) {
    Object.assign(this, updates);
  }
}
```

### Step 2: Compose specialized types

```typescript
// ✅ CORRECT: Composition-based design
class PdfDocument {
  private props: DocumentProperties;

  constructor(props: DocumentProperties) {
    this.props = props;
  }

  print() {
    console.log(`Printing PDF: ${this.props.getTitle()}`);
    // PDF-specific printing logic
  }

  // Delegate to shared properties
  getTitle() { return this.props.getTitle(); }
  getAuthor() { return this.props.getAuthor(); }
  updateMetadata(updates: Partial<DocumentProperties>) {
    this.props.updateMetadata(updates);
  }
}

class WordDocument {
  private props: DocumentProperties;

  constructor(props: DocumentProperties) {
    this.props = props;
  }

  print() {
    console.log(`Printing Word Doc: ${this.props.getTitle()}`);
    // Word-specific printing logic
  }

  // Delegate to shared properties
  getTitle() { return this.props.getTitle(); }
  getAuthor() { return this.props.getAuthor(); }
  updateMetadata(updates: Partial<DocumentProperties>) {
    this.props.updateMetadata(updates);
  }
}
```

**Benefits:**
- ✅ Shared logic lives in one place
- ✅ Specialized behavior stays per-type
- ✅ Adding new document types doesn't modify existing code
- ✅ Easy to test each component independently
- ✅ Clear separation of concerns

---

## Reversing a Wrong Abstraction

### The "Fastest Way Forward Is Back" Approach (Sandi Metz)

When you discover a wrong abstraction, don't try to fix it in place. Instead:

#### Step 1: Re-introduce duplication

```typescript
// Bad abstraction exists
class Document {
  type: "pdf" | "word" | "excel";
  print() {
    if (this.type === "pdf") { /* ... */ }
    else if (this.type === "word") { /* ... */ }
    else if (this.type === "excel") { /* ... */ }
  }
}

// Step 1: Split it back out by type parameter
class PdfDocument { /* inline everything */ }
class WordDocument { /* inline everything */ }
class ExcelDocument { /* inline everything */ }
```

#### Step 2: Identify truly shared behavior

```typescript
// What's actually the same across all three?
// - title, author, dates (metadata)
// - getters/setters for metadata
// - metadata validation

// What's different?
// - print() implementation
// - export() format
// - validation rules
```

#### Step 3: Extract shared logic cleanly

```typescript
// Shared behavior → one place
class DocumentMetadata { /* ... */ }

// Specialized behavior → composition
class PdfDocument {
  private metadata: DocumentMetadata;
  print() { /* PDF-specific */ }
}
```

**Why this works:**
- ✅ Forces you to see the duplication clearly
- ✅ Prevents premature optimization
- ✅ Leads to cleaner abstractions
- ✅ Easier than trying to "fix" the wrong abstraction in place

---

## Systematic Refactoring Process

### Phase 1: Identify duplication

**Automated detection:**
```bash
# Find similar code blocks
pnpm exec jscpd --min-lines 5 --min-tokens 50 apps/scorpion

# Find duplicate function signatures
grep -r "export function" apps/scorpion | sort | uniq -c | sort -rn
```

**Manual review:**
- Look for copy-pasted blocks
- Search for similar error handling patterns
- Check for repeated validation logic
- Scan for identical stream formatting

### Phase 2: Categorize by risk

**High priority (extract immediately):**
- Error handling (appears 95+ times in Scorpion)
- Stream event emission (appears 80+ times)
- Validation patterns (appears 60+ times)
- Tool execution wrappers (appears 40+ times)

**Medium priority (extract when touching the code):**
- Logging patterns
- Result formatting
- Path resolution
- Type guards

**Low priority (acceptable for now):**
- Single-line utilities
- Configuration constants
- Type definitions

### Phase 3: Extract to helpers

**Pattern: Error handling**

```typescript
// Before (duplicated 95 times)
try {
  const result = await operation();
} catch (error: any) {
  console.error('[Component] Error:', error?.message);
  send({ type: 'error', data: { error: error?.message || 'Unknown error' } });
}

// After (single source of truth)
// helpers/errorHandler.ts
export function handleStreamError(
  send: SendFunction,
  error: unknown,
  context: { component: string; metadata?: Record<string, unknown> }
): void {
  const normalized = normalizeError(error);
  logError(context.component, normalized, context.metadata);
  emitErrorEvent(send, normalized);
}

// Usage
try {
  const result = await operation();
} catch (error) {
  handleStreamError(send, error, { component: 'ToolExecutor', metadata: { toolName } });
}
```

### Phase 4: Validate with tests

```typescript
// Always add tests for extracted helpers
describe('handleStreamError', () => {
  it('normalizes error objects', () => { /* ... */ });
  it('logs with correct component name', () => { /* ... */ });
  it('emits SSE error event', () => { /* ... */ });
  it('handles non-Error types', () => { /* ... */ });
});
```

### Phase 5: Replace all occurrences

```bash
# Find all duplicates
grep -r "console.error.*Error:" apps/scorpion

# Replace with helper call
# Use IDE refactoring tools or careful find-replace
```

---

## Decision Framework: When to Extract?

### ✅ Extract immediately if:
- [ ] Code block appears 2+ times
- [ ] Logic is 3+ lines
- [ ] Error handling pattern
- [ ] Validation logic
- [ ] Stream formatting
- [ ] Tool execution wrapper
- [ ] Data transformation

### ⚠️ Consider carefully if:
- [ ] Only appears once (YAGNI principle)
- [ ] Single-line utility
- [ ] Configuration value
- [ ] Type definition

### ❌ Don't extract if:
- [ ] The "shared" logic has subtle differences (not truly shared)
- [ ] Extraction would create more coupling than duplication
- [ ] The duplication is intentional (e.g., test fixtures)

---

## Common Duplication Patterns in Scorpion

### 1. Error Handling (95+ duplicates)

**Extract to:** `helpers/errorHandler.ts`

**Functions:**
- `handleStreamError()` - SSE error emission
- `normalizeError()` - Error type normalization
- `logError()` - Consistent error logging

### 2. Stream Event Emission (80+ duplicates)

**Extract to:** `helpers/streamEmitter.ts`

**Functions:**
- `emitProgress()` - Progress events
- `emitThinking()` - Thinking events
- `emitData()` - Data events
- `emitError()` - Error events

### 3. Validation Patterns (60+ duplicates)

**Extract to:** `helpers/validators.ts`

**Functions:**
- `validateRequest()` - Request structure validation
- `validatePlan()` - Plan structure validation
- `validateToolParams()` - Tool parameter validation

### 4. Tool Execution (40+ duplicates)

**Extract to:** `helpers/toolExecutor.ts`

**Functions:**
- `executeUserTool()` - Unified tool execution
- `extractToolResult()` - Result normalization
- `handleToolError()` - Tool-specific error handling

---

## Measuring Success

### Before refactoring:
```
Total lines: 15,000
Duplicate blocks: 95
Maintenance risk: HIGH
```

### After refactoring:
```
Total lines: 12,000 (-20%)
Duplicate blocks: 10
Maintenance risk: LOW
```

### Key metrics:
- **Code duplication ratio:** Target <5%
- **Helper reuse count:** Each helper used 10+ times
- **Bug fix efficiency:** One fix updates all usages
- **Onboarding time:** New devs understand patterns faster

---

## Final Principles

### 1. Duplication is almost always more costly than refactoring a wrong abstraction

**Duplication spreads bugs like wildfire.**
**Wrong abstractions can be reversed systematically.**

### 2. The danger is not abstraction — it's wrong abstraction

**Good abstraction:** Clear boundaries, single responsibility, easy to understand
**Bad abstraction:** Conditional logic, type flags, hidden coupling

### 3. Test coverage makes refactoring safe

**With tests:** Refactor confidently, catch regressions immediately
**Without tests:** Write tests first, then refactor

### 4. Prefer composition over inheritance

**Composition:** Flexible, testable, easy to change
**Inheritance:** Rigid, coupled, hard to modify

---

## Quick Reference Checklist

Before committing code:
- [ ] No code blocks duplicated 2+ times
- [ ] All error handling uses `handleStreamError()`
- [ ] All stream events use `streamEmitter` helpers
- [ ] All validation uses `validators` helpers
- [ ] Helper functions are <40 lines
- [ ] Helper modules are <500 lines
- [ ] Tests exist for all extracted helpers
- [ ] All duplicates replaced with helper calls

---

## Additional Resources

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Full readability guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [PHASE_4_PLAN.md](./PHASE_4_PLAN.md) - Current refactoring plan
- [Sandi Metz on Duplication](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)

---

**Remember:** Code that is duplicated is code that will betray you. Extract early, extract often, extract correctly.
