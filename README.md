# PORSENIGAMA 26

Official website of the Pekan Olahraga dan Seni Gadjah Mada (PORSENIGAMA) 2026.

## Running the Project

Make sure Node.js and pnpm are installed, then run:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure

Use the following structure for pages, modules, and components:

```text
app/
├── nama-page/
│   └── page.tsx
├── layout.tsx
└── page.tsx

src/
├── modules/
│   └── nama-page/
│       └── section.tsx
└── components/
    └── nama-page-atau-section/
        └── nama-component.tsx
```

### Naming Rules

- All folder and file names must use `kebab-case`.
- Page route names should match the page name, for example `app/daftar-lomba/page.tsx`.
- Page-specific sections should be placed in `src/modules/nama-page/`.
- Shared or section-specific components should be placed in `src/components/nama-page-atau-section/`.
- Use descriptive names and avoid uncommon abbreviations.

## Contribution Workflow

### 1. Create a Branch

Branch names must follow the format `<scope>/<section>.<name>`:

```text
feat/hero.aya
```

Available scopes:

| Scope   | Usage                                                                                 |
| ------- | ------------------------------------------------------------------------------------- |
| `feat`  | Adds a new feature or changes the UI and functionality of a section by more than 60%. |
| `fix`   | Fixes bugs, errors, or UI issues.                                                     |
| `ref`   | Refactors code without changing the UI or behavior.                                   |
| `chore` | README updates or other support-related tasks.                                        |

### 2. Work on Your Assigned Section

Focus on the section or feature assigned to you and follow the folder structure and naming rules above.

### 3. Run Validation

Before committing, you must run linting and type checking:

```bash
pnpm lint
pnpm typecheck
```

All errors must be fixed before continuing.

### 4. Commit

Use the following commit message format:

```text
<scope>(<section/feature>): <details>
```

Examples:

```text
feat(hero): add hero section
fix(navbar): fix navbar animation
feat(klasemen): add klasemen animation
ref(landing): optimize code for landing page
```

### 5. Push and Open a Pull Request

1. Push the branch to the remote repository.
2. Create a pull request from that branch to `dev`, not to `main`.
3. If checks or merge validation fail, fix them first.
4. After the pull request is ready to merge, confirm it with Aya.
5. Make revisions if requested.

## Main Scripts

| Command          | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Runs the development server.                    |
| `pnpm lint`      | Runs ESLint.                                    |
| `pnpm typecheck` | Checks TypeScript types without emitting files. |
| `pnpm build`     | Creates a production build.                     |

## Contributors

### Website Subdivision Subcoordinator

- [Ayasha Rahmadinni](https://github.com/ayashar)

### Developers

- [Akmal Rafli Fauzan](https://github.com/Akmaaalrf)
- [Chelsea Christofera Antonioli Purnomo](https://github.com/chelchr)
- [Rafa Attamimi Adnan Atmaja](https://github.com/adnanmaja)
- [Ramon Fabian](https://github.com/mon-jago)
- [Salwa Dyah Nafla](https://github.com/wawaDyah)
- [Seto Aryo Hudoyo](https://github.com/SetoAryo479)

### UX Researcher

- [Jettavane Anatha Pindika](https://github.com/jettapindika)

### UI Designer

- [Ahmad Tariq Hifzhillah](https://github.com/ThariqHifzh)

### IT Division Coordinator

- Azzuddinurrofif Azzuko
