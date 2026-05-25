# Project Rules — Resume Tracker

> These rules must be reviewed **before any code work begins**. Task level determines whether a formal plan is required before coding.

---

## ⚠️ CRITICAL — API Data Binding Rule

**Never assume field names when binding API data.**

When writing any mapper, type, RTK Query endpoint, or component that reads from an API payload or response — if **any field is missing, ambiguous, or unclear**, **STOP immediately** and ask the owner which field maps to which before writing a single line of binding code.

- Do not guess field names from the response shape.
- Do not assume a field exists because a similar one does.
- Do not infer a mapping from the UI label alone.
- If the API payload/response sample is incomplete, ask for the full sample first.

> This rule applies to every API integration — new features, updates to existing ones, and mock data.

---

## 0. Chat Mode vs Code Mode

**When the owner says "no code only chat"** — switch to discussion mode immediately:
- No file edits, no code generation, no implementation of any kind.
- Only discuss, analyse, suggest, and answer questions.
- This mode continues until the owner explicitly says **"ok start code"** or equivalent.

**When the owner says "ok start code"** — resume normal workflow:
- Follow the task level rules (Level 1 / 2 / 3) from Section 1.
- Apply the approved plan from the discussion.

> Default is code mode unless told otherwise. One signal switches the mode — no need to repeat it every message.

---

## 1. Workflow Rules

### Task Levels

**Level 1 — Quick Tasks** _(no formal plan required)_
For small, isolated changes: UI tweaks, copy changes, minor bug fixes.
- AI may proceed directly after stating what it will do.
- No written plan document required.
- Examples: changing a label, fixing a typo, adjusting padding via a class.

**Level 2 — Standard Tasks** _(light plan required)_
For feature modifications or changes spanning multiple files.
- AI must produce a short bullet-point implementation plan.
- Plan requires approval before any coding begins.
- Examples: adding a form field, extending an existing component, updating API mappings.

**Level 3 — Architectural Tasks** _(full plan required)_
For new features, structural changes, or any state/API changes.
- AI must produce a detailed plan including:
  - Files to be created or modified
  - Data flow description
  - State impact (Redux slices, RTK Query cache)
- Plan requires explicit approval before any coding begins.
- Examples: new feature module, new shared component, routing changes, new Redux slice.

### General Rules
- **No Unapproved Changes:** If a better approach is identified during work, present the suggestion — do not apply it without approval. If the owner approves, apply it and verify existing functionality is not broken.
- **Ask Before Updating:** If updating existing code, state what is being changed and why before doing it.
- **Scope Lock:** Only touch what was explicitly approved. No refactoring, cleanup, or "improvements" outside the agreed scope.
- **Verify After Change:** After every code change, confirm that no existing functionality is broken.

---

## 2. Folder & Module Structure

### Root `src/` Layout

```
src/
├── app/                  # Application core (bootstrap, routing, layout, guards, providers)
│   ├── main.tsx
│   ├── store/            # Redux store configuration
│   ├── provider/         # Providers wrapper (Redux, Router, i18n, Toast, Confirm)
│   ├── routes/           # Route definitions with auth guards
│   ├── layout/           # AppShell, Header, Breadcrumbs, MegaMenu
│   ├── middleware/        # App-level middleware (error, toast, init)
│   ├── guards/           # Route guards (RequireAuth, RequirePermission)
│   └── authModal/        # Session expiry handling
│
├── features/             # Feature modules (one folder per domain)
│   └── [feature-name]/
│       ├── pages/        # Page-level components (routed views)
│       ├── [sub-form]/   # Sub-form or section components within the feature
│       ├── api/          # RTK Query endpoints + response mappers
│       │   ├── [feature].api.ts
│       │   └── [feature].mappers.ts
│       ├── redux/        # Redux slice, selectors, index barrel
│       │   ├── [feature].slice.ts
│       │   ├── [feature].selectors.ts
│       │   └── index.ts
│       └── types/        # Feature-scoped TypeScript types
│           └── [feature].types.ts
│
├── components/           # Shared reusable components (no business logic)
│   ├── ui/               # Atomic/theme-level UI components (Button, Input, Select, etc.)
│   ├── form/             # Form layout helpers (FormField, FormGrid, FormSection)
│   ├── datagrid/         # DataGrid component with hooks, utils, types, theme
│   ├── containers/       # Layout containers (PageContainer, PageHeader, FormCard)
│   └── modals/           # Modal system (BaseModal, ModalHost, modal types)
│
├── services/             # Shared API layer (baseApi, common endpoints)
├── hooks/                # Shared custom hooks
├── theme/                # Theme system (types, utils, applyTheme, ThemeDropdown)
├── i18n/                 # Internationalization setup
├── styles/               # Global CSS (Tailwind + CSS variable definitions)
├── config/               # Environment configuration
├── constants/            # Shared constants
├── types/                # Shared TypeScript types (API response, errors)
└── utils/                # Utility/helper functions
```

