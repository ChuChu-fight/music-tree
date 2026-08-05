# Music Tree MVP v1 Scope

## Purpose

Music Tree is a small, local-first practice companion for Lucy.

It celebrates real piano practice and teacher-confirmed progress through a growing magical tree.

The product must support real-life motivation rather than replace it.

It must avoid:

- punishment;
- guilt;
- streak pressure;
- competitive rankings;
- artificial payment for every activity.

The primary experience is warm, calm, simple, and child-friendly.

## Primary users

### Parent

The Parent can:

- create, edit, and safely remove homework;
- record up to three practice records per child and local calendar date;
- record minutes, quality, improvement, achievement, and a Parent note;
- see daily Water and current Health;
- see current homework and Stage progress;
- manage Urlaub / Pause periods;
- manually grant a Parent Reward Fruit;
- see Reward Progress and Reward History;
- export and import local backup data.

### Teacher

The Teacher can:

- evaluate all active homework items;
- give each item 1–5 stars;
- select improvement;
- mark each item completed or unfinished;
- carry unfinished homework forward;
- complete piece-type homework;
- create Teacher-confirmed learning evidence.

### Child

The Child can:

- view Lucy’s Music Tree;
- see Water, Health, Parent note, and current missions;
- see permanent leaves;
- see Music Fruits from completed pieces;
- see Parent Reward Fruits;
- tap and claim an available Parent Reward Fruit;
- see the tree progress through Stages 1–5.

## Core practice flow

Parent creates homework
→ Parent records practice
→ daily Water is derived
→ Health is derived
→ when Water is 3 and Health is 100, one permanent daily leaf may be earned
→ Child sees the updated tree.

## Teacher flow

Teacher evaluates homework
→ unfinished homework is carried forward
→ completed piece homework creates a permanent Music Fruit
→ valid evidence may create a Completed Learning Cycle
→ Root and Stage evidence update.

## Reward flow

Every five newly earned permanent leaves may create one Parent reminder.

The reminder does not automatically grant a reward.

Parent manually:

- enters the reward;
- selects Apple, Pear, Berry, or Peach;
- grants the reward.

The Child may claim the fruit.

After claiming:

- the fruit remains in its stable tree position;
- it stops glowing;
- the reward remains visible in history.

## Water rules

Water is calculated per accepted PracticeRecord:

- below 5 minutes: 0;
- missing quality: 0;
- 5–9 minutes: 1;
- 10–19 minutes: 2;
- 20 minutes or more: 3.

Daily Water is capped at 3/3.

A maximum of three PracticeRecords may be created per child and local calendar date.

## Health rules

Fresh Health begins at 80.

On a normal next day:

Health base = round(previous final Health × 0.8)

Health is capped between 0 and 100.

Parent and Teacher contributions follow the implemented approved rules.

Urlaub dates freeze the normal daily Health decay while still allowing positive practice or Teacher contributions.

## Leaf rules

A fresh profile begins with exactly 12 permanent baseline leaves.

A new permanent leaf is earned when:

- daily Water is 3;
- current Health is 100;
- no leaf was already earned for that child/date.

At most one new leaf may be earned per child/date.

Earned leaves are permanent.

Low Health may temporarily hide leaves visually but must never remove earned progress.

## Root rules

Per LessonEvaluation, Root may gain:

- +1 for a Completed Learning Cycle;
- +1 when one or more new pieces are completed;
- +1 for big Teacher improvement.

Maximum Root gain per LessonEvaluation is +3.

Root is permanent and is not an additional Stage requirement.

## Stage rules

Stages progress from Stage 1 through Stage 5.

All six mandatory requirements must be met:

- non-vacation elapsed days;
- distinct valid practice days;
- Completed Learning Cycles;
- qualified Teacher lessons;
- qualified improvements;
- completed pieces.

Use the implemented authoritative target table:

| Requirement | Stage 1→2 | Stage 2→3 | Stage 3→4 | Stage 4→5 |
|---|---:|---:|---:|---:|
| Non-vacation elapsed days | 30 | 36 | 44 | 53 |
| Distinct valid practice days | 18 | 22 | 27 | 33 |
| Completed Learning Cycles | 4 | 5 | 6 | 8 |
| Qualified Teacher Lessons | 3 | 4 | 5 | 6 |
| Qualified Improvements | 2 | 3 | 4 | 5 |
| Completed Pieces | 8 | 10 | 12 | 15 |

A Teacher lesson qualifies only when its arithmetic mean score is strictly greater than 40.

Only clear and big improvements qualify.

If any mandatory requirement is incomplete, displayed progress is capped at 99%.

A Stage unlock is permanent.

## Persistence

MVP v1 uses:

- localStorage key `music-tree:mvp:v1`;
- JSON export;
- JSON import.

The current version is local-first and single-device.

## Included in MVP v1

- three-role workflow;
- Water;
- Health;
- Urlaub;
- permanent leaves;
- Root;
- Stage 1–5;
- Music Fruits;
- Parent Reward Fruits;
- Parent reminders;
- local backup and restore;
- GitHub Pages deployment;
- desktop-first browser use;
- basic responsive phone support.

## Explicitly out of scope for MVP v1

- user login;
- cloud database;
- automatic desktop/mobile synchronization;
- multiple families;
- public child profiles;
- separate remote Teacher account;
- real-time collaboration;
- social features;
- leaderboards;
- payments;
- AI music teaching;
- server backend;
- app-store native application;
- complete physical-device compatibility certification.

## Planned future direction

MVP v0.2 may add:

- Parent account;
- cloud database;
- desktop and phone synchronization;
- local-first offline support;
- conflict handling;
- improved mobile verification;
- stronger backup validation.

Future cloud work should preserve the repository/domain separation so that domain rules do not need to be rewritten.

Status: MVP v1 scope frozen for release.
