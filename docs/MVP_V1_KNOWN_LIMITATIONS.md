# Music Tree MVP v1 Known Limitations

## Release position

Music Tree MVP v1 is a personal, local-first version for Lucy.

It is not yet a multi-user production platform.

These limitations are accepted for MVP v1 and do not represent new release requirements.

## 1. Single-device local storage

All meaningful user data is stored in browser localStorage.

Consequences:

- data does not automatically synchronize between computer and phone;
- another browser or device starts with separate data;
- clearing browser storage removes local data unless a JSON backup exists;
- private/incognito browser modes may not persist reliably.

Mitigation:

- export backups regularly;
- import only into a trusted Music Tree installation;
- cloud sync is planned for a future version.

## 2. Desktop-first verification

The primary verified environment for v1 is a desktop browser.

The application includes responsive safeguards such as:

- one-column phone layouts;
- 44px-class touch targets;
- 16px phone inputs;
- `100dvh`;
- safe-area padding;
- long-text wrapping;
- reduced-motion support.

However, full rendered verification across all iOS and Android devices has not been completed.

Known mobile risks include:

- browser keyboard behavior;
- native confirmation dialogs;
- JSON upload/download differences;
- landscape layout;
- device-specific date controls;
- high-count tree interaction.

## 3. Backup validation

Backup/import supports the application’s own exported JSON.

Nested validation is not yet exhaustive for every persisted domain object.

For MVP v1:

- use only backups exported by Music Tree;
- do not manually edit backup JSON;
- do not import unknown third-party JSON.

A future version should add deep versioned schema validation.

## 4. Storage write failures

Browser storage failures are reported to the user.

In unusual cases such as storage quota failure, an in-memory change may exist temporarily without being persisted.

Users should refresh and verify the last action after a storage error.

## 5. High leaf and fruit counts

Leaf rendering supports deterministic overflow and clustering.

Music Fruit overflow is represented.

At unusually high counts:

- generated leaves and Reward Fruits may require further visual separation;
- Reward Fruit positions beyond early reserved slots require more real-browser verification;
- the exact stored counts remain authoritative even when visual clustering is used.

This is unlikely to affect normal early MVP use.

## 6. Native confirmations

Reward claims and destructive confirmations may use browser-native dialogs.

Their exact appearance differs between browsers.

## 7. No cloud identity or access control

MVP v1 has no:

- login;
- Parent account;
- Teacher account;
- remote authorization;
- cross-device conflict resolution.

The Parent controls access to the device and browser.

## 8. Child data privacy

MVP v1 is intended for private family use.

It should not be treated as a public child profile or public social platform.

Avoid entering unnecessary sensitive information.

## 9. Long-term migration

The application includes deterministic compatibility behavior for current local data, including the initial-leaf baseline.

Future database migration will require a separate, reviewed migration plan.

## 10. Not included in this release

The following are intentionally deferred:

- cloud database;
- desktop/phone sync;
- multi-family support;
- remote Teacher access;
- complete mobile certification;
- extensive accessibility certification;
- app-store packaging.

These limitations are accepted for Music Tree MVP v1 and should be reviewed before planning v0.2.