### Feature Module Pattern (Example: `auth`)

```
features/auth/
├── pages/
│   └── LoginPage.tsx         # Routed page component
├── loginForm/
│   └── index.tsx             # Form sub-component used by the page
├── api/
│   ├── auth.api.ts           # RTK Query endpoints
│   └── auth.mappers.ts       # API response → domain model mapping
├── redux/
│   ├── auth.slice.ts         # Redux state slice
│   ├── auth.selectors.ts     # Typed selectors
│   └── index.ts              # Barrel export
└── types/
    └── auth.types.ts         # Feature types (User, AuthState, etc.)
```

> Every new feature **must** follow this exact pattern. No deviation without approval.

### Naming Conventions

#### camelCase — All Files and Folders
- **All folder names** must be camelCase: `cascadeSelect/`, `progressBar/`, `labEnrolment/` — not `cascade-select/`, `CascadeSelect/`, or `lab-enrolment/`.
- **All file names** must be camelCase: `auth.types.ts`, `buttonStyles.ts`, `labDetails.tab.tsx` — not `AuthTypes.ts` or `button-styles.ts`.
- **Exception — Page-level components** (routed views inside `pages/`) use PascalCase: `LoginPage.tsx`, `LabEnrolmentPage.tsx`.

#### Component Folder Structure — `componentName/index.tsx`
Every shared UI component and feature sub-component follows this structure:

```
components/ui/progressBar/     ← folder name: camelCase
├── index.tsx                  ← main component file — ALWAYS named index.tsx
├── index.ts                   ← barrel export
├── progressBar.types.ts       ← (only if types are complex enough to extract)
└── progressBar.utils.ts       ← (only if utils are needed)
```

- The main component file is always named **`index.tsx`** — never `ProgressBar.tsx` or `ProgressBarComponent.tsx`.
- Supporting files prefix the component name in camelCase: `progressBar.types.ts`, `progressBar.utils.ts`.
- A `styles.css` may be added only when Tailwind cannot cover the required styles — see Section 3.
- Even a single-file component must live in its own named folder. No bare component files at the `ui/` root.

---

## 3. Styling Rules

### No Inline Styles
- **Never** use `style={{ }}` inline JSX styles.
- **Never** use arbitrary Tailwind values like `w-[123px]` unless no theme token covers it and it is approved.

**Exception — Computed Positioning Only:**
`style={{ }}` is allowed exclusively for runtime-computed pixel values that CSS classes cannot express: popover/tooltip placement, drag-and-drop coordinates, and dynamic offset calculations. All other styling must use classes.

```tsx
// ✅ allowed — runtime position cannot be expressed as a class
<div style={{ top: position.top, left: position.left }}>

// ❌ wrong — static value must use a class
<div style={{ color: 'red', padding: '16px' }}>
```

### Class-Based Styling Only
- Use Tailwind utility classes composed via `clsx`.
- Use semantic theme classes (`bg-primary`, `text-text`, `border-border`, etc.) — these are driven by CSS variables and update automatically when the tenant theme changes.

### Component-Level Styles
- **Do not create `styles.css` by default.** Only create it when a Tailwind utility class genuinely cannot express the required style — e.g., complex animations, multi-step gradients, pseudo-element hacks, or third-party library overrides. If Tailwind covers it, use Tailwind.
- When a `styles.css` is needed, place it in the component's own folder (e.g., `progressBar/styles.css`) and reference it only via class names — never via inline `style` props.
- Example pattern already in use: `DateTimePicker/DateTimePicker.css`, `NotFound/NotFound.css`.

