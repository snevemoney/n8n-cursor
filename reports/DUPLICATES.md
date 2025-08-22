# Duplicate Analysis Report

Generated: 2025-08-22T15:04:00Z

## Potential Duplicates Found

### 1. Workflow Files
- `workflows/ai-saas-master-scaffold.json` vs `workflows/ai-saas-master-scaffold-enhanced.json`
- `workflows/ai-saas-master-scaffold.json` vs `workflows/ai-saas-master-scaffold-import.json`
- `workflows/master-orchestration-system.json` vs `workflows/master-orchestration-system_clean.json`
- `workflows/gpt5-support-agent.json` vs `workflows/gpt5-support-agent_clean.json`
- `workflows/simple_slack_notifier.json` vs `workflows/simple_slack_notifier_clean.json`

### 2. Script Files
- `scripts/ops/n8n-manager.sh` vs `scripts/ops/n8n.sh` (potential overlap)
- `scripts/ops/backup-db.sh` vs `scripts/ops/restore-db.sh` (related but not duplicates)

### 3. Test Files
- `tools/test-comprehensive-n8n.js` vs `tools/test-remote-n8n.js` (different purposes)

## Recommendations

### High Priority
1. **Review workflow duplicates**: Clean versions vs enhanced versions
   - Keep the most recent/complete version
   - Archive or remove older versions
   - Update references in documentation

### Medium Priority
2. **Consolidate similar scripts**:
   - Merge common functionality in n8n-manager.sh and n8n.sh
   - Create shared utility functions

### Low Priority
3. **Organize test files**:
   - Move test files to dedicated test directory
   - Ensure clear naming conventions

## Action Items

- [ ] Run `make wf-dedupe` to identify exact duplicates
- [ ] Review workflow differences and keep best versions
- [ ] Consolidate overlapping script functionality
- [ ] Update documentation to reflect current file structure

## Notes

- Many "clean" versions exist alongside originals
- Some scripts have overlapping functionality
- Test files are scattered across tools directory
- Consider implementing automated duplicate detection
