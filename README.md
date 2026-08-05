# React + TypeScript + Vite

## MVP browser persistence

Music Tree stores its current MVP data in browser `localStorage` under the versioned key `music-tree:mvp:v1`. All reads and writes go through `src/data/localRepository.ts`; React components do not access browser storage directly.

This storage is local to the current browser and browser profile. It does not synchronize across devices. Clearing browser storage deletes saved Music Tree data. The repository includes a development reset method, and Firebase/Firestore is intended to replace this browser-only persistence in a later phase.

JSON backup export and restore also run entirely in the browser. Backups are not uploaded by the application; users must keep exported files somewhere safe if they want a recoverable copy.

If the saved value is corrupt or fails validation, the repository keeps a best-effort backup under an `:invalid:` key, restores safe demo defaults, logs a development warning, and exposes a Parent-facing warning instead of crashing the application.

## Static publication

`npm run build` creates the static site in `dist`. Vite uses relative asset paths, so the same build works at a GitHub Pages repository subpath without embedding a repository name. The included Pages workflow builds and uploads `dist`; it does not deploy from local development and requires GitHub Pages to use GitHub Actions as its source.

The checked-in Lucy profile and learning records are fictional demonstration data, not a real child's record. Before using this MVP with a real child, remember that browser storage is not encrypted, is not synchronized, and is deleted when that browser's site data is cleared.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# Development reset and Stage entry dates

Legacy demo saves that do not contain a reliable Stage-entry snapshot use the earliest accepted practice date as the current Stage entry date. If no accepted practice exists, the current calendar date is used. During development, use the existing demo-data reset when a deliberately clean Stage window is required; the storage key remains `music-tree:mvp:v1`.