### Global Styles
- All global styles and CSS variable definitions live in `src/styles/index.css`.
- Theme tokens (colors, radius, font, shadow) are defined once here and consumed everywhere via Tailwind or direct `var(--*)` references.

### Theme-Level Requirement
- Every UI decision must respect the theme system (`TenantTheme` → CSS variables → Tailwind classes).
- Colors, fonts, spacing, shadows, and border radii must use theme tokens — no hardcoded hex or pixel values.

### Layout / Structural CSS Variables
- All app-shell layout dimensions (header height, sidebar width, content padding, etc.) must be defined as CSS custom properties in `src/styles/index.css` and referenced via `var(--layout-*)`.
- No hardcoded `px` values for layout structure in CSS files.

```css
/* ✅ correct — define once, reference everywhere */
@theme {
  --layout-header-height: 56px;
  --layout-sidebar-width: 220px;
  --layout-content-padding: 16px;
}

.app-header { height: var(--layout-header-height); }
.app-sidebar { width: var(--layout-sidebar-width); }

/* ❌ wrong — hardcoded layout values */
.app-header { height: 56px; }
.app-sidebar { width: 220px; }
```

### Form Field Typography (MANDATORY)
- All form field **labels** must use `text-xs` (12px) — enforced via `FormField` component.
- All form field **input text and placeholder text** must use `text-xs` (12px) — enforced via `inputStyles.ts` base class.
- All **checkbox labels** must use `text-xs` (12px).
- All **dropdown / select trigger text** must use `text-xs` (12px).
- All **field-level error messages** must use `text-xs` (12px) — enforced via `FormField` error prop.
- All **API error banners** must use `text-xs` (12px) — enforced via `FormErrorBanner`.
- Do not use `text-sm` (14px) or any other size for form-related text. The only exception is section headings above a form group.
- The global field height is defined as `--layout-field-height` in `src/styles/index.css` and must be used by all input, select, and dropdown trigger components.

```tsx
// ✅ correct — 12px label, 12px input text
<FormField label={t('fields.name')} required>
  <Input placeholder={t('placeholders.name')} />
</FormField>

// ❌ wrong — 14px label
<label className="text-sm">Name</label>
<input className="text-sm" />
```

### DataGrid Cell Field Width (MANDATORY)
- All DataGrid columns containing **interactive fields** (dropdowns, inputs, number inputs) must use a minimum column `size` of **170px**.
- This ensures dropdowns and inputs have enough room to display content without clipping, especially on mobile/tablet.
- Read-only text columns (labels, status, codes) are not bound by this rule — size them to fit content.

```ts
// ✅ correct — interactive column with 170px minimum
{ id: 'analyser', header: 'Analyser', size: 170, cell: ... }

// ❌ wrong — interactive column too narrow
{ id: 'analyser', header: 'Analyser', size: 100, cell: ... }
```

### Button Border Rule (MANDATORY)
- All button variants (except `unstyled` and `outline`) must have a `border` that matches their background color.
- `primary` → `border-primary`, `danger` → `border-error`, `soft` → `border-surface-muted`, `secondary` → `border-border`.
- This ensures buttons have a consistent visual weight and don't appear borderless.
- The `unstyled` variant has no styles — border is controlled entirely by `className`.
- When using `variant="unstyled"` with custom bg (e.g. `bg-info`), always add a matching border (e.g. `border border-info`).

---

## 4. Component Import Rules

### UI Fallback Rule
If a shared UI component in `components/ui` does not support a required case:
1. **Extend the component** inside `components/ui` — add the variant, prop, or slot it needs.
2. **Do not bypass** with a raw HTML element unless explicitly approved by the project owner.
3. If extension is not feasible, raise it before writing any workaround code.

> Raw HTML bypass is a last resort and must be documented with the approval reason.

### Use `components/ui` — Not Raw HTML Tags
- Never use raw HTML form elements (`<button>`, `<input>`, `<select>`, `<textarea>`) directly in feature or page code.
- Always import and use the corresponding component from `components/ui`:

| Raw HTML      | Use Instead                              |
|---------------|------------------------------------------|
| `<button>`    | `Button`, `IconButton`, `FormButton`     |
| `<input>`     | `Input`, `FormInput`, `PasswordInput`    |
| `<select>`    | `Select`, `FormSelect`, `SelectNative`   |
| `<textarea>`  | `Textarea`                               |
| `<input type="checkbox">` | `Checkbox`, `SimpleCheckbox`  |
| `<input type="radio">` | `Radio`                          |

