// cli/generators/featureGenerator.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateFeature(name) {
  if (!name) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error: Feature name is required!');
    console.log('👉 Usage: npm run generate:feature <feature-name>\n');
    return;
  }

  const rawClean = name.replaceAll(/[^a-zA-Z0-9_-]/g, '');
  const kebabCase = rawClean.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replaceAll('_', '-');
  const pascalCase = kebabCase
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);

  const featureDir = path.resolve(__dirname, `../../src/features/${kebabCase}`);

  if (fs.existsSync(featureDir)) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error: Feature "${kebabCase}" already exists at src/features/${kebabCase}!`);
    return;
  }

  // Create subdirectories for wireframe structure
  const folders = ['form-config', 'pages', 'types'];
  folders.forEach((folder) => {
    fs.mkdirSync(path.join(featureDir, folder), { recursive: true });
  });

  // 1. Types Template
  const typesTemplate = `// src/features/${kebabCase}/types/${kebabCase}.types.ts

export interface ${pascalCase}Item {
  id: string | number;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface ${pascalCase}FormData {
  name: string;
  code: string;
  status: string;
  description?: string;
}
`;

  // 2. Form Config Template (Uses FormField from form.types.ts with reusable Select)
  const formConfigTemplate = `// src/features/${kebabCase}/form-config/${camelCase}FormConfig.ts
import type { FormField } from '@/shared/components/ui/Forms/form.types';

export const ${camelCase}FormConfig: FormField[] = [
  {
    name: 'name',
    label: '${pascalCase} Name',
    type: 'text',
    placeholder: 'Enter name',
    gridColumn: 6,
    validation: {
      required: true,
      minLength: 2,
      message: '${pascalCase} Name is required (at least 2 characters)',
    },
  },
  {
    name: 'code',
    label: 'Identifier Code',
    type: 'text',
    placeholder: 'e.g. ${pascalCase.toUpperCase().slice(0, 3)}-001',
    gridColumn: 6,
    validation: {
      required: true,
      message: 'Identifier Code is required',
    },
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Select status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
    gridColumn: 6,
    validation: {
      required: true,
      message: 'Please select a status',
    },
  },
  {
    name: 'description',
    label: 'Description / Notes',
    type: 'textarea',
    placeholder: 'Enter optional notes...',
    gridColumn: 12,
  },
];
`;

  // 3. Add Page Template
  const addPageTemplate = `// src/features/${kebabCase}/pages/Add${pascalCase}.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';
import FormGenerator from '@/shared/components/ui/Forms/FormGenerator';
import Card from '@/shared/components/layout/Card';
import Button from '@/shared/components/ui/Button';
import { ${camelCase}FormConfig } from '../form-config/${camelCase}FormConfig';

export const Add${pascalCase}: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleSubmit = (_data: Record<string, any>) => {
    toast.success(id ? '${pascalCase} updated successfully!' : '${pascalCase} created successfully!');
    navigate('/${kebabCase}');
  };

  return (
    <div className="space-y-6">
      <Card
        title={id ? 'Edit ${pascalCase}' : 'Add New ${pascalCase}'}
        icon={PlusCircle}
      >
        <FormGenerator
          fields={${camelCase}FormConfig}
          onSubmit={handleSubmit}
          gridColumns={12}
        >
          <div className="flex justify-center gap-2 mt-6 col-span-full">
            <Button
              type="button"
              variant="danger"
              label="Cancel"
              size="sm"
              onClick={() => navigate('/${kebabCase}')}
            />
            <Button
              type="submit"
              variant="primary"
              label={id ? 'Update ${pascalCase}' : 'Save ${pascalCase}'}
              size="sm"
            />
          </div>
        </FormGenerator>
      </Card>
    </div>
  );
};

export default Add${pascalCase};
`;

  // 4. List Page Template with dummy wireframe data
  const listPageTemplate = `// src/features/${kebabCase}/pages/${pascalCase}List.tsx
import React, { useCallback, useMemo, useState } from 'react';
import type { MRT_ColumnDef } from 'material-react-table';
import { Layers } from 'lucide-react';
import { ReusableTable } from '@/shared/components/ui/Table';
import ActionButtons from '@/shared/components/ui/Actions/ActionButtons';
import type { ActionType } from '@/shared/components/ui/Actions/action.types';
import Modal from '@/shared/components/ui/Modal/Modal';
import Card from '@/shared/components/layout/Card';
import type { ${pascalCase}Item } from '../types/${kebabCase}.types';

