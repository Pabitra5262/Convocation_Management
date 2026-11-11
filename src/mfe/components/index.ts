/**
 * `@mfe/components` for the wireframe project.
 *
 * Pages built here import from `@mfe/components` exactly like in hplus_react, so a feature folder can be
 * copied into hplus_react `apps/<app>/src/features/` without changes. Same names and props as hplus_react's
 * package; the wireframe's own components draw them. Only the parts the wireframe pages need are listed here —
 * add more the same way (same name and props as in hplus_react).
 */

// Same API in the wireframe already: re-exported as is
export { default as Card, CardHeader, CardBody, CardFooter, type CardProps, type CardHeaderProps } from "@/shared/components/layout/Card";
export { default as Modal } from "@/shared/components/ui/Modal/Modal";
export { default as DialogModal } from "@/shared/components/ui/DialogModal/DialogModal";
export { default as Tabs, type TabItem, type TabsProps } from "@/shared/components/ui/Tabs";
export { FormGenerator, Input, MultiStepForm, TextArea, DatePicker, TimePicker, Checkbox, RadioGroup, UploadFile } from "@/shared/components/ui/Forms";
export type { FormField, FormProps, Option, InputType, ValidationRule } from "@/shared/components/ui/Forms/form.types";
export { DynamicFormTable } from "@/shared/components/ui/Table";
export { useMouseDepth } from "@/shared/hooks/useMouseDepth";

// hplus_react API on top of the wireframe components
export { Button, type ButtonProps, type ButtonVariant, type ButtonAction, type ButtonSize } from "./Button";
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from "./Badge";
export { PageHeader, type PageHeaderProps, type BreadcrumbItem } from "./PageHeader";
export { Select, type SelectProps } from "./Select";
export {
    DataTable,
    DataTable as ReusableTable,
    type DataTableProps,
    type DataTableProps as ReusableTableProps,
    type TableColumnDef,
    type TableServerPagination,
    type TableSortState,
    type TableBulkAction,
    type TableMenuItem,
    type TableRowActions,
    type TableExportFormat,
} from "./DataTable";
export { showToast, toast } from "./toast";
export { useAppNavigate } from "./useAppNavigate";
