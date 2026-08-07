# SENTINEL QA matrix (Phase 9)

**Product:** SENTINEL  
**Repo:** `shield-buddies`  
**Lane:** `product_candidate` (`packages/shared-config/src/repo-registry.ts`)  
**Anti-overlap:** ≠ Clearfield Evidence Flow; Clearfield may feed SENTINEL only.

Sign-off required before Phase 10 own-domain cutover.

## Environment under test

| Field | Value |
|-------|-------|
| Build / commit | |
| Device(s) | mid/low Android required |
| Network | online + offline |
| Locale | FR / EN as applicable |
| Tester | |
| Date | |

## Matrix

### PWA / installability

- [ ] Manifest valid (name, icons, `display`, `start_url`)
- [ ] Installable on Android Chrome
- [ ] Icons render at store/home sizes
- [ ] Update / cache strategy documented (no surprise wipe of local vault)

### Offline core

- [ ] App shell loads offline after first visit
- [ ] Core navigation works offline
- [ ] Offline write queue or clear offline UX (no silent data loss)
- [ ] Reconnect sync behavior documented

### Supplies

- [ ] List / add / edit supply items
- [ ] Offline supplies read works
- [ ] Units / quantities sane for Quebec emergency context

### Check-ins

- [ ] Create check-in
- [ ] History visible
- [ ] Offline create does not crash

### Vault

- [ ] Sensitive items stored locally as designed
- [ ] No accidental upload to hive (CE/n8n/Scorpion)
- [ ] Lock / unlock path works

### Critical alert / emergency

- [ ] Critical alert UX reachable
- [ ] Disclaimer visible before destructive/emergency actions
- [ ] No dependency on OpenClaw / CE for core emergency path

### Performance (mid/low Android)

- [ ] Cold start acceptable on mid/low device
- [ ] No sustained jank on core lists
- [ ] Memory pressure: app recovers without blank screen

### Copy / privacy

- [ ] FR copy pass (if required)
- [ ] EN copy pass (if required)
- [ ] Privacy + emergency disclaimer draft approved

### Security / coupling

- [ ] No machine tokens or hive secrets in client bundle
- [ ] Clearfield feed hook is optional stub only (Phase 12)
- [ ] Anti-overlap README header present (`docs/patches/github-hygiene/headers/shield-buddies.md`)

## Sign-off

| Role | Name | Pass? | Date |
|------|------|-------|------|
| QA | | | |
| Operator | | | |

**Gate:** Phase 10 launch blocked until Pass = yes for both rows.
