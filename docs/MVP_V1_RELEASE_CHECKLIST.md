# Music Tree MVP v1 Release Checklist

## A. Scope freeze

- [ ] MVP v1 scope reviewed.
- [ ] No new features added during release preparation.
- [ ] Known limitations reviewed.
- [ ] Future database and sync work remains deferred to v0.2.

## B. Fresh-state verification

After exporting any existing backup:

- [ ] Use the genuine fresh reset, not the demo reset.
- [ ] Fresh profile shows Stage 1.
- [ ] Fresh profile shows exactly 12 permanent leaves.
- [ ] Health shows 80.
- [ ] Water shows 0/3.
- [ ] Practice records are empty.
- [ ] Homework is empty.
- [ ] Lesson evaluations are empty.
- [ ] Completed pieces are empty.
- [ ] Learning cycles are empty.
- [ ] Root awards are empty.
- [ ] Parent Reward Fruits are empty.
- [ ] Reward reminders are empty.
- [ ] Urlaub periods are empty.
- [ ] LeafGrowthEvents are empty.

## C. Automated verification

Run:

```bash
npm test
npm run lint
npm run build
```
