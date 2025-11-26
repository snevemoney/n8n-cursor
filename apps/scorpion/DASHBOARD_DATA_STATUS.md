# Scorpion Dashboard Pages - Data Status

This document tracks which dashboard pages fetch and display data properly.

## ✅ Pages That Fetch and Display Data Correctly

1. **Home (`/`)** - ✅ Fetches from `/api/stats` - Shows system stats
2. **Dashboard (`/dashboard`)** - ✅ Fetches from `/api/health` - Shows system health
3. **Project (`/project`)** - ✅ Fetches from `/api/projects` - Shows project status
4. **Workflows (`/workflows`)** - ✅ Fetches from `/api/workflows` - Shows workflow list
5. **Operations (`/ops`)** - ✅ Fetches from `/api/operations` - Shows operations
6. **Knowledge (`/knowledge`)** - ✅ Fetches from `/api/project/knowledge` - Shows knowledge items
7. **Agents (`/agents`)** - ✅ Fetches from `/api/agents` - Shows agent list
8. **Council (`/council`)** - ✅ Fetches from `/api/council` - Shows council members
9. **Ontology (`/ontology`)** - ✅ Fetches from `/api/ontology` - Shows entities
10. **Build (`/build`)** - ✅ Fetches from `/api/build` - Shows knowledge stats
11. **Research (`/research`)** - ✅ Fetches from `/api/research/start` - Shows research results
12. **Logs (`/logs`)** - ✅ Fetches from `/api/logs` - Shows system logs
13. **Settings (`/settings`)** - ✅ Fetches from `/api/settings` - Shows settings
14. **Notifications (`/notifications`)** - ✅ Fetches from `/api/notifications` - Shows notifications

## ⚠️ Pages That May Need Attention

1. **Selling (`/selling`)** - ⚠️ API returns empty products array (by design - needs payment integration)
2. **Observability (`/observability`)** - ⚠️ Uses telemetry stream (may need verification)

## Notes

- All pages should fetch data on mount
- All pages should display loading states
- All pages should handle empty data gracefully
- All pages should show error states if API calls fail