- These components are theme-aware. When the theme changes, all instances update automatically.
- New primitive components must be added to `components/ui/` and exported from the folder's `index.ts` barrel.

### Global Exports
- All `components/ui` components must have a barrel `index.ts` export.
- Import from the barrel, not from the file directly:
  ```ts
  // correct
  import { Button } from '@/components/ui/button';

  // wrong
  import Button from '@/components/ui/button/Button';
  ```

---

## 5. Icon Rules

### Icon Library
- Only `@heroicons/react` is used for icons. No other icon library.
- Always use the **SVG component** variant (not the string/path variant).

### Centralized Icon Barrel — `src/icons/`
- All icon imports from `@heroicons/react` are **centralized** in `src/icons/index.ts`.
- Every other file in the project imports icons from `@/icons` — never directly from `@heroicons/react`.

```ts
// src/icons/index.ts — the only place that touches @heroicons/react
export { UserIcon, LockClosedIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
export { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
```

```ts
// ✅ correct — import from the barrel
import { UserIcon, ChevronDownIcon } from '@/icons';

// ❌ wrong — never import directly from the package
import { UserIcon } from '@heroicons/react/24/outline';
```

### Rules
- When a new icon is needed, add it to `src/icons/index.ts` first, then import from `@/icons`.
- Use the `24/outline` set by default. Only fall back to `24/solid` or `20/solid` if the icon is not available in `24/outline`.
- Do not inline SVG markup (`<svg>...</svg>`) — always use the heroicon component.

### Brand / Third-Party Icons
Brand icons not available in heroicons (Google, GitHub, Microsoft, etc.) must be placed in `src/icons/brand/` as named React components and exported from `src/icons/brand/index.ts`. Inline SVG in feature code is still not allowed.

```
src/icons/brand/
├── GoogleIcon.tsx
├── GitHubIcon.tsx
└── index.ts          ← barrel export
```

```tsx
// ✅ correct — named component from the brand barrel
import { GoogleIcon } from '@/icons/brand';

// ❌ wrong — inline SVG in feature/component code
<svg viewBox="0 0 24 24">...</svg>
```

### Images & SVG Assets
- All image and SVG asset imports are **centralized** in `src/icons/images.ts`.
- Every other file in the project imports images from `@/icons/images` — never import directly from `public/assets/` or use raw string paths in JSX.
- Static images (PNG, WebP, SVG used as `<img src>`) must be placed in `public/assets/images/` and referenced via the barrel.
- SVG files used as React components must follow the Brand Icons pattern above.

```ts
// src/icons/images.ts — the only place that defines image paths
export const IMAGES = {
  logo: '/assets/images/logo.png',
  loginBanner: '/assets/images/loginBnr.webp',
  emptyCart: '/assets/images/emptyCart.svg',
} as const;
```

```tsx
// ✅ correct — import from the barrel
import { IMAGES } from '@/icons/images';
<img src={IMAGES.logo} alt="EQAS" />

// ❌ wrong — raw path in JSX
<img src="/assets/images/logo.png" alt="EQAS" />
```

---

## 6. TypeScript Rules

- Strict mode is enforced — no `any`, no ignored type errors.
- `.tsx` files — explicit return type annotation is **not required** (JSX inference is sufficient).
- `.ts` files (utilities, services, slices, hooks, mappers) — explicit return types are **required**.
- Feature-scoped types live in `features/[feature]/types/`.
- Shared cross-feature types live in `src/types/`.
- API response shapes must be mapped to domain types via mapper files.

---

## 7. API & State Rules

### Redux — Auth/Login Only
Redux is used **only** for state that must persist across the entire session and is set at login time:
- Authenticated user (`user`, `isAuthenticated`)
- Active tenant (`tenant`)
- User permissions (`permissions`)

Do **not** create Redux slices for feature-level state, UI state, filters, form state, or any data that can be derived from the server.

```ts
// ✅ correct — auth/login state belongs in Redux
dispatch(setUser(user));

// ❌ wrong — feature data does not belong in Redux
dispatch(setPatientList(data));
dispatch(setModalOpen(true));
```

