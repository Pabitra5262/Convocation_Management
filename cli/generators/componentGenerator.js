// cli/generators/componentGenerator.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateComponent(name, options = {}) {
  if (!name) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error: Component name is required!');
    console.log('👉 Usage: npm run generate:component <ComponentName> [--category=ui|layout]\n');
    return;
  }

  // Formatting name
  const rawClean = name.replaceAll(/[^a-zA-Z0-9_-]/g, '');
  const pascalCase = rawClean
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);

  const category = options.category || 'ui'; // 'ui' or 'layout'
  const componentDir = path.resolve(__dirname, `../../src/shared/components/${category}/${pascalCase}`);

  if (fs.existsSync(componentDir)) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error: Component "${pascalCase}" already exists at src/shared/components/${category}/${pascalCase}!`);
    return;
  }

  fs.mkdirSync(componentDir, { recursive: true });

  // 1. Types File
  const typesContent = `// src/shared/components/${category}/${pascalCase}/${camelCase}.types.ts
import type { ReactNode, HTMLAttributes } from 'react';

export interface ${pascalCase}Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}
`;

  // 2. Styles File
  const stylesContent = `// src/shared/components/${category}/${pascalCase}/${camelCase}.styles.ts

export const base${pascalCase}Style = 
  'inline-flex items-center justify-center transition-all duration-200 font-medium rounded-lg';

export const ${camelCase}Variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
  outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
};

export const ${camelCase}Sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
`;

  // 3. Component Implementation (index.tsx)
  const componentContent = `// src/shared/components/${category}/${pascalCase}/index.tsx
import React from 'react';
import type { ${pascalCase}Props } from './${camelCase}.types';
import { base${pascalCase}Style, ${camelCase}Variants, ${camelCase}Sizes } from './${camelCase}.styles';

export const ${pascalCase}: React.FC<${pascalCase}Props> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={\`\${base${pascalCase}Style} \${${camelCase}Variants[variant]} \${${camelCase}Sizes[size]} \${className}\`}
      {...props}
    >
      {isLoading && <span className="mr-2 animate-spin">⏳</span>}
      {children || '${pascalCase} Component'}
    </div>
  );
};

export default ${pascalCase};
`;

  // Write files
  fs.writeFileSync(path.join(componentDir, `${camelCase}.types.ts`), typesContent);
  fs.writeFileSync(path.join(componentDir, `${camelCase}.styles.ts`), stylesContent);
  fs.writeFileSync(path.join(componentDir, `index.tsx`), componentContent);

  console.log('\x1b[32m%s\x1b[0m', `\n✅ Component "${pascalCase}" successfully created in src/shared/components/${category}/${pascalCase}/`);
  console.log('📁 Created files:');
  console.log(`   ├── ${camelCase}.types.ts`);
  console.log(`   ├── ${camelCase}.styles.ts`);
  console.log(`   └── index.tsx`);
  console.log(`\n💡 Import example: import { ${pascalCase} } from '@/shared/components/${category}/${pascalCase}';\n`);
}
