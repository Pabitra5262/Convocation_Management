# Project Architecture & Developer Guide

Welcome to the **React Wireframe Project Documentation**. This document serves as the complete, definitive guide for understanding the project structure, import/export conventions, shared component library, attribute passing, form schemas, button positioning, and end-to-end feature development workflow.

---

## Table of Contents
1. [Tech Stack & System Overview](#1-tech-stack--system-overview)
2. [Import & Export Conventions & Path Aliases](#2-import--export-conventions--path-aliases)
   - [2.1 Path Alias (`@/`)](#21-path-alias-)
   - [2.2 Barrel Exports & Import Strategies for `src/shared/`](#22-barrel-exports--import-strategies-for-srcshared)
   - [2.3 Master Import Reference Table](#23-master-import-reference-table)
3. [Complete `src/` Folder Structure](#3-complete-src-folder-structure)
4. [Deep Dive: Shared Architecture (`src/shared/`)](#4-deep-dive-shared-architecture-srcshared)
   - [4.1 UI Components (`src/shared/components/ui/`)](#41-ui-components)
     - [1. Button](#1-button-sharedcomponentsuibutton)
     - [2. Badge](#2-badge-sharedcomponentsuibadge)
     - [3. Modal & ModalFooter](#3-modal--modalfooter-sharedcomponentsuimodal)
     - [4. DialogModal](#4-dialogmodal-sharedcomponentsuidialogmodal)
     - [5. StatusModal](#5-statusmodal-sharedcomponentsuistatusmodal)
     - [6. ReusableOffcanvas](#6-reusableoffcanvas-sharedcomponentsuioffcanvas)
     - [7. ReusableTable & ReusableMaterialTable](#7-reusabletable--reusablematerialtable-sharedcomponentsuitable)
     - [8. DynamicFormTable](#8-dynamicformtable-sharedcomponentsuitabledynamicformtable)
     - [9. Tabs](#9-tabs-sharedcomponentsuitabs)
     - [10. ActionButtons & ActionMenu](#10-actionbuttons--actionmenu-sharedcomponentsuiactions)
     - [11. Radio, RadioButton & RadioGroup](#11-radio-radiobutton--radiogroup-sharedcomponentsuiforms)
   - [4.2 Forms, JSON Schemas & FormGenerator (`src/shared/components/ui/Forms/`)](#42-forms-json-schemas--formgenerator-srcsharedcomponentsuiforms)
     - [1. Core Architecture & Workflow](#1-core-architecture--workflow)
     - [2. Complete JSON Schema (`FormField`) Attributes Reference](#2-complete-json-schema-formfield-attributes-reference)
     - [3. All Supported Field Types & JSON Examples](#3-all-supported-field-types--json-examples)
     - [4. Validation Rules Reference (`ValidationRule`)](#4-validation-rules-reference-validationrule)
     - [5. `FormGenerator` Props Reference (`FormProps`)](#5-formgenerator-props-reference-formprops)
     - [6. Deep Dive: Button Placement & Alignment (`buttonPosition`, `buttonGridColumn`, `buttonClassName`)](#6-deep-dive-button-placement--alignment-buttonposition-buttongridcolumn-buttonclassname)
     - [7. Step-by-Step Implementation in React](#7-step-by-step-implementation-in-react)
     - [8. Advanced Form Patterns (Edit Mode, Dependent Fields, Modal Forms, MultiStepForm)](#8-advanced-form-patterns)
   - [4.3 Layout Components (`src/shared/components/layout/`)](#43-layout-components-srcsharedcomponentslayout)
   - [4.4 Shared Hooks (`src/shared/hooks/`)](#44-shared-hooks-srcsharedhooks)
   - [4.5 Shared Utilities (`src/shared/utils/`)](#45-shared-utilities-srcsharedutils)
5. [Core Services & State Management](#5-core-services--state-management)
6. [Step-by-Step: How to Build a New Feature](#6-step-by-step-how-to-build-a-new-feature)
7. [Best Practices & Code Standards](#7-best-practices--code-standards)
8. [Project CLI Generator Guide](#8-project-cli-generator-guide)

---

## 1. Tech Stack & System Overview

- **Core**: React 19, TypeScript, Vite
- **State Management**: Redux Toolkit & RTK Query
- **Routing**: React Router DOM (v7)
- **Tables**: Material React Table (MRT v3) + MUI Core
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Styling**: Tailwind CSS & Dynamic CSS Theme Variables (Light/Dark mode)
- **Exports**: jsPDF, AutoTable, XLSX

---

## 2. Import & Export Conventions & Path Aliases

### 2.1 Path Alias (`@/`)
The project configures `@` as an alias for the `src` directory in both `vite.config.ts` and `tsconfig.app.json`.

```typescript
// ✅ RECOMMENDED: Use alias imports
import { Button, Modal, Card } from '@/shared/components';
import { useTable } from '@/shared/hooks';
import apiClient from '@/services/api/apiClient';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// ❌ AVOID: Deep relative imports
import Button from '../../../../shared/components/ui/Button';
```

---

### 2.2 Barrel Exports & Import Strategies for `src/shared/`

The `src/shared/` directory provides multi-tier barrel exports for maximum developer ergonomics. You can import common items using any of the following patterns:

```
src/shared/
├── index.ts                      <-- Root barrel (re-exports components, hooks, utils)
├── components/
│   ├── index.ts                  <-- Components barrel (re-exports ui + layout)
│   ├── ui/
│   │   ├── index.ts              <-- UI barrel (Button, Modal, Table, Forms, Tabs, etc.)
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Forms/
│   │   │   └── index.ts          <-- Forms barrel (FormGenerator, Input, Select, etc.)
│   └── layout/
│       ├── index.ts              <-- Layout barrel (Card, Breadcrumb, Header, etc.)
├── hooks/
│   └── index.ts                  <-- Hooks barrel (useTable, etc.)
└── utils/
    └── index.ts                  <-- Utils barrel (exportUtils, authUtils, etc.)
```

#### Supported Import Patterns:

##### 1. Category Barrel Imports (Most Common & Recommended)
```typescript
// 1. UI Components
import { Button, Badge, Modal, DialogModal, StatusModal, ReusableTable, DynamicFormTable, Tabs } from '@/shared/components/ui';

// 2. Form Components & Utilities
import { FormGenerator, MultiStepForm, Input, Select, SearchableSelect, DatePicker, generateZodSchema } from '@/shared/components/ui/Forms';
import type { FormField, FormProps, Option, ValidationRule } from '@/shared/components/ui/Forms';

// 3. Layout Components
import { Card, Breadcrumb, Header, Sidebar, Loader, ThemeToggle, MainLayout, AuthLayout } from '@/shared/components/layout';

// 4. Shared Hooks
import { useTable } from '@/shared/hooks';

// 5. Shared Utilities
import { exportToExcel, exportToPDF, getJwtToken, setJwtToken, isAuthenticated, clearAuthData } from '@/shared/utils';
```

##### 2. Top-Level Components Import
```typescript
// Imports both UI and Layout components from a single path
import { Button, Modal, Card, Breadcrumb, Tabs, ReusableTable } from '@/shared/components';
```

##### 3. Root Shared Import
```typescript
// Imports UI, Layout, Hooks, and Utils directly from @/shared
import { Button, Card, useTable, exportToExcel, getJwtToken } from '@/shared';
```

##### 4. Direct Submodule / Component Imports
```typescript
import Button from '@/shared/components/ui/Button';
import Card from '@/shared/components/layout/Card';
import Modal from '@/shared/components/ui/Modal';
import { getJwtToken } from '@/shared/utils/cookieUtils';
```

---

### 2.3 Master Import Reference Table

| Component / Utility | Type | Recommended Import Path | Submodule Import Path |
| :--- | :--- | :--- | :--- |
| `Button` | Component | `import { Button } from '@/shared/components/ui';` | `import Button from '@/shared/components/ui/Button';` |
| `Badge` | Component | `import { Badge } from '@/shared/components/ui';` | `import Badge from '@/shared/components/ui/Badge';` |
| `Modal`, `ModalFooter` | Component | `import { Modal, ModalFooter } from '@/shared/components/ui';` | `import Modal, { ModalFooter } from '@/shared/components/ui/Modal';` |
| `DialogModal` | Component | `import { DialogModal } from '@/shared/components/ui';` | `import DialogModal from '@/shared/components/ui/DialogModal';` |
| `StatusModal` | Component | `import { StatusModal } from '@/shared/components/ui';` | `import StatusModal from '@/shared/components/ui/StatusModal';` |
| `ReusableOffcanvas` | Component | `import { ReusableOffcanvas } from '@/shared/components/ui';` | `import ReusableOffcanvas from '@/shared/components/ui/Offcanvas';` |
| `ReusableTable` | Component | `import { ReusableTable } from '@/shared/components/ui';` | `import ReusableTable from '@/shared/components/ui/Table';` |
| `DynamicFormTable` | Component | `import { DynamicFormTable } from '@/shared/components/ui';` | `import DynamicFormTable from '@/shared/components/ui/Table/DynamicFormTable';` |
| `Tabs` | Component | `import { Tabs } from '@/shared/components/ui';` | `import Tabs from '@/shared/components/ui/Tabs';` |
| `ActionButtons`, `ActionMenu` | Component | `import { ActionButtons, ActionMenu } from '@/shared/components/ui';` | `import { ActionButtons, ActionMenu } from '@/shared/components/ui/Actions';` |
| `Radio`, `RadioButton`, `RadioGroup` | Form Controls | `import { Radio, RadioButton, RadioGroup } from '@/shared/components/ui/Forms';` | `import { Radio, RadioButton, RadioGroup } from '@/shared/components/ui/Forms';` |
| `FormGenerator` | Component | `import { FormGenerator } from '@/shared/components/ui/Forms';` | `import FormGenerator from '@/shared/components/ui/Forms/FormGenerator';` |
| `MultiStepForm` | Component | `import { MultiStepForm } from '@/shared/components/ui/Forms';` | `import MultiStepForm from '@/shared/components/ui/Forms/MultiStepForm';` |
| `Input`, `Select`, `DatePicker`... | Form Controls | `import { Input, Select, DatePicker } from '@/shared/components/ui/Forms';` | `import Input from '@/shared/components/ui/Forms/Input';` |
| `generateZodSchema` | Helper | `import { generateZodSchema } from '@/shared/components/ui/Forms';` | `import { generateZodSchema } from '@/shared/components/ui/Forms/schemaUtils';` |
| `Card` | Layout | `import { Card } from '@/shared/components/layout';` | `import Card from '@/shared/components/layout/Card';` |
| `Breadcrumb` | Layout | `import { Breadcrumb } from '@/shared/components/layout';` | `import Breadcrumb from '@/shared/components/layout/Breadcrumb';` |
| `Header`, `Sidebar` | Layout | `import { Header, Sidebar } from '@/shared/components/layout';` | `import Header from '@/shared/components/layout/Header';` |
| `Loader` | Layout | `import { Loader } from '@/shared/components/layout';` | `import Loader from '@/shared/components/layout/Loader';` |
| `ThemeToggle` | Layout | `import { ThemeToggle } from '@/shared/components/layout';` | `import ThemeToggle from '@/shared/components/layout/ThemeToggle';` |
| `MainLayout`, `AuthLayout` | Layout | `import { MainLayout, AuthLayout } from '@/shared/components/layout';` | `import MainLayout from '@/shared/components/layout/MainLayout';` |
| `useTable` | Hook | `import { useTable } from '@/shared/hooks';` | `import { useTable } from '@/shared/hooks/useTable';` |
| `exportToPDF`, `exportToExcel` | Utility | `import { exportToPDF, exportToExcel } from '@/shared/utils';` | `import { exportToPDF, exportToExcel } from '@/shared/utils/exportUtils';` |
| `getJwtToken`, `setJwtToken`... | Utility | `import { getJwtToken, setJwtToken } from '@/shared/utils';` | `import { getJwtToken } from '@/shared/utils/cookieUtils';` |
| `isAuthenticated`, `isTokenValid` | Utility | `import { isAuthenticated, isTokenValid } from '@/shared/utils';` | `import { isAuthenticated } from '@/shared/utils/authUtils';` |
| `clearAuthData` | Utility | `import { clearAuthData } from '@/shared/utils';` | `import { clearAuthData } from '@/shared/utils/authHelper';` |

---

## 3. Complete `src/` Folder Structure

```
src/
├── app/                  # Application initialization, root store, routing, providers
│   ├── routes/           # Route definitions, guards (Protected & Public), Route config
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   ├── routeConfig.ts
│   │   └── index.ts
│   ├── store/            # Redux Toolkit global store configuration
│   │   ├── store.ts      # Store setup with RTK middleware
│   │   ├── rootReducer.ts# Combined reducers
│   │   └── index.ts
│   ├── App.tsx           # Main App component with AppProviders
│   ├── AppProviders.tsx  # Redux Provider, ThemeProvider, StatusModalProvider, Router
│   └── hooks.ts          # Typed hooks: useAppDispatch, useAppSelector
│
├── assets/               # Static assets (images, logos, SVG files)
│   └── images/           # Image constants & assets
│
├── config/               # Application-level configuration
│   └── theme/            # Theme context, MUI theme configuration, Status modal context
│       ├── ThemeContext.tsx
│       ├── MuiTheme.tsx
│       ├── StatusModalContext.tsx
│       └── index.ts
│
├── features/             # Feature/domain-driven modules
│   ├── auth/             # Authentication (Login, slice, service, validation)
│   ├── dashboard/        # Dashboard view & metrics
│   ├── employee-details/ # Employee management, forms, tables, sub-components
│   ├── Product-details/  # Product listing, approvals, tabs, add product forms
│   └── student-details/  # Student details management
│
├── services/             # Application services
│   ├── api/              # Axios HTTP client instance & interceptors
│   │   ├── apiClient.ts
│   │   └── index.ts
│   ├── encryption/       # Encryption / hashing services
│   └── storage/          # LocalStorage / SessionStorage wrappers
│
├── shared/               # Shared global components, hooks, utilities, and design system
│   ├── index.ts          # Root shared barrel
│   ├── components/
│   │   ├── index.ts      # Components barrel
│   │   ├── layout/       # Layout components (Card, Breadcrumb, Header, Sidebar, etc.)
│   │   └── ui/           # Reusable UI elements (Button, Modal, Table, Forms, Tabs, etc.)
│   ├── hooks/            # Generic hooks (useTable, etc.)
│   └── utils/            # Utilities (exportUtils, cookieUtils, authUtils, authHelper)
│
├── styles/               # Global CSS and Tailwind setup
│   ├── App.css
│   └── index.css         # CSS Variables (Theme tokens: --background, --foreground, etc.)
│
├── main.tsx              # React DOM entry point
└── vitest.setup.ts       # Test environment setup
```

---

## 4. Deep Dive: Shared Architecture (`src/shared/`)

---

### 4.1 UI Components

#### 1. `Button` (`@/shared/components/ui/Button`)
A flexible, theme-aware button component supporting predefined business actions, visual variants, sizes, icons, and automated loading spinners. Extends standard `ButtonHTMLAttributes<HTMLButtonElement>`.

- **Props / Attributes**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `label` | `string` | `undefined` | Button text label |
  | `variant` | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Visual style scheme |
  | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size styling (`sm`: compact, `md`: standard, `lg`: prominent) |
  | `action` | `'submit' \| 'save' \| 'update' \| 'approve' \| 'reject' \| 'cancel' \| 'reset' \| 'back'` | `undefined` | Pre-configured color & icon action |
  | `loading` | `boolean` | `false` | Shows loading spinner and disables user interaction |
  | `icon` | `ReactNode` | `undefined` | Leading icon element |
  | `disabled` | `boolean` | `false` | Disables button |
  | `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
  | `onClick` | `(e: MouseEvent<HTMLButtonElement>) => void` | `undefined` | Click event handler |
  | `className`| `string` | `''` | Extra Tailwind CSS classes |

- **Usage Example**:
  ```tsx
  import { Button } from "@/shared/components/ui";
  import { Plus, Trash2 } from "lucide-react";

  // Standard Button with Icon
  <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={handleCreate}>
    Add New Record
  </Button>

  // Action-driven button (automatically styled for 'save' with spinner support)
  <Button action="save" loading={isSubmitting} type="submit">
    Save Changes
  </Button>

  // Danger Button
  <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={handleDelete}>
    Delete Record
  </Button>
  ```

---

#### 2. `Badge` (`@/shared/components/ui/Badge`)
Renders status tags and badges. Extends standard `HTMLAttributes<HTMLDivElement>`.

- **Props / Attributes**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Visual badge color scheme |
  | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size (`sm`: xs text, `md`: sm text, `lg`: base text) |
  | `isLoading` | `boolean` | `false` | Displays spinning indicator |
  | `className` | `string` | `''` | Extra CSS classes |
  | `children` | `ReactNode` | `undefined` | Badge content |

- **Usage Example**:
  ```tsx
  import { Badge } from "@/shared/components/ui";

  <Badge variant="primary">Active</Badge>
  <Badge variant="secondary">In Review</Badge>
  <Badge variant="outline">Draft</Badge>
  ```

---

#### 3. `Modal` & `ModalFooter` (`@/shared/components/ui/Modal`)
Accessible modal dialog rendered via React Portals with smooth backdrop transitions, size scaling, and header/footer controls.

- **`Modal` Props**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `isOpen` | `boolean` | **Required** | Open/close visibility state |
  | `onClose` | `() => void` | **Required** | Callback invoked when close action is triggered |
  | `title` | `string` | `undefined` | Modal header title text |
  | `children` | `ReactNode` | **Required** | Modal body content |
  | `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl' \| '6xl' \| '7xl' \| 'full'` | `'md'` | Maximum width size |
  | `footer` | `ReactNode` | `undefined` | Custom footer container or `<ModalFooter />` |
  | `showCloseButton` | `boolean` | `true` | Show top-right 'X' close button |
  | `closeOnBackdropClick` | `boolean` | `true` | Closes modal when clicking backdrop |
  | `animation` | `'scale' \| 'top'` | `'scale'` | Animation effect on enter/exit |

- **`ModalFooter` Props**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `onClose` | `() => void` | `undefined` | Close / cancel callback |
  | `onConfirm` | `() => void` | `undefined` | Confirm / submit callback |
  | `confirmText` | `string` | `'Confirm'` | Confirm button label |
  | `cancelText` | `string` | `'Cancel'` | Cancel button label |
  | `showCancel` | `boolean` | `true` | Show cancel button |
  | `showConfirm` | `boolean` | `true` | Show confirm button |
  | `confirmDisabled` | `boolean` | `false` | Disables confirm button |

- **Usage Example**:
  ```tsx
  import { useState } from "react";
  import { Modal, ModalFooter } from "@/shared/components/ui";

  const [isOpen, setIsOpen] = useState(false);

  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Edit Profile"
    size="lg"
    footer={
      <ModalFooter
        onClose={() => setIsOpen(false)}
        onConfirm={handleSave}
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    }
  >
    <p>Modal body content goes here...</p>
  </Modal>
  ```

---

#### 4. `DialogModal` (`@/shared/components/ui/DialogModal`)
Pre-styled confirmation dialog modal for destructive actions, warnings, notifications, and verification prompts.

- **Props / Attributes**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `isOpen` | `boolean` | **Required** | Open/close visibility |
  | `onClose` | `() => void` | **Required** | Cancel callback |
  | `onConfirm` | `() => void` | **Required** | Confirm callback |
  | `title` | `string` | `'Confirm Action'` | Title text |
  | `message` | `string` | **Required** | Dialog message body |
  | `type` | `'info' \| 'warning' \| 'danger' \| 'success'` | `'info'` | Color scheme and status icon |
  | `confirmText` | `string` | `'Confirm'` | Confirm button label |
  | `cancelText` | `string` | `'Cancel'` | Cancel button label |
  | `closeOnBackdropClick` | `boolean` | `false` | Whether backdrop click closes dialog |

- **Usage Example**:
  ```tsx
  import { DialogModal } from "@/shared/components/ui";

  <DialogModal
    isOpen={isDeleteDialogOpen}
    onClose={() => setIsDeleteDialogOpen(false)}
    onConfirm={confirmDeleteRecord}
    type="danger"
    title="Delete Employee"
    message="Are you sure you want to delete this employee? This action cannot be undone."
    confirmText="Yes, Delete"
    cancelText="No, Keep"
  />
  ```

---

#### 5. `StatusModal` (`@/shared/components/ui/StatusModal`)
Notification modal with automated 3-second auto-dismiss for operation outcomes.

- **Props / Attributes**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `isOpen` | `boolean` | **Required** | Visibility |
  | `onClose` | `() => void` | **Required** | Close callback |
  | `type` | `'success' \| 'error' \| 'warning' \| 'info' \| 'confirm'` | `'success'` | Modal status type |
  | `title` | `string` | `undefined` | Custom title (defaults based on `type`) |
  | `message` | `string` | **Required** | Description message |
  | `confirmText` | `string` | `'OK'` | Confirm button label |
  | `cancelText` | `string` | `'Cancel'` | Cancel button label |
  | `onConfirm` | `() => void` | `undefined` | Confirmation action |

- **Usage via Context Hook (`useStatusModal`)**:
  ```tsx
  import { useStatusModal } from "@/config/theme/StatusModalContext";

  const { showSuccess, showError, showWarning } = useStatusModal();

  // Trigger directly anywhere:
  showSuccess("Employee details saved successfully!");
  showError("Failed to update product status.");
  ```

---

#### 6. `ReusableOffcanvas` (`@/shared/components/ui/Offcanvas`)
Slide-over drawer component based on MUI Drawer with custom header, body, and footer slots.

- **Props / Attributes**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `isOpen` | `boolean` | **Required** | Drawer open state |
  | `onClose` | `() => void` | **Required** | Close callback |
  | `title` | `string` | **Required** | Drawer title |
  | `subTitle` | `string` | `undefined` | Subtitle text rendered below title |
  | `children` | `ReactNode` | **Required** | Drawer body contents |
  | `footer` | `ReactNode` | `undefined` | Sticky bottom footer content |
  | `anchor` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Drawer slide direction |
  | `width` | `string \| number` | `450` | Drawer width in pixels or CSS units |

- **Usage Example**:
  ```tsx
  import { ReusableOffcanvas, Button } from "@/shared/components/ui";

  <ReusableOffcanvas
    isOpen={isFilterDrawerOpen}
    onClose={() => setIsFilterDrawerOpen(false)}
    title="Filter Employees"
    subTitle="Select filter parameters below"
    width={480}
    footer={<Button onClick={applyFilters}>Apply Filters</Button>}
  >
    <div className="space-y-3">Filter inputs here...</div>
  </ReusableOffcanvas>
  ```

---

#### 7. `ReusableTable` & `ReusableMaterialTable` (`@/shared/components/ui/Table`)
Full-featured, responsive data table powered by **Material React Table**, including search, sorting, filtering, density toggle, column ordering, PDF/Excel export, and **built-in high-contrast draggable horizontal scrollbar** for large multi-column datasets.

> [!TIP]
> **Horizontal Drag Scrolling**: Wide tables automatically render a prominent, styled horizontal scrollbar inside the table container. The top toolbar (Search/Filters/Export) and bottom toolbar (Rows per page/Pagination) stay pinned and accessible while you smoothly drag and scroll horizontally through columns.

- **Props / Attributes**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `columns` | `MRT_ColumnDef<T>[]` | **Required** | Column definitions array |
  | `data` | `T[]` | **Required** | Array of row data items |
  | `loading` | `boolean` | `false` | Displays skeleton loading state |
  | `maxHeight` | `string \| number` | `undefined` | Optional max height for vertical scrolling |
  | `minWidth` | `string \| number` | `'max-content'` | Table minimum width ensuring horizontal scroll trigger |
  | `enableRowActions` | `boolean` | `false` | Enables row actions column |
  | `renderRowActions` | `({ row, table }) => ReactNode` | `undefined` | Custom row actions component |
  | `renderRowActionMenuItems` | `(props) => ReactNode[]` | `undefined` | Custom menu items for row action dropdown |
  | `renderTopToolbarCustomActions` | `({ table }) => ReactNode` | `undefined` | Custom action buttons on top toolbar |
  | `enableExport` | `boolean` | `true` | Enables export dropdown (PDF & Excel) |
  | `exportFileName` | `string` | `'export_data'` | Default file name for exported files |
  | `onExportPDF` | `(rows: any[]) => void` | `undefined` | Custom PDF export handler |
  | `onExportExcel` | `(rows: any[]) => void` | `undefined` | Custom Excel export handler |
  | `serverSidePagination` | `object` | `undefined` | Config: `{ totalRows, pageIndex, pageSize, onPageChange, onPageSizeChange }` |

- **Usage Example**:
  ```tsx
  import { useMemo } from "react";
  import type { MRT_ColumnDef } from "material-react-table";
  import { ReusableTable, ActionButtons, Button } from "@/shared/components/ui";
  import { Plus } from "lucide-react";

  interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  const EmployeeTable = () => {
    const data: Employee[] = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "Developer" },
    ];

    const columns = useMemo<MRT_ColumnDef<Employee>[]>(() => [
      { accessorKey: "id", header: "ID", size: 60 },
      { accessorKey: "name", header: "Employee Name" },
      { accessorKey: "email", header: "Email Address" },
      { accessorKey: "role", header: "Designation" },
    ], []);

    return (
      <ReusableTable
        columns={columns}
        data={data}
        exportFileName="employees_list"
        renderTopToolbarCustomActions={() => (
          <Button icon={<Plus size={16} />} onClick={() => navigate('/add')}>
            Add Employee
          </Button>
        )}
        enableRowActions
        renderRowActions={({ row }) => (
          <ActionButtons
            actions={["view", "edit", "delete"]}
            onAction={(action) => handleAction(action, row.original)}
          />
        )}
      />
    );
  };
  ```

---

#### 8. `DynamicFormTable` (`@/shared/components/ui/Table/DynamicFormTable`)
Dynamic tabular grid with Add (`+`) and Remove (`-`) controls for managing inline editable form rows (e.g. line items, previous employment history, qualifications).

- **Props / Attributes**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `rows` | `readonly T[]` | **Required** | Array of row items |
  | `headers` | `readonly ReactNode[]` | **Required** | Column header labels / React nodes |
  | `renderRow` | `(index: number) => ReactNode` | **Required** | Callback returning the `<td>` cells for each row index |
  | `onAdd` | `() => void` | `undefined` | Callback invoked when top-right `+` button is clicked |
  | `onRemove` | `(index: number) => void` | `undefined` | Callback invoked when row `-` button is clicked |
  | `disableAddRemove` | `boolean` | `false` | Disables add and remove action buttons |
  | `showAction` | `boolean` | `true` | Shows action column with add/remove buttons |

- **Usage Example**:
  ```tsx
  import { useState } from "react";
  import { DynamicFormTable, Button } from "@/shared/components/ui";
  import { Input } from "@/shared/components/ui/Forms";

  interface QualificationRow {
    degree: string;
    institution: string;
    passingYear: string;
  }

  export const QualificationsTable = () => {
    const [rows, setRows] = useState<QualificationRow[]>([
      { degree: "", institution: "", passingYear: "" },
    ]);

    const handleAdd = () => {
      setRows((prev) => [...prev, { degree: "", institution: "", passingYear: "" }]);
    };

    const handleRemove = (index: number) => {
      setRows((prev) => prev.filter((_, idx) => idx !== index));
    };

    return (
      <DynamicFormTable
        rows={rows}
        headers={["Degree / Course", "Institution / University", "Passing Year"]}
        onAdd={handleAdd}
        onRemove={handleRemove}
        renderRow={(index) => (
          <>
            <td className="p-2 border border-table-border">
              <Input
                placeholder="e.g. B.Tech"
                value={rows[index].degree}
                onChange={(e) => {
                  const updated = [...rows];
                  updated[index].degree = e.target.value;
                  setRows(updated);
                }}
              />
            </td>
            <td className="p-2 border border-table-border">
              <Input
                placeholder="University name"
                value={rows[index].institution}
                onChange={(e) => {
                  const updated = [...rows];
                  updated[index].institution = e.target.value;
                  setRows(updated);
                }}
              />
            </td>
            <td className="p-2 border border-table-border">
              <Input
                placeholder="YYYY"
                value={rows[index].passingYear}
                onChange={(e) => {
                  const updated = [...rows];
                  updated[index].passingYear = e.target.value;
                  setRows(updated);
                }}
              />
            </td>
          </>
        )}
      />
    );
  };
  ```

---

#### 9. `Tabs` (`@/shared/components/ui/Tabs`)
Modern segmented tab switcher with Lucide icon support and smooth active highlight transitions.

- **`TabsProps` Reference**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `tabs` | `TabItem[]` | **Required** | Array of tab items |
  | `activeTab` | `string` | **Required** | Currently active tab `key` |
  | `onChange` | `(key: string) => void` | **Required** | Callback invoked when user selects a tab |

- **`TabItem` Interface**:
  ```typescript
  export interface TabItem {
    key: string;            // Unique tab identifier
    label: string;          // Display label
    icon?: LucideIcon;      // Optional Lucide icon component
  }
  ```

- **Usage Example**:
  ```tsx
  import { useState } from "react";
  import { Tabs } from "@/shared/components/ui";
  import { User, Briefcase, FileText } from "lucide-react";

  const tabList = [
    { key: "personal", label: "Personal Info", icon: User },
    { key: "employment", label: "Employment", icon: Briefcase },
    { key: "documents", label: "Documents", icon: FileText },
  ];

  export const ProfileTabs = () => {
    const [activeTab, setActiveTab] = useState("personal");

    return (
      <div className="space-y-4">
        <Tabs tabs={tabList} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "personal" && <div>Personal Info Component</div>}
        {activeTab === "employment" && <div>Employment History Component</div>}
        {activeTab === "documents" && <div>Documents Upload Component</div>}
      </div>
    );
  };
  ```

---

#### 10. `ActionButtons` & `ActionMenu` (`@/shared/components/ui/Actions`)
Standardized row actions with preconfigured icons, tooltips, and click callbacks.

- **Available `ActionType` Values**:
  `"view" | "edit" | "delete" | "download" | "pdf" | "toggle" | "lock" | "link" | "person" | "approve" | "reject" | "dispatch" | "pending"`

- **`ActionButtonProps` Reference**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `actions` | `ActionType[]` | **Required** | List of action buttons to display |
  | `onAction` | `(action: ActionType) => void` | `undefined` | Callback fired when any action button is clicked |
  | `toggleValue` | `boolean` | `undefined` | Boolean state value when `"toggle"` action is used |
  | `disabledActions` | `ActionType[]` | `undefined` | Specific actions in the list to disable |

- **`ActionMenu` Props**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `actions` | `ActionType[]` | **Required** | Action items in the popup menu |
  | `onAction` | `(action: ActionType) => void` | `undefined` | Callback fired on item click |

- **Usage Example**:
  ```tsx
  import { ActionButtons, ActionMenu } from "@/shared/components/ui";

  // Action Buttons Row
  <ActionButtons
    actions={["view", "edit", "delete"]}
    disabledActions={row.isLocked ? ["edit", "delete"] : []}
    onAction={(action) => {
      if (action === "edit") handleEdit(row);
      if (action === "delete") handleDelete(row);
    }}
  />

  // Action Dropdown Menu
  <ActionMenu
    actions={["view", "edit", "download", "pdf"]}
    onAction={(action) => handleAction(action, row)}
  />
  ```

---

#### 11. `Radio`, `RadioButton` & `RadioGroup` (`@/shared/components/ui/Forms`)
Modern, theme-aware, accessible radio button components supporting size variants (`sm`, `md`, `lg`), orientation (`horizontal`, `vertical`), interactive card variants (`variant="cards"`), descriptions, helper texts, and validation errors.

##### Size Variants Reference:
- **`sm`**: 14px radio (`w-3.5 h-3.5`), `text-xs` label — Ideal for compact tables and dense toolbars.
- **`md`**: 16px radio (`w-4 h-4`), `text-sm` label (Default) — Standard size for all typical form fields.
- **`lg`**: 20px radio (`w-5 h-5`), `text-base` label — Prominent size for key decision points, checkouts, and cards.

##### Color / Theme Variants:
- `'primary'` (Default theme primary)
- `'success'` (Green accent)
- `'danger'` (Red accent)
- `'warning'` (Amber accent)
- `'secondary'` (Slate accent)

##### `Radio` / `RadioButton` Props:
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `ReactNode` | `undefined` | Primary text label |
| `description` | `ReactNode` | `undefined` | Secondary subtitle/helper text under the label |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `variant` | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'secondary'` | `'primary'` | Accent color variant |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Displays red asterisk `*` |
| `error` | `string` | `undefined` | Validation error message |
| `helpText` | `string` | `undefined` | Hint text displayed below radio |
| `checked` | `boolean` | `undefined` | Controlled checked state |
| `onChange` | `ChangeEventHandler` | `undefined` | Standard change callback |

##### `RadioGroup` Props:
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | `RadioOption[]` | **Required** | Array of `{ label, value, description?, disabled?, badge?, icon? }` |
| `label` | `string` | `undefined` | Group label title |
| `name` | `string` | Auto-generated | Form input name attribute |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant applied to all radio options |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction of options (`'horizontal'` = inline row) |
| `variant` | `'default' \| 'cards'` | `'default'` | Visual display style (`'cards'` renders modern selectable tiles) |
| `colorVariant` | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'secondary'` | `'primary'` | Radio dot accent color |
| `value` | `string \| number` | `undefined` | Controlled value |
| `defaultValue` | `string \| number` | `undefined` | Uncontrolled default value |
| `onChange` | `(e) => void` | `undefined` | Event callback |
| `onValueChange` | `(val: string \| number) => void` | `undefined` | Value callback |
| `required` | `boolean` | `false` | Displays red asterisk `*` |
| `error` | `string` | `undefined` | Error message displayed below group |
| `helpText` | `string` | `undefined` | Helper text displayed below group |

##### Usage Examples:

**1. Standalone Radio Buttons with Different Sizes (`sm`, `md`, `lg`)**:
```tsx
import { useState } from "react";
import { Radio, RadioButton } from "@/shared/components/ui/Forms";

export const RadioSizesDemo = () => {
  const [sizeOption, setSizeOption] = useState("medium");

  return (
    <div className="space-y-4">
      {/* Small Size */}
      <Radio
        name="size-demo"
        value="small"
        size="sm"
        label="Small Radio (14px)"
        description="Compact label for dense layouts"
        checked={sizeOption === "small"}
        onChange={(e) => setSizeOption(e.target.value)}
      />

      {/* Medium Size (Default) */}
      <Radio
        name="size-demo"
        value="medium"
        size="md"
        label="Medium Radio (16px - Standard)"
        description="Default size for regular form inputs"
        checked={sizeOption === "medium"}
        onChange={(e) => setSizeOption(e.target.value)}
      />

      {/* Large Size */}
      <Radio
        name="size-demo"
        value="large"
        size="lg"
        label="Large Radio (20px)"
        description="Prominent radio for easy touch interaction"
        checked={sizeOption === "large"}
        onChange={(e) => setSizeOption(e.target.value)}
      />
    </div>
  );
};
```

**2. Horizontal and Vertical `RadioGroup`**:
```tsx
import { useState } from "react";
import { RadioGroup } from "@/shared/components/ui/Forms";

export const GenderSelection = () => {
  const [gender, setGender] = useState("Male");

  return (
    <RadioGroup
      label="Gender"
      name="gender"
      required
      size="md"
      orientation="horizontal"
      options={[
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ]}
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      helpText="Select your gender as per official ID"
    />
  );
};
```

**3. Interactive Cards Variant (`variant="cards"`)**:
```tsx
import { useState } from "react";
import { RadioGroup } from "@/shared/components/ui/Forms";
import { ShieldCheck, Zap } from "lucide-react";

export const PlanSelection = () => {
  const [plan, setPlan] = useState("pro");

  return (
    <RadioGroup
      label="Select Subscription Plan"
      name="plan"
      variant="cards"
      orientation="horizontal"
      size="md"
      options={[
        {
          label: "Basic Plan",
          value: "basic",
          icon: <Zap size={16} className="text-amber-500" />,
          description: "Essential tools for personal projects",
          badge: "Free",
        },
        {
          label: "Pro Plan",
          value: "pro",
          icon: <ShieldCheck size={16} className="text-blue-500" />,
          description: "Full suite with priority team support",
          badge: "Popular",
        },
      ]}
      value={plan}
      onChange={(e) => setPlan(e.target.value)}
    />
  );
};
```

**4. JSON Schema Usage in `<FormGenerator />`**:
```json
{
  "name": "employmentType",
  "label": "Employment Type",
  "type": "radio-group",
  "required": true,
  "radioSize": "md",
  "orientation": "horizontal",
  "options": [
    { "label": "Full-Time", "value": "full_time" },
    { "label": "Part-Time", "value": "part_time" },
    { "label": "Contractual", "value": "contract" }
  ],
  "validation": {
    "required": true,
    "message": "Please select an employment type"
  }
}
```

---

### 4.2 Forms, JSON Schemas & FormGenerator (`src/shared/components/ui/Forms/`)

The application provides a powerful **schema-driven form engine** (`<FormGenerator />`) along with standalone input components.

#### 1. Core Architecture & Workflow
In this project, forms are **configuration-driven**:
- You declare form fields in a JSON configuration file inside `form-config/*.json` as an array of `FormField` objects.
- `<FormGenerator />` parses the JSON, automatically builds a **Zod validation schema** via `generateZodSchema`, binds with **React Hook Form**, renders a responsive Tailwind grid layout, and manages validation error messages and submissions.

```
┌────────────────────────────────────────────────────────┐
│  1. JSON Config (src/features/.../form-config/*.json)  │
│  [ { name: "email", type: "email", validation: {...} } ]│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  2. schemaUtils.ts -> generateZodSchema(fields)        │
│  Transforms JSON validation rules into Zod Schema:     │
│  z.object({ email: z.string().email(...) })            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  3. FormGenerator.tsx                                  │
│  1. useForm({ resolver: zodResolver(schema) })         │
│  2. Maps fields to Inputs, Selects, DatePickers, etc.  │
│  3. Applies Tailwind Grid classes & Button Alignment   │
│  4. Handles validation errors & submission             │
└────────────────────────────────────────────────────────┘
```

---

#### 2. Complete JSON Schema (`FormField`) Attributes Reference
Each field in your JSON file is an object conforming to the `FormField` interface:

| Attribute | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | - | Unique key/property name in form output data. |
| `label` | `string` | No | `undefined` | Label displayed above the input. |
| `placeholder`| `string` | No | `undefined` | Placeholder text inside input. |
| `type` | `string` | No | `'text'` | Component type (`text`, `select`, `multiselect`, `date`, `time`, `checkbox`, `radio-group`, `file`, `profile-upload`, etc.). |
| `gridColumn` | `number` | No | `12` | Grid width in a 12-column layout (`6` = half width, `12` = full width, `4` = one-third, `3` = one-fourth). |
| `rowSpan` | `number` | No | `1` | Row span for elements like avatar uploads (e.g. `2` or `3`). |
| `required` | `boolean` | No | `false` | Quick shorthand for required validation. |
| `validation` | `ValidationRule` | No | `undefined` | Validation rules (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `email`, `url`, `custom`, `message`). |
| `options` | `Option[]` | For selects/radios | `[]` | Dropdown options or radio choices (`{ label: string; value: string \| number; disabled?: boolean }`). |
| `disabled` | `boolean` | No | `false` | Disables user interaction. |
| `readOnly` | `boolean` | No | `false` | Makes input read-only. |
| `helpText` | `string` | No | `undefined` | Helper hint text rendered under the input. |
| `rows` | `number` | For textarea | `3` | Number of visible text lines for `textarea`. |
| `maxLength` | `number` | No | `undefined` | Maximum allowed character length. |
| `minLength` | `number` | No | `undefined` | Minimum allowed character length. |
| `min` | `number \| string` | No | `undefined` | Minimum numeric value or minimum date value. |
| `max` | `number \| string` | No | `undefined` | Maximum numeric value or maximum date value. |
| `step` | `number` | No | `undefined` | Step increment for numeric inputs. |
| `pattern` | `string` | No | `undefined` | Regex pattern string for input filtering. |
| `accept` | `string` | For uploads | `".pdf"` or `"image/*"` | Accepted file extensions/MIME types. |
| `minDate` | `string \| Date` | For date picker | `undefined` | Minimum selectable date (e.g. `"2020-01-01"`). |
| `maxDate` | `string \| Date` | For date picker | `undefined` | Maximum selectable date (e.g. `"2030-12-31"`). |
| `dateFormat` | `string` | For date picker | `'yyyy-MM-dd'` | Date display format. |
| `showTimeSelect` | `boolean` | For date picker | `false` | Enables time selection inside date picker. |
| `showCount` | `boolean` | For textarea/input | `false` | Shows character counter. |
| `autoComplete` | `string` | No | `undefined` | HTML `autocomplete` attribute. |
| `onSearch` | `(term: string) => Promise<Option[]>` | For select | `undefined` | Async search callback for remote select options. |
| `multiple` | `boolean` | For select/files | `false` | Allows multiple file or item selection. |
| `className` | `string` | No | `''` | Custom CSS class applied to the input element. |
| `wrapperClassName` | `string` | No | `''` | Custom CSS class applied to field outer container. |
| `labelClassName` | `string` | No | `''` | Custom CSS class applied to field label. |
| `errorClassName` | `string` | No | `''` | Custom CSS class applied to error message text. |
| `render` | `(value, onChange, error) => ReactNode` | No | `undefined` | Custom JSX render override function. |

---

#### 3. All Supported Field Types & JSON Examples

##### `text`, `email`, `number`
```json
{
  "name": "employeeName",
  "label": "Employee Name",
  "type": "text",
  "placeholder": "Enter full name",
  "gridColumn": 6,
  "validation": {
    "required": true,
    "minLength": 3,
    "maxLength": 100,
    "message": "Employee Name must be between 3 and 100 characters"
  }
},
{
  "name": "emailId",
  "label": "Email Address",
  "type": "email",
  "placeholder": "example@domain.com",
  "gridColumn": 6,
  "validation": {
    "required": true,
    "email": true,
    "message": "Enter a valid email address"
  }
},
{
  "name": "salary",
  "label": "Monthly Salary",
  "type": "number",
  "placeholder": "Enter salary amount",
  "gridColumn": 6,
  "validation": {
    "required": true,
    "min": 1000,
    "max": 1000000,
    "message": "Salary must be between 1,000 and 1,000,000"
  }
}
```

##### `tel` (Phone Number with Digit Restriction)
```json
{
  "name": "mobileNumber",
  "label": "Mobile Number",
  "type": "tel",
  "placeholder": "Enter 10-digit number",
  "maxLength": 10,
  "gridColumn": 6,
  "validation": {
    "required": true,
    "pattern": "^[0-9]{10}$",
    "message": "Mobile number must be exactly 10 digits"
  }
}
```

##### `select` (Searchable Dropdown / Async Search)
```json
{
  "name": "department",
  "label": "Department",
  "type": "select",
  "placeholder": "Select department",
  "gridColumn": 6,
  "options": [
    { "label": "Engineering", "value": "Engineering" },
    { "label": "Human Resources", "value": "HR" },
    { "label": "Marketing", "value": "Marketing" },
    { "label": "Finance & Accounting", "value": "Finance" }
  ],
  "validation": {
    "required": true,
    "message": "Department selection is required"
  }
}
```

##### `multiselect` (Multi-Tag Selection)
```json
{
  "name": "skills",
  "label": "Skills / Technologies",
  "type": "multiselect",
  "placeholder": "Select applicable skills",
  "gridColumn": 12,
  "options": [
    { "label": "React", "value": "react" },
    { "label": "TypeScript", "value": "typescript" },
    { "label": "Node.js", "value": "nodejs" }
  ],
  "validation": {
    "required": true,
    "message": "Select at least one skill"
  }
}
```

##### `date`, `time`, `textarea`
```json
{
  "name": "dateOfBirth",
  "label": "Date of Birth",
  "type": "date",
  "gridColumn": 6,
  "maxDate": "2008-01-01",
  "validation": {
    "required": true,
    "message": "Date of birth is required"
  }
},
{
  "name": "address",
  "label": "Permanent Address",
  "type": "textarea",
  "placeholder": "Enter full address with pincode",
  "rows": 3,
  "maxLength": 300,
  "gridColumn": 12,
  "validation": {
    "required": true,
    "minLength": 10,
    "message": "Address must be at least 10 characters"
  }
}
```

##### `profile-upload` & `file`
```json
{
  "name": "profilePhoto",
  "label": "Profile Picture",
  "type": "profile-upload",
  "gridColumn": 12,
  "rowSpan": 2
},
{
  "name": "resumeDocument",
  "label": "Upload Resume (PDF)",
  "type": "file",
  "accept": ".pdf,.docx",
  "gridColumn": 6,
  "validation": {
    "required": true,
    "message": "Please upload a resume file"
  }
}
```

---

#### 4. Validation Rules Reference (`ValidationRule`)
```typescript
export interface ValidationRule {
  required?: boolean;        // Field must not be empty
  minLength?: number;        // Minimum character length (strings)
  maxLength?: number;        // Maximum character length (strings)
  min?: number;              // Minimum numeric value (numbers)
  max?: number;              // Maximum numeric value (numbers)
  pattern?: string;          // Regular Expression string (e.g. "^[0-9]{10}$")
  email?: boolean;           // Enforces valid email pattern
  url?: boolean;             // Enforces valid HTTP/HTTPS URL
  custom?: (value: any) => boolean | string; // Custom validator function
  message?: string;          // Custom error message displayed on failure
}
```

---

#### 5. `FormGenerator` Props Reference (`FormProps`)

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fields` | `FormField[]` | **Required** | Array of field configuration objects |
| `onSubmit` | `(data: Record<string, any>, methods?: any) => void` | **Required** | Callback invoked upon valid form submission |
| `defaultValues` | `Record<string, any>` | `undefined` | Initial or editing values for form fields |
| `gridColumns` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 12` | `1` | Total grid column divisions (use `12` or `5` or `6` for responsive grids) |
| `buttonPosition` | `'bottom' \| 'inline'` | `'bottom'` | Position of submit/action buttons (`children`). See Deep Dive below. |
| `buttonGridColumn` | `number` | `undefined` | Column span for action button container when `buttonPosition="inline"` |
| `buttonClassName` | `string` | `''` | Extra CSS classes passed to the button container wrapper |
| `loading` | `boolean` | `false` | Disables form inputs while submitting |
| `submitText` | `string` | `'Submit'` | Default submit button label if children are not provided |
| `resetText` | `string` | `'Reset'` | Default reset button label |
| `showReset` | `boolean` | `false` | Whether to show default reset button |
| `className` | `string` | `''` | Extra CSS classes passed to the `<form>` element |
| `formId` | `string` | `undefined` | Unique HTML `id` attribute for `<form id="...">` |
| `children` | `ReactNode` | `undefined` | Custom action buttons (e.g. `<Button action="save" type="submit" />`) |
| `validationSchema` | `ZodSchema` | `Auto-generated` | Custom Zod schema override (auto-generated from fields if omitted) |
| `onValuesChange` | `(values: Record<string, any>) => void` | `undefined` | Callback fired whenever any form value changes |
| `standalone` | `boolean` | `false` | Render fields without `<form>` tag (for nested parent form providers) |
| `fieldPrefix` | `string` | `undefined` | Nested property path prefix (e.g. `'contact'` -> `'contact.phone'`) |

---

#### 6. Deep Dive: Button Placement & Alignment (`buttonPosition`, `buttonGridColumn`, `buttonClassName`)

Where are these attributes defined?
- **Definition**: `FormProps` interface in `src/shared/components/ui/Forms/form.types.ts`.
- **Implementation**: Handled inside `<FormGenerator />` in `src/shared/components/ui/Forms/FormGenerator/FormGenerator.tsx`.

```typescript
export interface FormProps {
    // ...
    buttonPosition?: "bottom" | "inline";
    buttonGridColumn?: number;
    buttonClassName?: string;
}
```

##### 1. `buttonPosition?: "bottom" | "inline"`
Controls how the action buttons (`children`) are placed relative to the form's input fields:

- **`"bottom"` (Default)**:
  - Renders the action buttons in a separate container **beneath** the entire form grid.
  - Generates: `<div className="flex justify-center gap-2 mt-5 w-full">{children}</div>`.
  - **When to use**: Standard multi-row data entry pages, wide cards, modal popups, and long forms where submit/reset buttons belong at the footer.

- **`"inline"`**:
  - Renders the action buttons **inside the grid** alongside input fields in the same row layout.
  - Generates: `<div className="self-end flex items-center gap-2 h-[38px] pb-0.5 ${buttonColClass} ${buttonClassName}">{children}</div>`.
  - Aligning at `self-end` ensures the buttons sit flush with the bottom edge of adjacent input boxes (taking input labels into account).
  - **When to use**: Single-row search forms, filter toolbars, compact entity forms (e.g. `EmployeeDetails.tsx`), or any grid where buttons sit in the remaining columns of a row.

##### 2. `buttonGridColumn?: number`
Defines how many columns the button container occupies in the grid when `buttonPosition="inline"`:
- If omitted in a 12-column grid (`gridColumns={12}`), defaults to `col-span-12 sm:col-span-6 md:col-span-4`.
- In other grids (e.g. `gridColumns={5}` or `gridColumns={6}`), defaults to `col-span-2`.
- Setting `buttonGridColumn={1}` or `buttonGridColumn={2}` lets you precisely size the action button container to fit remaining columns on any row.

##### 3. `buttonClassName?: string`
Allows passing extra utility classes to the button container (e.g. `justify-end`, `gap-3`, `w-full`, `mt-auto`).

---

##### Example 1: Standard Bottom Action Buttons (`buttonPosition="bottom"`)
```tsx
<FormGenerator
  fields={fields}
  onSubmit={handleSubmit}
  gridColumns={12}
  buttonPosition="bottom"
>
  <Button action="save" type="submit">Save Employee</Button>
  <Button variant="outline" type="reset">Reset</Button>
</FormGenerator>
```

---

##### Example 2: Inline Action Buttons in a Compact Grid (`buttonPosition="inline"`)
```tsx
import { FormGenerator } from "@/shared/components/ui/Forms";
import { Button } from "@/shared/components/ui";
import type { FormField } from "@/shared/components/ui/Forms";

const CompactEmployeePage = () => {
  return (
    <FormGenerator
      fields={employeeConfig as FormField[]}
      onSubmit={handleSubmit}
      gridColumns={5}
      buttonPosition="inline"
      buttonGridColumn={2}
      buttonClassName="justify-end gap-2"
    >
      <Button
        type="button"
        variant="danger"
        label="Cancel"
        size="sm"
        onClick={() => navigate('/list')}
      />
      <Button
        type="submit"
        variant="primary"
        label="Save Details"
        size="sm"
      />
    </FormGenerator>
  );
};
```

---

##### Example 3: Single-Row Filter / Search Toolbar (`buttonPosition="inline"`)
```tsx
import { FormGenerator } from "@/shared/components/ui/Forms";
import { Button } from "@/shared/components/ui";
import { Search, RotateCcw } from "lucide-react";

const searchFields: FormField[] = [
  { name: "keyword", label: "Search Keyword", type: "text", gridColumn: 4, placeholder: "Search by name or email..." },
  { name: "department", label: "Department", type: "select", gridColumn: 4, options: deptOptions },
];

export const SearchToolbar = ({ onSearch, onReset }: { onSearch: (data: any) => void; onReset: () => void }) => (
  <FormGenerator
    fields={searchFields}
    onSubmit={onSearch}
    gridColumns={12}
    buttonPosition="inline"
    buttonGridColumn={4}
    buttonClassName="justify-start gap-2"
  >
    <Button variant="primary" size="md" icon={<Search size={16} />} type="submit">
      Search
    </Button>
    <Button variant="outline" size="md" icon={<RotateCcw size={16} />} type="button" onClick={onReset}>
      Reset
    </Button>
  </FormGenerator>
);
```

---

#### 7. Step-by-Step Implementation in React

##### Step 1: Create the JSON Schema (`src/features/employee-details/form-config/employeeForm.json`)
```json
[
  {
    "name": "employeeId",
    "label": "Employee ID",
    "type": "text",
    "placeholder": "EMP-001",
    "gridColumn": 6,
    "validation": { "required": true, "message": "Employee ID is required" }
  },
  {
    "name": "employeeName",
    "label": "Full Name",
    "type": "text",
    "placeholder": "Enter full name",
    "gridColumn": 6,
    "validation": { "required": true, "minLength": 3, "message": "Min 3 characters" }
  },
  {
    "name": "department",
    "label": "Department",
    "type": "select",
    "gridColumn": 6,
    "options": [
      { "label": "Engineering", "value": "Engineering" },
      { "label": "HR", "value": "HR" }
    ],
    "validation": { "required": true, "message": "Select department" }
  },
  {
    "name": "joiningDate",
    "label": "Joining Date",
    "type": "date",
    "gridColumn": 6,
    "validation": { "required": true, "message": "Joining date is required" }
  }
]
```

##### Step 2: Use in Page Component
```tsx
import React, { useState } from 'react';
import { Card, Breadcrumb } from '@/shared/components/layout';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';
import { Button } from '@/shared/components/ui';
import { useStatusModal } from '@/config/theme/StatusModalContext';
import { UserPlus } from 'lucide-react';
import employeeFormConfig from '../form-config/employeeForm.json';

const EmployeeFormPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useStatusModal();

  const fields = employeeFormConfig as FormField[];

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      console.log('Submitted Payload:', formData);
      showSuccess('Employee saved successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to save employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: 'Employees', path: '/employee-details' }, { label: 'Add Employee' }]} />
      <Card title="Add New Employee" icon={UserPlus}>
        <FormGenerator
          fields={fields}
          onSubmit={handleSubmit}
          gridColumns={12}
          buttonPosition="bottom"
        >
          <Button action="save" loading={loading} type="submit">Submit</Button>
          <Button variant="outline" type="reset">Reset</Button>
        </FormGenerator>
      </Card>
    </div>
  );
};

export default EmployeeFormPage;
```

---

#### 8. Advanced Form Patterns

##### A. Edit Mode with `defaultValues` from Route State
```tsx
import { useLocation } from 'react-router-dom';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';
import { Card } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui';
import employeeFormConfig from '../form-config/employeeForm.json';

const EditEmployeePage = () => {
  const location = useLocation();
  const editRecord = location.state?.editRecord;

  return (
    <Card title="Edit Employee">
      <FormGenerator
        fields={employeeFormConfig as FormField[]}
        defaultValues={editRecord}
        onSubmit={handleUpdate}
        gridColumns={12}
      >
        <Button action="update" type="submit">Update</Button>
      </FormGenerator>
    </Card>
  );
};
```

##### B. Dynamic / Dependent Fields (`onValuesChange`)
```tsx
import { useMemo, useState } from 'react';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';
import { Button } from '@/shared/components/ui';
import employeeFormConfig from '../form-config/employeeForm.json';

export const DynamicForm = () => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const dynamicFields = useMemo<FormField[]>(() => {
    const baseFields = [...(employeeFormConfig as FormField[])];

    if (formValues.nationality && formValues.nationality !== 'Indian') {
      baseFields.push({
        name: 'visaNumber',
        label: 'Passport / Visa Number',
        type: 'text',
        gridColumn: 6,
        validation: { required: true, message: 'Visa number is required for foreign nationals' }
      });
    }

    return baseFields;
  }, [formValues.nationality]);

  return (
    <FormGenerator
      fields={dynamicFields}
      onValuesChange={setFormValues}
      onSubmit={handleSave}
      gridColumns={12}
    >
      <Button action="save" type="submit">Save</Button>
    </FormGenerator>
  );
};
```

##### C. Inside a Modal
```tsx
import { Modal, Button } from '@/shared/components/ui';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';
import employeeFormConfig from '../form-config/employeeForm.json';

export const QuickAddModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Record" size="lg">
    <FormGenerator
      fields={employeeFormConfig as FormField[]}
      onSubmit={(data) => { console.log(data); onClose(); }}
      gridColumns={12}
    >
      <div className="flex justify-end gap-2 w-full">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button action="save" type="submit">Save</Button>
      </div>
    </FormGenerator>
  </Modal>
);
```

##### D. Multi-Step Forms (`MultiStepForm`)
`<MultiStepForm />` supports guided multi-step wizard workflows with step validation:

- **`MultiStepFormProps` Reference**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `steps` | `Array<{ id: string; label: string; fields: FormField[] }>` | **Required** | Step definitions array |
  | `onSubmit` | `(data: Record<string, unknown>) => void` | **Required** | Final completion submit callback |
  | `onCancel` | `() => void` | `undefined` | Cancel callback |
  | `gridColumn` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Column layout for form step fields |
  | `title` | `string` | `'Multi-Step Form'` | Card title header |
  | `icon` | `LucideIcon` | `undefined` | Header icon |

- **Usage Example**:
  ```tsx
  import { MultiStepForm } from '@/shared/components/ui/Forms';
  import { UserPlus } from 'lucide-react';
  import step1 from '../form-config/personalDetails.json';
  import step2 from '../form-config/workDetails.json';

  const steps = [
    { id: 'personal', label: 'Personal Information', fields: step1 },
    { id: 'work', label: 'Work & Department', fields: step2 },
  ];

  export const WizardPage = () => (
    <MultiStepForm
      steps={steps}
      title="Employee Onboarding"
      icon={UserPlus}
      gridColumn={2}
      onSubmit={(data) => console.log('Wizard submitted:', data)}
    />
  );
  ```

---

### 4.3 Layout Components (`src/shared/components/layout/`)

#### 1. `Card` (`@/shared/components/layout/Card`)
Standard container card with icon header and body.

- **Props**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `title` | `string` | **Required** | Card title in header |
  | `icon` | `LucideIcon` | `undefined` | Header icon |
  | `containerClassName` | `string` | `''` | Outer wrapper classes |
  | `bodyClassName` | `string` | `''` | Inner body classes |
  | `children` | `ReactNode` | `undefined` | Content |

- **Usage**:
  ```tsx
  import { Card } from "@/shared/components/layout";
  import { User } from "lucide-react";

  <Card title="Personal Information" icon={User}>
    <div>Form or details content goes here...</div>
  </Card>
  ```

---

#### 2. `Breadcrumb` (`@/shared/components/layout/Breadcrumb`)
Navigation breadcrumbs showing current hierarchy.

- **Props**:
  | Attribute | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `items` | `Array<{ label: string; path?: string }>` | **Required** | Breadcrumb trail items |
  | `className` | `string` | `''` | Extra CSS class |

- **Usage**:
  ```tsx
  import { Breadcrumb } from "@/shared/components/layout";

  <Breadcrumb
    items={[
      { label: "Employees", path: "/employee-details" },
      { label: "Add Employee" },
    ]}
  />
  ```

---

#### 3. `Loader` (`@/shared/components/layout/Loader`)
Centered spinning indicator for page suspense loading.

```tsx
import { Loader } from "@/shared/components/layout";

<Loader />
```

---

#### 4. `ThemeToggle` (`@/shared/components/layout/ThemeToggle`)
Animated button toggling between light and dark themes.

```tsx
import { ThemeToggle } from "@/shared/components/layout";

<ThemeToggle />
```

---

#### 5. `Header` & `Sidebar` (`@/shared/components/layout`)
Application top navigation bar and collapsible sidebar menu.

---

### 4.4 Shared Hooks (`src/shared/hooks/`)

#### `useTable` (`@/shared/hooks`)
Client-side table state manager for searching, pagination, and filtering.

```typescript
import { useTable } from "@/shared/hooks";

const {
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  searchText,
  setSearchText,
  paginatedData,
  totalRows,
} = useTable(rawData, {
  searchFields: ["name", "email"],
  initialRowsPerPage: 10,
});
```

---

### 4.5 Shared Utilities (`src/shared/utils/`)

| Utility | File | Purpose | Key Functions |
| :--- | :--- | :--- | :--- |
| **Export Utils** | `exportUtils.ts` | PDF & Excel generation | `exportToPDF(columns, rows, fileName)`, `exportToExcel(columns, rows, fileName)` |
| **Cookie Utils** | `cookieUtils.ts` | Cookie & JWT management | `getJwtToken()`, `setJwtToken(token)`, `removeJwtToken()`, `setCookie()`, `getCookie()`, `removeCookie()` |
| **Auth Utils** | `authUtils.ts` | Auth state verification | `isAuthenticated()`, `isTokenValid(token)`, `getStoredUser()` |
| **Auth Helper** | `authHelper.ts` | Cleanup & Logout helper | `clearAuthData()` |

---

## 5. Core Services & State Management

### 5.1 API Client (`src/services/api/apiClient.ts`)
Configured Axios instance with:
- `baseURL` from `import.meta.env.VITE_API_BASE_URL`
- Automated JWT Bearer token injection in request headers
- Automated 401/403 interceptor handling: clears auth data and dispatches `'auth-redirect'` event to redirect to `/login`.
- Standardized error rejection via `throw error;`.

```typescript
import apiClient from "@/services/api/apiClient";

// Example GET
export const fetchEmployees = async () => {
  const response = await apiClient.get("/employees");
  return response.data;
};

// Example POST
export const createEmployee = async (payload: Record<string, any>) => {
  const response = await apiClient.post("/employees", payload);
  return response.data;
};
```

---

### 5.2 Redux Store Setup (`src/app/store/`)

- `store.ts`: Configures store and attaches RTK Query middleware.
- `rootReducer.ts`: Combines feature reducers.
- `hooks.ts`: Provides `useAppDispatch` and `useAppSelector` with full TypeScript typing.

```typescript
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, logout } from "@/features/auth/slice/authSlice";

const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

---

## 6. Step-by-Step: How to Build a New Feature

When creating a new feature module (e.g., `features/orders/`), follow these structured steps:

### Step 1: Create Feature Directory Structure
```
src/features/orders/
├── index.ts              # Barrel export for the feature
├── types/
│   └── index.ts          # TypeScript interfaces (Order, OrderStatus, etc.)
├── pages/
│   ├── OrderList.tsx     # Table listing page
│   └── CreateOrder.tsx   # Creation/Edit page
├── components/
│   └── OrderSummaryCard.tsx
├── service/
│   └── orderService.ts   # API methods or RTK Query api
└── slice/
    └── orderSlice.ts     # Redux slice (if global state is required)
```

### Step 2: Define Feature Types (`types/index.ts`)
```typescript
export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: "Pending" | "Completed" | "Cancelled";
  createdAt: string;
}
```

### Step 3: Create API Service (`service/orderService.ts`)
```typescript
import apiClient from "@/services/api/apiClient";
import type { Order } from "../types";

export const getOrders = async (): Promise<Order[]> => {
  const res = await apiClient.get("/orders");
  return res.data;
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const res = await apiClient.post("/orders", orderData);
  return res.data;
};
```

### Step 4: Build Page with Shared Components (`pages/OrderList.tsx`)
```tsx
import { useEffect, useState, useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { Card, Breadcrumb } from "@/shared/components/layout";
import { ReusableTable, Badge, Button, ActionButtons } from "@/shared/components/ui";
import { ShoppingCart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../types";
import { getOrders } from "../service/orderService";

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<MRT_ColumnDef<Order>[]>(() => [
    { accessorKey: "id", header: "Order ID", size: 80 },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "totalAmount", header: "Amount ($)" },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        const variant = val === "Completed" ? "primary" : "secondary";
        return <Badge variant={variant}>{val}</Badge>;
      },
    },
  ], []);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Orders" }]} />
      <Card title="Order Management" icon={ShoppingCart}>
        <ReusableTable
          columns={columns}
          data={orders}
          loading={loading}
          exportFileName="orders_export"
          renderTopToolbarCustomActions={() => (
            <Button icon={<Plus size={16} />} onClick={() => navigate("/orders/new")}>
              New Order
            </Button>
          )}
          enableRowActions
          renderRowActions={({ row }) => (
            <ActionButtons
              actions={["view", "delete"]}
              onAction={(action) => console.log(action, row.original)}
            />
          )}
        />
      </Card>
    </div>
  );
};

export default OrderList;
```

### Step 5: Register Route in `routeConfig.ts` & `AppRoutes.tsx`
1. In `src/app/routes/routeConfig.ts`:
   ```typescript
   export const routes = {
     // ... existing routes
     orders: { path: "/orders", title: "Orders" },
     createOrder: { path: "/orders/new", title: "New Order" },
   };
   ```
2. In `src/app/routes/AppRoutes.tsx`:
   ```tsx
   const OrderList = lazy(() => import("@/features/orders/pages/OrderList"));
   const CreateOrder = lazy(() => import("@/features/orders/pages/CreateOrder"));

   // Inside ProtectedRoute -> MainLayout:
   <Route path={routes.orders.path} element={<OrderList />} />
   <Route path={routes.createOrder.path} element={<CreateOrder />} />
   ```

### Step 6: Add Navigation Link in `Sidebar.tsx`
Add your new menu item to the sidebar navigation configuration in `src/shared/components/layout/Sidebar/sidebar.config.ts`.

---

## 7. Best Practices & Code Standards

1. **Always Use Path Aliases**: Use `@/...` instead of deep relative paths (`../../..`).
2. **Use Shared Components**: Never write ad-hoc HTML buttons, custom modal overlays, or custom raw tables. Always utilize `Button`, `Modal`, `DialogModal`, `FormGenerator`, `Tabs`, `DynamicFormTable`, and `ReusableTable`.
3. **Form State**: Use `FormGenerator` for standard entity forms to maintain consistent validation, spacing, and styling.
4. **Button Layouts**: Use `buttonPosition="bottom"` for standard long forms and `buttonPosition="inline"` for compact toolbar/single-row forms.
5. **Error Handling**:
   - In `async` functions, use `throw error;` instead of `return Promise.reject(error);`.
   - Use `StatusModalContext` (`showSuccess`, `showError`) for user-facing notifications.
6. **Theme Support**: Use theme CSS variables (`var(--background)`, `var(--foreground)`, `var(--color-table-border)`) and Tailwind theme classes (`bg-card-bg`, `text-foreground`) to ensure seamless light/dark mode transitions.
7. **Strict Types**: Always define TypeScript interfaces for props, forms, and API models. Avoid using `any`.

---

## 8. Project CLI Generator Guide

The project includes an internal CLI tool to automate boilerplate creation for components and full feature modules.

### 8.1 Available Commands

```bash
# 1. Generate a UI or Layout component
npm run generate:component <ComponentName>
npm run generate:component <ComponentName> -- --category=layout

# 2. Generate a Complete Feature Module
npm run generate:feature <feature-name>

# 3. Direct CLI invocation
node cli/index.js component Badge
node cli/index.js feature doctor-details
```

### 8.2 Supported Form Field Types in `<FormGenerator />` & CLI

When configuring forms in `form-config` or using generated templates:

| Field `type` | Component Rendered | Description & Usage |
| :--- | :--- | :--- |
| `text` | `<Input type="text" />` | Standard single-line text input |
| `email` | `<Input type="email" />` | Email input with regex validation |
| `password` | `<Input type="password" />` | Password input with secure masking |
| `number` | `<Input type="number" />` | Numeric input with min/max range limits |
| `tel` | `<Input type="tel" />` | Digit-only telephone input (auto-enforces 10 digits) |
| `select` | `<SearchableSelect />` | **Default Searchable Select**: Searchable single select dropdown with built-in instant filtering; supports optional `onSearch` for async search. |
| `multiselect` | `<MultiSelect />` | **Multi-Tag Select**: Multiple selection with searchable options and badge tags. |
| `textarea` | `<TextArea />` | Multi-line text area with rows and max character count |
| `date` | `<DatePicker type="date" />` | Date picker with minDate / maxDate support |
| `time` | `<TimePicker />` | 12-hour AM/PM time selector |
| `checkbox` | `<Checkbox />` | Single boolean checkbox |
| `radio-group` | `<RadioGroup />` | Radio button list |
| `file` | `<UploadFile />` | File attachment upload (e.g. PDF/DOCX) |
| `profile-upload` | `<ProfileUpload />` | Avatar image uploader with preview |
