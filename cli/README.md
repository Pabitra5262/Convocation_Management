# ⚡ Project CLI Generator Guide

A custom-built internal Command Line Interface (CLI) for the **React Wireframe** project. It automates repetitive boilerplate generation for new **UI Components** and complete **Feature Modules** while enforcing the project's architectural standards.

---

## 🎯 Key Benefits

1. **⚡ Speed & Instant Productivity**: Generate complete feature modules (with form configs, CRUD services, add/edit pages, and data tables) in under a second.
2. **📐 100% Structural Consistency**: Eliminates typos in subfolders (`form-config`, `services`, `types`, `pages`) and adheres to strict TypeScript standards.
3. **🧩 Plug-and-Play Reusability**: Pre-wires your newly generated pages with `<FormGenerator />`, `<ReusableTable />`, and `apiClient`.
4. **🚀 Frictionless Onboarding**: Junior developers can generate standardized code instantly without manual copy-pasting.

---

## 📂 CLI Directory Structure

The CLI lives completely **outside** the `src/` directory in `cli/`:

```
cli/
├── index.js                          # Main CLI entry point & argument parser
├── README.md                         # This comprehensive guide
└── generators/
    ├── componentGenerator.js         # Scaffolds UI & Layout components
    └── featureGenerator.js           # Scaffolds complete feature modules
```

---

## 🚀 Available Commands

You can run commands directly using `npm run` or via `node cli/index.js`.

### 1. 🧩 Generate a Component

Scaffolds a TypeScript UI or Layout component with separate `.types.ts`, `.styles.ts`, and `index.tsx` files.

#### Syntax:
```bash
# Generate inside src/shared/components/ui/<ComponentName>/
npm run generate:component <ComponentName>

# Or generate inside src/shared/components/layout/<ComponentName>/
npm run generate:component <ComponentName> -- --category=layout
```

#### Examples:
```bash
npm run generate:component Badge
npm run generate:component UserAvatar
npm run generate:component PageHeader -- --category=layout
```

#### Generated Structure:
```
src/shared/components/ui/Badge/
├── badge.types.ts    # TypeScript interface with props & variants
├── badge.styles.ts   # Tailwind CSS style tokens & variants
└── index.tsx         # Clean, typed React component with export
```

---

### 2. 📦 Generate a Feature Module

Scaffolds a complete feature module configured with JSON form schemas, Material React Table list page, Add/Edit page, TypeScript models, and Axios CRUD services.

#### Syntax:
```bash
npm run generate:feature <feature-name>
```

#### Examples:
```bash
npm run generate:feature doctor-details
npm run generate:feature patient-management
npm run generate:feature hospital-branches
```

#### Generated Structure:
```
src/features/doctor-details/
├── types/
│   └── doctor-details.types.ts       # Model and form data interfaces
├── form-config/
│   └── doctorDetailsFormConfig.ts   # FormGenerator JSON configuration
├── services/
│   └── doctorDetailsService.ts      # Axios CRUD methods with apiClient
└── pages/
    ├── AddDoctorDetails.tsx         # Add/Edit page with FormGenerator & toast
    └── DoctorDetailsList.tsx        # List view with ReusableTable & actions
```

---

## 🛠️ Step-by-Step After Generating a Feature

After generating a feature module with `npm run generate:feature <name>`:

1. **Register Routes** in `src/app/routes/routeConfig.ts`:
   ```typescript
   export const ROUTES = {
     DOCTORS: {
       LIST: '/doctor-details',
       ADD: '/doctor-details/add',
       EDIT: (id: string | number) => `/doctor-details/edit/${id}`,
     },
   };
   ```

2. **Add Lazy Route in `src/app/routes/AppRoutes.tsx`**:
   ```tsx
   const DoctorDetailsList = lazy(() => import('@/features/doctor-details/pages/DoctorDetailsList'));
   const AddDoctorDetails = lazy(() => import('@/features/doctor-details/pages/AddDoctorDetails'));
   ```

3. **Add Navigation Link** in `src/shared/components/layout/Sidebar/Sidebar.tsx`.

---

## 📝 Form Config Field Types Reference

When editing generated form configurations (`form-config/*FormConfig.ts`):

| Type | Description |
| :--- | :--- |
| `text` | Standard text input |
| `email` | Email input |
| `password` | Password input |
| `number` | Numeric input |
| `tel` | 10-digit telephone number input |
| `select` | **Searchable Dropdown** (filters static options automatically or uses `onSearch`) |
| `multiselect` | **Multi-tag selection** for multiple options |
| `textarea` | Multi-line text input |
| `date` / `time` | Date or Time picker |
| `checkbox` / `radio-group` | Selection boxes/radios |
| `file` / `profile-upload` | File attachment / Avatar uploader |

---

## 💻 Help & Diagnostics

To view all CLI commands in your terminal anytime:
```bash
npm run cli
```
or
```bash
node cli/index.js --help
```