const INITIAL_DATA: ${pascalCase}Item[] = [
  { id: '1', name: '${pascalCase} Alpha', code: '${pascalCase.toUpperCase().slice(0, 3)}-001', status: 'active' },
  { id: '2', name: '${pascalCase} Beta', code: '${pascalCase.toUpperCase().slice(0, 3)}-002', status: 'active' },
  { id: '3', name: '${pascalCase} Gamma', code: '${pascalCase.toUpperCase().slice(0, 3)}-003', status: 'inactive' },
];

const ${pascalCase}StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const isActive = status?.toLowerCase() === 'active';
  return (
    <span
      className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold \${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
      }\`}
    >
      {status?.toUpperCase() || 'N/A'}
    </span>
  );
};

const ${pascalCase}ActionCell: React.FC<{
  item: ${pascalCase}Item;
  onAction: (action: ActionType, item: ${pascalCase}Item) => void;
}> = ({ item, onAction }) => (
  <ActionButtons
    actions={['view', 'edit', 'delete']}
    toggleValue={item.status === 'active'}
    onAction={(action) => onAction(action, item)}
  />
);

const get${pascalCase}Columns = (
  handleAction: (action: ActionType, item: ${pascalCase}Item) => void
): MRT_ColumnDef<${pascalCase}Item>[] => [
  { accessorKey: 'id', header: 'ID', size: 80 },
  { accessorKey: 'name', header: '${pascalCase} Name' },
  { accessorKey: 'code', header: 'Code' },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ cell }) => <${pascalCase}StatusBadge status={cell.getValue<string>()} />,
  },
  {
    accessorKey: 'action',
    header: 'Action',
    size: 150,
    Cell: ({ row }) => (
      <${pascalCase}ActionCell
        item={row.original}
        onAction={handleAction}
      />
    ),
  },
];

export const ${pascalCase}List: React.FC = () => {
  const [data] = useState<${pascalCase}Item[]>(INITIAL_DATA);
  const [selectedItem, setSelectedItem] = useState<${pascalCase}Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = useCallback(
    (action: ActionType, row: ${pascalCase}Item) => {
      if (action === 'view') {
        setSelectedItem(row);
        setIsModalOpen(true);
      }
    },
    []
  );

  const columns = useMemo(() => get${pascalCase}Columns(handleAction), [handleAction]);

  return (
    <>
      <Card title="${pascalCase} Details" icon={Layers}>
        <ReusableTable
          columns={columns}
          data={data}
          enableRowActions={false}
          enableExport={true}
          exportFileName="${kebabCase}_records"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? \`${pascalCase} Details - \${selectedItem.name}\` : '${pascalCase} Details'}
        size="2xl"
      >
        {selectedItem && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">ID</span>
                <p className="text-sm font-medium text-foreground mt-1">{selectedItem.id}</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">${pascalCase} Name</span>
                <p className="text-sm font-medium text-foreground mt-1">{selectedItem.name}</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Code</span>
                <p className="text-sm font-medium text-foreground mt-1">{selectedItem.code}</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                <p className="text-sm font-medium text-foreground mt-1">
                  <${pascalCase}StatusBadge status={selectedItem.status} />
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ${pascalCase}List;
`;

  // Write all files
  fs.writeFileSync(path.join(featureDir, `types/${kebabCase}.types.ts`), typesTemplate);
  fs.writeFileSync(path.join(featureDir, `form-config/${camelCase}FormConfig.ts`), formConfigTemplate);
  fs.writeFileSync(path.join(featureDir, `pages/Add${pascalCase}.tsx`), addPageTemplate);
  fs.writeFileSync(path.join(featureDir, `pages/${pascalCase}List.tsx`), listPageTemplate);

  console.log('\x1b[32m%s\x1b[0m', `\n✅ Feature module "${pascalCase}" successfully created at src/features/${kebabCase}/`);
  console.log('📁 Created files:');
  console.log(`   ├── types/${kebabCase}.types.ts`);
  console.log(`   ├── form-config/${camelCase}FormConfig.ts`);
  console.log(`   ├── pages/Add${pascalCase}.tsx`);
  console.log(`   └── pages/${pascalCase}List.tsx`);
  console.log('\n🔗 Next Steps:');
  console.log(`   1. Add routes in src/app/routes/routeConfig.ts & AppRoutes.tsx`);
  console.log(`   2. Add sidebar link in src/shared/components/layout/Sidebar/Sidebar.tsx\n`);
}