### Server State — RTK Query Cache
All server data is managed via RTK Query. The cache is the source of truth for API data — do not copy it into Redux slices.

### Local UI State — useState
All UI state (open/close, selected tab, local form values, loading indicators) lives in component `useState`. Do not lift it to Redux.

### State Decision Table

| Data type | Where it lives |
|---|---|
| User identity, tenant, permissions | Redux (auth slice) |
| API response data | RTK Query cache |
| Form state | React Hook Form |
| UI state (modals, tabs, toggles) | `useState` |
| Shared derived values | `useMemo` / selector inside component |

### API Calls
- All API calls go through RTK Query endpoints defined in `features/[name]/api/`.
- No direct `fetch` or `axios` — always use `baseApi` from `src/services/baseApi.ts`.

---

## 8. i18n Rules

- All user-visible strings must use the translation hook (`useT`) in components, or `i18n.t()` in non-component files (middleware, services, utilities).
- No hardcoded English strings **anywhere** in the codebase that will be displayed to the user — this includes JSX/TSX, middleware, toast calls, error handlers, and utilities.
- Translation keys live in `public/locales/en/` JSON files.

```ts
// ✅ correct — middleware/service using i18n.t()
toastService.error(i18n.t('common:errors.networkError'), i18n.t('common:errors.networkErrorDesc'));

// ❌ wrong — hardcoded string in middleware
toastService.error('Network Error', 'Please check your internet connection.');
```

---

## 9. Form Validation Display Rules

### Field-Level Errors (MANDATORY)
- Every form field that has a validation constraint **must** display its error message inline, directly below the input, when the field fails validation.
- The error message must never be silent — a red border alone is not sufficient feedback.
- Error text must use an i18n translation key — no hardcoded English strings.

```tsx
// ✅ correct — error message shown below the input
<Input
  {...register('labId')}
  variant={formState.errors.labId ? 'error' : 'default'}
/>
{formState.errors.labId && (
  <p className="mt-1 text-xs text-error">{formState.errors.labId.message}</p>
)}

// ❌ wrong — red border only, user doesn't know what is wrong
<Input variant="error" />
```

### Zod Schema — Module Level, Type Derived (MANDATORY)
- Zod schemas **must** be defined at module level (outside the component function).
- The form value type **must** be derived with `z.infer<typeof schema>` — never write a manual type that duplicates the schema shape. Manual types cause TypeScript errors when the schema and type drift (e.g. `optional()` vs non-optional).
- Do **not** define the schema inside the component to access `t()` — this re-creates the schema on every render and breaks type inference.

```ts
// ✅ correct — schema at module level, type derived
const loginSchema = z.object({
  labId: z.string().min(1),
  rememberMe: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// ❌ wrong — manual type, will drift from schema and cause TS errors
type LoginFormValues = { labId: string; rememberMe: boolean };

// ❌ wrong — schema inside component
export function MyForm() {
  const loginSchema = z.object({ ... }); // re-created every render
}
```

### Zod Schema Error Messages
- Zod validation messages shown to the user must come from `t()` called at **render time**, not from Zod's `message` option.
- This avoids i18n timing issues (namespace may not be loaded at module-import time) and keeps translations reactive to language changes.

```tsx
// ✅ correct — t() called at render time
{formState.errors.labId && (
  <p className="mt-1 text-xs text-error">{t('login.errors.fieldRequired')}</p>
)}

// ❌ wrong — i18n.t() at module level, may run before namespace loads
labId: z.string().min(1, { message: i18n.t('auth:login.errors.fieldRequired') }),
```

### FormErrorBanner — API Errors Only
- `FormErrorBanner` is reserved for **server / API errors** returned after a failed request.
- Do not use `FormErrorBanner` to display field-level Zod validation errors.

---

## 10. RTL & Internationalisation Layout Rules

The application supports both LTR (English) and RTL (Arabic) layouts. Every UI decision must be direction-aware.

### Direction Application
- `applyDirection(language)` from `src/i18n/rtl.ts` sets the `dir` attribute on `<html>` and applies any RTL-specific CSS.
- It must be called in **two places**:
  1. `src/app/main.tsx` — before `createRoot().render()`, so the direction is set on every page load including public routes (e.g. `/login`).
  2. `src/app/initializeApp.ts` — on language change via `i18n.on('languageChanged', ...)`, already in place.
