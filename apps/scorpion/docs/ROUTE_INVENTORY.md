# Scorpion Route Inventory

**Generated:** 2025-01-27  
**Purpose:** Comprehensive audit of all routes in Scorpion WebUI

## Route Categories

### 1. Overview Routes
- `/` - Home page
- `/dashboard` - Dashboard (main overview)

### 2. Project & Operations Routes
- `/project` - Project management
- `/ops` - Operations center

### 3. Automation Routes
- `/workflows` - Workflow management
- `/build` - Build system

### 4. Knowledge & Research Routes
- `/knowledge` - Knowledge base
- `/knowledge/recommendations` - Knowledge recommendations
- `/ontology` - Ontology management
- `/research` - Research interface
- `/research/screenshots` - Research screenshots

### 5. AI & Agents Routes
- `/council` - Agent council
- `/agents` - Agents list
- `/agents/specialized` - Specialized agents
- `/agents/[id]` - Individual agent detail (dynamic)
- `/agents/create` - Create new agent (orphaned - outside route group)
- `/chat` - Chat AGI interface
- `/chat/correct` - Mistake learning
- `/llm/experiments` - LLM experiments list
- `/llm/experiments/[id]` - Individual experiment (dynamic)
- `/llm/models` - LLM models (exists but not in navigation)
- `/llm/prompts` - LLM prompts (exists but not in navigation)
- `/llm/compare` - Model comparison

### 6. Monitoring & Business Routes
- `/observability` - Observability dashboard
- `/selling` - Selling interface

### 7. System Routes
- `/notifications` - Notifications center
- `/logs` - System logs
- `/settings` - Settings

### 8. Orphaned Routes (Outside Route Group)
- `/agents/create` - Create agent (no layout)
- `/ai/docs` - Document Chat & RAG (no layout)
- `/ai/local` - Local AI Services (no layout)

### 9. Error & Special Routes
- `/not-found` - 404 page
- `/error` - Error page
- `/healthz` - Health check endpoint

## Navigation Status

### ✅ Routes in Navigation
All routes listed in sections 1-7 (except orphaned routes) are accessible via sidebar navigation.

### ❌ Routes Missing from Navigation
- `/llm/models` - Page exists, not linked in sidebar
- `/llm/prompts` - Page exists, not linked in sidebar
- `/agents/create` - Orphaned route, not accessible via navigation

### ⚠️ Orphaned Routes (No Layout)
- `/agents/create` - Outside `(scorpion)` route group
- `/ai/docs` - Outside `(scorpion)` route group
- `/ai/local` - Outside `(scorpion)` route group

## Dynamic Routes

### Agent Routes
- `/agents/[id]` - Accessible from `/agents` page, shows individual agent details

### LLM Experiment Routes
- `/llm/experiments/[id]` - Accessible from `/llm/experiments` page, shows individual experiment

## Issues Identified

1. **Missing Navigation Links:**
   - `/llm/models` and `/llm/prompts` exist but aren't in sidebar
   - LLM section incomplete in navigation

2. **Orphaned Routes:**
   - `/agents/create`, `/ai/docs`, `/ai/local` are outside `(scorpion)` route group
   - These pages don't use the main layout/sidebar
   - Inconsistent user experience

3. **No Breadcrumbs:**
   - Current layout has no breadcrumb component
   - Users can't see navigation hierarchy
   - Hard to navigate back from deep pages

4. **Navigation Structure:**
   - "AI & Agents" section is large (7 items)
   - LLM routes scattered (experiments, compare, but missing models/prompts)

## Recommendations

1. Add missing routes to navigation (`/llm/models`, `/llm/prompts`)
2. Consolidate orphaned routes into main route group or add proper navigation links
3. Add breadcrumb navigation component
4. Reorganize AI & Agents section for better UX
5. Consider grouping LLM routes together in a sub-menu