- Never set `dir` manually in component JSX — always go through `applyDirection`.

### Styling Rules for RTL
- **No hardcoded directional classes.** Do not use `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right` directly.
- Use **logical CSS utilities** instead so layout flips automatically:

| Avoid (physical)   | Use instead (logical)  |
|--------------------|------------------------|
| `ml-*` / `mr-*`   | `ms-*` / `me-*`        |
| `pl-*` / `pr-*`   | `ps-*` / `pe-*`        |
| `left-*`          | `start-*`              |
| `right-*`         | `end-*`                |
| `text-left`       | `text-start`           |
| `text-right`      | `text-end`             |
| `rounded-l-*`     | `rounded-s-*`          |
| `rounded-r-*`     | `rounded-e-*`          |
| `border-l-*`      | `border-s-*`           |
| `border-r-*`      | `border-e-*`           |

- **Exception — explicit visual positioning:** `left-*` / `right-*` are allowed only for elements whose position must not flip (e.g. fixed overlays, popover placement computed at runtime). Document the reason with a comment.

### Icons in RTL
- Directional icons (arrows, chevrons, back/forward) must be mirrored in RTL.
- Use the CSS `[dir="rtl"] .icon { transform: scaleX(-1) }` pattern via a utility class — do not conditionally swap icon components in JSX.
- Non-directional icons (lock, user, status) must **not** be mirrored.

### Font
- Arabic text must use a font that supports Arabic script. Define an Arabic font family in `src/theme/theme.types.ts` (`familyArabic`) and apply it via `applyTheme` / CSS variable when `lang === 'ar'`.
- Do not hardcode `font-family` for Arabic in component styles.

### Translation Namespaces
- Arabic translation files live in `public/locales/ar/` mirroring the `en/` structure.
- Every namespace added under `en/` must have a matching file under `ar/`.
- All namespaces used in the app must be listed in the `ns` array in `src/i18n/index.ts`.

```ts
// ✅ correct — logical spacing, flips automatically in RTL
<div className="ms-4 pe-6 text-start">

// ❌ wrong — physical spacing, broken in RTL
<div className="ml-4 pr-6 text-left">
```

---

## 11. Git & Commit Rules

- Follow conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`.
- All commits go through Husky pre-commit hooks (Prettier + ESLint) — do not bypass.
- One logical concern per commit.

---

## 12. ESLint Rules (Enforced)

These are actively enforced by `eslint.config.js`. Understanding them prevents avoidable lint failures.

### Return Types (by file type)
- `.tsx` — `explicit-function-return-type` is **off**. JSX inference is enough.
- `.ts` — `explicit-function-return-type` is **error**. All exported functions must have annotated return types.

### Boolean Safety
- `strict-boolean-expressions` is **warn**. Do not use truthy/falsy checks on nullable values without explicit null handling. CI blocks on warnings (`--max-warnings 0`).

### Console Logging
- `no-console` is **warn** in app code. Only `console.warn` and `console.error` are allowed.
- `no-console` is **error** in tooling files (`vite.config.ts`).
- CI uses `--max-warnings 0` — warnings become errors on merge.

### React Rules
- `react/jsx-key` is **error** — all list-rendered elements must have a `key` prop.
- `react/jsx-no-useless-fragment` is **warn** — remove unnecessary `<>` wrappers.
- `react-hooks/exhaustive-deps` is **warn** — keep hook dependency arrays complete.
- `react-refresh/only-export-components` is **warn** — do not mix component and non-component exports in `.tsx` files (breaks HMR).

### Cross-Feature Import Boundaries
- Importing `@/features/[name]/**` from another feature is **error**.
- Intra-feature imports must use **relative paths** (e.g. `../redux`, `./api/auth.api`).
- Code shared between features must live in `components/`, `hooks/`, `services/`, `types/`, `constants/`, or `utils/`.

```ts
// ✅ allowed — relative intra-feature import
import { authSelectors } from '../redux';

// ✅ allowed — shared layer import
import { Button } from '@/components/ui/button';

// ❌ blocked — cross-feature import
import { patientSelectors } from '@/features/patient/redux';
```

### Async Safety
- `no-floating-promises` is **error**. Every `Promise` must be awaited or explicitly `void`-ed.

```ts
// ✅ correct
void fetchData();
await fetchData();

// ❌ blocked
fetchData();
```

### Lint Scripts
| Script | Purpose |
|---|---|
| `npm run lint` | Standard lint (pre-commit, local dev) |
| `npm run lint:ci` | Full lint with `--max-warnings 0` — used in CI pipeline |

---

## 13. Responsive Design Rules

Every component — from atoms to full pages — must be responsive. There is no "desktop only" exception unless the owner explicitly approves it for a specific screen.

### Mobile-First Approach
- Write base styles for mobile (smallest viewport) first.
- Layer larger viewports with Tailwind's responsive prefixes: `sm:` (640 px) → `md:` (768 px) → `lg:` (1024 px) → `xl:` (1280 px) → `2xl:` (1536 px).
- Never write a layout that only works at one screen size and leaves others broken.

### Mandatory Breakpoints to Test
Before marking any component or page as done, verify it looks correct at:

| Breakpoint | Width   | Represents        |
|------------|---------|-------------------|
| Mobile     | 375 px  | Smartphone        |
| Tablet     | 768 px  | iPad / tablet     |
| Laptop     | 1280 px | Standard laptop   |
| Wide       | 1536 px | Large desktop     |

### Rules
- No component may use a hardcoded `width` or `height` in `px` that causes overflow or invisible content below `sm` (640 px).
- Navigation, modals, forms, tables, and data grids must all have a collapsed or stacked layout on small screens.
- Use `hidden sm:block`, `flex-col md:flex-row`, `w-full lg:w-1/2`, etc. to progressively enhance at wider sizes.
- Avoid `overflow-hidden` on page-level containers — it will clip absolutely-positioned dropdowns and popovers.
- Scrollable containers must use `overflow-x-auto` or `overflow-y-auto` scoped to the correct element, not the root.

```tsx
// ✅ correct — mobile-first, responsive
<div className="flex flex-col gap-4 md:flex-row md:gap-6">

// ❌ wrong — fixed layout that only works on desktop
<div className="flex gap-6">
```

---

## 14. Global Component-First Rule

Before writing any piece of UI, check `src/components/ui/` first. If a matching component exists, use it. If it does not cover a required variant, extend it — never re-implement it inline.

### Check Before You Build
1. Search `src/components/ui/` for the element you need (button, input, select, modal, cascade, etc.).
2. If it exists → import and use it.
3. If it exists but lacks a variant/prop → extend the component in `components/ui/`, get approval, then use it.
4. If it does not exist and will be used in 2 or more places → create it in `components/ui/`, export from the barrel, then use it everywhere.
5. If it will only ever be used in one place → build it inline, but flag it for extraction if a second use appears.

### Extraction Threshold
- A UI pattern used in **2 or more** separate features or pages **must** be extracted to `components/ui/`.
- This includes: loading states, empty states, section headers, status badges, icon-button patterns, data rows, etc.
- When extracting, update **all** existing usages to point to the new shared component in the same PR.

### Canonical Component Registry
The following components are the canonical implementations. Feature code must never re-implement them:

| UI element              | Canonical component                          |
|-------------------------|----------------------------------------------|
| Button / icon action    | `Button`, `IconButton` from `components/ui/button` |
| Text input / password   | `Input`, `PasswordInput` from `components/ui/input` |
| Dropdown / select       | `Select`, `CascadeSelect` from `components/ui/` |
| Modal / dialog          | `BaseModal`, `ConfirmDialog` from `components/modals/` |
| Error message           | `FormErrorBanner` from `components/form/` |
| Toast notification      | toast service — never inline |
| Multi-level cascade     | `CascadeSelect` from `components/ui/cascade-select` |

### No Duplication Rule
- Do **not** create a second button, a second input, or a second modal that does the same thing as an existing one.
- Do **not** copy-paste a component from one feature into another — extract it to `components/ui/` instead.
- If two components look the same but serve "different purposes," they are the same component with a prop difference.

```tsx
// ✅ correct — use the global component
import { CascadeSelect } from '@/components/ui/cascade-select';

// ❌ wrong — re-implementing a cascade dropdown inline in a feature
function MyFeatureDropdown() {
  // custom hover logic, panel stacking, etc. — duplicating what CascadeSelect already does
}
```
